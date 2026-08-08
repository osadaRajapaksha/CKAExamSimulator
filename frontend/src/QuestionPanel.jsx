import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, PlayCircle, Loader2 } from 'lucide-react';
import questions from './questions.json';

export default function QuestionPanel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState(null); // 'success', 'error', null
  const [verifyLogs, setVerifyLogs] = useState('');
  
  const question = questions[currentIndex];

  // Reset verification state when changing questions
  useEffect(() => {
    setVerifyStatus(null);
    setVerifyLogs('');
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyStatus(null);
    setVerifyLogs('Running verification scripts...');
    
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
      const apiUrl = wsUrl.replace('ws://', 'http://').replace('wss://', 'https://').replace('/ws', '') + '/api/verify';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId: question.id }),
      });
      
      const data = await response.json();
      setVerifyStatus(data.success ? 'success' : 'error');
      setVerifyLogs(data.logs || (data.success ? 'Success!' : 'Failed.'));
    } catch (err) {
      setVerifyStatus('error');
      setVerifyLogs('Failed to reach backend server. ' + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="question-panel">
      <div className="question-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={20} color={currentIndex > 0 ? "var(--success-color)" : "var(--text-muted)"} />
          <span style={{ fontWeight: 500 }}>
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="question-nav-buttons">
          <button 
            className="nav-btn" 
            onClick={handlePrev} 
            disabled={currentIndex === 0}
            title="Previous Question"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            className="nav-btn" 
            onClick={handleNext} 
            disabled={currentIndex === questions.length - 1}
            title="Next Question"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="question-content">
        <div className="question-title">
          <h2>Task</h2>
          <span className="weight-badge">Weight: {question.weight}</span>
        </div>
        
        <div className="context-box">
          Set configuration context: <code>kubectl config use-context {question.context}</code>
        </div>
        
        <div 
          className="task-description" 
          dangerouslySetInnerHTML={{ __html: question.description }}
        />
        
        <div className="verify-section" style={{ marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <button 
            className="verify-btn" 
            onClick={handleVerify}
            disabled={isVerifying}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px', borderRadius: '6px',
              backgroundColor: 'var(--primary-color)', color: 'white',
              border: 'none', cursor: 'pointer', fontWeight: 500,
              fontSize: '14px', transition: 'background-color 0.2s'
            }}
          >
            {isVerifying ? <Loader2 size={18} className="spin" /> : <PlayCircle size={18} />}
            Check Task
          </button>
          
          {(verifyStatus || isVerifying) && (
            <div className={`verify-result ${verifyStatus}`} style={{ marginTop: '16px' }}>
              <div style={{
                padding: '12px',
                borderRadius: '6px',
                backgroundColor: verifyStatus === 'success' ? 'rgba(34, 197, 94, 0.1)' : 
                                 verifyStatus === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${verifyStatus === 'success' ? '#22c55e' : verifyStatus === 'error' ? '#ef4444' : '#334155'}`,
              }}>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  color: verifyStatus === 'success' ? '#22c55e' : verifyStatus === 'error' ? '#ef4444' : 'var(--text-muted)' 
                }}>
                  {isVerifying ? 'Checking...' : verifyStatus === 'success' ? 'Task Passed' : 'Task Failed'}
                </h4>
                <pre style={{ 
                  margin: 0, padding: '10px', backgroundColor: '#0f172a', 
                  borderRadius: '4px', fontSize: '13px', color: '#e2e8f0',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  fontFamily: '"JetBrains Mono", monospace'
                }}>
                  {verifyLogs}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
