import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { 
  AcademicCapIcon, 
  ChevronRightIcon
} from '@heroicons/react/24/solid';
import StudentLayout from '../../components/StudentLayout/StudentLayout';
import './StudentCourses.css';

const StudentCourses = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const coursesRes = await api.get('courses/');
      const formattedCourses = coursesRes.data.map(course => {
        let totalLessons = 0;
        let lessonsDone = 0;
        if (course.sections) {
          course.sections.forEach(sec => {
            if (sec.lessons) {
              totalLessons += sec.lessons.length;
              lessonsDone += sec.lessons.filter(l => l.is_completed).length;
            }
          });
        }
        return { ...course, lessonsDone, totalLessons };
      });
      setMyCourses(formattedCourses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner">Жүктелуде...</div>;

  return (
    <StudentLayout>
      <div className="student-page-content">
        <header className="app-header-compact">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>Курстарым</h2>
          <AcademicCapIcon style={{ width: 22, color: '#1cb0f6' }} />
        </header>

        <div className="app-scroll-content">
          <div className="course-list-vertical">
            {myCourses.length === 0 ? (
              <p style={{textAlign: 'center', color: '#afafaf', padding: '40px 0'}}>Сіз әлі ешқандай курсқа жазылмағансыз.</p>
            ) : (
              myCourses.map(course => {
                const progress = (course.lessonsDone / (course.totalLessons || 1)) * 100;
                return (
                  <div key={course.id} className="course-app-card" onClick={() => navigate(`/student/course/${course.id}`)}>
                    <div className="course-app-icon">
                      <AcademicCapIcon style={{ width: 24 }} />
                    </div>
                    <div className="course-app-info">
                      <h4>{course.title}</h4>
                      <p>{course.lessonsDone}/{course.totalLessons} сабақ</p>
                      <div className="mini-progress-bar">
                        <div className="mini-progress-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    <ChevronRightIcon style={{ width: 18, color: '#cbd5e1' }} />
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

export default StudentCourses;
