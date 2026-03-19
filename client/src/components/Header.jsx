import React, { useState, useEffect, useRef } from 'react';
import {
  PanelLeftOpen,
  PanelLeftClose,
  Sun,
  Moon,
  Search,
  Clock,
  CloudSun,
  Bell
} from 'lucide-react';
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
  onProfileClick
}) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  // --- Lógica de Notificações ---
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Exemplo de dados de notificações (poderiam vir via props)
  const notifications = [
    { id: 1, text: "Saldo positivo de 1h 20m hoje!", type: "success", time: "2 min atrás" },
    { id: 2, text: "Revisão de descarte de dados pendente", type: "alert", time: "1h atrás" }
  ];

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-BR'));
      setDate(now.toLocaleDateString('pt-BR'));
    };
    tick();
    const id = setInterval(tick, 1000);

    // Fechar ao clicar fora
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(id);
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
          /* On mobile, show hamburger-style menu if closed */
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

      {/* ── Divider ── */}
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
      <div className="notification-wrapper" ref={notificationRef} style={{ position: 'relative' }}>
        <button
          type="button"
          className="tb-icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowNotifications(!showNotifications);
          }}
        >
          <Bell size={18} />
        </button>

        {showNotifications && (
          <div className="tb-notif-popover">
            <div className="tb-notif-header">
              <span>Notificações</span>
              <span className="tb-notif-count">{notifications.length} novas</span>
            </div>
            <div className="tb-notif-list">
              {notifications.map(n => (
                <div key={n.id} className={`tb-notif-item ${n.type}`}>
                  <p>{n.text}</p>
                  <small>{n.time}</small>
                </div>
              ))}
            </div>
            <button className="tb-notif-all">Ver todas as atividades</button>
          </div>
        )}
      </div>

      {/* ── Spacer ── */}
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

      {/* ── Divider ── */}
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