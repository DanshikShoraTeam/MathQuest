import React from 'react';
import { 
  ChevronLeftIcon, 
  StarIcon, 
  LockClosedIcon,
  CheckIcon
} from '@heroicons/react/24/solid';
import './CoursePath.css';

const CoursePath = () => {
  const lessons = [
    { id: 1, title: 'Кіріспе', type: 'theory', status: 'completed' },
    { id: 2, title: 'Сандарды қосу', type: 'game', status: 'completed' },
    { id: 3, title: 'Азайту негіздері', type: 'theory', status: 'current' },
    { id: 4, title: 'Логикалық ойын', type: 'game', status: 'locked' },
    { id: 5, title: 'Қорытынды тест', type: 'quiz', status: 'locked' },
  ];

  return (
    <div className="path-container">
      {/* TOP HEADER */}
      <header className="path-header">
        <button className="back-btn">
          <ChevronLeftIcon />
        </button>
        <div className="path-header-info">
          <h2>Көбейту кестесі</h2>
          <div className="header-progress">
            <div className="header-progress-bar"><div className="fill" style={{ width: '40%' }}></div></div>
            <span>40%</span>
          </div>
        </div>
      </header>

      {/* DUOLINGO STYLE PATH */}
      <div className="path-scroll">
        <div className="path-items">
          {lessons.map((lesson, index) => {
            // Alternating positions for Duolingo effect
            const offset = index % 2 === 0 ? '0' : (index % 4 === 1 ? '50px' : '-50px');
            
            return (
              <div 
                key={lesson.id} 
                className={`path-item-wrapper ${lesson.status}`}
                style={{ transform: `translateX(${offset})` }}
              >
                <div className={`path-node ${lesson.status}`}>
                  {lesson.status === 'completed' && <CheckIcon className="node-icon" />}
                  {lesson.status === 'current' && <StarIcon className="node-icon active-star" />}
                  {lesson.status === 'locked' && <LockClosedIcon className="node-icon" />}
                  
                  {/* Tooltip with title */}
                  <div className="node-tooltip">
                    {lesson.title}
                  </div>
                </div>
                
                {/* SVG Path lines can be added here for a better effect, but for now simple vertical alignment */}
                {index < lessons.length - 1 && <div className="path-line"></div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER INFO */}
      <footer className="path-footer">
        <div className="unit-card">
          <div className="unit-icon">1</div>
          <div className="unit-info">
            <h3>1-бөлім: Негіздер</h3>
            <p>Қарапайым қосу және азайту амалдары</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CoursePath;
