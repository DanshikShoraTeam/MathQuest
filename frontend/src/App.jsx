import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login/Login';
import TeacherDashboard from './pages/TeacherDashboard/TeacherDashboard';
import CourseEditor from './pages/CourseEditor/CourseEditor';
import LessonEditor from './pages/LessonEditor/LessonEditor';
import StudentDashboard from './pages/StudentDashboard/StudentDashboard';
import StudentCourses from './pages/StudentCourses/StudentCourses';
import StudentLeague from './pages/StudentLeague/StudentLeague';
import StudentProfile from './pages/StudentProfile/StudentProfile';
import CoursePath from './pages/CoursePath/CoursePath';
import StudentLessonView from './pages/StudentLessonView/StudentLessonView';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import GameFastCalc from './pages/GameFastCalc/GameFastCalc';
import GameTrueFalse from './pages/GameTrueFalse/GameTrueFalse';
import GameBomb from './pages/GameBomb/GameBomb';
import GameSequence from './pages/GameSequence/GameSequence';
import GameRoulette from './pages/GameRoulette/GameRoulette';

// Токен болмаса логинге жіберу
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Teacher routes */}
        <Route path="/teacher" element={<PrivateRoute><TeacherDashboard /></PrivateRoute>} />
        <Route path="/teacher/course/:courseId" element={<PrivateRoute><CourseEditor /></PrivateRoute>} />
        <Route path="/teacher/lesson/:lessonId" element={<PrivateRoute><LessonEditor /></PrivateRoute>} />

        {/* Student routes */}
        <Route path="/student" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
        <Route path="/student/courses" element={<PrivateRoute><StudentCourses /></PrivateRoute>} />
        <Route path="/student/league" element={<PrivateRoute><StudentLeague /></PrivateRoute>} />
        <Route path="/student/profile" element={<PrivateRoute><StudentProfile /></PrivateRoute>} />
        <Route path="/student/course/:courseId" element={<PrivateRoute><CoursePath /></PrivateRoute>} />
        <Route path="/student/lesson/:lessonId" element={<PrivateRoute><StudentLessonView /></PrivateRoute>} />

        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />

        {/* Game routes */}
        <Route path="/game/fast-calc" element={<PrivateRoute><GameFastCalc /></PrivateRoute>} />
        <Route path="/game/true-false" element={<PrivateRoute><GameTrueFalse /></PrivateRoute>} />
        <Route path="/game/bomb" element={<PrivateRoute><GameBomb /></PrivateRoute>} />
        <Route path="/game/sequence" element={<PrivateRoute><GameSequence /></PrivateRoute>} />
        <Route path="/game/roulette" element={<PrivateRoute><GameRoulette /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
