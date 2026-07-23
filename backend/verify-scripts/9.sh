#!/bin/bash
replicas=$(kubectl get deploy scale-deploy -o jsonpath='{.spec.replicas}' 2>/dev/null)
if [ "$replicas" = "5" ]; then
    echo "Validation Passed! Deployment scaled to 5 replicas."
    exit 0
else
    echo "Validation Failed: Deployment 'scale-deploy' does not have 5 replicas."
    exit 1
fi
