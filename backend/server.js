const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const pty = require('node-pty');
const os = require('os');
const cors = require('cors');

const app = express();
app.use(cors());

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
        cwd: process.env.HOME || process.cwd(),
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

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});
