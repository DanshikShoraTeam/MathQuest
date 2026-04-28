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

function App() {
  return (
    <Router>
      <Routes>
        {/* Перенаправление с главной страницы на страницу входа */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Маршрут страницы входа */}
        <Route path="/login" element={<LoginPage />} />

        {/* Маршрут панели мұғалімі */}
        <Route path="/teacher" element={<TeacherDashboard />} />

        {/* Маршрут редактора курса — бөлімдер мен сабақтарды басқару */}
        <Route path="/teacher/course/:courseId" element={<CourseEditor />} />

        {/* Маршрут редактора сабақ — материалдарды басқару */}
        <Route path="/teacher/lesson/:lessonId" element={<LessonEditor />} />

        {/* Маршрут оқушының панелі */}
        <Route path="/student" element={<StudentDashboard />} />

        {/* Маршрут оқушының курстары */}
        <Route path="/student/courses" element={<StudentCourses />} />
        
        {/* Маршрут оқушының лигалары мен профилі */}
        <Route path="/student/league" element={<StudentLeague />} />
        <Route path="/student/profile" element={<StudentProfile />} />

        {/* Маршрут траекториясы (Duolingo style) */}
        <Route path="/student/course/:courseId" element={<CoursePath />} />

        {/* Маршрут оқушының сабақты көруі (Материалдар) */}
        <Route path="/student/lesson/:lessonId" element={<StudentLessonView />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Маршрут ойыны: Жылдам есеп */}
        <Route path="/game/fast-calc" element={<GameFastCalc />} />
        <Route path="/game/true-false" element={<GameTrueFalse />} />
        <Route path="/game/bomb" element={<GameBomb />} />
        <Route path="/game/sequence" element={<GameSequence />} />
        <Route path="/game/roulette" element={<GameRoulette />} />

        {/* Резервный маршрут для обработки несуществующих путей */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
