import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Users,
  Ticket,
  Shield,
  ChevronRight,
  Bell,
  Calendar,
  Workflow,
  Layers,
  Sparkles
} from 'lucide-react';
import '../styles/pages/LandingPage.css';

export default function LandingPage({ onStart, onLogin, onDocs, isAuthenticated }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStart = () => {
    onStart();
  };

  const features = [
    {
      icon: <BarChart3 size={24} />,
      title: "Dashboard em Tempo Real",
      desc: "Visibilidade instantânea do desempenho do sistema com visualizações interativas e indicadores chave (KPIs)."
    },
    {
      icon: <Ticket size={24} />,
      title: "Ticketing Unificado",
      desc: "Gestão centralizada para Pagamentos, Compras e Logística com filtros avançados e logs de auditoria."
    },
    {
      icon: <Users size={24} />,
      title: "Controle de Equipe RBAC",
      desc: "Controle de Acesso Baseado em Funções granular. Gerencie permissões de equipe para módulos específicos."
    },
    {
      icon: <Calendar size={24} />,
      title: "Rastreamento de Prazos",
      desc: "Calendário inteligente para visualizar e gerenciar tarefas pendentes. Nunca perca um prazo crítico."
    },
    {
      icon: <Bell size={24} />,
      title: "Notificações em Tempo Real",
      desc: "Sistema de alertas instantâneos com indicadores visuais e registro de atividades de toda a equipe."
    },
    {
      icon: <Shield size={24} />,
      title: "Infraestrutura Segura",
      desc: "Segurança corporativa com autenticação JWT, hashing de senhas avançado e criptografia Prisma."
    }
  ];

  return (
    <div className="lp-wrapper">
      {/* Dynamic Background Elements */}
      <div className="lp-bg-mesh">
        <div className="lp-blob lp-blob-1"></div>
        <div className="lp-blob lp-blob-2"></div>
        <div className="lp-blob lp-blob-3"></div>
      </div>

      {/* Navbar */}
      <nav className={`lp-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="lp-nav-content">
          <div className="lp-logo-wrap">
            <div className="lp-logo-icon">S</div>
            <span className="lp-logo-text">Sistema SGC</span>
          </div>

          <div className="lp-nav-links">
            <button className="lp-nav-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Início</button>
            <button className="lp-nav-link" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>Recursos</button>
            <button className="lp-nav-link" onClick={onDocs}>Documentação</button>
          </div>

          <div className="lp-nav-actions">
            {!isAuthenticated ? (
              <button className="lp-btn-auth" onClick={handleStart}>Criar Conta</button>
            ) : (
              <button className="lp-btn-auth" onClick={handleStart}>Ir para o Painel</button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="lp-hero">
        <div className="lp-hero-content">
          <div className="lp-badge-wrap">
            <span className="lp-badge">
              <Sparkles size={14} />
              SGC Pro v2.1 Disponível
            </span>
          </div>

          <h1 className="lp-hero-headline">
            Gestão Inteligente de<br />
            <span className="lp-text-gradient">Chamados Corporativos</span>
          </h1>

          <p className="lp-hero-summary">
            A plataforma definitiva para equipes de alta performance. Centralize pagamentos,
            compras e logística com automação e análises avançadas em tempo real.
          </p>

          <div className="lp-hero-actions">
            <button className="lp-btn-primary lp-btn-glow" onClick={handleStart}>
              {isAuthenticated ? 'Acessar Meu Painel' : 'Iniciar Experiência'}
              <ChevronRight size={18} />
            </button>
            <button className="lp-btn-secondary" onClick={onDocs}>
              Ver Documentação Técnica
            </button>
          </div>
        </div>

        {/* Mockup Preview */}
        <div className="lp-hero-mockup-wrapper">
          <div className="lp-hero-mockup">
            <div className="mockup-header">
              <div className="mockup-dots"><span></span><span></span><span></span></div>
              <div className="mockup-search"></div>
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar"></div>
              <div className="mockup-content">
                <div className="mockup-card-row">
                  <div className="mockup-card"></div>
                  <div className="mockup-card"></div>
                  <div className="mockup-card"></div>
                </div>
                <div className="mockup-chart"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="lp-section">
        <div className="lp-section-header">
          <h2 className="lp-section-title">Recursos <span className="lp-text-gradient">Poderosos</span></h2>
          <p className="lp-section-subtitle">
            Arquitetura moderna e design focado em produtividade máxima.
          </p>
        </div>

        <div className="lp-feature-grid">
          {features.map((f, i) => (
            <div key={i} className="lp-feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="lp-feature-icon">{f.icon}</div>
              <h3 className="lp-feature-title">{f.title}</h3>
              <p className="lp-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Subtle Footer */}
      <section className="lp-tech-stack">
        <div className="lp-tech-items">
          <div className="tech-item"><Layers size={18} /> React 19</div>
          <div className="tech-item"><Shield size={18} /> Prisma & PostgreSQL</div>
          <div className="tech-item"><Workflow size={18} /> Express API</div>
          <div className="tech-item"><BarChart3 size={18} /> Recharts Analytics</div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-logo-icon small">S</div>
        <p>© 2026 Sistema de Gestão SGC. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
