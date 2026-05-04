import React, { useState } from 'react';
import { Edit, Trash, RotateCcw, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({ tickets, onEdit, onDelete, onRestore, onPermanentDelete, isTrash }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const formatCurrency = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '';
    return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const day = d.getUTCDate().toString().padStart(2, '0');
      const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
      const year = d.getUTCFullYear();
      return `${day}/${month}/${year}`;
    } catch { return iso; }
  };

  const getDueInfo = (vencimento) => {
    if (!vencimento) return { class: '', label: '' };
    const v = new Date(vencimento); // Assume ISO string, so UTC
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())); // Midnight UTC
    const dueUTC = new Date(Date.UTC(v.getUTCFullYear(), v.getUTCMonth(), v.getUTCDate())); // Midnight UTC of due date
    const diffMs = dueUTC - todayUTC;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // Use floor to avoid edge cases
    
    if (diffDays < 0) return { class: 'badge-due', label: ' (vencido)' };
    if (diffDays <= 3) return { class: 'badge-warning', label: ` (vence em ${diffDays}d)` };
    return { class: '', label: '' };
  };

  if (tickets.length === 0) {
    return (
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Nº Chamado</th>
              <th className="hide-mobile">Data Emissão</th>
              <th className="hide-mobile">Pedido</th>
              <th>Nota Fiscal</th>
              <th>Vencimento</th>
              <th>Valor (R$)</th>
              <th className="hide-mobile">Forma Pagto</th>
              <th>Razão Social</th>
              <th className="hide-mobile">CNPJ</th>
              <th className="hide-mobile">Requisitante</th>
              <th className="small hide-mobile">Observação</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="14" className="empty-state">
                {isTrash ? "A lixeira está vazia." : 'Nenhum chamado encontrado.'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const totalPages = Math.ceil(tickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTickets = tickets.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Nº Chamado</th>
            <th className="hide-mobile">Data Emissão</th>
            <th className="hide-mobile">Pedido</th>
            <th>Nota Fiscal</th>
            <th>Vencimento</th>
            <th>Valor (R$)</th>
            <th className="hide-mobile">Forma Pagto</th>
            <th>Razão Social</th>
            <th className="hide-mobile">CNPJ</th>
            <th className="hide-mobile">Requisitante</th>
            <th className="small hide-mobile">Observação</th>
            <th className="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {currentTickets.map(t => {
            const dueInfo = getDueInfo(t.vencimento);
            return (
              <tr key={t.id}>
                <td>
                  <span className={`status-badge status-${(t.situacao || '').toLowerCase().replace(/\s+/g, '-')}`}>
                    {t.situacao}
                  </span>
                </td>
                <td>{t.numero}</td>
                <td className="hide-mobile">{formatDate(t.dataEmissao)}</td>
                <td className="hide-mobile">{t.pedido}</td>
                <td>{t.notaFiscal}</td>
                <td>
                  {formatDate(t.vencimento)}
                  {dueInfo.label && <span className={dueInfo.class}>{dueInfo.label}</span>}
                </td>
                <td>{formatCurrency(t.valor)}</td>
                <td className="hide-mobile">{t.forma}</td>
                <td className="wrap-text">{t.razao}</td>
                <td className="hide-mobile">{t.cnpj}</td>
                <td className="hide-mobile">{t.requisitante}</td>
                <td className="small hide-mobile" title={t.obs}>
                  {t.obs && t.obs.length > 50 ? t.obs.substring(0, 50) + '...' : t.obs}
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    {isTrash ? (
                      <>
                        <button className="action-btn" title="Restaurar" onClick={() => onRestore(t.id)}>
                          <RotateCcw size={16} />
                        </button>
                        <button className="action-btn delete" title="Excluir Definitivo" onClick={() => onPermanentDelete(t.id)}>
                          <XCircle size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="action-btn edit" title="Editar" onClick={() => onEdit(t)}>
                          <Edit size={16} />
                        </button>
                        <button className="action-btn delete" title="Enviar para Lixeira" onClick={() => onDelete(t.id)}>
                          <Trash size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {totalPages > 1 && (
        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, tickets.length)} de {tickets.length} registros
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
              className="sgc-btn-ghost" 
              style={{ padding: '0.5rem', height: 'auto', opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              <ChevronLeft size={18} />
            </button>
            <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
              {currentPage} / {totalPages}
            </span>
            <button 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
              className="sgc-btn-ghost" 
              style={{ padding: '0.5rem', height: 'auto', opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
