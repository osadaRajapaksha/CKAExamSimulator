#!/bin/bash
affinity=$(kubectl get pod affinity-pod -o jsonpath='{.spec.affinity.nodeAffinity}' 2>/dev/null)
if [ "$affinity" != "" ]; then
    echo "Validation Passed! Pod has NodeAffinity configured."
    exit 0
else
    echo "Validation Failed: Pod 'affinity-pod' does not have NodeAffinity configured."
    exit 1
fi
