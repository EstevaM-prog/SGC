import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, CheckCircle2 } from 'lucide-react';
import '../styles/pages/Auth.css';
const API_BASE = 'http://localhost:3001/api';

export default function Register({ onNavigate }) {
  const [form, setForm]           = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.id]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) { setError('As senhas não coincidem.'); return; }
    if (form.password.length < 6)       { setError('A senha deve ter ao menos 6 caracteres.'); return; }

    try {
      const resp = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: form.name, 
          email: form.email, 
          password: form.password, 
          confirmPassword: form.confirm,
          role: 'USER'
        })
      });

      const data = await resp.json();

      if (resp.ok) {
        setSuccess(true);
        setTimeout(() => onNavigate('login'), 1500);
      } else {
        setError(data.error || 'Erro ao criar conta.');
      }
    } catch (err) {
      setError('Erro de conexão ao servidor.');
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-icon-wrap">
          <UserPlus size={28} />
        </div>
        <h1 className="auth-title">Crie sua Conta</h1>
        <p className="auth-subtitle">Comece sua experiência gratuita hoje</p>

        {error && (
          <div className="auth-error">
            <Lock size={16} />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="auth-success">
            <CheckCircle2 size={16} />
            <span>Conta criada! Redirecionando...</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="name">Nome Completo</label>
            <div className="auth-input-wrap">
              <User size={18} className="auth-input-icon" />
              <input id="name" type="text" value={form.name} onChange={handleChange}
                placeholder="Ex: João da Silva" required />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="email">E-mail Profissional</label>
            <div className="auth-input-wrap">
              <Mail size={18} className="auth-input-icon" />
              <input id="email" type="email" value={form.email} onChange={handleChange}
                placeholder="voce@exemplo.com" required />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="password">Senha Forte</label>
            <div className="auth-input-wrap">
              <Lock size={18} className="auth-input-icon" />
              <input id="password" type={showPass ? 'text' : 'password'} value={form.password}
                onChange={handleChange} placeholder="Mínimo 6 caracteres" required />
              <button type="button" className="auth-eye-btn" onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="confirm">Repita a Senha</label>
            <div className="auth-input-wrap">
              <Lock size={18} className="auth-input-icon" />
              <input id="confirm" type={showConfirm ? 'text' : 'password'} value={form.confirm}
                onChange={handleChange} placeholder="Confirme sua senha" required />
              <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm(v => !v)}>
                {showConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn-primary">Criar Nova Conta</button>
        </form>

        <p className="auth-footer">
          Já possui acesso?{' '}
          <button className="auth-link" onClick={() => onNavigate('login')}>Entrar agora</button>
        </p>
      </div>
    </div>
  );
}
