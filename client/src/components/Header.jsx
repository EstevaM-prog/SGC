import React, { useState, useEffect, useRef } from 'react';
import {
  PanelLeftOpen,
  PanelLeftClose,
  Sun,
  Moon,
  Search,
  Clock,
  X
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
  userName = 'Usuário',
  userAvatar = null,
  onProfileClick,
  onNavigateTo,
  notifications = [],
  unreadCount = 0,
  onMarkRead
}) {
  const [time, setTime]         = useState('');
  const [date, setDate]         = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const inputRef = useRef(null);

  /* Live clock */
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-BR'));
      setDate(now.toLocaleDateString('pt-BR', {
        weekday: 'short', day: '2-digit', month: 'short'
      }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* Keyboard shortcut: "/" focuses search */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const initials = (userName || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isMobile = window.innerWidth <= 768;

  return (
    <header className="sgc-topbar">

      {/* ── Left controls ── */}
      <div className="sgc-tb-left">

        {/* Sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className="sgc-tb-icon-btn"
          title={isSidebarCollapsed ? 'Abrir menu' : 'Fechar menu'}
          aria-label="Toggle sidebar"
        >
          <span className="sgc-tb-btn-bg" />
          {isMobile
            ? <PanelLeftOpen size={19} />
            : isSidebarCollapsed
              ? <PanelLeftOpen size={19} />
              : <PanelLeftClose size={19} />
          }
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="sgc-tb-icon-btn"
          title={isDark ? 'Modo claro' : 'Modo escuro'}
          aria-label="Toggle theme"
        >
          <span className="sgc-tb-btn-bg" />
          {isDark
            ? <Sun size={18} />
            : <Moon size={18} />
          }
        </button>

        <div className="sgc-tb-sep desktop-only" />

        {/* Search */}
        <div className={`sgc-tb-search ${searchFocused ? 'focused' : ''}`}>
          <Search size={15} className="sgc-tb-search-icon" />
          <input
            ref={inputRef}
            type="search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder={isMobile ? 'Buscar...' : 'Pesquisar chamados, CNPJ, status…'}
            className="sgc-tb-search-input"
            aria-label="Pesquisar"
          />
          {searchTerm && (
            <button
              className="sgc-tb-search-clear"
              onClick={() => setSearchTerm('')}
              aria-label="Limpar busca"
            >
              <X size={13} />
            </button>
          )}
          <kbd className="sgc-tb-search-kbd desktop-only">/</kbd>
        </div>

      </div>

      {/* ── Right controls ── */}
      <div className="sgc-tb-right">

        {/* Clock */}
        <div className="sgc-tb-clock desktop-only">
          <div className="sgc-tb-clock-time">
            <Clock size={13} className="sgc-tb-clock-icon" />
            <span>{time}</span>
          </div>
          <span className="sgc-tb-clock-date">{date}</span>
        </div>

        <div className="sgc-tb-sep desktop-only" />

        {/* Notifications */}
        <Notification
          onNavigateTo={onNavigateTo}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkRead={onMarkRead}
        />

        <div className="sgc-tb-sep desktop-only" />

        {/* User / Avatar */}
        <button
          className="sgc-tb-user"
          onClick={onProfileClick}
          onMouseEnter={() => setAvatarHovered(true)}
          onMouseLeave={() => setAvatarHovered(false)}
          title="Ver perfil"
          aria-label="Perfil do usuário"
        >
          <div className="sgc-tb-user-info desktop-only">
            <span className="sgc-tb-user-name">
              Olá, <strong>{userName}</strong>
            </span>
            <span className="sgc-tb-user-role">Administrador</span>
          </div>

          <div className={`sgc-tb-avatar ${avatarHovered ? 'hovered' : ''}`}>
            {userAvatar
              ? <img src={userAvatar} alt={userName} />
              : <span>{initials}</span>
            }
            <span className="sgc-tb-avatar-ring" />
            <span className="sgc-tb-status-dot" />
          </div>
        </button>

      </div>
    </header>
  );
}