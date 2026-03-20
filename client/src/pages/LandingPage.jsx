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
  Layers
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
      icon: <BarChart3 />,
      title: "Dashboard em Tempo Real",
      desc: "Visibilidade instantânea do desempenho do sistema com visualizações Recharts interativas e indicadores chave de desempenho (KPIs)."
    },
    {
      icon: <Ticket />,
      title: "Ticketing Unificado",
      desc: "Gestão centralizada para Pagamentos, Compras e Logística (Fretes) com filtros avançados e logs de auditoria."
    },
    {
      icon: <Users />,
      title: "Controle de Equipe RBAC",
      desc: "Controle de Acesso Baseado em Funções (RBAC) granular. Gerencie permissões de equipe para páginas específicas."
    },
    {
      icon: <Calendar />,
      title: "Rastreamento de Prazos",
      desc: "Calendário funcional para visualizar e filtrar tarefas pendentes por data de vencimento. Nunca perca um prazo crítico."
    },
    {
      icon: <Bell />,
      title: "Notificações de Atividade",
      desc: "Sistema de notificações em tempo real com indicadores de não lidas e log de atividades de toda a equipe."
    },
    {
      icon: <Shield />,
      title: "Infraestrutura Segura",
      desc: "Segurança de nível empresarial usando autenticação JWT, hashing de senhas Bcrypt e criptografia de dados Prisma."
    }
  ];

  return (
    <div className="lp-container">
      {/* Navbar */}
      <nav className={`lp-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="lp-logo-wrap">
          <div className="lp-logo-icon">S</div>
          <span>Sistema SGC</span>
        </div>
        
        <div className="lp-nav-links">
          <button className="lp-nav-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Início</button>
          <button className="lp-nav-link" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>Recursos</button>
          <button className="lp-nav-link" onClick={onDocs}>Documentação</button>
        </div>

        <div className="lp-nav-actions">
          <button className="lp-btn-login" onClick={onLogin}>Entrar</button>
          <button className="lp-btn-auth" onClick={handleStart}>
            {isAuthenticated ? 'Painel' : 'Começar'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="lp-hero">
        <div className="lp-badge">Versão Beta v2.0 Disponível</div>
        <h1 className="lp-hero-headline">
          Gestão Inteligente de <br />
          Chamados para sua Equipe.
        </h1>
        <p className="lp-hero-summary">
          O sistema de gestão definitivo (SGC) projetado para equipes de alta performance. 
          Unifique operações de pagamentos, compras e fretes com análises avançadas.
        </p>
        
        <div className="lp-button-group">
          <button className="lp-btn-primary" onClick={handleStart}>
            {isAuthenticated ? 'Acessar Painel' : 'Começar Grátis'}
            <ChevronRight size={18} />
          </button>
          <button className="lp-btn-secondary" onClick={onDocs}>
            Ver Documentação
          </button>
        </div>
      </header>

      {/* Features Showcase */}
      <section id="features" className="lp-features">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
           <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>Recursos Poderosos</h2>
           <p style={{ color: 'var(--lp-muted)', maxWidth: '600px', margin: '0 auto' }}>Projetado para clareza, foco e máxima produtividade em ambientes corporativos.</p>
        </div>

        <div className="lp-feature-grid">
          {features.map((f, i) => (
            <div key={i} className="lp-feature-card">
              <div className="lp-feature-icon-wrap">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Subtle Section */}
      <section className="lp-features" style={{ paddingTop: '50px' }}>
         <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem', opacity: 0.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}><Layers size={16} /> React 19</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}><Shield size={16} /> Prisma + Postgres</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}><Workflow size={16} /> Node.js / Express</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}><BarChart3 size={16} /> Recharts</div>
         </div>
      </section>

      <footer style={{ padding: '80px 8%', borderTop: '1px solid var(--lp-border)', textAlign: 'center', marginTop: '100px' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--lp-muted)' }}>
           © 2026 Sistema de Gestão SGC. Todos os direitos reservados. <br />
           Uma abordagem minimalista para a eficiência da equipe.
        </p>
      </footer>
    </div>
  );
}
