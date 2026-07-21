#!/bin/bash

deploy=$(kubectl get deploy special-app -o json 2>/dev/null)
if [ -z "$deploy" ]; then
    echo "Validation Failed: Deployment 'special-app' not found."
    exit 1
fi

DEPLOY_JSON="$deploy" python3 -c "
import sys, json, os

try:
    deploy = json.loads(os.environ.get('DEPLOY_JSON', '{}'))
    replicas = deploy['spec'].get('replicas')
    if replicas != 2:
        print('Validation Failed: Replicas is not 2')
        sys.exit(1)
        
    containers = deploy['spec']['template']['spec'].get('containers', [])
    if not containers or containers[0].get('image') != 'redis':
        print('Validation Failed: Image is not redis')
        sys.exit(1)
        
    tolerations = deploy['spec']['template']['spec'].get('tolerations', [])
    found_toleration = False
    for t in tolerations:
        if t.get('key') == 'dedicated' and t.get('value') == 'special-team' and t.get('effect') == 'NoSchedule':
            found_toleration = True
            break
            
    if not found_toleration:
        print('Validation Failed: Could not find toleration for dedicated=special-team:NoSchedule')
        sys.exit(1)
        
    print('Validation Passed! Taints and tolerations are configured properly.')
    sys.exit(0)
except Exception as e:
    print('Validation Failed: Error parsing deployment', str(e))
    sys.exit(1)
"
