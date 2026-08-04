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

# K3d and clusters will be managed dynamically by the node.js backend.
# Install Node.js and build tools for node-pty
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential python3

# Clone repository and start backend
cd /home/ubuntu
git clone https://github.com/osadaRajapaksha/CKAExamSimulator.git
cd CKAExamSimulator/backend

# Backend handles cluster creation and setup automatically per user

# Install and start backend
npm install
nohup node server.js > backend.log 2>&1 &
