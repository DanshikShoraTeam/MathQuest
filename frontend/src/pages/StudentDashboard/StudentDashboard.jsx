import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BoltIcon,
  StarIcon,
  FireIcon,
  TrophyIcon,
  BookOpenIcon,
  ChevronRightIcon
} from '@heroicons/react/24/solid';
import api from '../../api';
import StudentLayout from '../../components/StudentLayout/StudentLayout';
import './StudentDashboard.css';

const OwlMascot = () => (
  <svg width="90" height="100" viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
    {/* Wings */}
    <ellipse cx="22" cy="72" rx="11" ry="20" fill="#5B21B6" transform="rotate(-20 22 72)"/>
    <ellipse cx="78" cy="72" rx="11" ry="20" fill="#5B21B6" transform="rotate(20 78 72)"/>
    {/* Body */}
    <ellipse cx="50" cy="78" rx="28" ry="30" fill="#7C3AED"/>
    {/* Belly */}
    <ellipse cx="50" cy="82" rx="18" ry="20" fill="#A78BFA"/>
    {/* Book */}
    <rect x="34" y="88" width="32" height="18" rx="4" fill="#EF4444"/>
    <line x1="50" y1="88" x2="50" y2="106" stroke="white" strokeWidth="1.5"/>
    <line x1="34" y1="95" x2="82" y2="95" stroke="white" strokeWidth="0.8" opacity="0.4"/>
    {/* Head */}
    <circle cx="50" cy="40" r="30" fill="#8B5CF6"/>
    {/* Ear tufts */}
    <polygon points="31,22 24,5 41,16" fill="#6D28D9"/>
    <polygon points="69,22 76,5 59,16" fill="#6D28D9"/>
    {/* Eyes white */}
    <circle cx="38" cy="38" r="13" fill="white"/>
    <circle cx="62" cy="38" r="13" fill="white"/>
    {/* Eyes iris */}
    <circle cx="38" cy="39" r="8" fill="#1E293B"/>
    <circle cx="62" cy="39" r="8" fill="#1E293B"/>
    {/* Eye shine */}
    <circle cx="40.5" cy="35.5" r="3" fill="white"/>
    <circle cx="64.5" cy="35.5" r="3" fill="white"/>
    {/* Beak */}
    <polygon points="50,46 43,56 57,56" fill="#F59E0B"/>
    {/* Cheeks */}
    <circle cx="28" cy="46" r="7" fill="#EC4899" opacity="0.4"/>
    <circle cx="72" cy="46" r="7" fill="#EC4899" opacity="0.4"/>
    {/* Feet */}
    <ellipse cx="40" cy="107" rx="12" ry="4" fill="#F59E0B"/>
    <ellipse cx="60" cy="107" rx="12" ry="4" fill="#F59E0B"/>
    {/* Star */}
    <text x="50" y="81" textAnchor="middle" fontSize="10" fill="#FCD34D">★</text>
  </svg>
);

/**
 * Главная страница ученика (дашборд).
 * Отображает приветствие, статистику (XP, уровень, стрик) и список текущих курсов.
 */
const StudentDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /** Загружает данные текущего пользователя и его курсы параллельно. */
  const fetchDashboardData = async () => {
    try {
      const userRes = await api.get('users/me/');
      setUserData(userRes.data);
      const coursesRes = await api.get('courses/');
      setEnrolledCourses(coursesRes.data);
    } catch (err) {
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner">Жүктелуде...</div>;

  return (
    <StudentLayout>
      <div className="student-dashboard-content">

        {/* Cartoon Hero Banner */}
        <div className="cartoon-hero-banner">
          <div className="hero-bubbles">
            <div className="bubble b1"/>
            <div className="bubble b2"/>
            <div className="bubble b3"/>
          </div>
          <div className="hero-left">
            <div className="hero-greeting">Сәлем,</div>
            <div className="hero-name">{userData?.username}!</div>
            <div className="hero-goal">
              <BoltIcon style={{ width: 14 }} />
              Бүгінгі мақсат: 50 XP
            </div>
          </div>
          <div className="hero-mascot">
            <OwlMascot />
          </div>
        </div>

        {/* XP Badge strip */}
        <div className="xp-strip">
          <BoltIcon style={{ width: 16, color: '#ff9600' }} />
          <span>{userData?.xp || 0} XP жинадың!</span>
        </div>

        <div className="app-scroll-content">
          {/* Stats */}
          <div className="mobile-stats-grid">
            <div className="m-stat-card xp">
              <div className="m-stat-icon-wrap xp-icon">
                <BoltIcon className="m-icon" />
              </div>
              <span className="m-val">{userData?.xp || 0}</span>
              <span className="m-lab">XP</span>
            </div>
            <div className="m-stat-card level">
              <div className="m-stat-icon-wrap level-icon">
                <StarIcon className="m-icon" />
              </div>
              <span className="m-val">{Math.floor((userData?.xp || 0) / 100) + 1}</span>
              <span className="m-lab">Деңгей</span>
            </div>
            <div className="m-stat-card streak">
              <div className="m-stat-icon-wrap streak-icon">
                <FireIcon className="m-icon" />
              </div>
              <span className="m-val">3</span>
              <span className="m-lab">Күн</span>
            </div>
            <div className="m-stat-card rank">
              <div className="m-stat-icon-wrap rank-icon">
                <TrophyIcon className="m-icon" />
              </div>
              <span className="m-val">#12</span>
              <span className="m-lab">Орын</span>
            </div>
          </div>

          {/* Courses */}
          <section className="app-section">
            <div className="section-header">
              <h3>Оқуды жалғастыру</h3>
              <BookOpenIcon style={{ width: 20, color: 'var(--primary)' }} />
            </div>
            <div className="mini-course-list">
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map(course => (
                  <div key={course.id} className="mini-course-item" onClick={() => navigate(`/student/course/${course.id}`)}>
                    <div className="mini-course-icon">{course.title[0]}</div>
                    <div className="mini-course-info">
                      <h4>{course.title}</h4>
                      <div className="mini-progress-bar">
                        <div className="mini-progress-fill" style={{ width: `${course.progress || 0}%` }}></div>
                      </div>
                      <span className="mini-progress-text">{course.progress || 0}% аяқталды</span>
                    </div>
                    <ChevronRightIcon style={{ width: 16, color: '#cbd5e1' }} />
                  </div>
                ))
              ) : (
                <div className="empty-mini-courses">
                  <p>Жазылған курстар жоқ</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
