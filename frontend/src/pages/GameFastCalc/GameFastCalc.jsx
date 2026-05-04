import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/solid';
import './GameFastCalc.css';

/**
 * Генерирует один вопрос для 5 класса (натуральные числа, дроби, проценты).
 * Возвращает объект { q, a, options }.
 */
const generateQuestion5Class = () => {
  const types = ['add', 'subtract', 'multiply', 'percent', 'fraction'];
  const type = types[Math.floor(Math.random() * types.length)];

  let q, a, distractors;

  if (type === 'add') {
    const n1 = Math.floor(Math.random() * 900) + 100;
    const n2 = Math.floor(Math.random() * 900) + 100;
    const res = n1 + n2;
    q = `${n1} + ${n2} = ?`;
    a = res.toString();
    distractors = [res + 10, res - 10, res + 100];
  } else if (type === 'subtract') {
    const n1 = Math.floor(Math.random() * 900) + 200;
    const n2 = Math.floor(Math.random() * 200) + 50;
    const res = n1 - n2;
    q = `${n1} − ${n2} = ?`;
    a = res.toString();
    distractors = [res + 5, res - 5, res + 50];
  } else if (type === 'multiply') {
    const n1 = Math.floor(Math.random() * 12) + 2;
    const n2 = Math.floor(Math.random() * 12) + 2;
    const res = n1 * n2;
    q = `${n1} × ${n2} = ?`;
    a = res.toString();
    distractors = [res + 2, res - 2, res + n2];
  } else if (type === 'percent') {
    const percents = [10, 20, 25, 50];
    const p = percents[Math.floor(Math.random() * percents.length)];
    const base = [100, 200, 500, 1000, 2000][Math.floor(Math.random() * 5)];
    const res = (base * p) / 100;
    q = `${base}-нің ${p}% қанша?`;
    a = res.toString();
    distractors = [res * 2, res + 10, res - 10];
  } else {
    // Сложение простых дробей с одинаковым знаменателем
    const denom = [4, 6, 8, 10][Math.floor(Math.random() * 4)];
    const n1 = Math.floor(Math.random() * (denom - 1)) + 1;
    const n2 = Math.floor(Math.random() * (denom - n1)) + 1;
    const resNum = n1 + n2;
    q = `${n1}/${denom} + ${n2}/${denom} = ?`;
    a = `${resNum}/${denom}`;
    distractors = [`${resNum + 1}/${denom}`, `${resNum - 1}/${denom}`, `${n1 + n2 + 2}/${denom}`];
  }

  const options = [a, ...distractors.map(String)].sort(() => Math.random() - 0.5);
  return { q, a, options };
};

/**
 * Игра "Жылдам есеп" — быстрые вычисления на время (30 секунд).
 * При ошибке показывает правильный ответ 2 секунды, затем продолжает.
 */
const GameFastCalc = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Выход из игры — возврат в урок или назад по истории.
   */
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

  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false); // флаг показа правильного ответа после ошибки
  const [wrongAnswer, setWrongAnswer] = useState(null); // выбранный неверный вариант

  const questionsFromLesson = location.state?.questions || [];

  /**
   * Создаёт вопрос из набора учителя или генерирует сам.
   * @param {number} idx - индекс вопроса
   */
  const buildQuestion = useCallback((idx) => {
    if (questionsFromLesson.length > 0 && questionsFromLesson[idx]) {
      const q = questionsFromLesson[idx];
      return {
        q: q.q,
        a: q.a,
        explanation: q.explanation || '',
        options: [q.a, q.w1, q.w2, q.w3].filter(Boolean).sort(() => Math.random() - 0.5)
      };
    }
    return { ...generateQuestion5Class(), explanation: '' };
  }, [questionsFromLesson]);

  const [currentQuestion, setCurrentQuestion] = useState(() => buildQuestion(0));

  // Таймер: каждую секунду уменьшает timeLeft
  useEffect(() => {
    if (timeLeft > 0 && !isGameOver && !showResult) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isGameOver) {
      setIsGameOver(true);
    }
  }, [timeLeft, isGameOver, showResult]);

  // Отправка XP на сервер по окончании игры
  useEffect(() => {
    if (isGameOver && score > 0) {
      import('../../api').then(({ default: api }) => {
        api.post('users/add_xp/', { points: score }).catch(err => console.error(err));
      });
    }
  }, [isGameOver, score]);

  /**
   * Обработчик выбора варианта ответа.
   * Правильный — даёт +10 очков и переходит к следующему вопросу через 500мс.
   * Неправильный — показывает правильный ответ 2 секунды, затем следующий вопрос.
   * @param {string} option - выбранный вариант
   */
  const handleAnswer = (option) => {
    if (isGameOver || showResult) return;
    setSelectedOption(option);

    if (option === currentQuestion.a) {
      setScore(s => s + 10);
      setTimeout(() => moveToNext(), 500);
    } else {
      setWrongAnswer(option);
      setShowResult(true);
      setTimeout(() => {
        setShowResult(false);
        setWrongAnswer(null);
        setSelectedOption(null);
        moveToNext();
      }, 2000);
    }
  };

  /**
   * Переход к следующему вопросу. Если вопросы кончились — заканчивает игру.
   */
  const moveToNext = () => {
    const nextIdx = qIdx + 1;
    const maxQuestions = questionsFromLesson.length > 0 ? questionsFromLesson.length : 999;
    if (nextIdx >= maxQuestions) {
      setIsGameOver(true);
      return;
    }
    setQIdx(nextIdx);
    setCurrentQuestion(buildQuestion(nextIdx));
    setSelectedOption(null);
  };

  return (
    <div className="game-container">
      {/* Шапка с таймером и очками */}
      <header className="game-header">
        <button className="close-btn" onClick={handleExit}><XMarkIcon /></button>
        <div className="game-progress-bar">
          <div className="progress-fill" style={{ width: `${(timeLeft / 30) * 100}%` }}></div>
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

      {/* Игровая область */}
      {!isGameOver ? (
        <main className="game-main">
          <div className="question-box">
            <h2 className="question-text">{currentQuestion.q}</h2>
          </div>

          <div className="options-grid">
            {currentQuestion.options.map((option, idx) => {
              let cls = 'option-btn';
              if (showResult) {
                if (option === currentQuestion.a) cls += ' correct';
                else if (option === wrongAnswer) cls += ' wrong';
                else cls += ' disabled';
              } else if (selectedOption === option) {
                cls += option === currentQuestion.a ? ' correct' : ' wrong';
              }
              return (
                <button key={idx} className={cls} onClick={() => handleAnswer(option)} disabled={showResult}>
                  {option}
                </button>
              );
            })}
          </div>

          {/* Подсказка с правильным ответом при ошибке */}
          {showResult && (
            <div className="answer-reveal-box">
              <p>Дұрыс жауап: <strong>{currentQuestion.a}</strong></p>
              {currentQuestion.explanation && <p className="reveal-explanation">{currentQuestion.explanation}</p>}
            </div>
          )}
        </main>
      ) : (
        <div className="game-over-overlay fade-in">
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
