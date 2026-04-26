import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import api from '../../api';
import './Login.css';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        
        if (userRole === 'TEACHER') navigate('/teacher');
        else navigate('/student');
      } else {
        // SIGNUP (For later phase, just message for now)
        alert('Тіркелу функциясы келесі фазада қосылады');
      }
    } catch (err) {
      setError('Логин немесе пароль қате!');
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
                <input type="text" placeholder="Аты-жөні" />
              </div>
            </div>
            <div className="input-group">
              <div className="input-wrapper">
                <EnvelopeIcon className="input-icon" />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="input-group">
              <div className="input-wrapper">
                <LockClosedIcon className="input-icon" />
                <input type="password" placeholder="Құпия сөз" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            <button className="submit-btn" type="submit">Тіркелу</button>
            <p className="mobile-toggle">Аккаунт бар ма? <span onClick={() => setIsLogin(true)}>Кіру</span></p>
          </form>
        </div>

        {/* ФОРМА ВХОДА */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleAuth}>
            <h1>Қайта оралдың</h1>
            <p className="subtitle">Оқуды жалғастыру үшін кіріңіз</p>
            {error && <p className="error-msg" style={{color: 'var(--error)', fontWeight: 800, marginBottom: '10px'}}>{error}</p>}
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
            <a href="#" className="forgot-password">Құпия сөзді ұмыттыңыз ба?</a>
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
