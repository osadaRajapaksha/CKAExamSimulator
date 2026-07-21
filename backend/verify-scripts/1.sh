#!/bin/bash
res=$(kubectl auth can-i list pods --as=system:serviceaccount:production:backend-sa -n production 2>/dev/null)
if [ "$res" = "yes" ]; then
    echo "Validation Passed! RBAC is correctly configured."
    exit 0
else
    echo "Validation Failed: ServiceAccount 'backend-sa' cannot list pods in the 'production' namespace."
    exit 1
fi
