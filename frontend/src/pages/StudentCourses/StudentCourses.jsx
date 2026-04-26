import React from 'react';
import { 
  AcademicCapIcon, 
  FireIcon, 
  CheckCircleIcon,
  PlayIcon,
  HandRaisedIcon,
  TrophyIcon,
  StarIcon,
  BoltIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/solid';
import './StudentCourses.css';

const StudentCourses = () => {
  const myCourses = [
    { id: 1, title: 'Көбейту кестесі', teacher: 'Арман Самат', lessonsDone: 5, totalLessons: 10, color: '#1cb0f6' },
    { id: 2, title: 'Логикалық есептер', teacher: 'Меруерт Асан', lessonsDone: 2, totalLessons: 8, color: '#58cc02' },
    { id: 3, title: 'Бөлшектер', teacher: 'Арман Самат', lessonsDone: 0, totalLessons: 12, color: '#ff9600' },
  ];

  return (
    <div className="student-container">
      {/* HEADER */}
      <header className="student-header">
        <div className="header-content">
          <div className="user-greet">
            <h1>Сәлем, Азамат! <HandRaisedIcon className="greet-icon" /></h1>
            <div className="streak-badge">
              <FireIcon className="streak-icon" />
              <span>5 күн қатарынан!</span>
            </div>
          </div>
          <div className="user-rank">
            <div className="rank-info">
              <span>Лига: Алтын</span>
              <div className="rank-bar"><div className="rank-fill"></div></div>
            </div>
            <div className="user-pfp">A</div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="student-main">
        <section className="active-courses">
          <h2>Менің курстарым</h2>
          <div className="student-courses-grid">
            {myCourses.map(course => {
              const progress = (course.lessonsDone / course.totalLessons) * 100;
              return (
                <div key={course.id} className="student-course-card">
                  <div className="course-card-top" style={{ backgroundColor: course.color }}>
                    <AcademicCapIcon className="card-top-icon" />
                  </div>
                  <div className="course-card-body">
                    <h3>{course.title}</h3>
                    <p className="teacher-name">{course.teacher}</p>
                    
                    <div className="course-progress-section">
                      <div className="progress-text">
                        <span>{course.lessonsDone}/{course.totalLessons} сабақ</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="progress-track">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${progress}%`, backgroundColor: course.color }}
                        ></div>
                      </div>
                    </div>

                    <button className="continue-btn" style={{ color: course.color, borderColor: course.color }}>
                      {progress === 0 ? 'Бастау' : 'Жалғастыру'}
                      <PlayIcon className="btn-play-icon" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ACHIEVEMENTS OR FRIENDS */}
        <section className="side-info">
          <div className="info-card achievements">
            <h3>Жетістіктерім</h3>
            <div className="achievements-list">
              <div className="achievement-item locked"><TrophyIcon className="ach-icon" /></div>
              <div className="achievement-item"><StarIcon className="ach-icon" /></div>
              <div className="achievement-item locked"><RocketLaunchIcon className="ach-icon" /></div>
              <div className="achievement-item"><BoltIcon className="ach-icon" /></div>
            </div>
          </div>
        </section>
      </main>

      {/* BOTTOM NAV (MOBILE STYLE) */}
      <nav className="bottom-nav">
        <div className="nav-item active">
          <AcademicCapIcon />
          <span>Оқу</span>
        </div>
        <div className="nav-item">
          <FireIcon />
          <span>Лига</span>
        </div>
        <div className="nav-item">
          <CheckCircleIcon />
          <span>Профиль</span>
        </div>
      </nav>
    </div>
  );
};

export default StudentCourses;
