import React from 'react';
import {
  Plus, BarChart3, List, ShoppingCart, Truck,
  Table, Workflow, Trash2, Headphones, Clock,
  ChevronRight, Zap, Settings
} from 'lucide-react';

const NAV_GROUPS = [
  {
    section: 'Visão Geral',
    items: [
      { id: 'dashboard', label: 'Dashboard', Icon: BarChart3, badge: null },
      { id: 'list', label: 'Chamados', Icon: List, badge: null },
    ]
  },
  {
    section: 'Operacional',
    items: [
      { id: 'shopping', label: 'Compras', Icon: ShoppingCart, badge: null },
      { id: 'freight', label: 'Fretes', Icon: Truck, badge: null },
      { id: 'ponto', label: 'Ponto', Icon: Clock, badge: null },
      { id: 'cnpj', label: 'Tabela CNPJ', Icon: Table, badge: null },
    ]
  },
  {
    section: 'Recursos',
    items: [
      { id: 'procedures', label: 'Procedimentos', Icon: Workflow, badge: null },
      { id: 'suporte', label: 'Suporte', Icon: Headphones, badge: 'Novo' },
      { id: 'trash', label: 'Lixeira', Icon: Trash2, badge: null },
    ]
  }
];

export default function Sidebar({
  currentView,
  setCurrentView,
  isCollapsed,
  isMobileOpen,
  onCloseMobile,
  permissions
}) {
  const filterItems = (items) =>
    items.filter(item => !permissions || permissions[item.id] !== false);

  return (
    <aside
      className={`sgc-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
      aria-label="Navegação principal"
    >
      {/* ── Mobile close ── */}
      <button className="sgc-close-btn" onClick={onCloseMobile} aria-label="Fechar menu">
        <ChevronRight size={16} />
      </button>

      {/* ── Brand ── */}
      <div className="sgc-brand">
        <div className="sgc-brand-icon">
          <Zap size={19} strokeWidth={2.5} />
        </div>
        <div className="sgc-brand-text">
          <span className="sgc-brand-name">SGC</span>
          <span className="sgc-brand-tagline">Gestão de Chamados</span>
        </div>
      </div>

      {/* ── New Ticket CTA ── */}
      <div className="sgc-cta-wrap">
        <button
          className={`sgc-cta-btn ${currentView === 'form' ? 'active' : ''}`}
          onClick={() => setCurrentView('form')}
          title="Novo Chamado"
        >
          <span className="sgc-cta-icon">
            <Plus size={16} strokeWidth={2.5} />
          </span>
          <span>Novo Chamado</span>
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="sgc-nav" aria-label="Menu">
        {NAV_GROUPS.map((group, gIdx) => {
          const filtered = filterItems(group.items);
          if (!filtered.length) return null;

          return (
            <div key={gIdx} className="sgc-nav-section">
              <span className="sgc-section-label">{group.section}</span>

              {filtered.map(({ id, label, Icon, badge }, iIdx) => {
                const isActive = currentView === id;

                return (
                  <button
                    key={id}
                    className={`sgc-nav-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setCurrentView(id)}
                    data-title={label}
                    style={{ animationDelay: `${(gIdx * 4 + iIdx) * 0.045}s` }}
                    aria-current={isActive ? 'page' : undefined}
                    title={isCollapsed ? label : undefined}
                  >
                    <span className="sgc-btn-bg" aria-hidden="true" />

                    <span className="sgc-icon-wrap">
                      <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                    </span>

                    <span className="sgc-nav-label">{label}</span>

                    {badge && <span className="sgc-badge">{badge}</span>}

                    {isActive && !badge && (
                      <span className="sgc-active-dot" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="sgc-footer">
        <div className="sgc-footer-user">
          <div className="sgc-footer-avatar">
            <Settings size={15} />
          </div>
          <div className="sgc-footer-info">
            <span className="sgc-footer-version">v2.2 · SGC Platform</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
