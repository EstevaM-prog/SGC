import React from 'react';
import { LogIn, UserX } from 'lucide-react';
import '../../styles/pages/Error.css';

export default function Unauthenticated({ onLogin }) {
  return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-icon-wrap">
          <UserX size={40} />
        </div>
        <div className="error-code">ERRO 401</div>
        <h1 className="error-title">Sessão Expirada</h1>
        <p className="error-message">
          Para garantir a sua segurança no SGC, você precisa fazer o login novamente antes de acessar esta área do painel.
        </p>
        <div className="error-actions">
          <button className="error-btn-primary" onClick={() => onLogin('login')}>
            <LogIn size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Entrar Agora
          </button>
        </div>
      </div>
    </div>
  );
}
