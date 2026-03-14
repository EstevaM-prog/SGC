import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import '../styles/pages/Auth.css';

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const stored = JSON.parse(localStorage.getItem('user_db') || 'null');
    if (stored && stored.email === email) {
      setSuccess(true);
    } else {
      setError('E-mail não encontrado nos registros.');
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-icon-wrap">
          <Lock size={24} />
        </div>
        <h1 className="auth-title">Esqueceu a senha?</h1>
        <p className="auth-subtitle">Sem problemas, enviaremos as instruções de redefinição.</p>

        {error   && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">Instruções enviadas para: {email}</p>}

        {!success && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="reset-email">E-mail</label>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-icon" />
                <input id="reset-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com" required />
              </div>
            </div>
            <button type="submit" className="auth-btn-primary">Redefinir senha</button>
          </form>
        )}

        <p className="auth-footer" style={{ marginTop: '1rem' }}>
          <button className="auth-link" style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => onNavigate('login')}>
            <ArrowLeft size={14}/> Voltar ao login
          </button>
        </p>
      </div>
    </div>
  );
}
