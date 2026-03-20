import React from 'react';
import { Hammer, History } from 'lucide-react';
import '../../styles/pages/Error.css';

export default function Maintenance() {
  return (
    <div className="error-container">
      <div className="error-card">
        <div className="error-icon-wrap">
          <Hammer size={40} />
        </div>
        <div className="error-code">STATUS 503</div>
        <h1 className="error-title">Manutenção Programada</h1>
        <p className="error-message">
          Estamos realizando uma evolução crítica em nosso sistema SGC. Voltamos em alguns minutos para oferecer uma experiência melhorada!
        </p>
        <div className="error-actions">
          <button className="error-btn-primary" onClick={() => window.location.reload()}>
            Tentar Recarregar
          </button>
        </div>
      </div>
    </div>
  );
}
