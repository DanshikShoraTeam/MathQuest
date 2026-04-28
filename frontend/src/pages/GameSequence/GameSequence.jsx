import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  XMarkIcon, 
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/solid';
import './GameSequence.css';

const GameSequence = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleExit = () => {
    if (location.state?.fromLessonId) {
      navigate(`/student/lesson/${location.state.fromLessonId}`, { 
        state: { activeStep: location.state.activeStep },
        replace: true
      });
    } else {
      navigate(-1);
    }
  };
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [sequence, setSequence] = useState([]);
  const [options, setOptions] = useState([]);
  const [missingIndex, setMissingIndex] = useState(0);

  // Мұғалім дайындаған сұрақтар
  const customQuestions = location.state?.questions || [];
  const totalQuestions = customQuestions.length > 0 ? customQuestions.length : 5;

  useEffect(() => {
    generateSequence(1);
  }, []);

  useEffect(() => {
    if (isGameOver && score > 0) {
      import('../../api').then(({ default: api }) => {
        api.post('users/add_xp/', { points: score }).catch(err => console.error(err));
      });
    }
  }, [isGameOver, score]);

  const generateSequence = (idx) => {
    const qIdx = (idx || questionCount) - 1;

    if (customQuestions.length > 0 && customQuestions[qIdx]) {
      const q = customQuestions[qIdx];
      // Сұрақ "2, 4, 6, ..." форматында болуы мүмкін
      const parts = q.q.split(/[, ]+/).map(p => p.trim()).filter(Boolean);
      
      let mIdx = parts.indexOf('...');
      if (mIdx === -1) mIdx = parts.indexOf('?');
      if (mIdx === -1) {
        // Егер белгі болмаса, соңғысын сұрақ қыламыз
        parts.push('...');
        mIdx = parts.length - 1;
      }

      setSequence(parts);
      setMissingIndex(mIdx);
      
      const opts = [q.a, q.w1, q.w2, q.w3].filter(Boolean).sort(() => Math.random() - 0.5);
      setOptions(opts);
    } else {
      // Fallback
      const start = Math.floor(Math.random() * 20) + 1;
      const step = Math.floor(Math.random() * 5) + 2; 
      const seq = [start, start + step, start + step * 2, start + step * 3, '...'];
      const ans = start + step * 4;
      
      setSequence(seq);
      setMissingIndex(4);
      setOptions([ans, ans + 2, ans - 2, ans + 5].sort(() => Math.random() - 0.5));
    }
  };

  const handleAnswer = (option) => {
    if (isGameOver) return;

    const qIdx = questionCount - 1;
    const correctAnswer = customQuestions.length > 0 ? customQuestions[qIdx].a : (sequence[missingIndex] === '...' ? (parseInt(sequence[0]) + (parseInt(sequence[1])-parseInt(sequence[0]))*4).toString() : sequence[missingIndex]);
    
    if (String(option) === String(correctAnswer)) {
      setScore(prev => prev + 15);
      
      setTimeout(() => {
        if (questionCount >= totalQuestions) {
          setIsGameOver(true);
        } else {
          const nextCount = questionCount + 1;
          setQuestionCount(nextCount);
          generateSequence(nextCount);
        }
      }, 500);
    } else {
      setTimeout(() => setIsGameOver(true), 500);
    }
  };

  return (
    <div className="game-container seq-bg">
      <header className="game-header">
        <button className="close-btn" onClick={handleExit}><XMarkIcon /></button>
        <div className="game-progress-bar">
          <div className="progress-fill" style={{ width: `${(questionCount / totalQuestions) * 100}%` }}></div>
        </div>
        <div className="game-stats">
          <div className="stat-item">
            <CheckCircleIcon className="stat-icon score" />
            <span>{score}</span>
          </div>
        </div>
      </header>

      {!isGameOver ? (
        <main className="seq-main">
          <div className="seq-title">
            <h2>Тізбекті жалғастыр</h2>
            <p>Сұрақ белгісінің орнына қандай сан келеді?</p>
          </div>

          <div className="seq-blocks">
            {sequence.map((num, idx) => (
              <div key={idx} className={`seq-block ${idx === missingIndex ? 'missing' : ''}`}>
                {idx === missingIndex ? '?' : num}
              </div>
            ))}
          </div>

          <div className="seq-options">
            {options.map((opt, idx) => (
              <button key={idx} className="seq-option-btn" onClick={() => handleAnswer(opt)}>
                {opt}
              </button>
            ))}
          </div>
        </main>
      ) : (
        <div className="game-over-overlay">
          <div className="game-over-card">
            {questionCount >= 5 ? <CheckCircleIcon className="over-icon success" /> : <XCircleIcon className="over-icon error" />}
            <h2>Ойын аяқталды!</h2>
            <div className="final-score">
              <p>Жалпы балл</p>
              <h3>{score}</h3>
            </div>
            <button className="restart-btn" onClick={() => window.location.reload()}>Қайталау</button>
            <button className="exit-btn" onClick={handleExit}>Шығу</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSequence;
