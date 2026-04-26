import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  BookOpenIcon,
  UsersIcon,
  ChartBarIcon,
  AcademicCapIcon,
  EllipsisVerticalIcon,
  HandRaisedIcon,
  CalculatorIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftStartOnRectangleIcon,
} from '@heroicons/react/24/outline';
import api from '../../api';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('courses/');
      setCourses(response.data);
    } catch (err) {
      console.error('Курстарды жүктеу мүмкін болмады');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    const title = prompt('Курс атауын енгізіңіз:');
    if (!title) return;
    try {
      await api.post('courses/', { title, description: '' });
      fetchCourses();
    } catch (err) {
      alert('Курс жасау кезінде қате кетті');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className={`dashboard-container${collapsed ? ' sb-collapsed' : ''}`}>

      {/* ===== SIDEBAR ===== */}
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>

        {/* Brand + Toggle */}
        <div className="sidebar-top">
          {!collapsed && (
            <div className="sidebar-brand">
              <div className="brand-logo"><CalculatorIcon className="brand-icon" /></div>
              <span className="brand-name">MathQuest</span>
            </div>
          )}
          <button
            className="toggle-btn"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Ашу' : 'Жабу'}
          >
            {collapsed
              ? <ChevronRightIcon className="toggle-icon" />
              : <ChevronLeftIcon className="toggle-icon" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <BookOpenIcon className="nav-icon" />
            {!collapsed && <span>Басты бет</span>}
          </a>
          <a href="#" className="nav-item">
            <UsersIcon className="nav-icon" />
            {!collapsed && <span>Оқушылар</span>}
          </a>
          <a href="#" className="nav-item">
            <ChartBarIcon className="nav-icon" />
            {!collapsed && <span>Статистика</span>}
          </a>
          <a href="#" className="nav-item">
            <AcademicCapIcon className="nav-icon" />
            {!collapsed && <span>Материалдар</span>}
          </a>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-row">
            <div className="user-avatar">М</div>
            {!collapsed && (
              <div className="user-info">
                <p className="user-name">Мұғалім</p>
                <button className="logout-btn" onClick={handleLogout}>
                  Шығу
                </button>
              </div>
            )}
          </div>
          {collapsed && (
            <button
              className="logout-icon-btn"
              onClick={handleLogout}
              title="Шығу"
            >
              <ArrowLeftStartOnRectangleIcon />
            </button>
          )}
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="main-content">
        <header className="content-header">
          <div className="header-titles">
            <h1>Қош келдіңіз! <HandRaisedIcon className="greet-icon" /></h1>
            <p>Бүгін сіздің оқушыларыңыз жақсы нәтиже көрсетіп жатыр.</p>
          </div>
          <button className="create-btn" onClick={handleCreateCourse}>
            <PlusIcon className="btn-icon" />
            <span>Жаңа курс</span>
          </button>
        </header>

        {/* Stats */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon students"><UsersIcon /></div>
            <div className="stat-info"><h3>84</h3><p>Жалпы оқушылар</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon courses-icon"><BookOpenIcon /></div>
            <div className="stat-info"><h3>{courses.length}</h3><p>Белсенді курстар</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon growth"><ChartBarIcon /></div>
            <div className="stat-info"><h3>+15%</h3><p>Апталық өсім</p></div>
          </div>
        </section>

        {/* Courses */}
        <section className="courses-section">
          <div className="section-header">
            <h2>Менің курстарым</h2>
            <a href="#">Барлығын көру</a>
          </div>

          <div className="courses-grid">
            {courses.map(course => (
              <div key={course.id} className="course-card">
                <div className="course-options">
                  <EllipsisVerticalIcon className="options-icon" />
                </div>
                <div className="course-icon-wrapper">
                  <AcademicCapIcon className="course-type-icon" />
                </div>
                <div className="course-details">
                  <h3>{course.title}</h3>
                  <p>{course.sections?.length || 0} бөлім • {course.students_count || 0} оқушы</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '0%' }} />
                  </div>
                </div>
                <div className="course-footer">
                  <button
                    className="edit-btn"
                    onClick={() => navigate(`/teacher/course/${course.id}`)}
                  >
                    Басқару
                  </button>
                </div>
              </div>
            ))}

            {loading && <p className="loading-text">Жүктелуде...</p>}

            {!loading && courses.length === 0 && (
              <div className="add-course-card" onClick={handleCreateCourse}>
                <PlusIcon className="add-icon" />
                <p>Курс қосу</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default TeacherDashboard;
