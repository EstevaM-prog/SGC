import React from 'react';
import { CloudOff, RefreshCw, ServerCrash } from 'lucide-react';
import '../../styles/pages/Error.css';

export default function ServerError({ type = '500', onRetry }) {
  const isOffline = type === 'offline';
  
  return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-icon-wrap">
          {isOffline ? <CloudOff size={40} /> : <ServerCrash size={40} />}
        </div>
        <div className="error-code">{isOffline ? 'SEM CONEXÃO' : 'ERRO 500'}</div>
        <h1 className="error-title">
          {isOffline ? 'Sem Conexão à Internet' : 'Algo deu errado do nosso lado'}
        </h1>
        <p className="error-message">
          {isOffline 
            ? 'Parece que seu Wi-Fi ou dados móveis caíram. Verifique sua conexão para continuar usando o SGC.' 
            : 'O servidor encontrou um problema inesperado. Por favor, tente recarregar a página ou voltar mais tarde.'}
        </p>
        <div className="error-actions">
          <button className="error-btn-primary" onClick={onRetry || (() => window.location.reload())}>
            <RefreshCw size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Recarregar Página
          </button>
        </div>
      </div>
    </div>
  );
}
