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

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userRes = await api.get('users/me/');
      setUserData(userRes.data);
      // Бұл жерде 'courses/enrolled/' орнына жай ғана 'courses/' қолданамыз
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
        <header className="app-header-compact">
          <div className="user-info-row">
            <div className="user-avatar-small">
              {userData?.username?.[0] || 'U'}
            </div>
            <div className="welcome-msg">
              <h3>Сәлем, {userData?.username}!</h3>
              <p>Бүгінгі мақсат: 50 XP</p>
            </div>
          </div>
          <div className="header-xp-badge">
            <BoltIcon style={{ width: 18, color: '#ff9600' }} />
            <span>{userData?.xp || 0}</span>
          </div>
        </header>

        <div className="app-scroll-content">
          <div className="mobile-stats-grid">
            <div className="m-stat-card xp">
              <BoltIcon className="m-icon" />
              <span className="m-val">{userData?.xp || 0}</span>
              <span className="m-lab">XP</span>
            </div>
            <div className="m-stat-card level">
              <StarIcon className="m-icon" />
              <span className="m-val">{Math.floor((userData?.xp || 0) / 100) + 1}</span>
              <span className="m-lab">Деңгей</span>
            </div>
            <div className="m-stat-card streak">
              <FireIcon className="m-icon" />
              <span className="m-val">3</span>
              <span className="m-lab">Күн</span>
            </div>
            <div className="m-stat-card rank">
              <TrophyIcon className="m-icon" />
              <span className="m-val">#12</span>
              <span className="m-lab">Орын</span>
            </div>
          </div>

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
