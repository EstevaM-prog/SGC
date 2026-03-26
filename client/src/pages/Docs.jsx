import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Cpu, 
  Zap, 
  Layout, 
  Settings, 
  BarChart3, 
  Terminal,
  ShieldCheck,
  AlertTriangle
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
          <p>Bem-vindo ao Manual do Sistema SGC. Este guia oferece um detalhamento completo dos módulos do aplicativo, desde o sistema de chamados até a gestão de equipes empresariais e segurança em conformidade com a LGPD.</p>
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
                <h4>Segurança 2FA</h4>
                <p>Fluxo de autenticação em duas etapas para garantir a identidade dos usuários.</p>
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
             <p>Encontrado na seção de Perfil, este módulo permite que administradores criem grupos de trabalho, gerem códigos de convite e configurem permissões granulares, incluindo *Feature Flags* para controle de funcionalidades específicas.</p>
          </div>
          <div className="docs-section">
             <h3>🗑️ Lixeira (Soft Delete)</h3>
             <p>Acesse o módulo de Lixeira para recuperar chamados, itens de compra ou fretes que foram excluídos. O sistema mantém os dados por tempo indeterminado em estado 'arquivado', permitindo restauração imediata ou exclusão permanente.</p>
          </div>
          <div className="docs-section">
             <h3>🛠️ Central de Suporte</h3>
             <p>Interface dedicada para suporte técnico. Categorize suas solicitações (Erro, Dúvida, Financeiro) para um atendimento mais ágil e rastreável.</p>
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
             <h3>🛡️ Verificação em Duas Etapas (2FA)</h3>
             <p>Ao se registrar ou recuperar a senha, o sistema envia um código de 6 dígitos para o e-mail cadastrado. Este código é válido por 15 minutos e é obrigatório para ativar a conta ou redefinir a credencial.</p>
          </div>
          <div className="docs-section">
             <h3>📝 Abrindo Chamados</h3>
             <p>Navegue até o formulário de "Novo Chamado". Preencha os campos obrigatórios. Ao enviar, os dados sensíveis (CNPJ/Razão) são criptografados antes de serem salvos no banco de dados.</p>
          </div>
          <div className="docs-section">
             <h3>📅 Prazos no Calendário</h3>
             <p>Use o Calendário no Dashboard para identificar datas críticas. Selecionar uma data filtra a visão de pendências para mostrar apenas os chamados com vencimento naquele dia.</p>
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
          <p>Uma análise da arquitetura do SGC e protocolos de segurança de dados em conformidade com a LGPD.</p>
          <div className="docs-code-block">
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Terminal size={14} />
                <span>Visão Geral da Tech Stack</span>
             </div>
             - Frontend: React 19 (Hooks, Context API) <br />
             - Backend: Node.js / Express <br />
             - Base de Dados: Neon Postgres (PostgreSQL) <br />
             - Segurança: AES-256-GCM (Database-at-rest) <br />
             - Identidade: Bcrypt + JWT (Session management)
          </div>
          <div className="docs-section">
             <h3>🔒 Proteção de Dados (LGPD)</h3>
             <p>O SGC utiliza criptografia simétrica AES-256-GCM para proteger campos sensíveis no banco de dados. E-mails e códigos de convite usam IVs determinísticos para busca, enquanto dados de chamados usam IVs randômicos para máxima segurança.</p>
          </div>
        </section>
      )
    },
    {
      id: "auditing",
      title: "Auditoria e Logs",
      icon: <ShieldCheck size={18} />,
      content: (
        <section className="docs-section">
          <h2>Auditoria e Logs</h2>
          <p>O SGC v2.1 implementa transparência total sobre ações sensíveis no sistema.</p>
          <div className="docs-grid">
             <div className="docs-card">
                <h4>Logs de Acesso</h4>
                <p>Monitoramento de logins bem-sucedidos e tentativas de intrusão (brute force) com rotação diária de arquivos.</p>
             </div>
             <div className="docs-card">
                <h4>Logs de Permissão</h4>
                <p>Rastreia quem alterou as *Feature Flags* de um membro da equipe e quando isso ocorreu.</p>
             </div>
             <div className="docs-card">
                <h4>Conformidade</h4>
                <p>Todos os logs seguem padrões ISO de auditoria para fins de compliance e segurança da informação.</p>
             </div>
          </div>
        </section>
      )
    },
    {
      id: "troubleshooting",
      title: "Solução de Problemas",
      icon: <AlertTriangle size={18} />,
      content: (
        <section className="docs-section">
          <h2>Solução de Problemas</h2>
          <p>Guia rápido para os estados de erro do sistema.</p>
          <div className="docs-grid">
             <div className="docs-card">
                <h4>Erro 403 (Acesso Negado)</h4>
                <p>Ocorre quando um usuário comum tenta acessar áreas administrativas (ex: Gestão de Equipe).</p>
             </div>
             <div className="docs-card">
                <h4>Erro 500 (Servidor)</h4>
                <p>Indica uma falha inesperada no processamento. Recomendamos aguardar e tentar recarregar.</p>
             </div>
             <div className="docs-card">
                <h4>Conexão Offline</h4>
                <p>O sistema detecta automaticamente a perda de conexão e exibe um aviso visual persistente.</p>
             </div>
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
           <p>Domine o Sistema SGC com nosso manual técnico completo e seguro.</p>
        </div>

        {sections.find(s => s.id === activeSection)?.content}

        <footer style={{ marginTop: '4rem', padding: '1rem 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.875rem', color: '#94a3b8' }}>
           Atualizado em Março de 2026. Versão 2.1.0 (Segurança Ativada)
        </footer>
      </main>
    </div>
  );
}
