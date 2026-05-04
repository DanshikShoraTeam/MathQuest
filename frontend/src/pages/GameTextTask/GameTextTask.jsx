import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  XMarkIcon,
  CheckCircleIcon,
  BookOpenIcon
} from '@heroicons/react/24/solid';
import './GameTextTask.css';

/**
 * Банк текстовых задач для 5 класса на казахском языке.
 * Каждая задача содержит: вопрос, правильный ответ, 3 дистрактора, решение по шагам.
 */
const WORD_PROBLEMS = [
  {
    q: 'Бір қапшықта 120 кг алма бар. Алмұрт алмадан 3 есе кем. Екі жемістің жалпы салмағы қанша кг?',
    a: '160',
    w1: '40', w2: '360', w3: '140',
    steps: ['Алмұрт = 120 ÷ 3 = 40 кг', 'Жалпы = 120 + 40 = 160 кг']
  },
  {
    q: 'Мектепте 450 оқушы бар. Олардың 2/5 бөлігі қыздар. Ұлдар қанша?',
    a: '270',
    w1: '180', w2: '250', w3: '300',
    steps: ['Қыздар = 450 × 2/5 = 180', 'Ұлдар = 450 − 180 = 270']
  },
  {
    q: 'Дүкенде 15 000 теңгелік тауардың бағасы 20%-ке түсті. Жаңа бағасы қанша теңге?',
    a: '12000',
    w1: '3000', w2: '18000', w3: '13000',
    steps: ['Жеңілдік = 15 000 × 20% = 3 000 теңге', 'Жаңа баға = 15 000 − 3 000 = 12 000 теңге']
  },
  {
    q: 'Автобус 240 км жолды 4 сағатта жүрді. Мотоцикл сол жолды 6 сағатта жүрді. Автобустың жылдамдығы мотоциклден қанша км/сағ артық?',
    a: '20',
    w1: '60', w2: '40', w3: '10',
    steps: ['Автобус жылдамдығы = 240 ÷ 4 = 60 км/сағ', 'Мотоцикл жылдамдығы = 240 ÷ 6 = 40 км/сағ', 'Айырмасы = 60 − 40 = 20 км/сағ']
  },
  {
    q: 'Тіктөртбұрышты бақшаның ұзындығы 25 м, ені 16 м. Бақшаның периметрі қанша метр?',
    a: '82',
    w1: '400', w2: '41', w3: '84',
    steps: ['Периметр = 2 × (ұзындық + ен)', 'P = 2 × (25 + 16) = 2 × 41 = 82 м']
  },
  {
    q: 'Бес оқушының математикадан бағалары: 85, 90, 75, 95, 80. Орташа баға қанша?',
    a: '85',
    w1: '80', w2: '90', w3: '95',
    steps: ['Қосынды = 85 + 90 + 75 + 95 + 80 = 425', 'Орташа = 425 ÷ 5 = 85']
  },
  {
    q: 'Тікбұрышты параллелепипедтің өлшемдері: ұзындығы 5 дм, ені 4 дм, биіктігі 3 дм. Көлемі қанша дм³?',
    a: '60',
    w1: '47', w2: '94', w3: '120',
    steps: ['V = ұзындық × ен × биіктік', 'V = 5 × 4 × 3 = 60 дм³']
  },
  {
    q: 'Қоймада 840 кг астық болды. Бірінші күні 3/8 бөлігін, екінші күні қалғанының 1/2 бөлігін шығарды. Қоймада қанша кг астық қалды?',
    a: '262',
    w1: '315', w2: '420', w3: '525',
    steps: ['1-күн = 840 × 3/8 = 315 кг', 'Қалды = 840 − 315 = 525 кг', '2-күн = 525 × 1/2 = 262.5 ≈ 262 кг']
  }
];

/**
 * Игра "Мәтіндік есеп" — решение текстовых задач на казахском с разбором решения.
 * После ответа показывает решение по шагам 3 секунды, затем переходит дальше.
 */
