import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/solid';
import './GameFastCalc.css';

const GameFastCalc = () => {
  const [timeLeft, setTimeLeft] = useState(15);
  const [currentQuestion, setCurrentQuestion] = useState({ q: '12 + 8 = ?', a: 20, options: [18, 20, 22, 25] });
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (timeLeft > 0 && !isGameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsGameOver(true);
    }
  }, [timeLeft, isGameOver]);

  const handleAnswer = (option) => {
    if (isGameOver) return;
    setSelectedOption(option);
    
    if (option === currentQuestion.a) {
      setScore(score + 10);
      // Generate next question (simple logic for now)
      setTimeout(() => {
        const num1 = Math.floor(Math.random() * 20);
        const num2 = Math.floor(Math.random() * 20);
        const ans = num1 + num2;
        setCurrentQuestion({
          q: `${num1} + ${num2} = ?`,
          a: ans,
          options: [ans - 2, ans, ans + 2, ans + 5].sort(() => Math.random() - 0.5)
        });
        setSelectedOption(null);
      }, 500);
    } else {
      // Wrong answer
      setTimeout(() => setIsGameOver(true), 500);
    }
  };

  return (
    <div className="game-container">
      {/* GAME HEADER */}
      <header className="game-header">
        <button className="close-btn"><XMarkIcon /></button>
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
            <button className="exit-btn">Шығу</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameFastCalc;
