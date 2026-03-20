import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
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
          <KeyRound size={28} />
        </div>
        <h1 className="auth-title">Recuperar Acesso</h1>
        <p className="auth-subtitle">Sem problemas, enviaremos as instruções para você</p>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="auth-success">
            <CheckCircle2 size={16} />
            <span>Link enviado para: {email}</span>
          </div>
        )}

        {!success && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="reset-email">E-mail Cadastrado</label>
              <div className="auth-input-wrap">
                <Mail size={18} className="auth-input-icon" />
                <input id="reset-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com" required />
              </div>
            </div>
            <button type="submit" className="auth-btn-primary">Enviar Instruções de Recuperação</button>
          </form>
        )}

        <div className="auth-footer" style={{ marginTop: '2.5rem' }}>
          <button className="auth-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto', textDecoration: 'none' }} onClick={() => onNavigate('login')}>
            <ArrowLeft size={16}/> Voltar para o Login
          </button>
        </div>
      </div>
    </div>
  );
}
