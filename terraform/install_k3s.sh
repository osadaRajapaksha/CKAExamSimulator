#!/bin/bash
# Install K3s (lightweight Kubernetes) with explicit node name 'node01'
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="server --node-name node01" sh -

# Wait for node to be ready
sleep 15

# Change kubeconfig permissions so the ubuntu user can use kubectl without sudo
sudo chmod 644 /etc/rancher/k3s/k3s.yaml
sudo mkdir -p /home/ubuntu/.kube
sudo cp /etc/rancher/k3s/k3s.yaml /home/ubuntu/.kube/config
sudo chown -R ubuntu:ubuntu /home/ubuntu/.kube
echo "export KUBECONFIG=/home/ubuntu/.kube/config" >> /home/ubuntu/.bashrc

# Install Node.js and build tools for node-pty
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential python3

# Clone repository and start backend
cd /home/ubuntu
git clone https://github.com/osadaRajapaksha/CKAExamSimulator.git
cd CKAExamSimulator/backend

# Apply prerequisite resources for the exam questions
sudo k3s kubectl apply -f /home/ubuntu/CKAExamSimulator/backend/setup.yaml
# Taint the node for question 7
NODE=$(sudo k3s kubectl get nodes -o jsonpath='{.items[0].metadata.name}')
sudo k3s kubectl taint nodes $NODE dedicated=special-team:NoSchedule

npm install
nohup node server.js > backend.log 2>&1 &
