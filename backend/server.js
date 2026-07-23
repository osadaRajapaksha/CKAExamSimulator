const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const pty = require('node-pty');
const os = require('os');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

wss.on('connection', (ws) => {
    console.log('Client connected to terminal websocket.');

    // Spawn a pseudo-terminal
    const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: '/root',
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
        console.log('Client disconnected.');
        ptyProcess.kill();
    });
});

app.get('/', (req, res) => {
    res.send('CKA Simulator Backend is running.');
});

const { exec } = require('child_process');
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
