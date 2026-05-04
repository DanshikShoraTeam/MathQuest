import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BoltIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  StarIcon,
  FireIcon
} from '@heroicons/react/24/solid';
import api from '../../api';
import StudentLayout from '../../components/StudentLayout/StudentLayout';
import './StudentProfile.css';

/**
 * Страница профиля ученика.
 * Отображает имя, уровень, XP и количество курсов. Кнопка выхода.
 */
const StudentProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [coursesCount, setCoursesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProfileData(); }, []);

  /** Загружает данные текущего пользователя и количество его курсов параллельно. */
  const fetchProfileData = async () => {
    try {
      const [meRes, coursesRes] = await Promise.all([
        api.get('users/me/'),
        api.get('courses/')
      ]);
      setUser(meRes.data);
      setCoursesCount(coursesRes.data.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /** Очищает токены и перенаправляет на страницу входа. */
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div className="loading-spinner">Жүктелуде...</div>;

  const level = Math.floor((user?.xp || 0) / 100) + 1;

  return (
    <StudentLayout>
      <div className="profile-page">
        {/* Banner */}
        <div className="profile-hero-banner">
          <div className="profile-bubbles">
            <div className="pb pb1"/><div className="pb pb2"/><div className="pb pb3"/>
          </div>
          <div className="profile-banner-inner">
            <div className="profile-avatar-large">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="profile-banner-info">
              <div className="profile-banner-name">{user?.username}</div>
              <div className="profile-banner-email">{user?.email}</div>
              <div className="profile-level-badge">
                <StarIcon style={{ width: 12 }} />
                {level}-деңгей
              </div>
            </div>
          </div>
        </div>

        <div className="app-scroll-content">
          {/* Stats */}
          <div className="profile-stats-grid-large">
            <div className="p-stat-large xp-stat">
              <div className="p-stat-icon-wrap" style={{ background: '#FFF5E6' }}>
                <BoltIcon style={{ width: 26, color: '#ff9600' }} />
              </div>
              <strong>{user?.xp || 0}</strong>
              <span>XP Жинады</span>
            </div>
            <div className="p-stat-large level-stat">
              <div className="p-stat-icon-wrap" style={{ background: '#F0FDF4' }}>
                <StarIcon style={{ width: 26, color: '#16a34a' }} />
              </div>
              <strong>{level}</strong>
              <span>Деңгей</span>
            </div>
            <div className="p-stat-large course-stat">
              <div className="p-stat-icon-wrap" style={{ background: '#EFF6FF' }}>
                <AcademicCapIcon style={{ width: 26, color: '#2563eb' }} />
              </div>
              <strong>{coursesCount}</strong>
              <span>Курстар</span>
            </div>
            <div className="p-stat-large streak-stat">
              <div className="p-stat-icon-wrap" style={{ background: '#FFF1F2' }}>
                <FireIcon style={{ width: 26, color: '#ef4444' }} />
              </div>
              <strong>3</strong>
              <span>Күн қатар</span>
            </div>
          </div>

          {/* XP progress to next level */}
          <div className="xp-progress-card">
            <div className="xp-progress-header">
              <span>Келесі деңгейге дейін</span>
              <span>{(user?.xp || 0) % 100} / 100 XP</span>
            </div>
            <div className="xp-progress-bar">
              <div className="xp-progress-fill" style={{ width: `${(user?.xp || 0) % 100}%` }}/>
            </div>
          </div>

          {/* Menu */}
          <div className="profile-menu-list">
            <div className="profile-menu-item logout" onClick={handleLogout}>
              <div className="menu-item-icon-wrap">
                <ArrowRightOnRectangleIcon style={{ width: 20 }} />
              </div>
              <span>Жүйеден шығу</span>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;
