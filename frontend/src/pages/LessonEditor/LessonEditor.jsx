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
  CheckBadgeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import api from '../../api';
import './LessonEditor.css';

const MATERIAL_TYPES = [
  { type: 'TEXT', label: 'Мәтін', icon: DocumentTextIcon, color: '#1cb0f6' },
  { type: 'VIDEO', label: 'Видео', icon: VideoCameraIcon, color: '#ff9600' },
  { type: 'GAME', label: 'Ойын', icon: PuzzlePieceIcon, color: '#cc02a8' },
  { type: 'TEST', label: 'Тест', icon: CheckBadgeIcon, color: '#ff4b4b' },
  { type: 'FILE', label: 'Файл', icon: DocumentIcon, color: '#58cc02' },
];

/**
 * Редактор урока для учителя.
 * Позволяет добавлять/редактировать/удалять/переставлять блоки материала:
 * текст, видео, файл, игра, тест. Для игр — выбор типа и генерация вопросов.
 */
const LessonEditor = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingData, setEditingData] = useState({ questions: [] });
  const [editingFile, setEditingFile] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingFile(file);
      setEditingContent(file.name);
    }
  };

  /**
   * Генерирует случайные вопросы для выбранного типа игры (5 класс).
   * @param {string} gameType - тип игры (fast-calc, true-false, sequence, text-task, fill-blank)
   * @param {number} count - количество вопросов
   * @returns {Array} массив объектов { q, a, w1, w2, w3, explanation }
   */
  const generateRandomQuestions = (gameType, count = 10) => {
    const questions = [];
    for (let i = 0; i < count; i++) {
      let q = '', a = '', w1 = '', w2 = '', w3 = '', explanation = '';

      if (gameType === 'fast-calc') {
        // Вопросы уровня 5 класса: сложение/вычитание трёхзначных, умножение, проценты
        const types = ['add', 'sub', 'mul', 'percent'];
        const t = types[Math.floor(Math.random() * types.length)];
        if (t === 'add') {
          const n1 = Math.floor(Math.random() * 900) + 100;
          const n2 = Math.floor(Math.random() * 900) + 100;
          const res = n1 + n2;
          q = `${n1} + ${n2} = ?`; a = res.toString();
          w1 = (res + 10).toString(); w2 = (res - 10).toString(); w3 = (res + 100).toString();
          explanation = `${n1} + ${n2} = ${res}`;
        } else if (t === 'sub') {
          const n1 = Math.floor(Math.random() * 900) + 200;
          const n2 = Math.floor(Math.random() * 200) + 50;
          const res = n1 - n2;
          q = `${n1} − ${n2} = ?`; a = res.toString();
          w1 = (res + 5).toString(); w2 = (res - 5).toString(); w3 = (res + 50).toString();
          explanation = `${n1} − ${n2} = ${res}`;
        } else if (t === 'mul') {
          const n1 = Math.floor(Math.random() * 12) + 2;
          const n2 = Math.floor(Math.random() * 12) + 2;
          const res = n1 * n2;
          q = `${n1} × ${n2} = ?`; a = res.toString();
          w1 = (res + 2).toString(); w2 = (res - 2).toString(); w3 = (res + n2).toString();
          explanation = `${n1} × ${n2} = ${res}`;
        } else {
          const percents = [10, 20, 25, 50];
          const p = percents[Math.floor(Math.random() * percents.length)];
          const base = [100, 200, 500, 1000][Math.floor(Math.random() * 4)];
          const res = (base * p) / 100;
          q = `${base}-нің ${p}%-і = ?`; a = res.toString();
          w1 = (res * 2).toString(); w2 = (res + 10).toString(); w3 = (res - 10).toString();
          explanation = `${base} × ${p} / 100 = ${res}`;
        }
      } else if (gameType === 'true-false') {
        // Проверка правильности утверждения (5 класс)
        const n1 = Math.floor(Math.random() * 500) + 100;
        const n2 = Math.floor(Math.random() * 500) + 100;
        const isCorrect = Math.random() > 0.5;
        const real = n1 + n2;
        const fake = real + (Math.random() > 0.5 ? 11 : -11);
        q = `${n1} + ${n2} = ${isCorrect ? real : fake}`;
        a = isCorrect ? 'True' : 'False';
        explanation = `${n1} + ${n2} = ${real}. Сондықтан бұл жауап ${isCorrect ? 'дұрыс' : 'қате'}.`;
      } else if (gameType === 'sequence') {
        // Арифметическая прогрессия уровня 5 класса
        const start = Math.floor(Math.random() * 50) + 5;
        const step = Math.floor(Math.random() * 10) + 2;
        const seq = [start, start + step, start + step * 2, start + step * 3];
        const correct = start + step * 4;
        q = `${seq.join(', ')}, ...`;
        a = correct.toString();
        w1 = (correct + step).toString();
        w2 = (correct + 2).toString();
        w3 = (correct - step).toString();
        explanation = `Тізбек ${step}-ке артып жатыр. Келесі сан: ${correct}.`;
      } else if (gameType === 'text-task') {
        // Текстовые задачи 5 класса
        const templates = [
          () => {
            const apples = Math.floor(Math.random() * 200) + 100;
            const factor = Math.floor(Math.random() * 3) + 2;
            const pears = Math.floor(apples / factor);
            const total = apples + pears;
            return {
              q: `Бір қапшықта ${apples} кг алма бар. Алмұрт алмадан ${factor} есе кем. Барлығы қанша кг?`,
              a: total.toString(),
              w1: pears.toString(), w2: (total + factor * 10).toString(), w3: (total - pears).toString(),
              explanation: `Алмұрт = ${apples} ÷ ${factor} = ${pears} кг. Барлығы = ${apples} + ${pears} = ${total} кг`
            };
          },
          () => {
            const speed = (Math.floor(Math.random() * 5) + 4) * 10;
            const time = Math.floor(Math.random() * 3) + 2;
            const dist = speed * time;
            return {
              q: `Автобус сағатына ${speed} км жылдамдықпен ${time} сағат жүрді. Жол қанша км?`,
              a: dist.toString(),
              w1: (dist + speed).toString(), w2: (speed + time).toString(), w3: (dist - speed).toString(),
              explanation: `S = v × t = ${speed} × ${time} = ${dist} км`
            };
          }
        ];
        const tmpl = templates[Math.floor(Math.random() * templates.length)]();
        q = tmpl.q; a = tmpl.a; w1 = tmpl.w1; w2 = tmpl.w2; w3 = tmpl.w3;
        explanation = tmpl.explanation;
      } else if (gameType === 'fill-blank') {
        // Задачи с вводом ответа (дроби, %, среднее арифметическое)
        const templates = [
          () => {
            const p = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
            const base = [200, 500, 1000, 2000][Math.floor(Math.random() * 4)];
            const res = (base * p) / 100;
            return { q: `${base}-нің ${p}%-і = ?`, a: res.toString(), explanation: `${base} × ${p} / 100 = ${res}` };
          },
          () => {
            const nums = Array.from({ length: 5 }, () => Math.floor(Math.random() * 20) + 70);
            const avg = Math.round(nums.reduce((s, n) => s + n, 0) / nums.length);
            return { q: `(${nums.join(' + ')}) ÷ 5 = ?`, a: avg.toString(), explanation: `Қосынды = ${nums.reduce((s, n) => s + n, 0)}, орташа = ${avg}` };
          }
        ];
        const tmpl = templates[Math.floor(Math.random() * templates.length)]();
        q = tmpl.q; a = tmpl.a; explanation = tmpl.explanation;
        // fill-blank не требует вариантов, но мы их оставим пустыми
        w1 = ''; w2 = ''; w3 = '';
      }
      questions.push({ q, a, w1, w2, w3, explanation });
    }
    return questions;
  };

  /**
   * Обновляет одно поле вопроса в массиве editingData.questions.
   * @param {number} idx - индекс вопроса
   * @param {string} field - название поля (q, a, w1, w2, w3, explanation)
   * @param {string} val - новое значение
   */
  const updateQ = (idx, field, val) => {
    const newQ = [...editingData.questions];
    newQ[idx][field] = val;
    setEditingData({ ...editingData, questions: newQ });
  };

  /**
   * Удаляет вопрос по индексу из списка editingData.questions.
   * @param {number} idx - индекс вопроса
   */
  const removeQ = (idx) => {
    const newQ = editingData.questions.filter((_, i) => i !== idx);
    setEditingData({ ...editingData, questions: newQ });
  };

  const renderQuestionInputs = (q, qIdx) => {
    const currentMaterial = materials.find(m => m.id === editingId);
    const isTest = currentMaterial?.type === 'TEST';

    // ТЕСТ үшін әрқашан стандартты 4 жауаптық интерфейс (PDD сияқты)
    if (isTest) {
      return (
        <div key={qIdx} className="q-row standard-row">
          <input className="q-main" value={q.q} onChange={e => updateQ(qIdx, 'q', e.target.value)} placeholder="Сұрақ..." />
          <div className="ans-grid">
            <input className="correct" value={q.a} onChange={e => updateQ(qIdx, 'a', e.target.value)} placeholder="Дұрыс" title="Дұрыс жауап" />
            <input value={q.w1} onChange={e => updateQ(qIdx, 'w1', e.target.value)} placeholder="Қате 1" />
            <input value={q.w2} onChange={e => updateQ(qIdx, 'w2', e.target.value)} placeholder="Қате 2" />
            <input value={q.w3} onChange={e => updateQ(qIdx, 'w3', e.target.value)} placeholder="Қате 3" />
          </div>
          <input className="exp" value={q.explanation} onChange={e => updateQ(qIdx, 'explanation', e.target.value)} placeholder="Түсіндірме (Неге бұл жауап дұрыс?)" />
          <button className="del-btn" onClick={() => removeQ(qIdx)}><TrashIcon style={{width:16}}/></button>
        </div>
      );
    }

    if (editingContent === 'true-false') {
      return (
        <div key={qIdx} className="q-row true-false-row">
          <div className="q-inputs-main">
            <input className="q-main" value={q.q} onChange={e => updateQ(qIdx, 'q', e.target.value)} placeholder="Теңдеу немесе Тұжырым..." />
            <select value={q.a} onChange={e => updateQ(qIdx, 'a', e.target.value)}>
              <option value="True">Шындық (True)</option>
              <option value="False">Жалған (False)</option>
            </select>
          </div>
          {isTest && (
            <input className="exp" value={q.explanation} onChange={e => updateQ(qIdx, 'explanation', e.target.value)} placeholder="Түсіндірме..." />
          )}
          <button className="del-btn" onClick={() => removeQ(qIdx)}><TrashIcon style={{width:16}}/></button>
        </div>
      );
    }
    if (editingContent === 'sequence') {
      return (
        <div key={qIdx} className="q-row sequence-row">
          <div className="q-inputs-main">
            <input className="q-main" value={q.q} onChange={e => updateQ(qIdx, 'q', e.target.value)} placeholder="Тізбек (мысалы: 2, 4, 6, ...)" />
            <div className="ans-grid" style={{ marginTop: '10px' }}>
              <input className="correct" value={q.a} onChange={e => updateQ(qIdx, 'a', e.target.value)} placeholder="Дұрыс" />
              <input value={q.w1} onChange={e => updateQ(qIdx, 'w1', e.target.value)} placeholder="Қате 1" />
              <input value={q.w2} onChange={e => updateQ(qIdx, 'w2', e.target.value)} placeholder="Қате 2" />
              <input value={q.w3} onChange={e => updateQ(qIdx, 'w3', e.target.value)} placeholder="Қате 3" />
            </div>
          </div>
          {isTest && (
            <input className="exp" value={q.explanation} onChange={e => updateQ(qIdx, 'explanation', e.target.value)} placeholder="Түсіндірме..." />
          )}
          <button className="del-btn" onClick={() => removeQ(qIdx)}><TrashIcon style={{width:16}}/></button>
        </div>
      );
    }
    if (editingContent === 'fill-blank') {
      // Для fill-blank варианты ответа не нужны — только вопрос и правильный ответ
      return (
        <div key={qIdx} className="q-row standard-row">
          <input className="q-main" value={q.q} onChange={e => updateQ(qIdx, 'q', e.target.value)} placeholder="Мысалы: 15 000-нің 20%-і = ?" />
          <input className="correct" value={q.a} onChange={e => updateQ(qIdx, 'a', e.target.value)} placeholder="Дұрыс жауап (мысалы: 3000)" title="Дұрыс жауап" />
          <input className="exp" value={q.explanation} onChange={e => updateQ(qIdx, 'explanation', e.target.value)} placeholder="Шешімі / Түсіндірме..." />
          <button className="del-btn" onClick={() => removeQ(qIdx)}><TrashIcon style={{width:16}}/></button>
        </div>
      );
    }
    return (
      <div key={qIdx} className="q-row standard-row">
        <input className="q-main" value={q.q} onChange={e => updateQ(qIdx, 'q', e.target.value)} placeholder="Сұрақ..." />
        <div className="ans-grid">
          <input className="correct" value={q.a} onChange={e => updateQ(qIdx, 'a', e.target.value)} placeholder="Дұрыс" title="Дұрыс жауап" />
          <input value={q.w1} onChange={e => updateQ(qIdx, 'w1', e.target.value)} placeholder="Қате 1" />
          <input value={q.w2} onChange={e => updateQ(qIdx, 'w2', e.target.value)} placeholder="Қате 2" />
          <input value={q.w3} onChange={e => updateQ(qIdx, 'w3', e.target.value)} placeholder="Қате 3" />
        </div>
        {isTest && (
          <input className="exp" value={q.explanation} onChange={e => updateQ(qIdx, 'explanation', e.target.value)} placeholder="Түсіндірме / Түсіндіру..." />
        )}
        <button className="del-btn" onClick={() => removeQ(qIdx)}><TrashIcon style={{width:16}}/></button>
      </div>
    );
  };

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const res = await api.get(`lessons/${lessonId}/`);
      setLesson(res.data);
      setMaterials(res.data.materials.sort((a, b) => a.order - b.order) || []);
    } catch {
      alert('Сабақ жүктелмеді');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Создаёт новый блок материала выбранного типа через API.
   * @param {string} type - тип материала: TEXT | VIDEO | GAME | TEST | FILE
   */
  const addMaterial = async (type) => {
    setShowTypePicker(false);
    const defaultContent = type === 'TEXT' ? 'Жаңа мәтін...' : type === 'VIDEO' ? '' : type === 'GAME' ? '' : '';
    // Жаңа материал қосар алдында редакциялау күйлерін тазалау
    setEditingId(null);
    setEditingContent(defaultContent);
    setEditingTitle('');
    setEditingDescription('');
    setEditingData({ questions: [] });
    setEditingFile(null);

    try {
      const res = await api.post('materials/', {
        lesson: parseInt(lessonId, 10),
        type,
        content: defaultContent,
        data: type === 'GAME' ? { questions: [] } : {},
        order: materials.length,
      });
      setMaterials([...materials, res.data]);
      setEditingId(res.data.id);
    } catch {
      alert('Материал қосу мүмкін болмады');
    }
  };

  /**
   * Сохраняет изменения материала на сервер через PATCH-запрос.
   * Для FILE-типа отправляет FormData с файлом.
   * @param {number} materialId - ID материала
   * @param {string} type - тип материала
   */
  const saveMaterial = async (materialId, type) => {
    try {
      let data;
      let headers = {};
      if (type === 'FILE' && editingFile) {
        data = new FormData();
        data.append('file_upload', editingFile);
        data.append('content', editingFile.name);
        data.append('title', editingTitle);
        data.append('description', editingDescription);
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        data = {
          content: editingContent,
          title: editingTitle,
          description: editingDescription,
          data: editingData
        };
      }
      const res = await api.patch(`materials/${materialId}/`, data, { headers });
      setMaterials(materials.map(m => m.id === materialId ? res.data : m));
      setEditingId(null);
    } catch {
      alert('Сақтау мүмкін болмады');
    }
  };

  const deleteMaterial = async (id) => {
    if (!confirm('Жою керек пе?')) return;
    try {
      await api.delete(`materials/${id}/`);
      setMaterials(materials.filter(m => m.id !== id));
    } catch {
      alert('Жою мүмкін болмады');
    }
  };

  /**
   * Перемещает блок материала вверх или вниз в списке.
   * Обновляет порядок (order) у двух затронутых материалов на сервере.
   * @param {number} index - текущий индекс материала
   * @param {'up'|'down'} direction - направление перемещения
   */
  const moveMaterial = async (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === materials.length - 1)) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newMaterials = [...materials];
    [newMaterials[index], newMaterials[newIndex]] = [newMaterials[newIndex], newMaterials[index]];
    setMaterials(newMaterials);
    try {
      await Promise.all([
        api.patch(`materials/${newMaterials[index].id}/`, { order: index }),
        api.patch(`materials/${newMaterials[newIndex].id}/`, { order: newIndex })
      ]);
    } catch (err) { console.error(err); }
  };

  const getYouTubeId = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  if (loading) return <div className="lesson-loading">Жүктелуде...</div>;

  return (
    <div className="lesson-editor">
      <header className="lesson-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeftIcon />
          <span>Артқа</span>
        </button>
        <div className="lesson-header-center">
          <h1>{lesson?.title}</h1>
          <span>{materials.length} блок</span>
        </div>
        <div style={{ width: 80 }} />
      </header>

      <div className="lesson-content">
        <div className="materials-list">
          {materials.map((m, idx) => {
            const cfg = MATERIAL_TYPES.find(t => t.type === m.type) || MATERIAL_TYPES[0];
            const Icon = cfg.icon;
            const isEditing = editingId === m.id;

            return (
              <div key={m.id} className="material-card">
                <div className="material-type-badge" style={{ background: cfg.color + '15', color: cfg.color }}>
                  <Icon style={{ width: 14 }} />
                  <span>{cfg.label}</span>
                </div>

                <div className="material-card-header">
                  <div className="material-actions">
                    <button className="icon-btn" onClick={() => moveMaterial(idx, 'up')} disabled={idx === 0}>
                      <ArrowUpIcon />
                    </button>
                    <button className="icon-btn" onClick={() => moveMaterial(idx, 'down')} disabled={idx === materials.length - 1}>
                      <ArrowDownIcon />
                    </button>
                    {isEditing ? (
                      <>
                        <button className="icon-btn red-cancel" onClick={() => {
                          setEditingId(null);
                          setEditingContent('');
                          setEditingTitle('');
                          setEditingDescription('');
                          setEditingData({ questions: [] });
                          setEditingFile(null);
                        }} title="Болдырмау">
                          <XMarkIcon />
                        </button>
                        <button className="icon-btn green" onClick={() => saveMaterial(m.id, m.type)} title="Сақтау">
                          <CheckIcon />
                        </button>
                      </>
                    ) : (
                      <button className="icon-btn" onClick={() => {
                        setEditingId(m.id);
                        setEditingContent(m.content || '');
                        setEditingTitle(m.title || '');
                        setEditingDescription(m.description || '');
                        setEditingData(m.data && m.data.questions ? m.data : { questions: [] });
                        setEditingFile(null);
                      }}>
                        <PencilIcon />
                      </button>
                    )}
                    <button className="icon-btn red" onClick={() => deleteMaterial(m.id)}>
                      <TrashIcon />
                    </button>
                  </div>
                </div>

                <div className="material-card-body">
                  {isEditing && (
                    <div className="common-edit-fields">
                      <input
                        className="material-title-input"
                        placeholder="Атауы (міндетті емес)"
                        value={editingTitle}
                        onChange={e => setEditingTitle(e.target.value)}
                      />
                      <textarea
                        className="material-desc-input"
                        placeholder="Сипаттамасы / Нұсқаулық..."
                        value={editingDescription}
                        onChange={e => setEditingDescription(e.target.value)}
                        rows={2}
                      />
                    </div>
                  )}

                  {isEditing ? (
                    m.type === 'TEXT' ? (
                      <textarea
                        className="material-textarea"
                        value={editingContent}
                        onChange={e => setEditingContent(e.target.value)}
                        autoFocus
                        rows={5}
                      />
                    ) : (m.type === 'GAME' || m.type === 'TEST') ? (
                      <div className="game-editor-container">
                        {/* ТЕСТ болса ойын таңдаудың қажеті жоқ, тікелей сұрақтарға көшеміз */}
                        {(!editingContent && m.type === 'GAME') ? (
                          <div className="game-picker">
                            <span className="game-picker-label">Математикалық ойынды таңдаңыз:</span>
                            <div className="game-picker-grid">
                              {[
                                { id: 'fast-calc', name: 'Жылдам есеп', desc: 'Уақытқа есептеу' },
                                { id: 'true-false', name: 'Шын/Жалған', desc: 'Логикалық таңдау' },
                                { id: 'sequence', name: 'Тізбек', desc: 'Сандар ретін тап' },
                                { id: 'text-task', name: 'Мәтіндік есеп', desc: 'Текстовые задачи' },
                                { id: 'fill-blank', name: 'Бос орын', desc: 'Жауапты өзің жаз' }
                              ].map(g => (
                                <button
                                  key={g.id}
                                  className={`game-option ${editingContent === g.id ? 'selected' : ''}`}
                                  onClick={() => setEditingContent(g.id)}
                                >
                                  <PuzzlePieceIcon style={{ width: 24, marginBottom: 8, color: editingContent === g.id ? 'white' : 'var(--primary)' }} />
                                  <div className="game-option-info">
                                    <strong>{g.name}</strong>
                                    <span>{g.desc}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          /* ТЕСТ немесе ойын түрі таңдалған соң */
                          <div className="questions-editor">
                            <div className="questions-editor-header">
                              <h3>{m.type === 'TEST' ? 'Тест сұрақтары' : `${editingContent.toUpperCase()}: Сұрақтар`}</h3>
                              {m.type === 'GAME' && (
                                <div className="gen-box">
                                  <input type="number" defaultValue={5} id={`count-${m.id}`} style={{ width: 50, padding: '4px 8px', borderRadius: 8, border: '1px solid #ddd' }} />
                                  <button className="gen-btn" onClick={() => {
                                    const count = parseInt(document.getElementById(`count-${m.id}`).value) || 5;
                                    const newQuestions = generateRandomQuestions(editingContent, count);
                                    setEditingData({ 
                                      ...editingData, 
                                      questions: [...(editingData.questions || []), ...newQuestions] 
                                    });
                                  }}>+ Сұрақ генерациялау</button>
                                </div>
                              )}
                            </div>

                            <div className="questions-list-edit">
                              {(editingData.questions || []).map((q, qIdx) => renderQuestionInputs(q, qIdx))}
                              <button className="add-q-row-btn" onClick={() => {
                                setEditingData({ ...editingData, questions: [...(editingData.questions || []), { q: '', a: '', w1: '', w2: '', w3: '', explanation: '' }] });
                              }}>+ Сұрақ қосу</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="non-text-editor">
                        <input
                          className="material-input"
                          value={editingContent}
                          onChange={e => setEditingContent(e.target.value)}
                          placeholder={m.type === 'VIDEO' ? 'YouTube сілтемесін (URL) қойыңыз...' : 'Сілтеме немесе Загрузка (төменде)...'}
                        />
                        {m.type === 'FILE' && (
                          <div className="file-upload-box">
                            <label className="upload-btn">
                              <ArrowUpTrayIcon style={{ width: 18 }} />
                              {editingFile ? editingFile.name : 'Файлды жүктеу (загрузка)'}
                              <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
                            </label>
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="material-preview-content">
                      {m.title && <h3 className="preview-title">{m.title}</h3>}
                      {m.description && <p className="preview-desc">{m.description}</p>}

                      {m.type === 'TEXT' ? (
                        <p className="material-text-preview">{m.content}</p>
                      ) : m.type === 'VIDEO' ? (
                        getYouTubeId(m.content) ? (
                          <div className="video-wrapper">
                            <iframe src={`https://www.youtube.com/embed/${getYouTubeId(m.content)}`} allowFullScreen />
                          </div>
                        ) : <p className="material-url-preview">{m.content || 'Видео сілтемесі жоқ'}</p>
                      ) : m.type === 'GAME' ? (
                        <div className="game-preview">
                          <PuzzlePieceIcon className="game-preview-icon" />
                          <span>Ойын: <strong>{m.content}</strong></span>
                        </div>
                      ) : (
                        <a href={m.file_upload} target="_blank" rel="noreferrer" className="material-url-preview">
                          📎 {m.content || 'Файл'}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="add-material-area">
            {showTypePicker ? (
              <div className="type-picker">
                <p className="type-picker-label">Мазмұн қосу</p>
                <div className="type-picker-grid">
                  {MATERIAL_TYPES.map(t => {
                    const Icon = t.icon;
                    return (
                      <button key={t.type} className="type-option" style={{ '--accent': t.color }} onClick={() => addMaterial(t.type)}>
                        <Icon className="type-option-icon" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
                <button className="cancel-btn" onClick={() => setShowTypePicker(false)}>Болдырмау</button>
              </div>
            ) : (
              <button className="add-material-btn" onClick={() => setShowTypePicker(true)}>
                <PlusIcon style={{ width: 20 }} />
                Жаңа блок қосу
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonEditor;
