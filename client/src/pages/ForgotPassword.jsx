import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import '../styles/pages/Auth.css';

import api from '../Axios/conect.js';

export default function ForgotPassword({ onNavigate }) {
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  /**
   * Passo 1: Solicitar código de recuperação
   */
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const resp = await api.post('/users/forgot-password', { email });

      if (resp.status === 200) {
        setStep(2);
      } else {
        setError(resp.data.error || 'Erro ao enviar e-mail.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro de conexão ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Passo 2: Validar código
   */
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setStep(3); // Vamos direto pro step 3 e faremos o reset com o cod junto
    // Na verdade, o controller exige o código no reset.
  };

  /**
   * Passo 3: Resetar senha
   */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) { setError('As senhas não coincidem.'); return; }
    if (newPassword.length < 6) { setError('A senha deve ter ao menos 6 caracteres.'); return; }

    setLoading(true);

    try {
      const resp = await api.post('/users/reset-password', { email, code, newPassword });

      if (resp.status === 200) {
        setSuccess(true);
        setTimeout(() => onNavigate('login'), 2000);
      } else {
        setError(resp.data.error || 'Falha ao redefinir.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-icon-wrap">
          <ShieldCheck size={28} />
        </div>
        
        <h1 className="auth-title">Recuperar Senha</h1>
        <p className="auth-subtitle">
          {step === 1 && 'Informe seu e-mail para receber o código'}
          {step === 2 && `Enviamos o código para ${email}`}
          {step === 3 && 'Cadastre sua nova senha de acesso'}
        </p>

        {error && <div className="auth-error"><AlertCircle size={18}/><span>{error}</span></div>}
        {success && <div className="auth-success"><CheckCircle2 size={18}/><span>Senha alterada com sucesso!</span></div>}

        {step === 1 && (
          <form className="auth-form" onSubmit={handleRequestCode}>
            <div className="auth-field">
              <label>E-mail Corporativo</label>
              <div className="auth-input-wrap">
                <Mail size={18} className="auth-input-icon" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@exemplo.com" required />
              </div>
            </div>
            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? 'Processando...' : 'Receber Código'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="auth-form" onSubmit={handleVerifyCode}>
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
            <button type="submit" className="auth-btn-primary">Validar e Continuar</button>
            <button type="button" className="auth-link" style={{ marginTop: '1rem' }} onClick={() => setStep(1)}>
              Voltar ao e-mail
            </button>
          </form>
        )}

        {step === 3 && (
          <form className="auth-form" onSubmit={handleResetPassword}>
            <div className="auth-field">
              <label>Nova Senha</label>
              <div className="auth-input-wrap">
                <Lock size={18} className="auth-input-icon" />
                <input type={showPass ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label>Confirme a Nova Senha</label>
              <div className="auth-input-wrap">
                <Lock size={18} className="auth-input-icon" />
                <input type={showPass ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirme a nova senha" required />
              </div>
            </div>

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? 'Redefinindo...' : 'Salvar Nova Senha'}
            </button>
          </form>
        )}

        <p className="auth-footer" style={{ marginTop: '1.5rem' }}>
          Lembrou a senha?{' '}
          <button className="auth-link" onClick={() => onNavigate('login')}>Voltar ao login</button>
        </p>
      </div>
    </div>
  );
}
