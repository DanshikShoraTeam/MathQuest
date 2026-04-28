import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeftIcon, 
  StarIcon, 
  LockClosedIcon,
  CheckIcon
} from '@heroicons/react/24/solid';
import api from '../../api';
import StudentLayout from '../../components/StudentLayout/StudentLayout';
import './CoursePath.css';

const CoursePath = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await api.get(`courses/${courseId}/`);
      setCourse(response.data);
      
      let allLessons = [];
      if (response.data.sections) {
        response.data.sections.forEach(section => {
          if (section.lessons) {
            section.lessons.forEach(lesson => {
              allLessons.push({ ...lesson, sectionTitle: section.title });
            });
          }
        });
      }
      
      const mappedLessons = allLessons.map((lesson, index) => ({
        ...lesson,
        status: calculateStatus(lesson, index, allLessons)
      }));

      setLessons(mappedLessons);
    } catch (err) {
      console.error(err);
      navigate('/student/courses');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatus = (lesson, idx, allLessons) => {
    if (lesson.is_completed) return 'completed';
    if (idx === 0) return 'current';
    const prevLesson = allLessons[idx - 1];
    if (prevLesson && prevLesson.is_completed) return 'current';
    return 'locked';
  };

  const handleLessonClick = (lesson) => {
    if (lesson.status === 'locked') return;
    navigate(`/student/lesson/${lesson.id}`);
  };

  if (loading) return <div className="loading-spinner">Жүктелуде...</div>;

  return (
    <StudentLayout>
      <div className="course-path-app">
        <header className="app-header-compact">
          <button className="back-btn-mini" onClick={() => navigate('/student/courses')}>
            <ChevronLeftIcon style={{ width: 20 }} />
          </button>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 900, margin: 0, flex: 1, textAlign: 'center' }}>
            {course?.title}
          </h3>
          <div style={{ width: 32 }} />
        </header>

        <div className="path-scroll-body">
           <div className="zig-zag-container">
              {lessons.length === 0 ? (
                <p style={{textAlign:'center', color:'#afafaf'}}>Сабақтар жоқ</p>
              ) : (
                lessons.map((lesson, index) => {
                  const offset = index % 2 === 0 ? '0' : (index % 4 === 1 ? '40px' : '-40px');
                  return (
                    <div key={lesson.id} className="node-wrapper-mini" style={{ transform: `translateX(${offset})` }}>
                      <div 
                        className={`node-circle-app ${lesson.status}`}
                        onClick={() => handleLessonClick(lesson)}
                      >
                        {lesson.status === 'completed' && <CheckIcon className="node-icon-mini" />}
                        {lesson.status === 'current' && <StarIcon className="node-icon-mini star-pulse" />}
                        {lesson.status === 'locked' && <LockClosedIcon className="node-icon-mini" />}
                        
                        <div className="node-tooltip-mini">
                          {lesson.title}
                        </div>
                      </div>
                      {index < lessons.length - 1 && <div className="node-line-mini"></div>}
                    </div>
                  );
                })
              )}
           </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default CoursePath;
