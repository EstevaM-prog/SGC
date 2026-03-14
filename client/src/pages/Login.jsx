import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import '../styles/pages/Auth.css';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    try {
      const stored = JSON.parse(localStorage.getItem('user_db') || 'null');
      if (stored && stored.email === email && (stored.password === password || (!stored.password && password === ''))) {
        // Persist Remember Me
        if (remember) {
          localStorage.setItem('remember_me', JSON.stringify({ email, password }));
        } else {
          localStorage.removeItem('remember_me');
        }
        localStorage.setItem('session_v1', JSON.stringify({ name: stored.name, email: stored.email }));
        onLogin({ name: stored.name, email: stored.email });
      } else {
        setError('E-mail ou senha incorretos.');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Erro ao processar login. Dados corrompidos.');
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-icon-wrap">
          <Lock size={24} />
        </div>
        <h1 className="auth-title">Bem-vindo de volta</h1>
        <p className="auth-subtitle">Acesse sua conta para continuar</p>

        {error && <p className="auth-error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="login-email">E-mail</label>
            <div className="auth-input-wrap">
              <Mail size={16} className="auth-input-icon" />
              <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="voce@exemplo.com" required autoComplete="email" />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Senha</label>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input id="login-password" type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
              <button type="button" className="auth-eye-btn" onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          <div className="auth-row">
            <label className="auth-remember" style={{ cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                style={{ cursor: 'pointer', accentColor: '#7c3aed' }}
              />
              Lembrar-me
            </label>
            <button type="button" className="auth-link" onClick={() => onNavigate('forgot')}>
              Esqueceu a senha?
            </button>
          </div>

          <button type="submit" className="auth-btn-primary">Entrar</button>
        </form>

        <p className="auth-footer">
          Não tem conta?{' '}
          <button className="auth-link" onClick={() => onNavigate('register')}>Cadastre-se</button>
        </p>
      </div>
    </div>
  );
}
