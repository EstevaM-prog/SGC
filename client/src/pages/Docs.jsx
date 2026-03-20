import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Cpu, 
  Zap, 
  Layout, 
  Settings, 
  BarChart3, 
  Terminal
} from 'lucide-react';
import '../styles/pages/Docs.css';

export default function Docs({ onBack }) {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    {
      id: "getting-started",
      title: "Primeiros Passos",
      icon: <Zap size={18} />,
      content: (
        <section className="docs-section">
          <h2>Primeiros Passos</h2>
          <p>Bem-vindo ao Manual do Sistema SGC. Este guia oferece um detalhamento completo dos módulos do aplicativo, desde o sistema de chamados até a gestão de equipes empresariais.</p>
          <div className="docs-grid">
             <div className="docs-card">
                <h4>Dashboard</h4>
                <p>Monitore as atividades da sua equipe e métricas de chamados em tempo real.</p>
             </div>
             <div className="docs-card">
                <h4>Chamados Consolidados</h4>
                <p>Visão unificada para chamados de Pagamentos, Compras e Fretes.</p>
             </div>
             <div className="docs-card">
                <h4>Permissões RBAC</h4>
                <p>Controle exatamente o que cada membro da equipe pode visualizar e editar.</p>
             </div>
          </div>
        </section>
      )
    },
    {
      id: "page-guide",
      title: "Guia de Páginas",
      icon: <Layout size={18} />,
      content: (
        <section className="docs-section">
          <h2>Guia de Páginas</h2>
          <p>Explore as funcionalidades de cada visão dentro do sistema SGC.</p>
          <div className="docs-section">
             <h3>📊 Painel (Dashboard)</h3>
             <p>O painel oferece uma visão visual das métricas do sistema usando Recharts. Indicadores chave de desempenho (KPIs) como Chamados Vencidos e Itens Pendentes são destacados para atenção imediata.</p>
          </div>
          <div className="docs-section">
             <h3>🎟️ Chamados (Lista Principal)</h3>
             <p>A interface primária para gerenciar solicitações operacionais. Suporta filtragem avançada por Status, CNPJ e termos de busca. Tipos de status incluem: Aberto, Em Andamento, Processado e Resolvido.</p>
          </div>
          <div className="docs-section">
             <h3>🏢 Gestão de Equipe</h3>
             <p>Encontrado na seção de Perfil, este módulo permite que administradores criem grupos de trabalho, gerem códigos de convite e configurem permissões granulares.</p>
          </div>
        </section>
      )
    },
    {
      id: "workflows",
      title: "Fluxos de Trabalho",
      icon: <Settings size={18} />,
      content: (
        <section className="docs-section">
          <h2>Fluxos de Trabalho</h2>
          <p>Processos padronizados para as ações comuns do sistema.</p>
          <div className="docs-section">
             <h3>📝 Abrindo Chamados</h3>
             <p>Navegue até o formulário de "Novo Chamado". Preencha os campos obrigatórios (Número, Data, Valor, CNPJ). Ao enviar, o sistema dispara um Toast de sucesso e registra no log de atividades.</p>
          </div>
          <div className="docs-section">
             <h3>📅 Prazos no Calendário</h3>
             <p>Use o Calendário no Dashboard para identificar datas críticas. Selecionar uma data filtra a visão de pendências para mostrar apenas os chamados com vencimento naquele dia.</p>
          </div>
          <div className="docs-section">
             <h3>🔔 Notificações</h3>
             <p>O log de atividades rastreia todos os eventos do sistema (Criação, Edições, Exclusões). Indicadores no Topbar mantém você atualizado sobre ações da equipe.</p>
          </div>
        </section>
      )
    },
    {
      id: "tech-specs",
      title: "Especificações Técnicas",
      icon: <Cpu size={18} />,
      content: (
        <section className="docs-section">
          <h2>Especificações Técnicas</h2>
          <p>Uma análise da arquitetura do SGC e protocolos de segurança de dados.</p>
          <div className="docs-code-block">
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Terminal size={14} />
                <span>Visão Geral da Tech Stack</span>
             </div>
             - Frontend: React 19 (Hooks, Context API) <br />
             - Backend: Node.js / Express <br />
             - Base de Dados: Neon Postgres <br />
             - ORM: Prisma Client <br />
             - Analytics: Recharts <br />
             - Segurança: JWT + Bcrypt
          </div>
          <div className="docs-section">
             <h3>🔒 Segurança de Dados</h3>
             <p>Usamos JWT (JSON Web Tokens) para sessões persistentes e Bcrypt para hashing de senhas. Todos os endpoints da API são protegidos por middleware de autorização.</p>
          </div>
        </section>
      )
    }
  ];

  return (
    <div className="docs-container">
      {/* Sidebar Navigation */}
      <aside className="docs-sidebar">
        <h1 onClick={onBack} style={{ cursor: 'pointer' }}>
          <ChevronLeft size={20} />
          Manual SGC
        </h1>

        <div className="docs-nav-section">
          <div className="docs-nav-title">Documentação</div>
          {sections.map(s => (
            <button 
              key={s.id}
              className={`docs-nav-link ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {s.icon}
                {s.title}
              </div>
            </button>
          ))}
        </div>

        <div className="docs-nav-section">
           <button className="docs-nav-link" onClick={onBack} style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <Zap size={18} />
                 Voltar ao Sistema
              </div>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="docs-content">
        <div className="docs-header">
           <h1>Documentação</h1>
           <p>Domine o Sistema SGC com nosso manual técnico completo.</p>
        </div>

        {sections.find(s => s.id === activeSection)?.content}

        <footer style={{ marginTop: '4rem', padding: '1rem 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.875rem', color: '#94a3b8' }}>
           Atualizado em Março de 2026. Versão 2.0.1
        </footer>
      </main>
    </div>
  );
}
