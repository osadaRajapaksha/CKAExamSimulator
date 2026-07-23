#!/bin/bash
init_containers=$(kubectl get pod init-demo -o jsonpath='{.spec.initContainers}' 2>/dev/null)
if [ "$init_containers" != "" ] && [ "$init_containers" != "[]" ]; then
    echo "Validation Passed! Init container exists in the pod."
    exit 0
else
    echo "Validation Failed: Init container missing in pod 'init-demo'."
    exit 1
fi
