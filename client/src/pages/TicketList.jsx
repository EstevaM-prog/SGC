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

      <div className="filter-call list" style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="situacao" className="filter-label text-xs font-semibold uppercase text-muted-foreground mr-2">Filtrar por status:</label>
        <select
          id="situacao"
          className="custom-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: '200px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input)', color: 'var(--foreground)', marginLeft: '8px' }}
        >
          <option value="">Todos</option>
          <option value="Aberto">Aberto</option>
          <option value="Processando">Processando</option>
          <option value="Escriturar">Escriturar</option>
          <option value="Solucionado">Solucionado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
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
