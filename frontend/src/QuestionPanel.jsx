import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import questions from './questions.json';

export default function QuestionPanel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const question = questions[currentIndex];

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
      </div>
    </div>
  );
}
