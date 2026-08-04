import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useAuthContext } from "@asgardeo/auth-react";
import '@xterm/xterm/css/xterm.css';

export default function Terminal() {
  const { state } = useAuthContext();

  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    // Initialize xterm.js
    const term = new XTerm({
      cursorBlink: true,
      theme: {
        background: '#000000',
        foreground: '#f8fafc',
        cursor: '#f8fafc',
      },
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 14,
    });
    
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Connect to WebSocket server
    const wsUrlBase = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    const userId = state?.username || state?.sub || 'anonymous';
    const wsUrl = `${wsUrlBase}?userId=${encodeURIComponent(userId)}`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      // The backend will handle the initial messages
      // Send initial dimensions
      ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
    };

    ws.onmessage = (event) => {
      // Data from backend to terminal
      term.write(event.data);
    };

    term.onData((data) => {
      // Data from terminal to backend
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input', data: data }));
      }
    });

    const handleResize = () => {
      fitAddon.fit();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ws.close();
      term.dispose();
    };
  }, []);

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <span>Terminal - node1 (k8s-cluster)</span>
      </div>
      <div className="terminal-wrapper" ref={terminalRef}></div>
    </div>
  );
}
