import React from 'react';
import { ShieldAlert, Home, Lock } from 'lucide-react';
import '../../styles/pages/Error.css';

export default function Forbidden({ onBack }) {
  return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-icon-wrap">
          <ShieldAlert size={40} />
        </div>
        <div className="error-code">ERRO 403</div>
        <h1 className="error-title">Acesso Negado</h1>
        <p className="error-message">
          Você não tem permissão para acessar esta área do SGC. Se acredita que isso seja um erro, entre em contato com o administrador da sua equipe.
        </p>
        <div className="error-actions">
          <button className="error-btn-primary" onClick={() => onBack('dashboard')}>
            <Home size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Voltar ao Painel
          </button>
          <button className="error-btn-secondary" onClick={() => window.location.reload()}>
            Tentar Novamente
          </button>
        </div>
      </div>
    </div>
  );
}
