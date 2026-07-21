#!/bin/bash

pod=$(kubectl get pod legacy-app -o json 2>/dev/null)
if [ -z "$pod" ]; then
    echo "Validation Failed: Pod 'legacy-app' not found in default namespace."
    exit 1
fi

python3 -c "
import sys, json

try:
    pod = json.loads('''$pod''')
    containers = pod['spec'].get('containers', [])
    if len(containers) < 2:
        print('Validation Failed: Pod does not have at least 2 containers (sidecar missing)')
        sys.exit(1)
        
    sidecar_found = False
    for c in containers:
        if c.get('image') == 'busybox':
            cmd = c.get('command', []) + c.get('args', [])
            if any('tail' in arg for arg in cmd) and any('/var/log/app.log' in arg for arg in cmd):
                sidecar_found = True
                break
                
    if not sidecar_found:
        print('Validation Failed: Could not find sidecar container running busybox with tail -f /var/log/app.log')
        sys.exit(1)
        
    volumes = pod['spec'].get('volumes', [])
    has_empty_dir = any(v.get('emptyDir') is not None for v in volumes)
    if not has_empty_dir:
        print('Validation Failed: Could not find an emptyDir volume')
        sys.exit(1)
        
    print('Validation Passed! Sidecar container configured successfully.')
    sys.exit(0)
except Exception as e:
    print('Validation Failed: Error parsing pod', str(e))
    sys.exit(1)
"
