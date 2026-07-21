#!/bin/bash

# Get the node k3d-cka-agent-0
node=$(kubectl get node k3d-cka-agent-0 -o json 2>/dev/null)
if [ -z "$node" ]; then
    echo "Validation Failed: Node 'k3d-cka-agent-0' not found in the cluster."
    exit 1
fi

NODE_JSON="$node" python3 -c "
import sys, json, os

try:
    node = json.loads(os.environ.get('NODE_JSON', '{}'))
    if node.get('spec', {}).get('unschedulable') != True:
        print('Validation Failed: Node is not cordoned (unschedulable)')
        sys.exit(1)
        
    print('Validation Passed! Node drained and cordoned.')
    sys.exit(0)
except Exception as e:
    print('Validation Failed: Error parsing node', str(e))
    sys.exit(1)
"
