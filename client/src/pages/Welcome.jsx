import React, { useEffect } from 'react';
import { Rocket, Shield, Clock, Layout, ArrowRight, Zap, Star } from 'lucide-react';
import '../styles/pages/Welcome.css';

export default function Welcome({ user, onStart }) {
  const firstName = user?.name?.split(' ')[0] || 'Usuário';

  useEffect(() => {
    // Reveal animation delay
    const timer = setTimeout(() => {
      document.querySelector('.welcome-page').classList.add('is-ready');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="welcome-page">
      <div className="welcome-container">
        <header className="welcome-header">
          <div className="welcome-badge">
            <Star size={14} className="text-indigo-400" />
            <span>S|GC Pro v2.1</span>
          </div>
          <h1 className="welcome-title">
            Bem-vindo, <span className="text-gradient">{firstName}</span>.
          </h1>
          <p className="welcome-subtitle">
            Sua central de gestão está pronta. Vamos otimizar sua produtividade hoje?
          </p>
        </header>

        <div className="welcome-grid">
          <div className="welcome-card card-1">
            <div className="card-icon"><Layout size={24} /></div>
            <h3>Dashboard</h3>
            <p>Visão geral de todos os seus indicadores em tempo real.</p>
          </div>
          <div className="welcome-card card-2">
            <div className="card-icon"><Shield size={24} /></div>
            <h3>Segurança</h3>
            <p>Seus dados estão protegidos com criptografia de ponta.</p>
          </div>
          <div className="welcome-card card-3">
            <div className="card-icon"><Zap size={24} /></div>
            <h3>Agilidade</h3>
            <p>Processamento rápido de fretes e compras corporativas.</p>
          </div>
        </div>

        <footer className="welcome-footer">
          <button className="btn-welcome-start" onClick={onStart}>
            <span>Começar Minha Sessão</span>
            <ArrowRight size={20} />
          </button>
          
          <div className="welcome-quote">
            <Clock size={14} />
            <span>Último acesso: Hoje, às {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </footer>
      </div>

      {/* Background Decorative Elements */}
      <div className="mesh-gradient"></div>
      <div className="floating-icons">
        <div className="f-icon i-1"><Rocket size={40} /></div>
        <div className="f-icon i-2"><Shield size={32} /></div>
      </div>
    </div>
  );
}
