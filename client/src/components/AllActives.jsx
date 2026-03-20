import React from 'react';
import { 
  Activity, 
  Clock, 
  PlusCircle, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Trash2, 
  User, 
  ArrowRightCircle,
  HelpCircle
} from 'lucide-react';
import '../styles/components/AllActives.css';

/**
 * Mapeamento de tipos/icones e cores para consistência visual.
 * Alinhado com Notification.jsx
 */
const ICON_MAP = {
  create: <PlusCircle size={18} className="icon-blue" />,
  ticket: <PlusCircle size={18} className="icon-blue" />,
  resolved: <CheckCircle size={18} className="icon-green" />,
  alert: <AlertCircle size={18} className="icon-orange" />,
  warning: <AlertCircle size={18} className="icon-orange" />,
  delete: <Trash2 size={18} className="icon-red" />,
  user: <User size={18} className="icon-purple" />,
  system: <Activity size={18} className="icon-gray" />,
  default: <FileText size={18} className="icon-gray" />
};

export default function AllActives({ activities = [] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="activities-empty">
        <div className="empty-icon-wrap">
          <HelpCircle size={48} />
        </div>
        <h3>Nenhuma atividade por aqui</h3>
        <p>Tudo está sob controle! Se ocorrer alguma alteração, você verá os detalhes aqui.</p>
      </div>
    );
  }

  return (
    <div className="activities-container">
      <ul className="activities-list">
        {activities.map((item, index) => (
          <li key={item.id || index} className={`activity-item ${item.type || 'info'}`}>
            <div className="activity-icon-wrap">
              {ICON_MAP[item.iconType] || ICON_MAP.default}
            </div>
            
            <div className="activity-content">
              <div className="activity-header-row">
                <h4 className="activity-title">{item.text}</h4>
                <div className="activity-time-wrap">
                   <Clock size={12} />
                   <span>{item.time}</span>
                </div>
              </div>
              
              <p className="activity-desc">
                {item.description || 'Log de sistema automático sem descrição detalhada.'}
              </p>
              
              {item.user && (
                <div className="activity-meta-footer">
                  <User size={12} />
                  <span>Por <strong>{item.user}</strong></span>
                </div>
              )}
            </div>

            <div className="activity-arrow desktop-only">
               <ArrowRightCircle size={16} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}