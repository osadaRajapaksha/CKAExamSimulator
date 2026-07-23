#!/bin/bash
image=$(kubectl get deploy web-update -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null)
if [[ "$image" == *"nginx:1.15"* ]]; then
    echo "Validation Passed! Deployment updated to nginx:1.15."
    exit 0
else
    echo "Validation Failed: Deployment 'web-update' does not use the nginx:1.15 image."
    exit 1
fi
