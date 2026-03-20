import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, CheckCircle2, ShieldCheck } from 'lucide-react';
import '../styles/pages/Auth.css';

const API_BASE = 'http://localhost:3001/api';

export default function Register({ onNavigate }) {
  const [step, setStep] = useState(1); // 1: Form, 2: Verification
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [code, setCode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.id]: e.target.value }));

  /**
   * Passo 1: Enviar Dados de Registro
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (form.password !== form.confirm) { setError('As senhas não coincidem.'); setLoading(false); return; }
    if (form.password.length < 6) { setError('A senha deve ter ao menos 6 caracteres.'); setLoading(false); return; }

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
        setStep(2); // Avança para o código
      } else {
        setError(data.error || 'Erro ao criar conta.');
      }
    } catch (err) {
      setError('Erro de conexão ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Passo 2: Validar Código de Segurança
   */
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/users/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, code })
      });

      const data = await resp.json();
      if (resp.ok) {
        setSuccess(true);
        setTimeout(() => onNavigate('login'), 2000);
      } else {
        setError(data.error || 'Código inválido.');
      }
    } catch (err) {
      setError('Erro ao validar código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-icon-wrap">
          {step === 1 ? <UserPlus size={28} /> : <ShieldCheck size={28} />}
        </div>
        
        <h1 className="auth-title">
          {step === 1 ? 'Crie sua Conta' : 'Verifique seu E-mail'}
        </h1>
        <p className="auth-subtitle">
          {step === 1 
            ? 'Comece sua experiência gratuita hoje' 
            : `Enviamos um código de 6 dígitos para ${form.email}`}
        </p>

        {error && <div className="auth-error"><span>{error}</span></div>}
        {success && <div className="auth-success"><span>Conta ativada! Redirecionando...</span></div>}

        {step === 1 ? (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-field">
              <label>Nome Completo</label>
              <div className="auth-input-wrap">
                <User size={18} className="auth-input-icon" />
                <input id="name" type="text" value={form.name} onChange={handleChange} placeholder="Ex: João da Silva" required />
              </div>
            </div>

            <div className="auth-field">
              <label>E-mail Profissional</label>
              <div className="auth-input-wrap">
                <Mail size={18} className="auth-input-icon" />
                <input id="email" type="email" value={form.email} onChange={handleChange} placeholder="voce@exemplo.com" required />
              </div>
            </div>

            <div className="auth-field">
              <label>Senha Forte</label>
              <div className="auth-input-wrap">
                <Lock size={18} className="auth-input-icon" />
                <input id="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" required />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label>Repita a Senha</label>
              <div className="auth-input-wrap">
                <Lock size={18} className="auth-input-icon" />
                <input id="confirm" type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={handleChange} placeholder="Confirme sua senha" required />
                <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? 'Processando...' : 'Próximo Passo'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerify}>
            <div className="auth-field">
              <label>Código de 6 Dígitos</label>
              <div className="auth-input-wrap">
                <ShieldCheck size={18} className="auth-input-icon" />
                <input 
                  type="text" 
                  value={code} 
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000" 
                  required 
                  style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px' }}
                />
              </div>
            </div>
            
            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? 'Validando...' : 'Confirmar Registro'}
            </button>
            <button type="button" className="auth-link" style={{ marginTop: '1rem' }} onClick={() => setStep(1)}>
              Voltar ao formulário
            </button>
          </form>
        )}

        <p className="auth-footer">
          Já possui acesso?{' '}
          <button className="auth-link" onClick={() => onNavigate('login')}>Entrar agora</button>
        </p>
      </div>
    </div>
  );
}
