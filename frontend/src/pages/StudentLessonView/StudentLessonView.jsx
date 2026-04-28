import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  XMarkIcon,
  PlayCircleIcon,
  DocumentArrowDownIcon,
  PuzzlePieceIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  BoltIcon,
  DocumentIcon,
  LinkIcon,
  CheckBadgeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/solid';
import api from '../../api';
import confetti from 'canvas-confetti';
import './StudentLessonView.css';

const StudentLessonView = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [lesson, setLesson] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(location.state?.activeStep || 0);
  const [isFinished, setIsFinished] = useState(false);

  const [testMode, setTestMode] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [selectedAns, setSelectedAns] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [testScore, setTestScore] = useState(0);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const res = await api.get(`lessons/${lessonId}/`);
      setLesson(res.data);
      setMaterials(res.data.materials.sort((a, b) => a.order - b.order) || []);
    } catch {
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleGameClick = (gameType) => {
    navigate(`/game/${gameType}`, {
      state: {
        fromLessonId: lessonId,
        activeStep: activeStep,
        questions: material.data?.questions || []
      }
    });
  };

  const handleComplete = async () => {
    const mandatoryTest = materials.find(m => m.type === 'TEST');
    if (mandatoryTest && !testResults) {
      setCurrentTest(mandatoryTest);
      setTestMode(true);
      return;
    }
    try {
      setIsFinished(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1cb0f6', '#58cc02', '#ff9600']
      });
      await api.post(`lessons/${lessonId}/complete/`);
      setTimeout(() => {
        const courseId = lesson?.section?.course || lesson?.course_id;
        navigate(courseId ? `/student/course/${courseId}` : '/student/courses');
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestAnswer = (ans) => {
    if (isAnswered) return;
    setSelectedAns(ans);
    setIsAnswered(true);
    if (ans === currentTest.data.questions[qIdx].a) {
      setTestScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (qIdx + 1 < currentTest.data.questions.length) {
      setQIdx(prev => prev + 1);
      setSelectedAns(null);
      setIsAnswered(false);
    } else {
      setTestResults({ 
        score: testScore + (selectedAns === currentTest.data.questions[qIdx].a ? 1 : 0), 
        total: currentTest.data.questions.length 
      });
      setTestMode(false);
    }
  };

  const renderTest = () => {
    if (!currentTest || !currentTest.data || !currentTest.data.questions) return null;
    const q = currentTest.data.questions[qIdx];
    const options = [q.a, q.w1, q.w2, q.w3].filter(o => o && o !== '-').sort();

    return (
      <div className="test-overlay">
        <div className="test-container">
          <div className="test-progress-bar">
            <div className="progress-fill" style={{ width: `${((qIdx + 1) / currentTest.data.questions.length) * 100}%` }}></div>
          </div>
          <div className="test-card">
            <span className="q-count">Сұрақ {qIdx + 1} / {currentTest.data.questions.length}</span>
            <h2 className="test-question-text">{q.q}</h2>
            <div className="test-options-grid">
              {options.map((opt, i) => {
                let className = "test-opt-btn";
                if (isAnswered) {
                  if (opt === q.a) className += " correct";
                  else if (opt === selectedAns) className += " wrong";
                  else className += " disabled";
                }
                return (
                  <button key={i} className={className} onClick={() => handleTestAnswer(opt)} disabled={isAnswered}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {isAnswered && (
              <div className={`explanation-box ${selectedAns === q.a ? 'success' : 'error'}`}>
                <div className="exp-header">
                  <strong>{selectedAns === q.a ? 'Керемет! Дұрыс.' : 'Қате болды...'}</strong>
                </div>
                {selectedAns !== q.a && (
                  <p className="correct-ans-reveal">Дұрыс жауап: <span>{q.a}</span></p>
                )}
                <p className="exp-text">{q.explanation || 'Бұл сұрақтың түсіндірмесі әлі қосылмаған.'}</p>
                <button className="next-q-btn" onClick={nextQuestion}>
                  {qIdx + 1 < currentTest.data.questions.length ? 'Келесі сұрақ' : 'Тестті аяқтау'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading-spinner">Жүктелуде...</div>;

  const material = materials[activeStep];
  const progress = isFinished ? 100 : (materials.length > 0 ? ((activeStep + 1) / materials.length) * 100 : 0);

  return (
    <div className="student-app-container lesson-view-mode">
      <div className="app-body lesson-session-body">

        <header className="lesson-nav-header">
          <button className="close-session-btn" onClick={() => navigate(-1)}>
            <XMarkIcon style={{ width: 24 }} />
          </button>
          <div className="session-progress-bar">
            <div className="session-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="xp-indicator">
            <BoltIcon style={{ width: 18, color: '#ff9600' }} />
          </div>
        </header>

        <div className="lesson-scroll-content">
          {materials.length === 0 ? (
            <div className="empty-state">Материалдар табылмады</div>
          ) : (
            <div className="active-material">
              {material.type === 'GAME' ? (
                <div className="game-content-view">
                  <div className="game-card-mobile-premium">
                    <div className="game-card-accent"></div>
                    <div className="game-card-icon-wrapper">
                      <PuzzlePieceIcon className="game-icon-svg" />
                    </div>
                    <div className="game-card-details">
                      <h2>{material.title || 'Математикалық ойын'}</h2>
                      <p>{material.description || 'Біліміңді сынап көруге дайынсың ба?'}</p>
                    </div>
                    <button className="start-game-premium-btn" onClick={() => handleGameClick(material.content)}>
                      Ойынды бастау
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {(material.title || material.description) && (
                    <div className="material-info-header">
                      {material.title && <h2 className="material-view-title">{material.title}</h2>}
                      {material.description && <p className="material-view-desc">{material.description}</p>}
                    </div>
                  )}

                  {material.type === 'TEXT' && (
                    <div className="text-content-view">
                      {material.content}
                    </div>
                  )}

                  {material.type === 'VIDEO' && (
                    <div className="video-content-view">
                      {getYouTubeId(material.content) ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${getYouTubeId(material.content)}`}
                          allowFullScreen
                        />
                      ) : (
                        <p>Видео сілтемесі қате</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {material.type === 'TEST' && (
                <div className="game-content-view">
                  <div className="game-card-mobile-premium test-card-preview">
                    <div className="game-card-accent test-accent"></div>
                    <div className="game-card-icon-wrapper test-icon-bg">
                      <CheckBadgeIcon className="game-icon-svg" />
                    </div>
                    <div className="game-card-details">
                      <h2>{material.title || 'Білімді тексеру'}</h2>
                      <p>Сабақты аяқтау үшін осы тестті тапсыруыңыз қажет.</p>
                    </div>
                    <button className="start-game-premium-btn test-start-btn" onClick={handleComplete}>
                      Тестті бастау
                    </button>
                  </div>
                </div>
              )}

              {material.type === 'FILE' && (
                <div className="file-viewer-mobile">
                  <a
                    href={material.file_upload || material.content}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="file-card-mobile"
                  >
                    <div className="file-icon-wrapper">
                      <DocumentIcon className="file-icon-large" />
                    </div>
                    <div className="file-info-mobile">
                      <span className="file-name-mobile">{material.title || 'Оқу материалы (Файл)'}</span>
                      <span className="file-size-mobile">Жүктеу үшін басыңыз</span>
                    </div>
                    <div className="download-icon-btn">
                      <ArrowDownTrayIcon style={{ width: 24 }} />
                    </div>
                  </a>
                </div>
              )}

              {material.type === 'TEXT' && (material.content.startsWith('http')) && (
                <div className="file-viewer-mobile">
                  <a
                    href={material.content}
                    target="_blank"
                    rel="noreferrer"
                    className="file-card-mobile link-card"
                  >
                    <div className="file-icon-wrapper link-icon">
                      <LinkIcon className="file-icon-large" />
                    </div>
                    <div className="file-info-mobile">
                      <span className="file-name-mobile">{material.title || 'Сыртқы сілтеме'}</span>
                      <span className="file-size-mobile">{material.content.substring(0, 40)}...</span>
                    </div>
                    <div className="download-icon-btn">
                      <ArrowTopRightOnSquareIcon style={{ width: 20 }} />
                    </div>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="lesson-footer-mobile">
          <button
            className={`lesson-prev-btn ${activeStep === 0 ? 'hidden' : ''}`}
            onClick={() => setActiveStep(s => s - 1)}
          >
            <ChevronLeftIcon style={{ width: 24 }} />
          </button>

          {activeStep < materials.length - 1 ? (
            <button className="lesson-next-btn" onClick={() => setActiveStep(s => s + 1)}>
              Жалғастыру
            </button>
          ) : (
            <button className="lesson-finish-btn" onClick={handleComplete}>
              <CheckCircleIcon style={{ width: 22, marginRight: 8 }} />
              Аяқтау
            </button>
          )}
        </footer>

        {testMode && renderTest()}

        {testResults && (
          <div className="test-overlay results">
            <div className="test-card results-card">
              <div className="results-icon">🏆</div>
              <h2>Керемет!</h2>
              <p>Сіз тестті сәтті тапсырдыңыз.</p>
              <div className="score-badge">{testResults.score} / {testResults.total} ұпай</div>
              <button className="finish-all-btn" onClick={() => navigate(-1)}>Курсқа қайту</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLessonView;
