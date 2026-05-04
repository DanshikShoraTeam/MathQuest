import React, { useState, useEffect } from 'react';
import { BoltIcon } from '@heroicons/react/24/solid';
import api from '../../api';
import StudentLayout from '../../components/StudentLayout/StudentLayout';
import './StudentLeague.css';

const TrophyMascot = () => (
  <svg width="80" height="95" viewBox="0 0 100 115" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="113" rx="28" ry="4" fill="rgba(0,0,0,0.15)"/>
    {/* Stand */}
    <rect x="35" y="92" width="30" height="8" rx="4" fill="#D97706"/>
    <rect x="28" y="100" width="44" height="10" rx="5" fill="#B45309"/>
    {/* Cup body */}
    <path d="M25 20 Q20 55 35 75 Q42 85 50 85 Q58 85 65 75 Q80 55 75 20 Z" fill="#FBBF24"/>
    {/* Cup shine */}
    <path d="M32 28 Q30 48 38 65" stroke="rgba(255,255,255,0.5)" strokeWidth="4" fill="none" strokeLinecap="round"/>
    {/* Handles */}
    <path d="M25 30 Q10 35 12 55 Q13 65 25 62" stroke="#F59E0B" strokeWidth="7" fill="none" strokeLinecap="round"/>
    <path d="M75 30 Q90 35 88 55 Q87 65 75 62" stroke="#F59E0B" strokeWidth="7" fill="none" strokeLinecap="round"/>
    {/* Face */}
    <circle cx="50" cy="48" r="18" fill="#FDE68A"/>
    {/* Eyes */}
    <circle cx="44" cy="45" r="5" fill="white"/>
    <circle cx="56" cy="45" r="5" fill="white"/>
    <circle cx="44" cy="46" r="3" fill="#78350F"/>
    <circle cx="56" cy="46" r="3" fill="#78350F"/>
    <circle cx="45" cy="44.5" r="1" fill="white"/>
    <circle cx="57" cy="44.5" r="1" fill="white"/>
    {/* Big smile */}
    <path d="M42 54 Q50 61 58 54" stroke="#78350F" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {/* Cheeks */}
    <circle cx="37" cy="52" r="5" fill="#FCA5A5" opacity="0.7"/>
    <circle cx="63" cy="52" r="5" fill="#FCA5A5" opacity="0.7"/>
    {/* Stars floating */}
    <text x="10" y="18" fontSize="14" fill="#FCD34D">★</text>
    <text x="76" y="14" fontSize="10" fill="#FCD34D">★</text>
    <text x="82" y="38" fontSize="8" fill="white" opacity="0.8">★</text>
  </svg>
);

const MEDALS = ['🥇', '🥈', '🥉'];

/**
 * Страница "Лига" — таблица лидеров по XP среди всех учеников.
 * Подсвечивает позицию текущего пользователя.
 */
const StudentLeague = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLeagueData(); }, []);

  /**
   * Загружает данные текущего пользователя и список всех учеников (для рейтинга).
   * Сортирует по убыванию XP.
   */
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

  const myRank = topUsers.findIndex(u => u.id === currentUser?.id) + 1;

  return (
    <StudentLayout>
      <div className="league-page">
        {/* Banner */}
        <div className="league-hero-banner">
          <div className="league-bubbles">
            <div className="lb lb1"/><div className="lb lb2"/><div className="lb lb3"/>
          </div>
          <div className="league-hero-left">
            <div className="league-hero-label">Үздіктер</div>
            <div className="league-hero-title">Лигасы</div>
            {myRank > 0 && (
              <div className="my-rank-badge">Орының: #{myRank}</div>
            )}
          </div>
          <div className="league-hero-mascot">
            <TrophyMascot />
          </div>
        </div>

        {/* My XP strip */}
        {currentUser && (
          <div className="my-xp-strip">
            <BoltIcon style={{ width: 16, color: '#ff9600' }} />
            <span>Менің XP: <strong>{currentUser.xp}</strong></span>
          </div>
        )}

        <div className="app-scroll-content">
          <div className="full-leaderboard-list">
            {topUsers.map((u, idx) => {
              const isMe = u.id === currentUser?.id;
              const isTop3 = idx < 3;
              return (
                <div key={u.id} className={`leader-row-app ${isMe ? 'is-me' : ''} ${isTop3 ? `top-${idx+1}` : ''}`}>
                  <div className="leader-rank">
                    {isTop3 ? (
                      <span className="medal">{MEDALS[idx]}</span>
                    ) : (
                      <span className="rank-num">{idx + 1}</span>
                    )}
                  </div>
                  <div className="leader-pfp" style={isMe ? { background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', color: 'white' } : {}}>
                    {u.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="leader-name">
                    {u.username}
                    {isMe && <span className="me-tag">Мен</span>}
                  </div>
                  <div className="leader-xp-val">
                    <BoltIcon style={{ width: 13, color: '#ff9600' }} />
                    {u.xp}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentLeague;
