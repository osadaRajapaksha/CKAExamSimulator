#!/bin/bash
type=$(kubectl get svc web-server-svc -o jsonpath='{.spec.type}' 2>/dev/null)
port=$(kubectl get svc web-server-svc -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null)

if [ "$type" = "NodePort" ] && [ "$port" = "30080" ]; then
    echo "Validation Passed! NodePort service created successfully."
    exit 0
else
    echo "Validation Failed: Service 'web-server-svc' is missing or not configured correctly."
    exit 1
fi
