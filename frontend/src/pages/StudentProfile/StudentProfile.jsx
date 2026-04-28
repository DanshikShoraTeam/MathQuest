import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  BoltIcon, 
  ArrowRightOnRectangleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/solid';
import api from '../../api';
import StudentLayout from '../../components/StudentLayout/StudentLayout';
import './StudentProfile.css';

const StudentProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [coursesCount, setCoursesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div className="loading-spinner">Жүктелуде...</div>;

  return (
    <StudentLayout>
      <div className="profile-page">
        <header className="app-header-compact">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>Профиль</h2>
          <UserIcon style={{ width: 22, color: '#1cb0f6' }} />
        </header>

        <div className="app-scroll-content">
          <div className="profile-hero-app">
            <div className="profile-avatar-large">
              {user?.username?.[0] || 'U'}
            </div>
            <h3>{user?.username}</h3>
            <p>{user?.email}</p>
          </div>

          <div className="profile-stats-grid-large">
            <div className="p-stat-large">
              <BoltIcon style={{ width: 32, color: '#ff9600' }} />
              <strong>{user?.xp}</strong>
              <span>XP Жинады</span>
            </div>
            <div className="p-stat-large">
              <AcademicCapIcon style={{ width: 32, color: '#1cb0f6' }} />
              <strong>{coursesCount}</strong>
              <span>Курстар</span>
            </div>
          </div>

          <div className="profile-menu-list">
             <div className="profile-menu-item logout" onClick={handleLogout}>
                <ArrowRightOnRectangleIcon style={{ width: 20 }} />
                <span>Жүйеден шығу</span>
             </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;