const GameTextTask = () => {
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

  const customQuestions = location.state?.questions || [];
  const pool = customQuestions.length > 0 ? customQuestions : WORD_PROBLEMS;
  const totalQuestions = Math.min(pool.length, 6);

  const [score, setScore] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentQ, setCurrentQ] = useState(null);
  const [shuffledPool] = useState(() => [...pool].sort(() => Math.random() - 0.5).slice(0, totalQuestions));

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
   * Загружает вопрос по индексу.
   * Перемешивает варианты ответов.
   * @param {number} idx - индекс вопроса в перемешанном пуле
   */
  const loadQuestion = (idx) => {
    const q = shuffledPool[idx];
    const options = [q.a, q.w1, q.w2, q.w3].filter(Boolean).sort(() => Math.random() - 0.5);
    setCurrentQ({ ...q, options });
    setAnswered(false);
    setSelectedOption(null);
  };

  /**
   * Обработчик выбора ответа.
   * Правильный: +20 очков. Неправильный: 0 очков.
   * В обоих случаях показывает решение по шагам 3 секунды.
   * @param {string} option - выбранный вариант
   */
  const handleAnswer = (option) => {
    if (isGameOver || answered) return;
    setSelectedOption(option);
    setAnswered(true);
    if (option === currentQ.a) {
      setScore(s => s + 20);
    }
    setTimeout(() => {
      moveToNext();
    }, 3000);
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

  /**
   * Адаптивный размер шрифта для длинных задач.
   * Чем длиннее текст — тем меньше шрифт.
   * @param {string} text - текст задачи
   * @returns {string} значение font-size в rem
   */
  const getFontSize = (text) => {
    if (!text) return '1.2rem';
    const len = text.length;
    if (len < 80) return '1.4rem';
    if (len < 130) return '1.2rem';
    if (len < 200) return '1rem';
    return '0.9rem';
  };

  return (
    <div className="game-container text-task-bg">
      {/* Шапка */}
      <header className="game-header">
        <button className="close-btn" onClick={handleExit}><XMarkIcon /></button>
        <div className="game-progress-bar">
          <div className="progress-fill" style={{ width: `${((qIdx + 1) / totalQuestions) * 100}%` }}></div>
        </div>
        <div className="game-stats">
          <div className="stat-item">
            <BookOpenIcon className="stat-icon" style={{ color: '#7c3aed' }} />
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
        <main className="text-task-main">
          <div className="text-task-card">
            <div className="text-task-badge">Мәтіндік есеп</div>
            <p className="text-task-question" style={{ fontSize: getFontSize(currentQ?.q) }}>
              {currentQ?.q}
            </p>
          </div>

          <div className="text-task-options">
            {currentQ?.options.map((opt, idx) => {
              let cls = 'text-task-opt-btn';
              if (answered) {
                if (opt === currentQ.a) cls += ' correct';
                else if (opt === selectedOption) cls += ' wrong';
                else cls += ' disabled';
              }
              return (
                <button key={idx} className={cls} onClick={() => handleAnswer(opt)} disabled={answered}>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Разбор решения по шагам */}
          {answered && (
            <div className={`text-task-steps ${selectedOption === currentQ.a ? 'steps-correct' : 'steps-wrong'}`}>
              <p className="steps-header">
                {selectedOption === currentQ.a ? '✅ Дұрыс! Шешімі:' : `❌ Дұрыс жауап: ${currentQ.a}. Шешімі:`}
              </p>
              <ol className="steps-list">
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
            <CheckCircleIcon className="over-icon" style={{ color: '#7c3aed' }} />
            <h2>Ойын аяқталды!</h2>
            <div className="final-score">
              <p>Жалпы балл</p>
              <h3>{score}</h3>
            </div>
            <p className="result-summary">{totalQuestions} есептен {score / 20} дұрыс шешілді</p>
            <button className="restart-btn" onClick={() => window.location.reload()}>Қайталау</button>
            <button className="exit-btn" onClick={handleExit}>Шығу</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameTextTask;
