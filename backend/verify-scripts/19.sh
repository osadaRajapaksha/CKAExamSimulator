#!/bin/bash
egress=$(kubectl get netpol secure-egress -o jsonpath='{.spec.policyTypes}' 2>/dev/null)
if [[ "$egress" == *"Egress"* ]]; then
    echo "Validation Passed! NetworkPolicy for egress created."
    exit 0
else
    echo "Validation Failed: NetworkPolicy 'secure-egress' missing or not applying Egress."
    exit 1
fi
