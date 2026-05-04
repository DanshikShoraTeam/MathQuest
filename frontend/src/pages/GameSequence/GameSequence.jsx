import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/solid';
import './GameSequence.css';

/**
 * Генерирует задачу на последовательность для 5 класса.
 * Возвращает { sequence, missingIndex, correctAnswer, options, explanation }.
 */
const generateSequence5Class = () => {
  const types = ['arithmetic', 'multiply', 'skip'];
  const type = types[Math.floor(Math.random() * types.length)];

  let seq, step, correctAnswer, explanation;

  if (type === 'arithmetic') {
    const start = Math.floor(Math.random() * 50) + 5;
    step = Math.floor(Math.random() * 10) + 2;
    const seqArr = [start, start + step, start + step * 2, start + step * 3, start + step * 4];
    correctAnswer = seqArr[4];
    seq = [...seqArr.slice(0, 4), '?'];
    explanation = `Тізбек ${step}-ке артып жатыр. ${start} + ${step}×4 = ${correctAnswer}`;
  } else if (type === 'multiply') {
    const start = 2 + Math.floor(Math.random() * 3);
    const ratio = 2 + Math.floor(Math.random() * 2);
    const seqArr = [start, start * ratio, start * ratio ** 2, start * ratio ** 3];
    correctAnswer = seqArr[3];
    seq = [...seqArr.slice(0, 3), '?'];
    explanation = `Тізбек ${ratio}-ге көбейіп жатыр. ${start} × ${ratio}³ = ${correctAnswer}`;
  } else {
    const start = Math.floor(Math.random() * 20) + 10;
    step = (Math.floor(Math.random() * 3) + 2) * 5;
    const seqArr = [start, start + step, start + step * 2, start + step * 3, start + step * 4];
    correctAnswer = seqArr[4];
    seq = [...seqArr.slice(0, 4), '?'];
    explanation = `Тізбек ${step}-ке артып жатыр`;
  }

  const d1 = correctAnswer + step;
  const d2 = correctAnswer - step;
  const d3 = correctAnswer + (step * 2);
  const options = [correctAnswer, d1, d2, d3].sort(() => Math.random() - 0.5).map(String);
  return { sequence: seq, missingIndex: seq.indexOf('?'), correctAnswer: String(correctAnswer), options, explanation };
};

/**
 * Игра "Тізбек" — найти следующее число в последовательности.
 * При ошибке показывает правильный ответ 2 секунды, затем продолжает.
 */
const GameSequence = () => {
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
  const [currentQ, setCurrentQ] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [wasWrong, setWasWrong] = useState(false);

  const customQuestions = location.state?.questions || [];
  const totalQuestions = customQuestions.length > 0 ? customQuestions.length : 8;

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
    setAnswered(false);
    setWasWrong(false);

    if (customQuestions.length > 0 && customQuestions[idx]) {
      const q = customQuestions[idx];
      const parts = q.q.split(/[,\s]+/).map(p => p.trim()).filter(Boolean);
      let mIdx = parts.findIndex(p => p === '...' || p === '?');
      if (mIdx === -1) { parts.push('?'); mIdx = parts.length - 1; }
      const opts = [q.a, q.w1, q.w2, q.w3].filter(Boolean).sort(() => Math.random() - 0.5);
      setCurrentQ({
        sequence: parts,
        missingIndex: mIdx,
        correctAnswer: q.a,
        options: opts,
        explanation: q.explanation || ''
      });
    } else {
      setCurrentQ(generateSequence5Class());
    }
  };

  /**
   * Обработчик выбора числа.
   * Правильный — +15 очков, следующий вопрос через 500мс.
   * Неправильный — показывает правильный ответ 2с, затем продолжает.
   * @param {string} option - выбранный вариант
   */
  const handleAnswer = (option) => {
    if (isGameOver || answered) return;

    if (String(option) === String(currentQ.correctAnswer)) {
      setScore(prev => prev + 15);
      setAnswered(true);
      setTimeout(() => moveToNext(), 500);
    } else {
      setAnswered(true);
      setWasWrong(true);
      setTimeout(() => moveToNext(), 2000);
    }
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
    <div className="game-container seq-bg">
      {/* Шапка */}
      <header className="game-header">
        <button className="close-btn" onClick={handleExit}><XMarkIcon /></button>
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
        <main className="seq-main">
          <div className="seq-title">
            <h2>Тізбекті жалғастыр</h2>
            <p>Сұрақ белгісінің орнына қандай сан келеді?</p>
          </div>

          <div className="seq-blocks">
            {currentQ?.sequence.map((num, idx) => (
              <div key={idx} className={`seq-block ${idx === currentQ.missingIndex ? 'missing' : ''}`}>
                {idx === currentQ.missingIndex ? (answered ? currentQ.correctAnswer : '?') : num}
              </div>
            ))}
          </div>

          <div className="seq-options">
            {currentQ?.options.map((opt, idx) => {
              let cls = 'seq-option-btn';
              if (answered) {
                if (String(opt) === String(currentQ.correctAnswer)) cls += ' correct';
                else cls += ' disabled';
              }
              return (
                <button key={idx} className={cls} onClick={() => handleAnswer(opt)} disabled={answered}>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Показ объяснения при ошибке */}
          {wasWrong && (
            <div className="seq-reveal-box">
              <p>Дұрыс жауап: <strong>{currentQ.correctAnswer}</strong></p>
              {currentQ.explanation && <p className="reveal-explanation">{currentQ.explanation}</p>}
            </div>
          )}
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
            <p className="result-summary">{totalQuestions} сұрақтан {score / 15} дұрыс</p>
            <button className="restart-btn" onClick={() => window.location.reload()}>Қайталау</button>
            <button className="exit-btn" onClick={handleExit}>Шығу</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSequence;
