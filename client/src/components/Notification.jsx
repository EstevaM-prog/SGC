import React, { useState, useEffect, useRef } from 'react';
import { Bell, ArrowRight } from 'lucide-react';

/**
 * Componente de Overlay de Notificações
 * @param {Object} props
 * @param {Function} props.onNavigateTo - Função para trocar a view principal do App
 * @param {Array} props.notifications - Lista real de notificações
 * @param {number} props.unreadCount - Contador de não lidas
 * @param {Function} props.onMarkRead - Função para zerar contador
 */
export default function Notification({ onNavigateTo, notifications = [], unreadCount = 0, onMarkRead }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAllActivities = () => {
    setShowNotifications(false);
    if (onNavigateTo) {
      onNavigateTo('activities');
    }
  };

  return (
    <div className="notification-wrapper" ref={notificationRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="sgc-tb-icon-btn"
        onClick={(e) => {
          e.stopPropagation();
          const next = !showNotifications;
          setShowNotifications(next);
          if (next && onMarkRead) onMarkRead();
        }}
        title="Notificações"
      >
        <span className="sgc-tb-btn-bg" />
        <Bell size={18} />
        {unreadCount > 0 && <span className="tb-notif-dot" />}
      </button>


      {showNotifications && (
        <div className="tb-notif-popover">
          <div className="tb-notif-header">
            <span>Notificações</span>
            <span className="tb-notif-count">{notifications.length} registros</span>
          </div>
          
          <div className="tb-notif-list">
            {notifications.length > 0 ? (
              notifications.map(n => (
                <div key={n.id} className={`tb-notif-item ${n.type}`}>
                  <p>{n.text}</p>
                  <small>{n.time}</small>
                </div>
              ))
            ) : (
              <div className="tb-notif-empty">Nenhuma notificação nova</div>
            )}
          </div>
          
          <button className="tb-notif-all" onClick={handleAllActivities}>
            Ver todas as atividades
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}