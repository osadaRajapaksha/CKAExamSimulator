#!/bin/bash
secret_val=$(kubectl get secret db-credentials -o jsonpath='{.data.password}' 2>/dev/null)
decoded=$(echo $secret_val | base64 -d 2>/dev/null)
vol=$(kubectl get pod secret-pod -o jsonpath='{.spec.volumes[*].secret.secretName}' 2>/dev/null)

if [ "$decoded" = "supersecret" ] && [[ "$vol" == *"db-credentials"* ]]; then
    echo "Validation Passed! Secret is created and mounted."
    exit 0
else
    echo "Validation Failed: Secret 'db-credentials' missing or not mounted correctly."
    exit 1
fi
