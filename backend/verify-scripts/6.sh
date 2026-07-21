#!/bin/bash

ingress=$(kubectl get ingress webapp-ingress -o json 2>/dev/null)
if [ -z "$ingress" ]; then
    echo "Validation Failed: Ingress 'webapp-ingress' not found in default namespace."
    exit 1
fi

INGRESS_JSON="$ingress" python3 -c "
import sys, json, os

try:
    ingress = json.loads(os.environ.get('INGRESS_JSON', '{}'))
    rules = ingress['spec'].get('rules', [])
    found_rule = False
    
    for rule in rules:
        if rule.get('host') == 'ckad.example.com':
            paths = rule.get('http', {}).get('paths', [])
            for p in paths:
                backend = p.get('backend', {})
                svc = backend.get('service', {})
                if svc.get('name') == 'webapp-service' and svc.get('port', {}).get('number') == 80:
                    found_rule = True
                    break
    
    if not found_rule:
        print('Validation Failed: Could not find routing rule for ckad.example.com to webapp-service:80')
        sys.exit(1)
        
    print('Validation Passed! Ingress configured correctly.')
    sys.exit(0)
except Exception as e:
    print('Validation Failed: Error parsing ingress', str(e))
    sys.exit(1)
"
