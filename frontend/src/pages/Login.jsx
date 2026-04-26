import React, { useState } from 'react';
import { UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import './Login.css';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-body">
      <div className={`auth-container ${isLogin ? '' : 'right-panel-active'}`} id="container">

        {/* SIGN UP FORM (Left side when active) */}
        <div className="form-container sign-up-container">
          <form onSubmit={(e) => e.preventDefault()}>
            <h1>Тіркелу</h1>
            <p className="subtitle">Математика әлеміне саяхат</p>
            <div className="input-group">
              <div className="input-wrapper">
                <UserIcon className="input-icon" />
                <input type="text" placeholder="Аты-жөні" />
              </div>
            </div>
            <div className="input-group">
              <div className="input-wrapper">
                <EnvelopeIcon className="input-icon" />
                <input type="email" placeholder="Email" />
              </div>
            </div>
            <div className="input-group">
              <div className="input-wrapper">
                <LockClosedIcon className="input-icon" />
                <input type="password" placeholder="Құпия сөз" />
              </div>
            </div>
            <button className="submit-btn">Тіркелу</button>
            <p className="mobile-toggle">Аккаунт бар ма? <span onClick={() => setIsLogin(true)}>Кіру</span></p>
          </form>
        </div>

        {/* SIGN IN FORM (Right side when active) */}
        <div className="form-container sign-in-container">
          <form onSubmit={(e) => e.preventDefault()}>
            <h1>Қайта оралдың</h1>
            <p className="subtitle">Оқуды жалғастыру үшін кіріңіз</p>
            <div className="input-group">
              <div className="input-wrapper">
                <EnvelopeIcon className="input-icon" />
                <input type="email" placeholder="Email" />
              </div>
            </div>
            <div className="input-group">
              <div className="input-wrapper">
                <LockClosedIcon className="input-icon" />
                <input type="password" placeholder="Құпия сөз" />
              </div>
            </div>
            <a href="#" className="forgot-password">Құпия сөзді ұмыттыңыз ба?</a>
            <button className="submit-btn">Кіру</button>
            <p className="mobile-toggle">Аккаунт жоқ па? <span onClick={() => setIsLogin(false)}>Тіркелу</span></p>
          </form>
        </div>

        {/* OVERLAY CONTAINER */}
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
