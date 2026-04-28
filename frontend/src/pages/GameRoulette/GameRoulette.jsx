import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  XMarkIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';
import './GameRoulette.css';

const GameRoulette = () => {
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
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Мұғалім дайындаған сұрақтар
  const customQuestions = location.state?.questions || [];
  const totalQuestions = customQuestions.length > 0 ? customQuestions.length : 7;
  
  const operators = ['+', '-', '×', '÷'];

  useEffect(() => {
    generateQuestion(1);
  }, []);

  useEffect(() => {
    if (isGameOver && score > 0) {
      import('../../api').then(({ default: api }) => {
        api.post('users/add_xp/', { points: score }).catch(err => console.error(err));
      });
    }
  }, [isGameOver, score]);

  const generateQuestion = (idx) => {
    const qIdx = (idx || questionCount) - 1;

    if (customQuestions.length > 0 && customQuestions[qIdx]) {
      const q = customQuestions[qIdx];
      // Формат: "10 ? 2 = 5", Жауап: "÷"
      const resultMatch = q.q.match(/(\d+)\s*\?\s*(\d+)\s*=\s*(\d+)/);
      if (resultMatch) {
        setCurrentQuestion({
          num1: resultMatch[1],
          num2: resultMatch[2],
          ans: resultMatch[3],
          op: q.a
        });
      } else {
        // Fallback parsing if regex fails
        const parts = q.q.split(/[?= ]+/).map(p => p.trim()).filter(Boolean);
        setCurrentQuestion({
          num1: parts[0] || 0,
          num2: parts[1] || 0,
          ans: parts[2] || 0,
          op: q.a
        });
      }
    } else {
      // Fallback
      const n1 = Math.floor(Math.random() * 10) + 1;
      const n2 = Math.floor(Math.random() * 10) + 1;
      const op = operators[Math.floor(Math.random() * 3)]; // +, -, *
      let ans = 0;
      if (op === '+') ans = n1 + n2;
      if (op === '-') ans = n1 - n2;
      if (op === '×') ans = n1 * n2;
      setCurrentQuestion({ num1: n1, num2: n2, ans, op });
    }
  };

  const spinAndAnswer = (selectedOp) => {
    if (isGameOver || isSpinning) return;
    setIsSpinning(true);
    
    setTimeout(() => {
      setIsSpinning(false);
      const isCorrect = String(selectedOp) === String(currentQuestion.op);
      
      if (isCorrect) {
        setScore(prev => prev + 15);
        setTimeout(() => {
          if (questionCount >= totalQuestions) {
            setIsGameOver(true);
          } else {
            const nextCount = questionCount + 1;
            setQuestionCount(nextCount);
            generateQuestion(nextCount);
          }
        }, 500);
      } else {
        setTimeout(() => setIsGameOver(true), 500);
      }
    }, 800);
  };

  return (
    <div className="game-container roulette-bg">
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
        <main className="roulette-main">
          <div className="roulette-title">
            <h2>Сиқырлы Рулетка</h2>
            <p>Қандай амал жасырылған?</p>
          </div>

          <div className="equation-display">
            <div className="eq-num">{currentQuestion?.num1}</div>
            <div className={`eq-op-box ${isSpinning ? 'spinning' : ''}`}>
              {isSpinning ? <ArrowPathIcon className="spin-icon" /> : '?'}
            </div>
            <div className="eq-num">{currentQuestion?.num2}</div>
            <div className="eq-equals">=</div>
            <div className="eq-ans">{currentQuestion?.ans}</div>
          </div>

          <div className="roulette-controls">
            {operators.map((op, idx) => (
              <button 
                key={idx} 
                className="roulette-btn" 
                onClick={() => spinAndAnswer(op)}
                disabled={isSpinning}
              >
                {op}
              </button>
            ))}
          </div>
        </main>
      ) : (
        <div className="game-over-overlay">
          <div className="game-over-card">
            {questionCount >= 7 ? <CheckCircleIcon className="over-icon success" /> : <XCircleIcon className="over-icon error" />}
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

export default GameRoulette;
