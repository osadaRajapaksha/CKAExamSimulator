const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const pty = require('node-pty');
const os = require('os');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let userId = url.searchParams.get('userId');
    if (!userId) {
        userId = 'anonymous'; // Fallback
    }

    // Sanitize userId to be safe for cluster names
    userId = userId.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    const clusterName = `cka-${userId}`;

    console.log(`Client connected to terminal websocket for user: ${userId}`);
    ws.send('\x1b[33m\x1b[1mChecking cluster status...\x1b[0m\r\n');

    const startTerminal = () => {
        // Spawn a pseudo-terminal into the k3d cluster container
        const ptyProcess = pty.spawn('docker', ['exec', '-it', `k3d-${clusterName}-server-0`, 'sh'], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: os.homedir(),
            env: process.env
        });

        // Send data from the pty to the websocket
        ptyProcess.onData((data) => {
            ws.send(data);
        });

        // Receive data from the websocket and write to the pty
        ws.on('message', (msg) => {
            try {
                const parsed = JSON.parse(msg.toString());
                if (parsed.type === 'resize') {
                    ptyProcess.resize(parsed.cols, parsed.rows);
                } else if (parsed.type === 'input') {
                    ptyProcess.write(parsed.data);
                }
            } catch (e) {
                ptyProcess.write(msg.toString());
            }
        });

        ws.on('close', () => {
            console.log(`Client disconnected for user: ${userId}`);
            ptyProcess.kill();
        });
    };

    exec(`k3d cluster get ${clusterName}`, (err) => {
        if (err) {
            ws.send(`\x1b[33m\x1b[1mProvisioning new K3s cluster for ${userId}. This takes about 15-30 seconds...\x1b[0m\r\n`);
            exec(`k3d cluster create ${clusterName} --servers 1 --agents 2`, (createErr, stdout, stderr) => {
                if (createErr) {
                    ws.send(`\x1b[31m\x1b[1mFailed to create cluster:\r\n${stderr}\x1b[0m\r\n`);
                    return;
                }
                
                // Get the kubeconfig for the new cluster
                exec(`k3d kubeconfig get ${clusterName}`, (kubeConfErr, kubeConfOut) => {
                    if (kubeConfErr) {
                        ws.send(`\x1b[31m\x1b[1mFailed to get kubeconfig: ${kubeConfErr.message}\x1b[0m\r\n`);
                        return;
                    }
                    
                    const fs = require('fs');
                    const os = require('os');
                    const path = require('path');
                    const kubeconfigPath = path.join(os.homedir(), `.kubeconfig-${clusterName}`);
                    fs.writeFileSync(kubeconfigPath, kubeConfOut);

                    // Wait a bit for nodes to be fully ready before applying manifests
                    ws.send('\x1b[33m\x1b[1mConfiguring cluster resources...\x1b[0m\r\n');
                    setTimeout(() => {
                        const setupYamlPath = path.join(__dirname, 'setup.yaml');
                        exec(`kubectl --kubeconfig=${kubeconfigPath} apply -f ${setupYamlPath}`, (applyErr, applyOut) => {
                            if (applyErr) {
                                ws.send(`\x1b[31m\x1b[1mFailed to apply setup.yaml:\r\n${applyErr.message}\x1b[0m\r\n`);
                            }
                            
                            // Taint the agent-1 node
                            exec(`kubectl --kubeconfig=${kubeconfigPath} taint nodes k3d-${clusterName}-agent-1 dedicated=special-team:NoSchedule`, (taintErr) => {
                                ws.send('\x1b[32m\x1b[1mCluster created successfully!\x1b[0m\r\n');
                                
                                // Set 2 hour deletion timer
                                setTimeout(() => {
                                    console.log(`2 hour timer expired. Deleting cluster ${clusterName}...`);
                                    exec(`k3d cluster delete ${clusterName}`);
                                    if (fs.existsSync(kubeconfigPath)) {
                                        fs.unlinkSync(kubeconfigPath);
                                    }
                                    if (ws.readyState === 1) { // OPEN
                                        ws.send('\x1b[31m\x1b[1mSession expired. Cluster deleted.\x1b[0m\r\n');
                                        ws.close();
                                    }
                                }, 2 * 60 * 60 * 1000); // 2 hours

                                startTerminal();
                            });
                        });
                    }, 10000); // 10 seconds delay for nodes to be ready
                });
            });
        } else {
            ws.send('\x1b[32m\x1b[1mCluster found!\x1b[0m\r\n');
            startTerminal();
        }
    });
});

app.get('/', (req, res) => {
    res.send('CKA Simulator Backend is running.');
});

const path = require('path');

app.post('/api/verify', (req, res) => {
    const { taskId } = req.body;
    if (!taskId) {
        return res.status(400).json({ error: 'taskId is required' });
    }

    const scriptPath = path.join(__dirname, 'verify-scripts', `${taskId}.sh`);
    
    // Run the verification script
    exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
            return res.json({
                success: false,
                logs: stdout + stderr || error.message
            });
        }
        return res.json({
            success: true,
            logs: stdout + stderr || 'Validation passed.'
        });
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});
