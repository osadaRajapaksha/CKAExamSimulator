#!/bin/bash
cm_value=$(kubectl get cm app-config -o jsonpath='{.data.APP_ENV}' 2>/dev/null)
pod_env=$(kubectl get pod config-pod -o jsonpath='{.spec.containers[0].env[*].valueFrom.configMapKeyRef.name}' 2>/dev/null)

if [ "$cm_value" = "production" ] && [[ "$pod_env" == *"app-config"* ]]; then
    echo "Validation Passed! ConfigMap is created and mounted correctly."
    exit 0
else
    echo "Validation Failed: ConfigMap 'app-config' is missing or not mounted correctly in 'config-pod'."
    exit 1
fi
