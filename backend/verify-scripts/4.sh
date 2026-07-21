#!/bin/bash

# Check if node02 exists
node=$(kubectl get node node02 -o json 2>/dev/null)
if [ -z "$node" ]; then
    echo "Validation Failed: Node 'node02' not found. (Note: this cluster might not have node02 provisioned)"
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
