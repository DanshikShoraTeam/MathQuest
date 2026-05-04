import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon as CloseIcon
} from '@heroicons/react/24/solid';
import './GameTrueFalse.css';

/**
 * Генерирует вопрос Шын/Жалған для 5 класса.
 * Возвращает { statement, isTrue, explanation }.
 */
const generateQuestion5Class = () => {
  const types = ['add', 'subtract', 'multiply', 'percent'];
  const type = types[Math.floor(Math.random() * types.length)];
  const isCorrect = Math.random() > 0.5;

  if (type === 'add') {
    const n1 = Math.floor(Math.random() * 500) + 100;
    const n2 = Math.floor(Math.random() * 500) + 100;
    const real = n1 + n2;
    const fake = real + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 20) + 5);
    return {
      statement: `${n1} + ${n2} = ${isCorrect ? real : fake}`,
      isTrue: isCorrect,
      explanation: `${n1} + ${n2} = ${real}`
    };
  } else if (type === 'subtract') {
    const n1 = Math.floor(Math.random() * 800) + 200;
    const n2 = Math.floor(Math.random() * 200) + 50;
    const real = n1 - n2;
    const fake = real + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 20) + 5);
    return {
      statement: `${n1} − ${n2} = ${isCorrect ? real : fake}`,
      isTrue: isCorrect,
      explanation: `${n1} − ${n2} = ${real}`
    };
  } else if (type === 'multiply') {
    const n1 = Math.floor(Math.random() * 12) + 2;
    const n2 = Math.floor(Math.random() * 12) + 2;
    const real = n1 * n2;
    const fake = real + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 2);
    return {
      statement: `${n1} × ${n2} = ${isCorrect ? real : fake}`,
      isTrue: isCorrect,
      explanation: `${n1} × ${n2} = ${real}`
    };
  } else {
    const percents = [10, 20, 50];
    const p = percents[Math.floor(Math.random() * percents.length)];
    const base = [200, 500, 1000][Math.floor(Math.random() * 3)];
    const real = (base * p) / 100;
    const fake = real + (Math.random() > 0.5 ? 10 : -10);
    return {
      statement: `${base}-нің ${p}% = ${isCorrect ? real : fake}`,
      isTrue: isCorrect,
      explanation: `${base}-нің ${p}% = ${real}`
    };
  }
};

/**
 * Игра "Шын/Жалған" — определить правда или ложь математическое утверждение.
 * При ошибке показывает правильный ответ 2 секунды, затем продолжает.
 */
const GameTrueFalse = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /** Выход из игры — в урок или назад */
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
  const [qIdx, setQIdx] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [showReveal, setShowReveal] = useState(false); // показ правильного ответа

  const customQuestions = location.state?.questions || [];
  const totalQuestions = customQuestions.length > 0 ? customQuestions.length : 10;

  useEffect(() => {
    loadQuestion(0);
  }, []);

  // Отправка XP по завершении
  useEffect(() => {
    if (isGameOver && score > 0) {
      import('../../api').then(({ default: api }) => {
        api.post('users/add_xp/', { points: score }).catch(err => console.error(err));
      });
    }
  }, [isGameOver, score]);

  /**
   * Загружает вопрос по индексу из набора учителя или генерирует.
   * @param {number} idx - индекс вопроса
   */
  const loadQuestion = (idx) => {
    setFeedback(null);
    setShowReveal(false);
    if (customQuestions.length > 0 && customQuestions[idx]) {
      const q = customQuestions[idx];
      setCurrentQuestion({
        statement: q.q,
        isTrue: q.a.toLowerCase() === 'true' || q.a.toLowerCase() === 'шын' || q.a.toLowerCase() === 'дұрыс',
        explanation: q.explanation || ''
      });
    } else {
      setCurrentQuestion(generateQuestion5Class());
    }
  };

  /**
   * Обработчик нажатия Шын/Жалған.
   * Правильный ответ: +10 очков, через 800мс — следующий вопрос.
   * Неправильный: показывает правильный ответ 2с, затем продолжает.
   * @param {boolean} userAnswer - выбор пользователя
   */
  const handleAnswer = (userAnswer) => {
    if (isGameOver || feedback) return;

    if (userAnswer === currentQuestion.isTrue) {
      setFeedback('correct');
      setScore(prev => prev + 10);
      setTimeout(() => {
        moveToNext();
      }, 800);
    } else {
      setFeedback('wrong');
      setShowReveal(true);
      setTimeout(() => {
        moveToNext();
      }, 2000);
    }
  };

  /** Переход к следующему вопросу или завершение игры */
  const moveToNext = () => {
    const nextIdx = qIdx + 1;
    if (nextIdx >= totalQuestions) {
      setIsGameOver(true);
    } else {
      setQIdx(nextIdx);
      loadQuestion(nextIdx);
    }
  };

  return (
    <div className={`game-container tf-bg ${feedback === 'correct' ? 'tf-correct' : feedback === 'wrong' ? 'tf-wrong' : ''}`}>
      {/* Шапка */}
      <header className="game-header">
        <button className="close-btn" onClick={handleExit}><CloseIcon /></button>
        <div className="game-progress-bar">
          <div className="progress-fill" style={{ width: `${((qIdx + 1) / totalQuestions) * 100}%` }}></div>
        </div>
        <div className="game-stats">
          <div className="stat-item">
            <CheckCircleIcon className="stat-icon score" />
            <span>{score}</span>
          </div>
        </div>
      </header>

      {/* Игровая область */}
      {!isGameOver ? (
        <main className="tf-main">
          <div className="tf-question-box">
            <p className="tf-question-counter">{qIdx + 1} / {totalQuestions}</p>
            <h2 className="tf-statement">{currentQuestion?.statement}</h2>
          </div>

          {/* Показ правильного ответа при ошибке */}
          {showReveal && (
            <div className="tf-reveal-box">
              <p>Дұрыс жауап: <strong>{currentQuestion.isTrue ? '✅ ШЫНДЫҚ' : '❌ ЖАЛҒАН'}</strong></p>
              {currentQuestion.explanation && <p className="reveal-explanation">{currentQuestion.explanation}</p>}
            </div>
          )}

          <div className="tf-controls">
            <button className="tf-btn false-btn" onClick={() => handleAnswer(false)} disabled={!!feedback}>
              <XCircleIcon className="tf-icon" />
              ЖАЛҒАН
            </button>
            <button className="tf-btn true-btn" onClick={() => handleAnswer(true)} disabled={!!feedback}>
              <CheckCircleIcon className="tf-icon" />
              ШЫНДЫҚ
            </button>
          </div>
        </main>
      ) : (
        <div className="game-over-overlay fade-in">
          <div className="game-over-card">
            <CheckCircleIcon className="over-icon success" />
            <h2>Ойын аяқталды!</h2>
            <div className="final-score">
              <p>Жалпы балл</p>
              <h3>{score}</h3>
            </div>
            <p className="result-summary">{qIdx + 1} сұрақтан {score / 10} дұрыс жауап</p>
            <button className="restart-btn" onClick={() => window.location.reload()}>Қайталау</button>
            <button className="exit-btn" onClick={handleExit}>Шығу</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameTrueFalse;
