#!/bin/bash
ds=$(kubectl get ds fluentd-ds -n kube-system -o jsonpath='{.metadata.name}' 2>/dev/null)
if [ "$ds" = "fluentd-ds" ]; then
    echo "Validation Passed! DaemonSet is created."
    exit 0
else
    echo "Validation Failed: DaemonSet 'fluentd-ds' missing in 'kube-system' namespace."
    exit 1
fi
