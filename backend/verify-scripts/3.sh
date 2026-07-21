#!/bin/bash

# Check PV
pv=$(kubectl get pv task-pv-volume -o json 2>/dev/null)
if [ -z "$pv" ]; then
    echo "Validation Failed: PersistentVolume 'task-pv-volume' not found."
    exit 1
fi

# Check PVC
pvc=$(kubectl get pvc task-pv-claim -o json 2>/dev/null)
if [ -z "$pvc" ]; then
    echo "Validation Failed: PersistentVolumeClaim 'task-pv-claim' not found in default namespace."
    exit 1
fi

# Check Pod
pod=$(kubectl get pod task-pv-pod -o json 2>/dev/null)
if [ -z "$pod" ]; then
    echo "Validation Failed: Pod 'task-pv-pod' not found in default namespace."
    exit 1
fi

python3 -c "
import sys, json

try:
    pv = json.loads('''$pv''')
    if pv['spec'].get('capacity', {}).get('storage') != '1Gi':
        print('Validation Failed: PV capacity is not 1Gi')
        sys.exit(1)
    if 'ReadWriteOnce' not in pv['spec'].get('accessModes', []):
        print('Validation Failed: PV accessMode is not ReadWriteOnce')
        sys.exit(1)
    if pv['spec'].get('hostPath', {}).get('path') != '/mnt/data':
        print('Validation Failed: PV hostPath is not /mnt/data')
        sys.exit(1)
        
    pvc = json.loads('''$pvc''')
    req = pvc['spec'].get('resources', {}).get('requests', {}).get('storage')
    if req != '500Mi':
        print('Validation Failed: PVC requested storage is not 500Mi')
        sys.exit(1)
        
    pod = json.loads('''$pod''')
    containers = pod['spec'].get('containers', [])
    if not containers or containers[0].get('image') != 'nginx':
        print('Validation Failed: Pod image is not nginx')
        sys.exit(1)
        
    mounts = containers[0].get('volumeMounts', [])
    mounted = False
    for m in mounts:
        if m.get('mountPath') == '/usr/share/nginx/html':
            mounted = True
            break
            
    if not mounted:
        print('Validation Failed: Volume not mounted at /usr/share/nginx/html')
        sys.exit(1)
        
    print('Validation Passed! Storage is configured correctly.')
    sys.exit(0)
except Exception as e:
    print('Validation Failed: Error parsing resources', str(e))
    sys.exit(1)
"
