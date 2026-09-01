import { useState, useEffect } from 'react';
import { useAuthContext } from "@asgardeo/auth-react";
import QuestionPanel from './QuestionPanel';
import Terminal from './Terminal';
import { Terminal as TerminalIcon, Clock, LogOut } from 'lucide-react';
import './index.css';

function App() {
  const { state, signIn, signOut } = useAuthContext();
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds
  const [examFinished, setExamFinished] = useState(false);

  useEffect(() => {
    if (examFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setExamFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examFinished]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (state.isLoading) {
    return (
      <div className="login-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#1e1e1e', color: 'white' }}>
        <TerminalIcon className="k8s-logo" size={64} style={{ marginBottom: '20px' }} />
        <h1 style={{ marginBottom: '30px' }}>CKA Exam Simulator</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return (
      <div className="login-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#1e1e1e', color: 'white' }}>
        <TerminalIcon className="k8s-logo" size={64} style={{ marginBottom: '20px' }} />
        <h1 style={{ marginBottom: '30px' }}>CKA Exam Simulator</h1>
        <button onClick={ () => signIn() } style={{ padding: '10px 20px', fontSize: '18px', cursor: 'pointer', backgroundColor: '#326ce5', color: 'white', border: 'none', borderRadius: '5px' }}>
          Login
        </button>
      </div>
    );
  }

  if (examFinished) {
    return (
      <div className="exam-finished-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#0f172a', color: 'white' }}>
        <TerminalIcon className="k8s-logo" size={64} style={{ marginBottom: '20px', color: '#10b981' }} />
        <h1 style={{ marginBottom: '20px' }}>Exam Finished</h1>
        <p>Your session has ended. Calculating results...</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '30px', padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px' }}>
          Restart Simulator
        </button>
      </div>
    );
  }

  return (
    <>
      <header className="app-header">
        <div className="app-title">
          <TerminalIcon className="k8s-logo" size={28} />
          CKA Exam Simulator
        </div>
        <div className="timer" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: timeLeft < 300 ? '#ef4444' : 'inherit' }}>
            <Clock size={18} />
            {formatTime(timeLeft)}
          </div>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to finish the exam early?')) {
                setExamFinished(true);
              }
            }}
            style={{ padding: '6px 12px', fontSize: '14px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Finish Exam
          </button>
          <button onClick={() => signOut()} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
            <LogOut size={18} />
          </button>
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
