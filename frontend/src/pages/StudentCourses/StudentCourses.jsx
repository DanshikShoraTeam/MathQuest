import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { AcademicCapIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import StudentLayout from '../../components/StudentLayout/StudentLayout';
import './StudentCourses.css';

const BookMascot = () => (
  <svg width="85" height="95" viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
    {/* Shadow */}
    <ellipse cx="50" cy="108" rx="30" ry="5" fill="rgba(0,0,0,0.15)"/>
    {/* Book body */}
    <rect x="15" y="20" width="70" height="80" rx="8" fill="#10B981"/>
    <rect x="15" y="20" width="12" height="80" rx="4" fill="#059669"/>
    {/* Pages side */}
    <rect x="83" y="24" width="5" height="72" rx="2" fill="#f0fdf4"/>
    {/* Lines on book */}
    <line x1="34" y1="45" x2="78" y2="45" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="34" y1="55" x2="78" y2="55" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="34" y1="65" x2="65" y2="65" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Face */}
    <circle cx="50" cy="33" r="16" fill="#34D399"/>
    {/* Eyes */}
    <circle cx="44" cy="31" r="5" fill="white"/>
    <circle cx="56" cy="31" r="5" fill="white"/>
    <circle cx="44" cy="32" r="3" fill="#065F46"/>
    <circle cx="56" cy="32" r="3" fill="#065F46"/>
    <circle cx="45" cy="30.5" r="1" fill="white"/>
    <circle cx="57" cy="30.5" r="1" fill="white"/>
    {/* Smile */}
    <path d="M44 38 Q50 43 56 38" stroke="#065F46" strokeWidth="2" fill="none" strokeLinecap="round"/>
    {/* Cheeks */}
    <circle cx="38" cy="37" r="4" fill="#6EE7B7" opacity="0.6"/>
    <circle cx="62" cy="37" r="4" fill="#6EE7B7" opacity="0.6"/>
    {/* Stars */}
    <text x="20" y="18" fontSize="12" fill="#FCD34D">★</text>
    <text x="74" y="15" fontSize="9" fill="#FCD34D">★</text>
  </svg>
);

/**
 * Страница "Мои курсы" для ученика.
 * Загружает список записанных курсов и вычисляет прогресс по каждому.
 */
const StudentCourses = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  /**
   * Загружает курсы ученика с API и вычисляет количество пройденных/всего уроков.
   * Результат сохраняется в state myCourses.
   */
  const fetchData = async () => {
    try {
      const coursesRes = await api.get('courses/');
      const formattedCourses = coursesRes.data.map(course => {
        let totalLessons = 0;
        let lessonsDone = 0;
        if (course.sections) {
          course.sections.forEach(sec => {
            if (sec.lessons) {
              totalLessons += sec.lessons.length;
              lessonsDone += sec.lessons.filter(l => l.is_completed).length;
            }
          });
        }
        return { ...course, lessonsDone, totalLessons };
      });
      setMyCourses(formattedCourses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner">Жүктелуде...</div>;

  return (
    <StudentLayout>
      <div className="courses-page">
        {/* Banner */}
        <div className="courses-hero-banner">
          <div className="courses-bubbles">
            <div className="cb cb1"/><div className="cb cb2"/><div className="cb cb3"/>
          </div>
          <div className="courses-hero-left">
            <div className="courses-hero-label">Менің</div>
            <div className="courses-hero-title">Курстарым</div>
            <div className="courses-hero-count">{myCourses.length} курс</div>
          </div>
          <div className="courses-hero-mascot">
            <BookMascot />
          </div>
        </div>

        <div className="app-scroll-content">
          <div className="course-list-vertical">
            {myCourses.length === 0 ? (
              <div className="empty-courses-card">
                <div className="empty-courses-emoji">📚</div>
                <p>Сіз әлі ешқандай курсқа жазылмағансыз.</p>
              </div>
            ) : (
              myCourses.map((course, i) => {
                const progress = Math.round((course.lessonsDone / (course.totalLessons || 1)) * 100);
                const colors = [
                  { bg: 'linear-gradient(135deg,#7C3AED,#4F46E5)', shadow: '#c4b5fd' },
                  { bg: 'linear-gradient(135deg,#10B981,#059669)', shadow: '#6EE7B7' },
                  { bg: 'linear-gradient(135deg,#F59E0B,#D97706)', shadow: '#FDE68A' },
                  { bg: 'linear-gradient(135deg,#EF4444,#DC2626)', shadow: '#FCA5A5' },
                  { bg: 'linear-gradient(135deg,#3B82F6,#2563EB)', shadow: '#BFDBFE' },
                ];
                const c = colors[i % colors.length];
                return (
                  <div key={course.id} className="course-app-card" onClick={() => navigate(`/student/course/${course.id}`)}>
                    <div className="course-app-icon" style={{ background: c.bg, boxShadow: `0 4px 10px ${c.shadow}` }}>
                      <AcademicCapIcon style={{ width: 22, color: 'white' }} />
                    </div>
                    <div className="course-app-info">
                      <h4>{course.title}</h4>
                      <p>{course.lessonsDone}/{course.totalLessons} сабақ</p>
                      <div className="mini-progress-bar">
                        <div className="mini-progress-fill" style={{ width: `${progress}%` }}/>
                      </div>
                      <span className="mini-progress-text">{progress}% аяқталды</span>
                    </div>
                    <ChevronRightIcon style={{ width: 18, color: '#cbd5e1', flexShrink: 0 }} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentCourses;
