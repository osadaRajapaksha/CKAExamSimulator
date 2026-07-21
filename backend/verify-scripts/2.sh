#!/bin/bash

# Check if namespace backend exists
kubectl get ns backend >/dev/null 2>&1 || { echo "Validation Failed: Namespace 'backend' not found"; exit 1; }

# Get NetworkPolicy
pol=$(kubectl get netpol db-netpol -n backend -o json 2>/dev/null)

if [ -z "$pol" ]; then
    echo "Validation Failed: NetworkPolicy 'db-netpol' not found in 'backend' namespace."
    exit 1
fi

# We can parse the json for the specific constraints.
# In a real environment we'd use jq, but we can also use grep if jq isn't available, or just check the output of describe.
# Wait, jq is likely available on ubuntu or we can use python to parse it. 
# Let's use python3 to parse JSON since it's installed.

python3 -c "
import sys, json
try:
    data = json.loads(sys.stdin.read())
    spec = data.get('spec', {})
    pod_selector = spec.get('podSelector', {}).get('matchLabels', {})
    if pod_selector.get('tier') != 'database':
        print('Validation Failed: podSelector does not match tier=database')
        sys.exit(1)
    
    ingress = spec.get('ingress', [])
    if not ingress:
        print('Validation Failed: No ingress rules defined')
        sys.exit(1)
        
    rule = ingress[0]
    from_rules = rule.get('from', [])
    if not from_rules:
        print('Validation Failed: No from rules defined in ingress')
        sys.exit(1)
        
    from_rule = from_rules[0]
    ingress_pod_selector = from_rule.get('podSelector', {}).get('matchLabels', {})
    if ingress_pod_selector.get('tier') != 'frontend':
        print('Validation Failed: ingress podSelector does not match tier=frontend')
        sys.exit(1)
        
    print('Validation Passed! NetworkPolicy is configured correctly.')
    sys.exit(0)
except Exception as e:
    print('Validation Failed: Error parsing NetworkPolicy', str(e))
    sys.exit(1)
" <<< "$pol"
