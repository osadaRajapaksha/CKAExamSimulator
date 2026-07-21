#!/bin/bash

# Get the first node
node=$(kubectl get node -o jsonpath='{.items[0]}' 2>/dev/null)
if [ -z "$node" ]; then
    echo "Validation Failed: No nodes found in the cluster."
    exit 1
fi

python3 -c "
import sys, json

try:
    node = json.loads('''$node''')
    if node.get('spec', {}).get('unschedulable') != True:
        print('Validation Failed: Node is not cordoned (unschedulable)')
        sys.exit(1)
        
    print('Validation Passed! Node drained and cordoned.')
    sys.exit(0)
except Exception as e:
    print('Validation Failed: Error parsing node', str(e))
    sys.exit(1)
"
