#!/bin/bash
res=$(kubectl auth can-i list nodes --as=system:serviceaccount:default:node-reader-sa 2>/dev/null)
if [ "$res" = "yes" ]; then
    echo "Validation Passed! ServiceAccount has node list permissions."
    exit 0
else
    echo "Validation Failed: ServiceAccount 'node-reader-sa' cannot list nodes."
    exit 1
fi
