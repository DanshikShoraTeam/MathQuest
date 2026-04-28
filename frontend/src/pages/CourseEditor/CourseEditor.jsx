import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeftIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  DocumentIcon,
  PuzzlePieceIcon,
  PencilIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import api from '../../api';
import './CourseEditor.css';

const CourseEditor = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');
  const [activeTab, setActiveTab] = useState('structure'); // 'structure', 'stats'
  const [stats, setStats] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  useEffect(() => {
    fetchCourse();
    fetchStats();
    fetchUsers();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await api.get(`courses/${courseId}/`);
      setCourse(res.data);
      setSections(res.data.sections || []);
    } catch {
      alert('Курс жүктелмеді');
      navigate('/teacher');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get(`courses/${courseId}/stats/`);
      setStats(res.data);
    } catch (err) {
      console.error('Статистиканы жүктеу мүмкін болмады');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('users/');
      setAllStudents(res.data.filter(u => u.role === 'STUDENT'));
    } catch (err) {
      console.error('Оқушылар тізімін жүктеу мүмкін болмады');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'stats') fetchStats();
  };

  const toggleStudentEnrollment = async (studentId) => {
    const currentStudentIds = course.students || [];
    const isEnrolled = currentStudentIds.includes(studentId);
    
    let newStudentIds;
    if (isEnrolled) {
      newStudentIds = currentStudentIds.filter(id => id !== studentId);
    } else {
      newStudentIds = [...currentStudentIds, studentId];
    }

    try {
      await api.post(`courses/${courseId}/enroll_students/`, { student_ids: newStudentIds });
      setCourse(prev => ({ ...prev, students: newStudentIds }));
      fetchStats(); // Статистиканы жаңарту
    } catch (err) {
      alert('Оқушыны тізімге қосу мүмкін болмады');
    }
  };

  /* ── SECTION CRUD ── */
  const addSection = async () => {
    const nextOrder = sections.length + 1;
    try {
      const res = await api.post('sections/', {
        course: courseId,
        title: `${nextOrder}-бөлім`,
        order: nextOrder,
      });
      setSections(prev => [...prev, { ...res.data, lessons: [] }]);
      setExpandedSection(res.data.id);
    } catch {
      alert('Бөлім қосу мүмкін болмады');
    }
  };

  const deleteSection = async (sectionId) => {
    if (!confirm('Бөлімді жою керек пе?')) return;
    try {
      await api.delete(`sections/${sectionId}/`);
      setSections(prev => prev.filter(s => s.id !== sectionId));
    } catch {
      alert('Жою мүмкін болмады');
    }
  };

  const saveSection = async (sectionId) => {
    try {
      await api.patch(`sections/${sectionId}/`, { title: editingSectionTitle });
      setSections(prev =>
        prev.map(s => s.id === sectionId ? { ...s, title: editingSectionTitle } : s)
      );
      setEditingSectionId(null);
    } catch {
      alert('Сақтау мүмкін болмады');
    }
  };

  /* ── LESSON CRUD ── */
  const addLesson = async (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    const nextOrder = (section?.lessons?.length || 0) + 1;
    try {
      const res = await api.post('lessons/', {
        section: sectionId,
        title: `${nextOrder}-сабақ`,
        order: nextOrder,
      });
      setSections(prev =>
        prev.map(s =>
          s.id === sectionId
            ? { ...s, lessons: [...(s.lessons || []), res.data] }
            : s
        )
      );
    } catch {
      alert('Сабақ қосу мүмкін болмады');
    }
  };

  const deleteLesson = async (sectionId, lessonId) => {
    if (!confirm('Сабақты жою керек пе?')) return;
    try {
      await api.delete(`lessons/${lessonId}/`);
      setSections(prev =>
        prev.map(s =>
          s.id === sectionId
            ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) }
            : s
        )
      );
    } catch {
      alert('Жою мүмкін болмады');
    }
  };

  const togglePublish = async () => {
    const action = course.is_published ? 'жариядан алғыңыз' : 'жариялағыңыз';
    if (!confirm(`Шынымен курсты ${action} келе ме?`)) return;

    try {
      const res = await api.patch(`courses/${courseId}/`, { is_published: !course.is_published });
      setCourse(res.data);
    } catch {
      alert('Күйді өзгерту мүмкін болмады');
    }
  };

  if (loading) return <div className="editor-loading">Жүктелуде...</div>;

  return (
    <div className="editor-page">
      <header className="editor-header">
        <button className="back-btn" onClick={() => navigate('/teacher')}>
          <ChevronLeftIcon style={{ width: 20 }} />
          <span>Артқа</span>
        </button>
        <div className="editor-header-center">
          <h1>{course?.title}</h1>
          <span>{sections.length} бөлім • {sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0)} сабақ</span>
        </div>
        <div className="editor-header-right">
          <div className="status-label">
            Статус: <span className={course?.is_published ? 'status-active' : 'status-draft'}>
              {course?.is_published ? 'Жарияланған' : 'Жарияланбаған'}
            </span>
          </div>
          <button 
            className={`publish-btn-v2 ${course?.is_published ? 'unpublish' : 'publish'}`}
            onClick={togglePublish}
          >
            {course?.is_published ? 'Жариядан алу' : 'Жариялау'}
          </button>
        </div>
      </header>

      <div className="editor-tabs">
        <button 
          className={`tab-btn ${activeTab === 'structure' ? 'active' : ''}`}
          onClick={() => handleTabChange('structure')}
        >
          Құрылым
        </button>
        <button 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => handleTabChange('stats')}
        >
          Оқушылар статистикасы
        </button>
      </div>

      <div className="editor-body">
        
        {activeTab === 'stats' ? (
          <div className="stats-panel-full">
            <div className="panel-header">
              <div>
                <h2>Оқушылардың үлгерімі</h2>
                <p>Барлығы: {stats.length} оқушы</p>
              </div>
              <button className="add-section-btn" onClick={() => setShowEnrollModal(true)}>
                <PlusIcon style={{ width: 18 }} />
                Оқушы қосу
              </button>
            </div>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Оқушы</th>
                  <th>Прогресс</th>
                  <th>Өтілген сабақ</th>
                  <th>XP</th>
                </tr>
              </thead>
              <tbody>
                {stats.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div className="student-cell">
                        <div className="s-avatar">{s.username[0]}</div>
                        <div>
                          <p className="s-name">{s.username}</p>
                          <p className="s-email">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="progress-cell">
                        <div className="p-bar"><div className="p-fill" style={{ width: `${s.progress}%`, background: s.progress === 100 ? '#58cc02' : '' }}></div></div>
                        <span>{s.progress}%</span>
                        {s.progress === 100 && <CheckIcon className="done-icon" />}
                      </div>
                    </td>
                    <td>{s.completed_lessons} / {s.total_lessons}</td>
                    <td><span className="xp-tag">{s.xp} XP</span></td>
                  </tr>
                ))}
                {stats.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty-td" style={{ textAlign: 'center', padding: '40px', color: '#777' }}>
                      Бұл курсқа әлі оқушылар жазылмаған. <br/>
                      Оқушыларды қосу үшін жоғарыдағы "Оқушы қосу" батырмасын басыңыз.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            {/* LEFT: Structure */}
            <div className="structure-panel">
              <div className="panel-header">
                <h2>Курс құрылымы</h2>
                <button className="add-section-btn" onClick={addSection}>
                  <PlusIcon style={{ width: 20 }} />
                  Бөлім қосу
                </button>
              </div>

              <div className="sections-list">
                {sections.map((section, idx) => (
                  <div key={section.id} className="section-block">
                    <div className="section-row" onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}>
                      <div className="section-num">{idx + 1}</div>
                      
                      {editingSectionId === section.id ? (
                        <input
                          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--primary)' }}
                          value={editingSectionTitle}
                          onChange={e => setEditingSectionTitle(e.target.value)}
                          onClick={e => e.stopPropagation()}
                          onKeyDown={e => e.key === 'Enter' && saveSection(section.id)}
                          autoFocus
                        />
                      ) : (
                        <span className="section-title">{section.title}</span>
                      )}

                      <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#777' }} onClick={() => { setEditingSectionId(section.id); setEditingSectionTitle(section.title); }}>
                          <PencilIcon style={{ width: 18 }} />
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4b4b' }} onClick={() => deleteSection(section.id)}>
                          <TrashIcon style={{ width: 18 }} />
                        </button>
                      </div>
                    </div>

                    {expandedSection === section.id && (
                      <div className="lessons-list">
                        {(section.lessons || []).map((lesson, li) => (
                          <div key={lesson.id} className="lesson-row" onClick={() => navigate(`/teacher/lesson/${lesson.id}`)}>
                            <div className="section-num" style={{ width: 24, height: 24, fontSize: '0.8rem' }}>{li + 1}</div>
                            <span className="lesson-title">{lesson.title}</span>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4b4b' }} onClick={(e) => { e.stopPropagation(); deleteLesson(section.id, lesson.id); }}>
                              <TrashIcon style={{ width: 18 }} />
                            </button>
                          </div>
                        ))}
                        <button className="add-lesson-btn" onClick={() => addLesson(section.id)}>
                          <PlusIcon style={{ width: 18 }} />
                          Сабақ қосу
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {sections.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    <PlusIcon style={{ width: 40, margin: '0 auto 10px', opacity: 0.3 }} />
                    <p>Бөлімдер әлі қосылмаған</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Tips */}
            <div className="tips-panel">
              <h3>Кеңестер</h3>
              <div className="tip-card">
                <DocumentTextIcon className="tip-icon" />
                <div>
                  <strong>Мәтін</strong>
                  <p>Теория, анықтамалар және мысалдар қосыңыз</p>
                </div>
              </div>
              <div className="tip-card">
                <VideoCameraIcon className="tip-icon" />
                <div>
                  <strong>Видео</strong>
                  <p>YouTube сілтемесі немесе файл жүктеу</p>
                </div>
              </div>
              <div className="tip-card">
                <PuzzlePieceIcon className="tip-icon" />
                <div>
                  <strong>Ойын</strong>
                  <p>5 ойын түрінің бірін таңдаңыз</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ENROLL MODAL */}
      {showEnrollModal && (
        <div className="modal-overlay" onClick={() => setShowEnrollModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Оқушыларды курсқа қосу</h3>
              <button className="close-btn" onClick={() => setShowEnrollModal(false)}>&times;</button>
            </div>
            <div className="enroll-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {allStudents.map(s => (
                <div key={s.id} className="enroll-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f9fafb', marginBottom: '8px', borderRadius: '12px' }}>
                  <div className="e-info" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="e-pfp" style={{ width: 36, height: 36, background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{s.username[0]}</div>
                    <div>
                      <p className="e-name" style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{s.username}</p>
                      <p className="e-email" style={{ fontSize: '0.75rem', color: '#777' }}>{s.email}</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={course?.students?.includes(s.id)}
                    onChange={() => toggleStudentEnrollment(s.id)}
                    style={{ width: 20, height: 20, cursor: 'pointer' }}
                  />
                </div>
              ))}
            </div>
            <button className="modal-done-btn" onClick={() => setShowEnrollModal(false)} style={{ marginTop: '20px' }}>Дайын</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseEditor;
