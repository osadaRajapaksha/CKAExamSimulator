#!/bin/bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install k3d
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash

# Wait a moment for docker daemon
sleep 5

# Create a multi-node cluster (1 control-plane, 2 agents)
sudo k3d cluster create cka --servers 1 --agents 2

# Configure kubeconfig for the ubuntu user and root user
sudo mkdir -p /home/ubuntu/.kube
sudo k3d kubeconfig get cka > /home/ubuntu/.kube/config
sudo chown -R ubuntu:ubuntu /home/ubuntu/.kube
echo "export KUBECONFIG=/home/ubuntu/.kube/config" >> /home/ubuntu/.bashrc

# Set up contexts for tasks
sudo KUBECONFIG=/home/ubuntu/.kube/config kubectl config rename-context k3d-cka k8s-admin
sudo KUBECONFIG=/home/ubuntu/.kube/config kubectl config set-context k8s-cluster --cluster=k3d-cka --user=admin@k3d-cka

sudo mkdir -p /root/.kube
sudo cp /home/ubuntu/.kube/config /root/.kube/config
sudo echo "export KUBECONFIG=/root/.kube/config" >> /root/.bashrc

# Wait for all nodes to be ready
sleep 15

# Install Node.js and build tools for node-pty
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential python3

# Clone repository and start backend
cd /home/ubuntu
git clone https://github.com/osadaRajapaksha/CKAExamSimulator.git
cd CKAExamSimulator/backend

# Apply prerequisite resources for the exam questions
# Note: we use kubectl directly now instead of k3s kubectl
sudo KUBECONFIG=/home/ubuntu/.kube/config kubectl apply -f /home/ubuntu/CKAExamSimulator/backend/setup.yaml

# Taint the second agent node for question 7
sudo KUBECONFIG=/home/ubuntu/.kube/config kubectl taint nodes k3d-cka-agent-1 dedicated=special-team:NoSchedule

# Install and start backend
npm install
nohup node server.js > backend.log 2>&1 &
