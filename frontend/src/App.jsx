import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login/Login';
import TeacherDashboard from './pages/TeacherDashboard/TeacherDashboard';
import CourseEditor from './pages/CourseEditor/CourseEditor';
import LessonEditor from './pages/LessonEditor/LessonEditor';
import StudentCourses from './pages/StudentCourses/StudentCourses';
import CoursePath from './pages/CoursePath/CoursePath';
import GameFastCalc from './pages/GameFastCalc/GameFastCalc';

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

        {/* Маршрут оқушының курстары */}
        <Route path="/student" element={<StudentCourses />} />

        {/* Маршрут траекториясы (Duolingo style) */}
        <Route path="/course-path" element={<CoursePath />} />

        {/* Маршрут ойыны: Жылдам есеп */}
        <Route path="/game/fast-calc" element={<GameFastCalc />} />

        {/* Резервный маршрут для обработки несуществующих путей */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
