import React from 'react';
import { Timer, ArrowRight, MailSearch } from 'lucide-react';
import '../../styles/pages/Error.css';

export default function TokenError({ onNavigate }) {
  return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-icon-wrap">
          <Timer size={40} />
        </div>
        <div className="error-code">TOKEN INVÁLIDO</div>
        <h1 className="error-title">Link ou Código Expirado</h1>
        <p className="error-message">
          O código de segurança que você utilizou não é mais válido ou já foi utilizado anteriormente. Por favor, solicite um novo.
        </p>
        <div className="error-actions">
          <button className="error-btn-primary" onClick={() => onNavigate('forgot')}>
            Solicitar novo Código
            <ArrowRight size={18} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
          </button>
          <button className="error-btn-secondary" onClick={() => onNavigate('landing')}>
            Voltar para a Home
          </button>
        </div>
      </div>
    </div>
  );
}
