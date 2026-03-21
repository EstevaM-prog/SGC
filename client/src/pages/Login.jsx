import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import '../styles/pages/Auth.css';
import api from '../Axios/conect.js';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Login({ onLogin, onNavigate }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');

  // On mount: restore remembered credentials
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('remember_me') || 'null');
      if (saved) {
        setEmail(saved.email);
        setPassword(saved.password);
        setRemember(true);
      }
    } catch { /* ignore */ }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const resp = await api.post('/users/login', { email, password });
      
      const data = resp.data;

      if (resp.status === 200) {
        // Persist Remember Me
        if (remember) {
          localStorage.setItem('remember_me', JSON.stringify({ email, password }));
        } else {
          localStorage.removeItem('remember_me');
        }
        
        const sessionData = { 
          id: data.user.id, 
          name: data.user.name, 
          email: data.user.email,
          token: data.token 
        };
        
        localStorage.setItem('session_v1', JSON.stringify(sessionData));
        onLogin(sessionData);
      } else {
        setError(data.error || 'E-mail ou senha incorretos.');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.response?.data?.error || 'Servidor indisponível. Verifique sua conexão.');
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-icon-wrap">
          <LogIn size={28} />
        </div>
        <h1 className="auth-title">Bem-vindo de volta</h1>
        <p className="auth-subtitle">Acesse sua conta para continuar no sistema</p>

        {error && (
          <div className="auth-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="login-email">E-mail Corporativo</label>
            <div className="auth-input-wrap">
              <Mail size={18} className="auth-input-icon" />
              <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="exemplo@empresa.com" required autoComplete="email" />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Senha de Acesso</label>
            <div className="auth-input-wrap">
              <Lock size={18} className="auth-input-icon" />
              <input id="login-password" type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} placeholder="Sua senha secreta" required autoComplete="current-password" />
              <button type="button" className="auth-eye-btn" onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>

          <div className="auth-row">
            <label className="auth-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                style={{ cursor: 'pointer', appearance: 'none', width: '1.25rem', height: '1.25rem', border: '2px solid var(--auth-glass-border)', borderRadius: '6px', backgroundColor: 'var(--auth-glass-bg)', display: 'grid', placeContent: 'center' }}
              />
              <span className={remember ? 'text-primary' : ''}>Lembrar-me</span>
            </label>
            <button type="button" className="auth-link" style={{ textDecoration: 'none' }} onClick={() => onNavigate('forgot')}>
              Esqueceu a senha?
            </button>
          </div>

          <button type="submit" className="auth-btn-primary">Acessar Painel</button>
        </form>

        <p className="auth-footer">
          Não possui uma conta?{' '}
          <button className="auth-link" onClick={() => onNavigate('register')}>Cadastre-se agora</button>
        </p>
      </div>
      
      {/* Inline styles helper for the custom checkbox logic if needed to keep it simple but pretty */}
      <style>{`
        .auth-remember input:checked::before {
          content: ""; width: 0.65em; height: 0.65em; transform: scale(1);
          background-color: #7c3aed; box-shadow: inset 1em 1em #7c3aed;
          clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
        }
        .text-primary { color: #a78bfa !important; }
      `}</style>
    </div>
  );
}
