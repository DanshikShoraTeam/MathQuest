import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeftIcon,
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  DocumentIcon,
  PuzzlePieceIcon,
  CheckIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import api from '../../api';
import './LessonEditor.css';

/* Материал типтерінің конфигурациясы */
const MATERIAL_TYPES = [
  { type: 'TEXT',  label: 'Мәтін',  icon: DocumentTextIcon,  color: '#1cb0f6' },
  { type: 'VIDEO', label: 'Видео',  icon: VideoCameraIcon,   color: '#ff9600' },
  { type: 'FILE',  label: 'Файл',   icon: DocumentIcon,      color: '#58cc02' },
  { type: 'GAME',  label: 'Ойын',   icon: PuzzlePieceIcon,   color: '#cc02a8' },
];

const LessonEditor = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const [editingFile, setEditingFile] = useState(null);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const res = await api.get(`lessons/${lessonId}/`);
      setLesson(res.data);
      setMaterials(res.data.materials || []);
    } catch {
      alert('Сабақ жүктелмеді');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  /* ── Материал қосу ── */
  const addMaterial = async (type) => {
    setShowTypePicker(false);
    const defaultContent = type === 'TEXT'
      ? 'Мәтінді осында жазыңыз...'
      : type === 'VIDEO'
      ? 'https://youtube.com/watch?v=...'
      : type === 'GAME'
      ? 'fast-calc'
      : '';   // FILE үшін бос

    try {
      const res = await api.post('materials/', {
        lesson: parseInt(lessonId, 10),
        type,
        content: defaultContent,
        order: materials.length + 1,
      });
      setMaterials(prev => [...prev, res.data]);
      setEditingId(res.data.id);
      setEditingContent(res.data.content);
      setEditingFile(null);
    } catch (err) {
      console.error('Material POST error:', err.response?.data);
      alert('Материал қосу мүмкін болмады: ' + JSON.stringify(err.response?.data));
    }
  };

  /* ── Материал өзгерту ── */
  const saveMaterial = async (materialId, type) => {
    try {
      let data;
      let headers = {};
      
      if (type === 'FILE' && editingFile) {
        data = new FormData();
        data.append('file_upload', editingFile);
        data.append('content', editingFile.name); // Файл атын content ретінде сақтаймыз
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        data = { content: editingContent };
      }

      const res = await api.patch(`materials/${materialId}/`, data, { headers });
      
      setMaterials(prev =>
        prev.map(m => m.id === materialId ? { ...m, content: res.data.content, file_upload: res.data.file_upload } : m)
      );
      setEditingId(null);
      setEditingFile(null);
    } catch {
      alert('Сақтау мүмкін болмады');
    }
  };

  /* ── Материал жою ── */
  const deleteMaterial = async (materialId) => {
    if (!confirm('Материалды жою керек пе?')) return;
    try {
      await api.delete(`materials/${materialId}/`);
      setMaterials(prev => prev.filter(m => m.id !== materialId));
    } catch {
      alert('Жою мүмкін болмады');
    }
  };

  const getTypeConfig = (type) =>
    MATERIAL_TYPES.find(t => t.type === type) || MATERIAL_TYPES[0];

  /* ── YouTube embed helper ── */
  const getYouTubeId = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  if (loading) return <div className="lesson-loading">Жүктелуде...</div>;

  return (
    <div className="lesson-editor">

      {/* HEADER */}
      <header className="lesson-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeftIcon className="back-icon" />
          <span>Артқа</span>
        </button>
        <div className="lesson-header-center">
          <h1>{lesson?.title}</h1>
          <span>{materials.length} материал</span>
        </div>
        <div style={{ width: 80 }} /> {/* spacer */}
      </header>

      {/* CONTENT */}
      <div className="lesson-content">

        {/* Materials list */}
        <div className="materials-list">
          {materials.map((material, idx) => {
            const cfg = getTypeConfig(material.type);
            const Icon = cfg.icon;
            const isEditing = editingId === material.id;

            return (
              <div key={material.id} className="material-card">
                {/* Card header */}
                <div className="material-card-header">
                  <div className="material-type-badge" style={{ background: cfg.color + '18', color: cfg.color }}>
                    <Icon className="type-icon" />
                    <span>{cfg.label}</span>
                  </div>
                  <div className="material-actions">
                    {isEditing ? (
                      <button className="icon-btn green" onClick={() => saveMaterial(material.id, material.type)}>
                        <CheckIcon className="icon-sm" />
                      </button>
                    ) : (
                      <button
                        className="icon-btn"
                        onClick={() => {
                          setEditingId(material.id);
                          setEditingContent(material.content);
                        }}
                      >
                        <PencilIcon className="icon-sm" />
                      </button>
                    )}
                    <button className="icon-btn red" onClick={() => deleteMaterial(material.id)}>
                      <TrashIcon className="icon-sm" />
                    </button>
                  </div>
                </div>

                {/* Card body */}
                <div className="material-card-body">
                  {isEditing ? (
                    /* Editing state */
                    material.type === 'TEXT' ? (
                      <textarea
                        className="material-textarea"
                        value={editingContent}
                        onChange={e => setEditingContent(e.target.value)}
                        autoFocus
                        rows={6}
                        placeholder="Мәтінді енгізіңіз..."
                      />
                    ) : material.type === 'GAME' ? (
                      <div className="game-picker">
                        <p className="game-picker-label">Ойын түрін таңдаңыз:</p>
                        {['fast-calc', 'true-false', 'bomb', 'sequence', 'roulette'].map(g => (
                          <button
                            key={g}
                            className={`game-option${editingContent === g ? ' selected' : ''}`}
                            onClick={() => setEditingContent(g)}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    ) : material.type === 'FILE' ? (
                      <input
                        type="file"
                        className="material-input"
                        onChange={e => setEditingFile(e.target.files[0])}
                      />
                    ) : (
                      <input
                        className="material-input"
                        value={editingContent}
                        onChange={e => setEditingContent(e.target.value)}
                        autoFocus
                        placeholder={'YouTube URL...'}
                      />
                    )
                  ) : (
                    /* Preview state */
                    material.type === 'TEXT' ? (
                      <p className="material-text-preview">{material.content}</p>
                    ) : material.type === 'VIDEO' ? (
                      getYouTubeId(material.content) ? (
                        <div className="video-wrapper">
                          <iframe
                            src={`https://www.youtube.com/embed/${getYouTubeId(material.content)}`}
                            title="YouTube video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <p className="material-url-preview">{material.content}</p>
                      )
                    ) : material.type === 'GAME' ? (
                      <div className="game-preview">
                        <PuzzlePieceIcon className="game-preview-icon" />
                        <span>Ойын: <strong>{material.content}</strong></span>
                      </div>
                    ) : material.type === 'FILE' && material.file_upload ? (
                      <a href={material.file_upload} target="_blank" rel="noopener noreferrer" className="material-url-preview">
                        Жүктелген файл: {material.content}
                      </a>
                    ) : (
                      <p className="material-url-preview">{material.content || 'Файл жүктелмеген'}</p>
                    )
                  )}
                </div>
              </div>
            );
          })}

          {/* Add material button */}
          <div className="add-material-area">
            {showTypePicker ? (
              <div className="type-picker">
                <p className="type-picker-label">Материал түрін таңдаңыз:</p>
                <div className="type-picker-grid">
                  {MATERIAL_TYPES.map(t => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.type}
                        className="type-option"
                        style={{ '--accent': t.color }}
                        onClick={() => addMaterial(t.type)}
                      >
                        <Icon className="type-option-icon" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
                <button className="cancel-btn" onClick={() => setShowTypePicker(false)}>
                  Болдырмау
                </button>
              </div>
            ) : (
              <button className="add-material-btn" onClick={() => setShowTypePicker(true)}>
                <PlusIcon className="btn-icon" />
                Материал қосу
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonEditor;
