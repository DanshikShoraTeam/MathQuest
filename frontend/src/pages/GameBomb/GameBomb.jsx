import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  XMarkIcon, 
  FireIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/solid';
import './GameBomb.css';

const GameBomb = () => {
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
  const [timeLeft, setTimeLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [defused, setDefused] = useState(false);
  const [options, setOptions] = useState([]);

  // Мұғалім дайындаған сұрақтар
  const customQuestions = location.state?.questions || [];

  useEffect(() => {
    generateQuestion(0);
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !isGameOver && !defused) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !defused && !isGameOver) {
      setIsGameOver(true);
    }
  }, [timeLeft, isGameOver, defused]);

  useEffect(() => {
    if (isGameOver && score > 0) {
      import('../../api').then(({ default: api }) => {
        api.post('users/add_xp/', { points: score }).catch(err => console.error(err));
      });
    }
  }, [isGameOver, score]);

  const generateQuestion = (idx) => {
    const qIdx = idx !== undefined ? idx : questionIndex;
    
    if (customQuestions.length > 0 && customQuestions[qIdx]) {
      const q = customQuestions[qIdx];
      setCurrentQuestion({ q: q.q, a: q.a });
      // Жауаптарды араластыру
      const opts = [q.a, q.w1, q.w2, q.w3].filter(Boolean).sort(() => Math.random() - 0.5);
      setOptions(opts);
    } else {
      // Кездейсоқ генерация (fallback)
      const num1 = Math.floor(Math.random() * 50) + 10;
      const num2 = Math.floor(Math.random() * 30) + 10;
      const ans = num1 - num2;
      setCurrentQuestion({ q: `${num1} - ${num2} = ?`, a: ans });
      setOptions([ans - 5, ans, ans + 2, ans + 10].sort(() => Math.random() - 0.5));
    }
    
    setTimeLeft(Math.max(5, 10 - Math.floor(score / 50)));
    setDefused(false);
  };

  const handleAnswer = (option) => {
    if (isGameOver || defused) return;

    if (String(option) === String(currentQuestion.a)) {
      setDefused(true);
      setScore(prev => prev + 20);
      
      setTimeout(() => {
        if (customQuestions.length > 0 && questionIndex + 1 >= customQuestions.length) {
          setIsGameOver(true); // Барлық сұрақ бітті
        } else {
          const nextIdx = questionIndex + 1;
          setQuestionIndex(nextIdx);
          generateQuestion(nextIdx);
        }
      }, 800);
    } else {
      setIsGameOver(true);
    }
  };

  return (
    <div className={`game-container bomb-bg ${isGameOver ? 'exploded' : defused ? 'defused' : ''}`}>
      <header className="game-header">
        <button className="close-btn" onClick={handleExit}><XMarkIcon /></button>
        <div className="game-stats">
          <div className="stat-item">
            <CheckCircleIcon className="stat-icon score" />
            <span>{score}</span>
          </div>
        </div>
      </header>

      {!isGameOver ? (
        <main className="bomb-main">
          <div className={`bomb-graphic ${timeLeft <= 3 ? 'panic' : ''}`}>
            <FireIcon className="bomb-icon" />
            <div className="bomb-timer">{timeLeft}с</div>
          </div>

          <div className="bomb-question-box">
            <h2>{currentQuestion?.q}</h2>
          </div>

          <div className="bomb-options-grid">
            {options.map((opt, idx) => (
              <button key={idx} className="bomb-option-btn" onClick={() => handleAnswer(opt)}>
                {opt}
              </button>
            ))}
          </div>
        </main>
      ) : (
        <div className="game-over-overlay">
          <div className="game-over-card">
            <XCircleIcon className="over-icon error" />
            <h2>Бум! Жарылды!</h2>
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

export default GameBomb;
