import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  BookOpenIcon,
  UsersIcon,
  ChartBarIcon,
  AcademicCapIcon,
  EllipsisVerticalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftStartOnRectangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../api';
import './TeacherDashboard.css';

/**
 * Дашборд учителя.
 * Вкладки: Курсы, Ученики, Статистика.
 * Позволяет создавать/удалять курсы и записывать учеников.
 */
const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'students' | 'stats'
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Параллельно загружает список курсов, учеников и статистику.
   * Фильтрует пользователей — оставляет только с ролью STUDENT.
   */
  const fetchData = async () => {
    try {
      const [coursesRes, usersRes, statsRes] = await Promise.all([
        api.get('courses/'),
        api.get('users/'),
        api.get('courses/general_stats/')
      ]);
      setCourses(coursesRes.data);
      setStats(statsRes.data);
      const filteredStudents = usersRes.data.filter(u =>
        u.role && u.role.toString().trim().toUpperCase() === 'STUDENT'
      );
      setStudents(filteredStudents);
    } catch (err) {
      console.error('Деректерді жүктеу қатесі:', err);
    } finally {
      setLoading(false);
    }
  };

  /** Создаёт новый курс с введённым названием и обновляет список. */
  const handleCreateCourse = async () => {
    const title = prompt('Курс атауын енгізіңіз:');
    if (!title) return;
    try {
      await api.post('courses/', { title, description: '' });
      fetchData();
    } catch (err) {
      alert('Курс жасау кезінде қате кетті');
    }
  };

  /** Переименовывает курс через prompt. Сохраняет только если название изменилось. */
  const handleEditCourse = async (course) => {
    const newTitle = prompt('Жаңа атауды енгізіңіз:', course.title);
    if (!newTitle || newTitle === course.title) return;
    try {
      await api.patch(`courses/${course.id}/`, { title: newTitle });
      fetchData();
    } catch (err) {
      alert('Өзгерту мүмкін болмады');
    }
  };

  /** Удаляет курс после подтверждения. Действие необратимо. */
  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Курсты өшіру керек пе? Бұл әрекетті қайтару мүмкін емес.')) return;
    try {
      await api.delete(`courses/${courseId}/`);
      fetchData();
    } catch (err) {
      alert('Өшіру кезінде қате кетті');
    }
  };

  /**
   * Записывает или отписывает ученика от курса (переключение).
   * Отправляет полный обновлённый список учеников на сервер.
   * @param {Object} course - объект курса
   * @param {number} studentId - ID ученика
   */
  const toggleStudentEnrollment = async (course, studentId) => {
    const currentStudents = [...(course.students || [])];
    const index = currentStudents.indexOf(studentId);
    if (index > -1) {
      currentStudents.splice(index, 1);
    } else {
      currentStudents.push(studentId);
    }
    try {
      await api.post(`courses/${course.id}/enroll_students/`, { student_ids: currentStudents });
      setSelectedCourse({ ...course, students: currentStudents });
      fetchData();
    } catch (err) {
      alert('Оқушыны қосу мүмкін болмады');
    }
  };

  /** Публикует или снимает с публикации курс после подтверждения. */
  const togglePublish = async (course) => {
    const action = course.is_published ? 'жариядан алғыңыз' : 'жариялағыңыз';
    if (!confirm(`Шынымен курсты ${action} келе ме?`)) return;
    try {
      const res = await api.patch(`courses/${course.id}/`, { is_published: !course.is_published });
      setCourses(courses.map(c => c.id === course.id ? res.data : c));
      fetchData();
    } catch {
      alert('Қате орын алды');
    }
  };

  /** Очищает localStorage и перенаправляет на страницу входа. */
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  /**
   * Рендерит вкладку "Статистика": недельный график активности,
   * количество завершений и самый популярный курс.
   */
  const renderStats = () => {
    const dayMap = {
      'Mon': 'Дүй', 'Tue': 'Сей', 'Wed': 'Сәр', 'Thu': 'Бей', 'Fri': 'Жұм', 'Sat': 'Сен', 'Sun': 'Жек'
    };
    const weeklyData = stats?.weekly_activity?.map(d => ({
      ...d, dayLabel: dayMap[d.day] || d.day
    })) || [];
    const maxVal = Math.max(...weeklyData.map(d => d.val), 5);

    return (
      <section className="stats-details">
        <div className="stats-header-box">
          <h2>Жалпы статистика</h2>
          <p>Оқушылардың соңғы 7 күндегі жетістіктері</p>
        </div>
        <div className="stats-main-grid">
          <div className="stats-chart-card large">
            <div className="card-header-flex">
              <h4>Оқу белсенділігі (Апталық)</h4>
              <span className="trend positive">Нақты уақыт</span>
            </div>
            <div className="premium-bar-chart">
              {weeklyData.map((d, i) => (
                <div key={i} className="bar-wrapper">
                  <div className="bar-fill" style={{ height: `${(d.val / maxVal) * 90 + 5}%` }}>
                    <span className="tooltip">{d.val} сабақ</span>
                  </div>
                  <span className="bar-label">{d.dayLabel}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="stats-info-side">
            <div className="mini-insight-card">
              <div className="insight-icon green">
                <CheckCircleIcon style={{ width: 20 }} />
              </div>
              <div className="insight-data">
                <p>Аяқталған сабақтар</p>
                <h4>{stats?.total_completions || 0} сабақ</h4>
              </div>
            </div>
            <div className="mini-insight-card">
              <div className="insight-icon blue">
                <AcademicCapIcon style={{ width: 20 }} />
              </div>
              <div className="insight-data">
                <p>Ең танымал курс</p>
                <h4>{stats?.popular_course || 'Жоқ'}</h4>
              </div>
            </div>
          </div>
        </div>
        <div className="top-performers-box">
          <h4>Үздік оқушылар</h4>
          <div className="top-students-list">
            {students.sort((a, b) => b.xp - a.xp).slice(0, 3).map((s, idx) => (
              <div key={s.id} className="top-student-card">
                <div className="rank-badge">#{idx + 1}</div>
                <div className="s-avatar">{s.username[0]}</div>
                <div className="s-name">
                  <p>{s.username}</p>
                  <span>{s.xp} XP жинады</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  if (loading) return <div className="loading-screen">Жүктелуде...</div>;

  return (
    <div className="teacher-dashboard">
      <aside className={`teacher-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!collapsed && (
            <div className="sidebar-logo">
              <AcademicCapIcon className="nav-icon" />
              <span>MathQuest</span>
            </div>
          )}
          <button className="collapse-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRightIcon className="nav-icon" /> : <ChevronLeftIcon className="nav-icon" />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
            <BookOpenIcon className="nav-icon" />
            {!collapsed && <span>Курстарым</span>}
          </div>
          <div className={`nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
            <UsersIcon className="nav-icon" />
            {!collapsed && <span>Оқушылар</span>}
          </div>
          <div className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
            <ChartBarIcon className="nav-icon" />
            {!collapsed && <span>Статистика</span>}
          </div>
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div className="teacher-profile">
              <div className="t-avatar">M</div>
              <div className="t-info">
                <p>Мұғалім</p>
                <span>MathQuest</span>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            <ArrowLeftStartOnRectangleIcon className="nav-icon" />
            {!collapsed && <span>Шығу</span>}
          </button>
        </div>
      </aside>

      <main className="teacher-main">
        <header className="main-header">
          <div>
            <h1>Қайырлы күн!</h1>
            <p>Бүгінгі оқу үрдісін басқарыңыз</p>
          </div>
          <button className="create-course-btn" onClick={handleCreateCourse}>
            <PlusIcon className="nav-icon" />
            <span>Жаңа курс</span>
          </button>
        </header>

        {activeTab === 'courses' && (
          <section className="courses-section">
            <div className="teacher-stats-grid">
               <div className="stat-card">
                 <div className="stat-icon students"><UsersIcon className="nav-icon" /></div>
                 <div className="stat-info"><p>Оқушылар</p><h3>{students.length}</h3></div>
               </div>
               <div className="stat-card">
                 <div className="stat-icon courses"><BookOpenIcon className="nav-icon" /></div>
                 <div className="stat-info"><p>Курстар</p><h3>{courses.length}</h3></div>
               </div>
               <div className="stat-card">
                 <div className="stat-icon growth"><AcademicCapIcon className="nav-icon" /></div>
                 <div className="stat-info"><p>Жалпы сабақ</p><h3>{courses.reduce((acc, c) => acc + (c.sections?.reduce((a, s) => a + (s.lessons?.length || 0), 0) || 0), 0)}</h3></div>
               </div>
               <div className="stat-card">
                 <div className="stat-icon growth" style={{background: '#f5f3ff', color: '#7c3aed'}}><ChartBarIcon className="nav-icon" /></div>
                 <div className="stat-info"><p>Орташа ұпай</p><h3>{students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.xp, 0) / students.length) : 0} XP</h3></div>
               </div>
            </div>

            <div className="courses-grid">
              {courses.map(course => (
                <div key={course.id} className="course-card">
                  <div className="course-options" onClick={() => setActiveMenuId(activeMenuId === course.id ? null : course.id)}>
                    <EllipsisVerticalIcon className="options-icon" />
                    {activeMenuId === course.id && (
                      <div className="options-dropdown">
                        <button onClick={() => handleEditCourse(course)}>Атын өзгерту</button>
                        <button onClick={() => { setSelectedCourse(course); setShowEnrollModal(true); }}>Оқушылар тізімі</button>
                        <button className="delete" onClick={() => handleDeleteCourse(course.id)}>Жою</button>
                      </div>
                    )}
                  </div>
                  <div className="course-icon-wrapper"><AcademicCapIcon className="course-type-icon" /></div>
                  <div className="course-details">
                    <h3>{course.title}</h3>
                    <p>{course.sections?.length || 0} бөлім • {course.students?.length || 0} оқушы</p>
                    <div className="card-status-info">Статус: <span className={course.is_published ? 'status-active' : 'status-draft'}>{course.is_published ? 'Жарияланған' : 'Жарияланбаған'}</span></div>
                  </div>
                  <div className="course-footer">
                    <button className={`publish-toggle-btn ${course.is_published ? 'unpublish' : 'publish'}`} onClick={() => togglePublish(course)}>{course.is_published ? 'Жариядан алу' : 'Жариялау'}</button>
                    <button className="edit-btn" onClick={() => navigate(`/teacher/course/${course.id}`)}>Басқару</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'students' && (
          <section className="students-section card-box">
            <div className="table-header"><h2>Тіркелген оқушылар</h2></div>
            <table className="data-table">
              <thead><tr><th>Аты-жөні</th><th>Email</th><th>Прогресс</th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td><div className="table-user"><div className="u-pfp">{s.username[0]}</div> {s.username}</div></td>
                    <td>{s.email}</td>
                    <td><span className="xp-badge">{s.xp} XP</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'stats' && renderStats()}
      </main>

      {showEnrollModal && (
        <div className="modal-overlay" onClick={() => setShowEnrollModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Оқушыларды қосу</h3>
              <button className="close-btn" onClick={() => setShowEnrollModal(false)}>&times;</button>
            </div>
            <div className="enroll-list">
              {students.map(s => (
                <div key={s.id} className="enroll-item">
                  <div className="e-info">
                    <div className="e-pfp">{s.username[0]}</div>
                    <div><p className="e-name">{s.username}</p><p className="e-email">{s.email}</p></div>
                  </div>
                  <input type="checkbox" checked={selectedCourse?.students?.includes(s.id)} onChange={() => toggleStudentEnrollment(selectedCourse, s.id)} />
                </div>
              ))}
            </div>
            <button className="modal-done-btn" onClick={() => setShowEnrollModal(false)}>Дайын</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
