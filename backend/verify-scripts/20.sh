#!/bin/bash
phase=$(kubectl get pod broken-pod -o jsonpath='{.status.phase}' 2>/dev/null)
if [ "$phase" = "Running" ]; then
    echo "Validation Passed! Pod 'broken-pod' is running successfully."
    exit 0
else
    echo "Validation Failed: Pod 'broken-pod' is not in Running phase."
    exit 1
fi
