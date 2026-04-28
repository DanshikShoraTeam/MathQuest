import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  BookOpenIcon,
  TrophyIcon,
  UserIcon
} from '@heroicons/react/24/solid';
import './StudentLayout.css';

const StudentLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/student' && location.pathname === '/student') return true;
    if (path === '/student/courses' && location.pathname.startsWith('/student/courses')) return true;
    if (path === '/student/league' && location.pathname.startsWith('/student/league')) return true;
    if (path === '/student/profile' && location.pathname.startsWith('/student/profile')) return true;
    return false;
  };

  return (
    <div className="student-app-container">
      <div className="app-body">
        {children}
      </div>

      <nav className="global-bottom-nav">
        <div 
          className={`nav-tab ${isActive('/student') ? 'active' : ''}`} 
          onClick={() => navigate('/student')}
        >
          <HomeIcon />
          <span>Басты</span>
        </div>
        <div 
          className={`nav-tab ${isActive('/student/courses') ? 'active' : ''}`} 
          onClick={() => navigate('/student/courses')}
        >
          <BookOpenIcon />
          <span>Курстар</span>
        </div>
        <div 
          className={`nav-tab ${isActive('/student/league') ? 'active' : ''}`} 
          onClick={() => navigate('/student/league')}
        >
          <TrophyIcon />
          <span>Лига</span>
        </div>
        <div 
          className={`nav-tab ${isActive('/student/profile') ? 'active' : ''}`} 
          onClick={() => navigate('/student/profile')}
        >
          <UserIcon />
          <span>Профиль</span>
        </div>
      </nav>
    </div>
  );
};

export default StudentLayout;
