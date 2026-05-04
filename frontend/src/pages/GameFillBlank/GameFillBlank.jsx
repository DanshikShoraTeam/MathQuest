import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  XMarkIcon,
  CheckCircleIcon,
  PencilIcon
} from '@heroicons/react/24/solid';
import './GameFillBlank.css';

/**
 * Банк задач с вводом ответа для 5 класса.
 * Поля: q — задача, a — правильный ответ (строка), steps — разбор.
 */
const FILL_BLANK_TASKS = [
  {
    q: '5/6 − 3/8 = ? (жауапты бөлшек ретінде жазыңыз)',
    a: '11/24',
    steps: ['ЖОЕ(6, 8) = 24', '5/6 = 20/24', '3/8 = 9/24', '20/24 − 9/24 = 11/24']
  },
  {
    q: 'ЕКОЕ(3, 4, 5) = ?',
    a: '60',
    steps: ['3 = 3', '4 = 2²', '5 = 5', 'ЕКОЕ = 2² × 3 × 5 = 60']
  },
  {
    q: '4.5 ÷ 1.5 = ?',
    a: '3',
    steps: ['4.5 ÷ 1.5 = 45 ÷ 15 = 3']
  },
  {
    q: '15 000 теңгенің 20%-і қанша теңге?',
    a: '3000',
    steps: ['15 000 × 20 / 100 = 15 000 × 0.2 = 3 000 теңге']
  },
  {
    q: '(85 + 90 + 75 + 95 + 80) ÷ 5 = ?',
    a: '85',
    steps: ['Қосынды = 85+90+75+95+80 = 425', '425 ÷ 5 = 85']
  },
  {
    q: 'Кубтың қабырғасы 6 см. Көлемі V = ? (см³)',
    a: '216',
    steps: ['V = a³ = 6³ = 6 × 6 × 6 = 216 см³']
  },
  {
    q: '3/4 + 5/12 = ? (жауапты бөлшек ретінде жазыңыз)',
    a: '7/6',
    steps: ['ЖОЕ(4, 12) = 12', '3/4 = 9/12', '5/12 = 5/12', '9/12 + 5/12 = 14/12 = 7/6']
  },
  {
    q: '2.4 × 3.5 = ?',
    a: '8.4',
    steps: ['2.4 × 3.5 = 24 × 35 / 100 = 840 / 100 = 8.4']
  },
  {
    q: '72 санының ЖОББО(72, 48) = ?',
    a: '24',
    steps: ['72 = 2³ × 3²', '48 = 2⁴ × 3', 'ЖОББО = 2³ × 3 = 24']
  },
  {
    q: 'Тіктөртбұрыштың ауданы S = 18 дм². Ені 3 дм. Ұзындығы = ? дм',
    a: '6',
    steps: ['S = ұзындық × ен', 'ұзындық = S ÷ ен = 18 ÷ 3 = 6 дм']
  }
];

/**
 * Игра "Бос орынды толтыр" — вводить ответ вручную с клавиатуры.
 * После ответа показывает решение по шагам 3 секунды.
 */
const GameFillBlank = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);

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

  const customQuestions = location.state?.questions || [];
  const pool = customQuestions.length > 0 ? customQuestions : FILL_BLANK_TASKS;
  const totalQuestions = Math.min(pool.length, 8);

  const [score, setScore] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentQ, setCurrentQ] = useState(null);
  const [shuffledPool] = useState(() => [...pool].sort(() => Math.random() - 0.5).slice(0, totalQuestions));

  useEffect(() => {
    loadQuestion(0);
  }, []);

  // Фокус на поле ввода при каждом новом вопросе
  useEffect(() => {
    if (!answered && inputRef.current) {
      inputRef.current.focus();
    }
  }, [qIdx, answered]);

  // Отправка XP по завершении
  useEffect(() => {
    if (isGameOver && score > 0) {
      import('../../api').then(({ default: api }) => {
        api.post('users/add_xp/', { points: score }).catch(err => console.error(err));
      });
    }
  }, [isGameOver, score]);

  /**
   * Загружает вопрос по индексу.
   * @param {number} idx - индекс вопроса
   */
  const loadQuestion = (idx) => {
    setCurrentQ(shuffledPool[idx]);
    setUserInput('');
    setAnswered(false);
    setIsCorrect(false);
  };

  /**
   * Проверяет ответ пользователя (с учётом trim и регистра).
   * Правильный: +20 очков. В обоих случаях — разбор решения 3с.
   */
  const checkAnswer = () => {
    if (answered || !userInput.trim()) return;
    const correct = userInput.trim().toLowerCase() === currentQ.a.toString().toLowerCase();
    setIsCorrect(correct);
    setAnswered(true);
    if (correct) setScore(s => s + 20);
    setTimeout(() => moveToNext(), 3000);
  };

  /** Отправка по Enter */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') checkAnswer();
  };

  /** Переход к следующему вопросу или завершение */
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
    <div className="game-container fill-bg">
      {/* Шапка */}
      <header className="game-header">
        <button className="close-btn" onClick={handleExit}><XMarkIcon /></button>
        <div className="game-progress-bar">
          <div className="progress-fill" style={{ width: `${((qIdx + 1) / totalQuestions) * 100}%` }}></div>
        </div>
        <div className="game-stats">
          <div className="stat-item">
            <PencilIcon className="stat-icon" style={{ color: '#0891b2' }} />
            <span>{qIdx + 1}/{totalQuestions}</span>
          </div>
          <div className="stat-item">
            <CheckCircleIcon className="stat-icon score" />
            <span>{score}</span>
          </div>
        </div>
      </header>

      {/* Игровая область */}
      {!isGameOver ? (
        <main className="fill-main">
          <div className="fill-card">
            <div className="fill-badge">Бос орынды толтыр</div>
            <p className="fill-question">{currentQ?.q}</p>
          </div>

          {/* Поле ввода */}
          {!answered ? (
            <div className="fill-input-wrap">
              <input
                ref={inputRef}
                className="fill-input"
                type="text"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Жауабыңызды жазыңыз..."
                disabled={answered}
                autoComplete="off"
              />
              <button className="fill-submit-btn" onClick={checkAnswer} disabled={!userInput.trim()}>
                Тексеру →
              </button>
            </div>
          ) : (
            /* Блок с разбором решения */
            <div className={`fill-reveal ${isCorrect ? 'reveal-correct' : 'reveal-wrong'}`}>
              <p className="fill-reveal-header">
                {isCorrect
                  ? `✅ Дұрыс! Жауап: ${currentQ.a}`
                  : `❌ Қате. Дұрыс жауап: ${currentQ.a}`}
              </p>
              <ol className="fill-steps">
                {(currentQ.steps || [`Жауап: ${currentQ.a}`]).map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </main>
      ) : (
        <div className="game-over-overlay fade-in">
          <div className="game-over-card">
            <CheckCircleIcon className="over-icon" style={{ color: '#0891b2' }} />
            <h2>Ойын аяқталды!</h2>
            <div className="final-score">
              <p>Жалпы балл</p>
              <h3>{score}</h3>
            </div>
            <p className="result-summary">{totalQuestions} есептен {score / 20} дұрыс жауап</p>
            <button className="restart-btn" onClick={() => window.location.reload()}>Қайталау</button>
            <button className="exit-btn" onClick={handleExit}>Шығу</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameFillBlank;
