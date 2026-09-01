import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import questions from './questions.json';
import './index.css';

export default function ScoreSummary({ questionProgress, onRestart }) {
  // Parse weight string (e.g. "5%") to integer
  const getWeight = (weightStr) => parseInt(weightStr.replace('%', ''), 10) || 0;

  let totalScore = 0;
  let maxScore = 0;
  let passedCount = 0;
  let failedCount = 0;
  let pendingCount = 0;

  questions.forEach(q => {
    const weight = getWeight(q.weight);
    maxScore += weight;
    const status = questionProgress[q.id];
    
    if (status === 'success') {
      totalScore += weight;
      passedCount++;
    } else if (status === 'error') {
      failedCount++;
    } else {
      pendingCount++;
    }
  });

  // Calculate percentage (default to 0 if maxScore is 0)
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const passed = percentage >= 66; // Standard CKA pass mark is 66%

  return (
    <div className="score-summary-container" style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)',
      padding: '40px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-panel)', padding: '40px', borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)', maxWidth: '600px', width: '100%',
        textAlign: 'center', border: `1px solid ${passed ? 'var(--success-color)' : '#ef4444'}`
      }}>
        {passed ? (
          <CheckCircle2 size={80} color="var(--success-color)" style={{ margin: '0 auto 20px' }} />
        ) : (
          <XCircle size={80} color="#ef4444" style={{ margin: '0 auto 20px' }} />
        )}
        
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
          {passed ? 'Congratulations!' : 'Exam Failed'}
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '30px' }}>
          You scored <strong style={{ color: passed ? 'var(--success-color)' : '#ef4444', fontSize: '1.5rem' }}>{percentage}%</strong>
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '40px' }}>
          <div style={{ padding: '15px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid var(--success-color)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>{passedCount}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Passed</div>
          </div>
          <div style={{ padding: '15px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid #ef4444' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{failedCount}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Failed</div>
          </div>
          <div style={{ padding: '15px', backgroundColor: 'rgba(148, 163, 184, 0.1)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>{pendingCount}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Unattempted</div>
          </div>
        </div>

        <button 
          onClick={onRestart} 
          style={{ 
            padding: '12px 24px', fontSize: '1.1rem', cursor: 'pointer', 
            backgroundColor: 'var(--accent-color)', color: 'white', 
            border: 'none', borderRadius: '6px', fontWeight: 600,
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-color)'}
        >
          Restart Simulator
        </button>
      </div>
    </div>
  );
}
