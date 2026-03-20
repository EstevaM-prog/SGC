import React, { useState, useEffect } from 'react';
import {
  PanelLeftOpen,
  PanelLeftClose,
  Sun,
  Moon,
  Search,
  Clock,
  CloudSun
} from 'lucide-react';
import Notification from './Notification';
import '../styles/components/Notification.css';

export default function Header({
  toggleSidebar,
  toggleTheme,
  isDark,
  isSidebarCollapsed,
  searchTerm,
  setSearchTerm,
  userName = "Usuário",
  userAvatar = null,
  onProfileClick,
  onNavigateTo,
  notifications = [],
  unreadCount = 0,
  onMarkRead
}) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-BR'));
      setDate(now.toLocaleDateString('pt-BR'));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const initials = (userName || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="topbar-glass">
      {/* ── Sidebar toggle ── */}
      <button
        onClick={toggleSidebar}
        className="tb-icon-btn"
        title={isSidebarCollapsed ? 'Abrir menu' : 'Fechar menu'}
        aria-label="Toggle sidebar"
      >
        {window.innerWidth <= 768 ? (
          <PanelLeftOpen size={20} />
        ) : (
          isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />
        )}
      </button>

      {/* ── Theme toggle ── */}
      <button
        onClick={toggleTheme}
        className="tb-icon-btn"
        title={isDark ? 'Modo claro' : 'Modo escuro'}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="tb-divider desktop-only" />

      {/* ── Search ── */}
      <div className="tb-search">
        <Search size={16} className="tb-search-icon" />
        <input
          type="search"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={window.innerWidth <= 640 ? "Buscar..." : "Pesquisar por número, status, CNPJ..."}
          className="tb-search-input"
        />
      </div>

      {/* ── Box notification ── */}
      <Notification 
        onNavigateTo={onNavigateTo} 
        notifications={notifications} 
        unreadCount={unreadCount} 
        onMarkRead={onMarkRead}
      />

      <div style={{ flex: 1 }} />

      {/* ── Clock ── */}
      <div className="tb-clock desktop-only">
        <div className="tb-clock-row">
          <CloudSun size={14} />
          <span className="tb-temp">24°C</span>
          <span className="tb-sep">·</span>
          <Clock size={14} />
          <span>{time}</span>
        </div>
        <span className="tb-date">{date}</span>
      </div>

      <div className="tb-divider desktop-only" />

      {/* ── User / Avatar ── */}
      <button className="tb-user" onClick={onProfileClick} title="Ver perfil">
        <div className="tb-user-info desktop-only">
          <span className="tb-user-name">Olá, <strong>{userName}</strong></span>
          <span className="tb-user-role">Administrador</span>
        </div>
        <div className="tb-avatar">
          {userAvatar
            ? <img src={userAvatar} alt={userName} />
            : <span>{initials}</span>
          }
        </div>
      </button>
    </header>
  );
}