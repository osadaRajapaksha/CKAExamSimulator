import { useState, useEffect } from 'react';
import QuestionPanel from './QuestionPanel';
import Terminal from './Terminal';
import { Terminal as TerminalIcon, Clock } from 'lucide-react';
import './index.css';

function App() {
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <header className="app-header">
        <div className="app-title">
          <TerminalIcon className="k8s-logo" size={28} />
          CKA Exam Simulator
        </div>
        <div className="timer">
          <Clock size={18} />
          {formatTime(timeLeft)}
        </div>
      </header>
      
      <main className="main-layout">
        <QuestionPanel />
        <Terminal />
      </main>
    </>
  );
}

export default App;
