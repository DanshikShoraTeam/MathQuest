import React, { useState, useEffect } from 'react';
import { FireIcon } from '@heroicons/react/24/solid';
import api from '../../api';
import StudentLayout from '../../components/StudentLayout/StudentLayout';
import './StudentLeague.css';

const StudentLeague = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeagueData();
  }, []);

  const fetchLeagueData = async () => {
    try {
      const [usersRes, meRes] = await Promise.all([
        api.get('users/'),
        api.get('users/me/')
      ]);

      const sorted = usersRes.data
        .filter(u => u.role === 'STUDENT')
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 15);
      
      setTopUsers(sorted);
      setCurrentUser(meRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner">Жүктелуде...</div>;

  return (
    <StudentLayout>
      <div className="league-page">
        <header className="app-header-compact">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>Лига</h2>
          <FireIcon style={{ width: 22, color: '#ff4b4b' }} />
        </header>

        <div className="app-scroll-content">
          <div className="league-hero">
            <div className="fire-glow">
              <FireIcon style={{ width: 60, color: '#ff4b4b' }} />
            </div>
            <h3>Көшбасшылар лигасы</h3>
            <p>Жоғары XP жинап, үздіктер қатарына қосыл!</p>
          </div>

          <div className="full-leaderboard-list">
            {topUsers.map((u, idx) => (
              <div key={u.id} className={`leader-row-app ${u.id === currentUser?.id ? 'is-me' : ''}`}>
                <div className="leader-rank">{idx + 1}</div>
                <div className="leader-pfp">{u.username?.[0] || 'U'}</div>
                <div className="leader-name">{u.username}</div>
                <div className="leader-xp-val">{u.xp} XP</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentLeague;
