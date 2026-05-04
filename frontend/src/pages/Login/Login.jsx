import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import api from '../../api';
import './Login.css';

/**
 * Страница входа и регистрации.
 * Переключается между формой входа (isLogin=true) и регистрации (isLogin=false).
 * После успешного входа перенаправляет по роли: /admin, /teacher или /student.
 */
const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('STUDENT');

  /**
   * Обрабатывает отправку формы входа или регистрации.
   * При входе: сохраняет токены в localStorage, получает роль и перенаправляет.
   * При регистрации: создаёт пользователя и автоматически выполняет вход.
   * @param {React.FormEvent} e - событие отправки формы
   */
  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        // LOGIN
        const response = await api.post('token/', { username, password });
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        // Рөлді анықтау үшін пайдаланушы мәліметін алу
        const userResponse = await api.get('users/me/');
        const userRole = userResponse.data.role;

        if (userRole === 'ADMIN') navigate('/admin');
        else if (userRole === 'TEACHER') navigate('/teacher');
        else navigate('/student');
      } else {
        // SIGNUP
        await api.post('users/', {
          username: regUsername,
          email: regEmail,
          password: regPassword,
          role: regRole
        });

        // Автоматты түрде кіру
        const response = await api.post('token/', { username: regUsername, password: regPassword });
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        if (regRole === 'ADMIN') navigate('/admin');
        else if (regRole === 'TEACHER') navigate('/teacher');
        else navigate('/student');
      }
    } catch (err) {
      if (isLogin) {
        setError('Логин немесе пароль қате!');
      } else {
        setError(err.response?.data?.username?.[0] || 'Тіркелу кезінде қате кетті. Бұл логин бос емес шығар.');
      }
    }
  };

  return (
    <div className="auth-body">
      <div className={`auth-container ${isLogin ? '' : 'right-panel-active'}`} id="container">

        {/* ФОРМА РЕГИСТРАЦИИ */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleAuth}>
            <h1>Тіркелу</h1>
            <p className="subtitle">Математика әлеміне саяхат</p>
            {error && <p className="error-msg">{error}</p>}
            <div className="input-group">
              <div className="input-wrapper">
                <UserIcon className="input-icon" />
                <input type="text" placeholder="Аты-жөні (Логин)" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} required />
              </div>
            </div>
            <div className="input-group">
              <div className="input-wrapper">
                <EnvelopeIcon className="input-icon" />
                <input type="email" placeholder="Email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
              </div>
            </div>
            <div className="input-group">
              <div className="input-wrapper">
                <LockClosedIcon className="input-icon" />
                <input type="password" placeholder="Құпия сөз" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
              </div>
            </div>
            <div className="role-selector" style={{ display: 'flex', gap: '15px', marginTop: '10px', marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input type="radio" name="role" value="STUDENT" checked={regRole === 'STUDENT'} onChange={() => setRegRole('STUDENT')} />
                Оқушы
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input type="radio" name="role" value="TEACHER" checked={regRole === 'TEACHER'} onChange={() => setRegRole('TEACHER')} />
                Мұғалім
              </label>
            </div>
            <button className="submit-btn" type="submit">Тіркелу</button>
            <p className="mobile-toggle">Аккаунт бар ма? <span onClick={() => setIsLogin(true)}>Кіру</span></p>
          </form>
        </div>

        {/* ФОРМА ВХОДА */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleAuth}>
            <h1>Қош келдіңіз!</h1>
            <p className="subtitle">Оқуды жалғастыру үшін кіріңіз</p>
            {error && <p className="error-msg" style={{ color: 'var(--error)', fontWeight: 800, marginBottom: '10px' }}>{error}</p>}
            <div className="input-group">
              <div className="input-wrapper">
                <UserIcon className="input-icon" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <div className="input-wrapper">
                <LockClosedIcon className="input-icon" />
                <input
                  type="password"
                  placeholder="Құпия сөз"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button className="submit-btn" type="submit">Кіру</button>
            <p className="mobile-toggle">Аккаунт жоқ па? <span onClick={() => setIsLogin(false)}>Тіркелу</span></p>
          </form>
        </div>

        {/* КОНТЕЙНЕР ПЕРЕКРЫТИЯ (OVERLAY) */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <div className="formula-icon">∫₀^π sin(x)</div>
              <h2>Қош келдіңіз!</h2>
              <p>Математика әлеміне саяхатты бізбен бірге бастаңыз</p>
              <button className="ghost-btn" onClick={() => setIsLogin(true)}>Кіру</button>
            </div>
            <div className="overlay-panel overlay-right">
              <div className="formula-icon">a² + b² = c²</div>
              <h2>MathQuest</h2>
              <p>Математиканы жаңаша үйреніп, біліміңізді шыңдаңыз</p>
              <button className="ghost-btn" onClick={() => setIsLogin(false)}>Тіркелу</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
