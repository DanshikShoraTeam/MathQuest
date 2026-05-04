import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  TrashIcon, 
  KeyIcon, 
  MagnifyingGlassIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import api from '../../api';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';

/**
 * Панель администратора.
 * Отображает список всех пользователей, позволяет удалять и сбрасывать пароли.
 * Доступна только пользователям с ролью ADMIN.
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showPassModal, setShowPassModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  /** Очищает токены и перенаправляет на страницу входа. */
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  /** Проверяет роль текущего пользователя. Если не ADMIN — редиректит на логин. */
  const checkAdmin = async () => {
    try {
      const res = await api.get('users/me/');
      if (res.data.role !== 'ADMIN') {
        alert('Бұл бетке тек Админ кіре алады!');
        navigate('/login');
      } else {
        fetchUsers();
      }
    } catch (err) {
      navigate('/login');
    }
  };

  /** Загружает список всех пользователей системы с API. */
  const fetchUsers = async () => {
    try {
      const res = await api.get('users/');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Удаляет пользователя после подтверждения.
   * @param {number} id - ID пользователя
   */
  const deleteUser = async (id) => {
    if (!confirm('Шынымен бұл пайдаланушыны жойғыңыз келе ме? Барлық курстары мен деректері жойылады!')) return;
    try {
      await api.delete(`users/${id}/`);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert('Жою мүмкін болмады');
    }
  };

  /** Отправляет запрос на сброс пароля выбранного пользователя. */
  const handleResetPass = async () => {
    if (!newPassword) return alert('Парольді жазыңыз');
    try {
      await api.post(`users/${selectedUser.id}/reset_password/`, { password: newPassword });
      alert('Пароль сәтті өзгертілді');
      setShowPassModal(false);
      setNewPassword('');
    } catch (err) {
      alert('Қате кетті');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Жүктелуде...</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-left">
          <ShieldCheckIcon className="admin-logo-icon" />
          <h1>Админ Панель</h1>
          <button className="admin-logout-btn" onClick={handleLogout} title="Жүйеден шығу">
            <ArrowLeftOnRectangleIcon style={{ width: 20 }} />
            Шығу
          </button>
        </div>
        <div className="admin-search">
          <MagnifyingGlassIcon className="search-icon" />
          <input 
            type="text" 
            placeholder="Пайдаланушыны іздеу..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <main className="admin-content">
        <div className="stats-grid">
          <div className="stat-card">
            <UsersIcon />
            <div>
              <h3>{users.length}</h3>
              <p>Жалпы пайдаланушы</p>
            </div>
          </div>
          <div className="stat-card blue">
            <AcademicCapIcon />
            <div>
              <h3>{users.filter(u => u.role === 'TEACHER').length}</h3>
              <p>Мұғалімдер</p>
            </div>
          </div>
          <div className="stat-card green">
            <UserCircleIcon />
            <div>
              <h3>{users.filter(u => u.role === 'STUDENT').length}</h3>
              <p>Оқушылар</p>
            </div>
          </div>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Логин / Аты-жөні</th>
                <th>Email</th>
                <th>Рөлі</th>
                <th>XP</th>
                <th>Әрекеттер</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td>
                    <div className="user-info-cell">
                      <div className={`role-dot ${u.role}`}></div>
                      <strong>{u.username}</strong>
                    </div>
                  </td>
                  <td>{u.email || '-'}</td>
                  <td>
                    <span className={`role-badge ${u.role}`}>
                      {u.role === 'ADMIN' ? 'Админ' : u.role === 'TEACHER' ? 'Мұғалім' : 'Оқушы'}
                    </span>
                  </td>
                  <td>{u.xp}</td>
                  <td className="actions-cell">
                    <button className="action-btn pass" onClick={() => { setSelectedUser(u); setShowPassModal(true); }}>
                      <KeyIcon />
                    </button>
                    {u.role !== 'ADMIN' && (
                      <button className="action-btn del" onClick={() => deleteUser(u.id)}>
                        <TrashIcon />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {showPassModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Парольді өзгерту</h3>
            <p>Пайдаланушы: <strong>{selectedUser?.username}</strong></p>
            <input 
              type="text" 
              placeholder="Жаңа пароль" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="modal-btns">
              <button className="cancel-btn" onClick={() => setShowPassModal(false)}>Болдырмау</button>
              <button className="confirm-btn" onClick={handleResetPass}>Сақтау</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
