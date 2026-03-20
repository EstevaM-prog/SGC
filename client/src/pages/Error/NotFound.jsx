import React from 'react';
import { Search, Home, ArrowLeft } from 'lucide-react';
import '../../styles/pages/Error.css';

export default function NotFound({ onBack }) {
  return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-icon-wrap">
          <Search size={40} />
        </div>
        <div className="error-code">ERRO 404</div>
        <h1 className="error-title">Página Não Encontrada</h1>
        <p className="error-message">
          Ops! Parece que o caminho que você tentou acessar não existe ou foi removido definitivamente do sistema.
        </p>
        <div className="error-actions">
          <button className="error-btn-primary" onClick={() => onBack('landing')}>
            <Home size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Voltar para a Home
          </button>
          <button className="error-btn-secondary" onClick={() => window.history.back()}>
            <ArrowLeft size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Página Anterior
          </button>
        </div>
      </div>
    </div>
  );
}
