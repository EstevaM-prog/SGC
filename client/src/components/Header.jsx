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
import '../styles/components/Header.css';
import { formatImageUrl } from '../Axios/conect.js';

/* ── View name map ── */
const VIEW_NAMES = {
  dashboard:  'Dashboard',
  list:       'Chamados',
  form:       'Novo Chamado',
  cnpj:       'Tabela CNPJ',
  trash:      'Lixeira',
  shopping:   'Compras',
  freight:    'Fretes',
  procedures: 'Procedimentos',
  suporte:    'Suporte',
  teams:      'Equipes',
  ponto:      'Ponto',
  profile:    'Perfil',
  activities: 'Atividades',
  docs:       'Documentação',
};

export default function Header({
  toggleSidebar,
  toggleTheme,
  isDark,
  isSidebarCollapsed,
  searchTerm,
  setSearchTerm,
  userName     = 'Usuário',
  userAvatar   = null,
  onProfileClick,
  onNavigateTo,
  notifications = [],
  unreadCount   = 0,
  onMarkRead,
  currentView,
}) {
  const [time, setTime]               = useState('');
  const [date, setDate]               = useState('');
  const [searchFocused, setFocused]   = useState(false);
  const [avatarHovered, setAvatarH]   = useState(false);
  const inputRef = useRef(null);

  /* ── Live clock ── */
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-BR'));
      setDate(now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* ── "/" shortcut focuses search ── */
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

  /* ── Helpers ── */
  const initials = (userName || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isMobile  = window.innerWidth <= 768;
  const viewLabel = VIEW_NAMES[currentView]
    ?? (currentView.charAt(0).toUpperCase() + currentView.slice(1));

  /* ── first name only ── */
  const firstName = (userName || 'Usuário').split(' ')[0];

  return (
    <header className="sgc-topbar">

      {/* ════ LEFT ════ */}
      <div className="sgc-tb-left">

        {/* Sidebar toggle */}
        <button
          className="sgc-tb-icon-btn"
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? 'Expandir menu' : 'Colapsar menu'}
          aria-label="Toggle sidebar"
        >
          <span className="sgc-tb-btn-bg" aria-hidden="true" />
          {isMobile
            ? <PanelLeftOpen size={18} />
            : isSidebarCollapsed
              ? <PanelLeftOpen  size={18} />
              : <PanelLeftClose size={18} />
          }
        </button>

        {/* Breadcrumbs */}
        <nav className="sgc-breadcrumbs desktop-only" aria-label="Localização">
          <span className="breadcrumb-item" onClick={() => onNavigateTo('dashboard')}>SGC</span>
          <span className="breadcrumb-sep" aria-hidden="true">/</span>
          <span className="breadcrumb-item active" aria-current="page">{viewLabel}</span>
        </nav>

        {/* Search */}
        <div className={`sgc-tb-search ${searchFocused ? 'focused' : ''}`}>
          <Search size={15} className="sgc-tb-search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={isMobile ? 'Buscar...' : 'Pesquisar chamados, CNPJ, status…'}
            className="sgc-tb-search-input"
            aria-label="Campo de busca global"
          />
          {searchTerm && (
            <button
              className="sgc-tb-search-clear"
              onClick={() => setSearchTerm('')}
              aria-label="Limpar busca"
            >
              <X size={11} />
            </button>
          )}
          <kbd className="sgc-tb-search-kbd desktop-only" aria-label="Atalho: barra">/</kbd>
        </div>

      </div>

      {/* ════ RIGHT ════ */}
      <div className="sgc-tb-right">

        {/* Theme toggle */}
        <button
          className="sgc-tb-icon-btn"
          onClick={toggleTheme}
          title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          aria-label="Alternar tema"
        >
          <span className="sgc-tb-btn-bg" aria-hidden="true" />
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <div className="sgc-tb-sep desktop-only" aria-hidden="true" />

        {/* Clock */}
        <div className="sgc-tb-clock desktop-only" aria-live="polite" aria-label="Horário atual">
          <div className="sgc-tb-clock-time">
            <Clock size={12} className="sgc-tb-clock-icon" aria-hidden="true" />
            <span>{time}</span>
          </div>
          <span className="sgc-tb-clock-date">{date}</span>
        </div>

        <div className="sgc-tb-sep desktop-only" aria-hidden="true" />

        {/* Notifications */}
        <Notification
          onNavigateTo={onNavigateTo}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkRead={onMarkRead}
        />

        <div className="sgc-tb-sep desktop-only" aria-hidden="true" />

        {/* User / Avatar */}
        <button
          className="sgc-tb-user"
          onClick={onProfileClick}
          onMouseEnter={() => setAvatarH(true)}
          onMouseLeave={() => setAvatarH(false)}
          title="Ver meu perfil"
          aria-label={`Perfil de ${userName}`}
        >
          {/* User text info (desktop only) */}
          <div className="sgc-tb-user-info desktop-only">
            <span className="sgc-tb-user-name">
              Olá, <strong>{firstName}</strong>
            </span>
            <span className="sgc-tb-user-role">SGC Admin</span>
          </div>

          {/* Avatar */}
          <div className={`sgc-tb-avatar ${avatarHovered ? 'hovered' : ''}`}>
            {userAvatar
              ? <img src={formatImageUrl(userAvatar)} alt={`Avatar de ${userName}`} />
              : <span>{initials}</span>
            }
            {/* Animated ring on hover */}
            <span className="sgc-tb-avatar-ring" aria-hidden="true" />
            {/* Online status dot */}
            <span className="sgc-tb-status-dot" aria-label="Online" />
          </div>
        </button>

      </div>
    </header>
  );
}