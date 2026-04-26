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

  useEffect(() => {
    fetchCourse();
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

  if (loading) return <div className="editor-loading">Жүктелуде...</div>;

  return (
    <div className="editor-page">

      {/* HEADER */}
      <header className="editor-header">
        <button className="back-btn" onClick={() => navigate('/teacher')}>
          <ChevronLeftIcon className="back-icon" />
          <span>Артқа</span>
        </button>
        <div className="editor-header-center">
          <h1>{course?.title}</h1>
          <span>{sections.length} бөлім • {sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0)} сабақ</span>
        </div>
        <div className="editor-header-right">
          <button className="publish-btn">Жариялау</button>
        </div>
      </header>

      {/* BODY */}
      <div className="editor-body">

        {/* LEFT: Structure */}
        <div className="structure-panel">
          <div className="panel-header">
            <h2>Курс құрылымы</h2>
            <button className="add-section-btn" onClick={addSection}>
              <PlusIcon className="btn-icon" />
              Бөлім қосу
            </button>
          </div>

          {sections.length === 0 && (
            <div className="empty-state">
              <PlusIcon className="empty-icon" />
              <p>Бірінші бөлімді қосыңыз</p>
            </div>
          )}

          <div className="sections-list">
            {sections.map((section, idx) => (
              <div key={section.id} className="section-block">

                {/* Section header row */}
                <div className="section-row">
                  <button
                    className="section-toggle"
                    onClick={() =>
                      setExpandedSection(expandedSection === section.id ? null : section.id)
                    }
                  >
                    {expandedSection === section.id
                      ? <ChevronUpIcon className="chevron" />
                      : <ChevronDownIcon className="chevron" />}
                  </button>

                  <div className="section-num">{idx + 1}</div>

                  {editingSectionId === section.id ? (
                    <>
                      <input
                        className="section-title-input"
                        value={editingSectionTitle}
                        onChange={e => setEditingSectionTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveSection(section.id)}
                        autoFocus
                      />
                      <button className="icon-btn green" onClick={() => saveSection(section.id)}>
                        <CheckIcon className="icon-sm" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="section-title">{section.title}</span>
                      <button
                        className="icon-btn"
                        onClick={() => {
                          setEditingSectionId(section.id);
                          setEditingSectionTitle(section.title);
                        }}
                      >
                        <PencilIcon className="icon-sm" />
                      </button>
                    </>
                  )}

                  <button className="icon-btn red" onClick={() => deleteSection(section.id)}>
                    <TrashIcon className="icon-sm" />
                  </button>
                </div>

                {/* Lessons list (accordion) */}
                {expandedSection === section.id && (
                  <div className="lessons-list">
                    {(section.lessons || []).map((lesson, li) => (
                      <div key={lesson.id} className="lesson-row">
                        <div className="lesson-num">{li + 1}</div>
                        <span className="lesson-title">{lesson.title}</span>
                        <button
                          className="icon-btn"
                          onClick={() => navigate(`/teacher/lesson/${lesson.id}`)}
                        >
                          <PencilIcon className="icon-sm" />
                        </button>
                        <button
                          className="icon-btn red"
                          onClick={() => deleteLesson(section.id, lesson.id)}
                        >
                          <TrashIcon className="icon-sm" />
                        </button>
                      </div>
                    ))}

                    <button
                      className="add-lesson-btn"
                      onClick={() => addLesson(section.id)}
                    >
                      <PlusIcon className="btn-icon" />
                      Сабақ қосу
                    </button>
                  </div>
                )}
              </div>
            ))}
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
          <div className="tip-card">
            <DocumentIcon className="tip-icon" />
            <div>
              <strong>Файл / PDF</strong>
              <p>Материалды жүктеп беріңіз</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CourseEditor;
