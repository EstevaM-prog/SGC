import React, { useState } from 'react';
import DataTable from '../components/DataTable';

export default function TicketList({ tickets, searchTerm, onNewTicket, onEdit, onDelete }) {
  const [statusFilter, setStatusFilter] = useState('');

  // Filter logic
  const validTickets = tickets.filter(r => !r.deleted && r.type !== 'cnpj_record');

  const filteredTickets = validTickets.filter(t => {
    if (statusFilter && t.situacao !== statusFilter) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const textMatch = (t.numero || '').toLowerCase().includes(q)
        || (t.requisitante || '').toLowerCase().includes(q)
        || (t.razao || '').toLowerCase().includes(q)
        || (t.cnpj || '').toLowerCase().includes(q)
        || (t.situacao || '').toLowerCase().includes(q)
        || (t.pedido || '').toLowerCase().includes(q);

      if (!textMatch) return false;
    }
    return true;
  });

  return (
    <section id="view-list" className="view-section active">
      <div className="section-header">
        <div>
          <h2 className="section-title">Lista de Chamados</h2>
          <p className="section-subtitle">Gerencie e acompanhe todos os chamados do sistema</p>
        </div>
        <button className="btn-secondary" onClick={onNewTicket}>
          Novo Chamado
        </button>
      </div>

      <div className="filter-section-container" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <label htmlFor="situacao" className="filter-label" style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
            Filtrar por status:
          </label>
          <select
            id="situacao"
            className="custom-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: '160px' }}
          >
            <option value="">Todos os Status</option>
            <option value="Aberto">Aberto</option>
            <option value="Processando">Processando</option>
            <option value="Escriturar">Escriturar</option>
            <option value="Solucionado">Solucionado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="card">
        <DataTable
          tickets={filteredTickets}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </section >
  );
}
