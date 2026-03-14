import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import '../styles/pages/Auth.css';

export default function Register({ onNavigate }) {
  const [form, setForm]           = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.id]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('As senhas não coincidem.'); return; }
    if (form.password.length < 6)       { setError('A senha deve ter ao menos 6 caracteres.'); return; }
    localStorage.setItem('user_db', JSON.stringify({ name: form.name, email: form.email, password: form.password }));
    setSuccess(true);
    setTimeout(() => onNavigate('login'), 1500);
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-icon-wrap">
          <User size={24} />
        </div>
        <h1 className="auth-title">Criar conta</h1>
        <p className="auth-subtitle">Comece com sua conta gratuita</p>

        {error   && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">Conta criada! Redirecionando...</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="name">Nome completo</label>
            <div className="auth-input-wrap">
              <User size={16} className="auth-input-icon" />
              <input id="name" type="text" value={form.name} onChange={handleChange}
                placeholder="Seu nome" required />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="email">E-mail</label>
            <div className="auth-input-wrap">
              <Mail size={16} className="auth-input-icon" />
              <input id="email" type="email" value={form.email} onChange={handleChange}
                placeholder="voce@exemplo.com" required />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="password">Senha</label>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input id="password" type={showPass ? 'text' : 'password'} value={form.password}
                onChange={handleChange} placeholder="••••••••" required />
              <button type="button" className="auth-eye-btn" onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="confirm">Confirmar senha</label>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input id="confirm" type={showConfirm ? 'text' : 'password'} value={form.confirm}
                onChange={handleChange} placeholder="••••••••" required />
              {/* ← toggle independente para o campo confirmar */}
              <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm(v => !v)}>
                {showConfirm ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn-primary">Criar Conta</button>
        </form>

        <p className="auth-footer">
          Já tem uma conta?{' '}
          <button className="auth-link" onClick={() => onNavigate('login')}>Entrar</button>
        </p>
      </div>
    </div>
  );
}
