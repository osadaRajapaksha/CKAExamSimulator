import os
import glob
import re

script_dir = "d:/CKAExamSimulator/backend/verify-scripts"

for filepath in glob.glob(os.path.join(script_dir, "*.sh")):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Step 1: Replace python3 -c " with python3 -c "import os
    if 'import sys, json' in content and 'import os' not in content:
        content = content.replace('import sys, json', 'import sys, json, os')
        
    # Step 2: Replace json.loads('''$var''') with json.loads(os.environ.get('VAR_JSON', '{}'))
    # Example: '''$pod''' -> os.environ.get('POD_JSON')
    replacements = {
        "'''$node'''": "os.environ.get('NODE_JSON', '{}')",
        "'''$pv'''": "os.environ.get('PV_JSON', '{}')",
        "'''$pvc'''": "os.environ.get('PVC_JSON', '{}')",
        "'''$pod'''": "os.environ.get('POD_JSON', '{}')",
        "'''$ingress'''": "os.environ.get('INGRESS_JSON', '{}')",
        "'''$deploy'''": "os.environ.get('DEPLOY_JSON', '{}')",
        "'''$svc'''": "os.environ.get('SVC_JSON', '{}')",
    }
    for k, v in replacements.items():
        content = content.replace(k, v)

    # Step 3: Prefix python3 -c with environment variables
    env_vars = {
        "node": "NODE_JSON",
        "pv": "PV_JSON",
        "pvc": "PVC_JSON",
        "pod": "POD_JSON",
        "ingress": "INGRESS_JSON",
        "deploy": "DEPLOY_JSON",
        "svc": "SVC_JSON",
    }
    
    # We find 'python3 -c "' and replace it with 'VAR_JSON="$var" VAR2_JSON="$var2" python3 -c "'
    if 'python3 -c "' in content:
        # Determine which variables are actually used in this script
        # by checking if "$var" is assigned earlier (e.g. pod=$(...))
        envs = []
        for var, env in env_vars.items():
            # if we see os.environ.get('POD_JSON' in the new content
            if env in content:
                envs.append(f'{env}="${var}"')
        
        if envs:
            env_prefix = " ".join(envs) + " "
            # ONLY replace if not already replaced
            if env_prefix not in content:
                content = content.replace('python3 -c "', f'{env_prefix}python3 -c "')

    with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)

print("Rewrote scripts safely.")
