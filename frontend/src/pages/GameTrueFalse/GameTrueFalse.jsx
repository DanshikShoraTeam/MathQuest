import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  XMarkIcon, 
  CheckCircleIcon,
  XCircleIcon,
  CheckIcon,
  XMarkIcon as CloseIcon
} from '@heroicons/react/24/solid';
import './GameTrueFalse.css';

const GameTrueFalse = () => {
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
  const [feedback, setFeedback] = useState(null);

  // Мұғалім дайындаған сұрақтар немесе бос тізім
  const customQuestions = location.state?.questions || [];
  const totalQuestions = customQuestions.length > 0 ? customQuestions.length : 10;

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
      // Егер мұғалім True/False форматында берсе (q, isTrue)
      // Бірақ біздің редакторымыз (q, a, w1, w2, w3) форматында береді
      // Сондықтан a === 'Дұрыс' немесе кездейсоқ жауаптармен салыстырамыз
      setCurrentQuestion({
        statement: q.q,
        isTrue: q.a.toLowerCase() === 'шын' || q.a.toLowerCase() === 'true' || q.a.toLowerCase() === 'дұрыс'
      });
    } else {
      // Кездейсоқ генерация (fallback)
      const num1 = Math.floor(Math.random() * 20) + 1;
      const num2 = Math.floor(Math.random() * 20) + 1;
      const isTrue = Math.random() > 0.5;
      const realAns = num1 + num2;
      const fakeAns = realAns + (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
      
      setCurrentQuestion({
        statement: `${num1} + ${num2} = ${isTrue ? realAns : fakeAns}`,
        isTrue: isTrue
      });
    }
    setFeedback(null);
  };

  const handleAnswer = (userAnswer) => {
    if (isGameOver || feedback) return;

    if (userAnswer === currentQuestion.isTrue) {
      setFeedback('correct');
      setScore(prev => prev + 10);
      
      setTimeout(() => {
        if (questionCount >= totalQuestions) {
          setIsGameOver(true);
        } else {
          const nextCount = questionCount + 1;
          setQuestionCount(nextCount);
          generateQuestion(nextCount);
        }
      }, 800);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setIsGameOver(true);
      }, 1000);
    }
  };

  return (
    <div className={`game-container tf-bg ${feedback === 'correct' ? 'tf-correct' : feedback === 'wrong' ? 'tf-wrong' : ''}`}>
      {/* HEADER */}
      <header className="game-header">
        <button className="close-btn" onClick={handleExit}><CloseIcon /></button>
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

      {/* MAIN */}
      {!isGameOver ? (
        <main className="tf-main">
          <div className="tf-question-box">
            <h2 className="tf-statement">{currentQuestion?.statement}</h2>
          </div>

          <div className="tf-controls">
            <button className="tf-btn false-btn" onClick={() => handleAnswer(false)}>
              <XCircleIcon className="tf-icon" />
              ЖАЛҒАН
            </button>
            <button className="tf-btn true-btn" onClick={() => handleAnswer(true)}>
              <CheckCircleIcon className="tf-icon" />
              ШЫНДЫҚ
            </button>
          </div>
        </main>
      ) : (
        <div className="game-over-overlay">
          <div className="game-over-card">
            {questionCount >= 10 ? <CheckCircleIcon className="over-icon success" /> : <XCircleIcon className="over-icon error" />}
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

export default GameTrueFalse;
