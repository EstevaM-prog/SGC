import React, { useState } from 'react';
import { List, Plus, Filter } from 'lucide-react';
import DataTable from '../components/DataTable';
import TableActions from '../components/TableActions';

export default function TicketList({ tickets, searchTerm, onNewTicket, onEdit, onDelete }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const valid = tickets.filter(r => !r.deleted && r.type !== 'cnpj_record');
  const filtered = valid.filter(t => {
    if (statusFilter && t.situacao !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (t.numero || '').toLowerCase().includes(q)
        || (t.requisitante || '').toLowerCase().includes(q)
        || (t.razao || '').toLowerCase().includes(q)
        || (t.cnpj || '').toLowerCase().includes(q)
        || (t.situacao || '').toLowerCase().includes(q)
        || (t.pedido || '').toLowerCase().includes(q);
    }
    return true;
  });

  const STATUS_OPTIONS = ['Aberto', 'Processando', 'Escriturar', 'Solucionado', 'Cancelado'];

  return (
    <section id="view-list" className="view-section active">

      {/* ── Page Header ── */}
      <div className="sgc-page-header">
        <div className="sgc-page-title-block">
          <h1 className="sgc-page-title">Lista de Chamados</h1>
          <p className="sgc-page-subtitle">Gerencie e acompanhe todos os chamados do sistema</p>
        </div>
        <div className="sgc-page-actions">
          <TableActions
            data={filtered.map(({ id, type, deleted, createdAt, updatedAt, ...rest }) => rest)}
            onImport={items => {
              if (window.confirm(`Deseja importar ${items.length} registros?`))
                items.forEach(item => onNewTicket({ ...item, type: 'ticket' }));
            }}
            filename="lista-chamados"
          />
          <button className="sgc-btn-primary" onClick={onNewTicket}>
            <Plus size={16} /> Novo Chamado
          </button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="sgc-filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} style={{ color: '#0066FF' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Status:
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            className={`sgc-tab-btn ${!statusFilter ? 'active' : ''}`}
            style={{ height: 34, padding: '0 0.75rem', fontSize: '0.8rem' }}
            onClick={() => setStatusFilter('')}
          >Todos</button>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              className={`sgc-tab-btn ${statusFilter === s ? 'active' : ''}`}
              style={{ height: 34, padding: '0 0.75rem', fontSize: '0.8rem' }}
              onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="sgc-card" style={{ padding: 0, overflow: 'hidden' }}>
        <DataTable tickets={filtered} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </section>
  );
}
