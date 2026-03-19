import React from 'react';
import {
  Plus,
  BarChart3,
  List,
  ShoppingCart,
  Truck,
  Table,
  Workflow,
  Trash2,
  Headphones,
  Clock
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: BarChart3 },
  { id: 'list', label: 'Lista de Chamados', Icon: List },
  { id: 'shopping', label: 'Compras', Icon: ShoppingCart },
  { id: 'freight', label: 'Fretes', Icon: Truck },
  { id: 'ponto', label: 'Ponto', Icon: Clock },
  { id: 'cnpj', label: 'Tabela CNPJ', Icon: Table },
  { id: 'procedures', label: 'Procedimentos', Icon: Workflow },
  { id: 'trash', label: 'Lixeira', Icon: Trash2 },
  { id: 'suporte', label: 'Suporte', Icon: Headphones }
];

export default function Sidebar({ currentView, setCurrentView, isCollapsed, isMobileOpen, onCloseMobile }) {
  return (
    <aside className={`sidebar-glass ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Mobile close button */}
      <button className="sidebar-close-btn" onClick={onCloseMobile}>
        &times;
      </button>

      {/* ── Logo ── */}
      <div className="sg-header">
        <div className="sg-logo-mark">SGC</div>
        <div className="sg-logo-text">
          <span className="sg-logo-title">Sistema de</span>
          <span className="sg-logo-sub">Gerenciamento de Chamados</span>
        </div>
      </div>

      {/* ── Novo Chamado ── */}
      <div className="sg-new-btn-wrap">
        <button
          className={`sg-new-btn ${currentView === 'form' ? 'active' : ''}`}
          onClick={() => setCurrentView('form')}
        >
          <Plus size={18} style={{ flexShrink: 0 }} />
          <span className="sg-btn-label">Novo Chamado</span>
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="sg-nav">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`sg-nav-item ${currentView === id ? 'active' : ''}`}
            onClick={() => setCurrentView(id)}
          >
            <Icon size={18} className="sg-nav-icon" />
            <span className="sg-nav-label">{label}</span>
          </button>
        ))}
      </nav>

    </aside>
  );
}
