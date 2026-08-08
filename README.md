# CKA Exam Simulator

Welcome to the CKA Exam Simulator project! This application provides a realistic environment for practicing for the Certified Kubernetes Administrator (CKA) exam.

## Project Structure

The project is divided into three main components:

- **`frontend/`**: The web user interface, built with React and Vite. It provides the exam questions panel and an integrated terminal (using xterm.js) to interact with the Kubernetes cluster.
- **`backend/`**: The backend server, built with Node.js and Express. It uses `node-pty` and WebSockets to provide the terminal emulation backend, allowing the frontend terminal to communicate with the underlying system.
- **`terraform/`**: Infrastructure as Code (IaC) using Terraform to provision the necessary AWS resources (Ubuntu instances) and install k3s to provide the Kubernetes cluster for the simulator.

## Getting Started

### Prerequisites

- Node.js and npm (for frontend and backend)
- Terraform (for infrastructure provisioning)
- AWS CLI configured with appropriate credentials (if deploying via Terraform)

### Local Development Setup

#### 1. Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server (ensure any necessary environment variables are set):
   ```bash
   node server.js
   ```

#### 2. Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### Infrastructure Provisioning

The `terraform` directory contains scripts to deploy an AWS environment with k3s installed.

1. Navigate to the terraform directory:
   ```bash
   cd terraform
   ```
2. Initialize Terraform:
   ```bash
   terraform init
   ```
3. Review and apply the configuration:
   ```bash
   terraform plan
   terraform apply
   ```

## Technologies Used

- **Frontend:** React, Vite, xterm.js, Lucide React, Asgardeo Auth
- **Backend:** Node.js, Express, WebSockets (ws), node-pty
- **Infrastructure:** Terraform, AWS, K3s (Lightweight Kubernetes)

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
