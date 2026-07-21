#!/bin/bash

svc=$(kubectl get svc frontend-svc -o json 2>/dev/null)
if [ -z "$svc" ]; then
    echo "Validation Failed: Service 'frontend-svc' not found."
    exit 1
fi

deploy=$(kubectl get deploy frontend-deploy -o json 2>/dev/null)
if [ -z "$deploy" ]; then
    echo "Validation Failed: Deployment 'frontend-deploy' not found."
    exit 1
fi

python3 -c "
import sys, json

try:
    svc = json.loads('''$svc''')
    deploy = json.loads('''$deploy''')
    
    svc_selector = svc.get('spec', {}).get('selector', {})
    pod_labels = deploy.get('spec', {}).get('template', {}).get('metadata', {}).get('labels', {})
    
    if not svc_selector:
        print('Validation Failed: Service has no selector configured')
        sys.exit(1)
        
    for k, v in svc_selector.items():
        if pod_labels.get(k) != v:
            print(f'Validation Failed: Service selector {k}={v} does not match deployment labels')
            sys.exit(1)
            
    print('Validation Passed! Service selector correctly matches the deployment.')
    sys.exit(0)
except Exception as e:
    print('Validation Failed: Error parsing resources', str(e))
    sys.exit(1)
"
