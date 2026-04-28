import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  XMarkIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/solid';
import './GameFastCalc.css';

const GameFastCalc = () => {
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
  const [timeLeft, setTimeLeft] = useState(30); // Уақытты көбейттім
  const questions = location.state?.questions || [];
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const getInitialQuestion = () => {
    if (questions.length > 0) {
      const q = questions[0];
      return { q: q.q, a: q.a, options: [q.a, q.w1, q.w2, q.w3].sort(() => Math.random() - 0.5) };
    }
    return { q: '12 + 8 = ?', a: '20', options: ['18', '20', '22', '25'].sort(() => Math.random() - 0.5) };
  };

  const [currentQuestion, setCurrentQuestion] = useState(getInitialQuestion());

  useEffect(() => {
    if (timeLeft > 0 && !isGameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isGameOver) {
      setIsGameOver(true);
    }
  }, [timeLeft, isGameOver]);

  useEffect(() => {
    if (isGameOver && score > 0) {
      import('../../api').then(({ default: api }) => {
        api.post('users/add_xp/', { points: score }).catch(err => console.error(err));
      });
    }
  }, [isGameOver, score]);

  const handleAnswer = (option) => {
    if (isGameOver) return;
    setSelectedOption(option);
    
    if (option === currentQuestion.a) {
      setScore(score + 10);
      setTimeout(() => {
        const nextIdx = qIdx + 1;
        if (questions.length > 0 && nextIdx < questions.length) {
          const q = questions[nextIdx];
          setCurrentQuestion({ q: q.q, a: q.a, options: [q.a, q.w1, q.w2, q.w3].sort(() => Math.random() - 0.5) });
          setQIdx(nextIdx);
        } else if (questions.length === 0) {
          // Кездейсоқ генерация (егер мұғалім сұрақ жазбаса)
          const n1 = Math.floor(Math.random() * 20);
          const n2 = Math.floor(Math.random() * 20);
          const ans = (n1 + n2).toString();
          setCurrentQuestion({
            q: `${n1} + ${n2} = ?`,
            a: ans,
            options: [ans, (n1+n2+2).toString(), (n1+n2-2).toString(), (n1+n2+5).toString()].sort(() => Math.random() - 0.5)
          });
        } else {
          // Сұрақтар бітті
          setIsGameOver(true);
        }
        setSelectedOption(null);
      }, 500);
    } else {
      setTimeout(() => setIsGameOver(true), 500);
    }
  };

  return (
    <div className="game-container">
      {/* GAME HEADER */}
      <header className="game-header">
        <button className="close-btn" onClick={handleExit}><XMarkIcon /></button>
        <div className="game-progress-bar">
          <div className="progress-fill" style={{ width: `${(timeLeft / 15) * 100}%` }}></div>
        </div>
        <div className="game-stats">
          <div className="stat-item">
            <ClockIcon className="stat-icon" />
            <span>{timeLeft}с</span>
          </div>
          <div className="stat-item">
            <CheckCircleIcon className="stat-icon score" />
            <span>{score}</span>
          </div>
        </div>
      </header>

      {/* GAME CONTENT */}
      {!isGameOver ? (
        <main className="game-main">
          <div className="question-box">
            <h2 className="question-text">{currentQuestion.q}</h2>
          </div>

          <div className="options-grid">
            {currentQuestion.options.map((option, idx) => (
              <button 
                key={idx} 
                className={`option-btn ${selectedOption === option ? (option === currentQuestion.a ? 'correct' : 'wrong') : ''}`}
                onClick={() => handleAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </main>
      ) : (
        <div className="game-over-overlay">
          <div className="game-over-card">
            {timeLeft === 0 ? <ClockIcon className="over-icon" /> : <ExclamationCircleIcon className="over-icon" />}
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

export default GameFastCalc;
