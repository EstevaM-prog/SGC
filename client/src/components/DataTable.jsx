import React from 'react';
import { 
  Edit, Trash, RotateCcw, XCircle, ChevronLeft, ChevronRight, 
  Eye, CheckCircle2, AlertCircle, Clock, Banknote, User, Star, ChevronDown 
} from 'lucide-react';

const STATUS_CYCLE = ['Aberto', 'Escriturar', 'Processando', 'Solucionado', 'Cancelado'];

/* ─── Search Highlighter ─── */
const Highlight = ({ text, query }) => {
  if (!query || !text) return <span>{text}</span>;
  const parts = (text + '').split(new RegExp(`(${query})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <mark key={i} style={{ background: '#FDE047', color: '#854D0E', padding: '0 2px', borderRadius: '2px' }}>{part}</mark> 
          : part
      )}
    </span>
  );
};

/* ─── Inline Status Cycle (Click to Change) ─── */
const StatusBadge = ({ currentStatus, onUpdate }) => {
  const handleCycle = (e) => {
    e.stopPropagation();
    const currentIndex = STATUS_CYCLE.indexOf(currentStatus) === -1 ? 0 : STATUS_CYCLE.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % STATUS_CYCLE.length;
    onUpdate(STATUS_CYCLE[nextIndex]);
  };

  return (
    <button 
      className={`dt-status dt-status-${(currentStatus || '').toLowerCase().replace(/\s+/g, '-')} is-clickable`}
      onClick={handleCycle}
      title="Clique para mudar o status"
      style={{ cursor: 'pointer', transition: 'all 0.2s', border: 'none' }}
    >
      <span className={`dt-status-dot ${(currentStatus || '').toLowerCase()}`} style={{ marginRight: 6 }} />
      {currentStatus}
    </button>
  );
};

export default function DataTable({ 
  tickets, 
  onEdit, 
  onDelete, 
  onPreview,
  onUpdateStatus,
  selectedIds = new Set(),
  onToggleSelect,
  onSelectAll,
  isCompact = false,
  visibleColumns = new Set(['status', 'numero', 'notaFiscal', 'vencimento', 'valor', 'razao', 'actions']),
  query = '',
  activeRowId = null,
  activeAction = 0,
  currentPage = 1,
  onPageChange
}) {
  const itemsPerPage = isCompact ? 20 : 10;

  const formatCurrency = (val) => {
    if (val === null || val === undefined || isNaN(val)) return 'R$ 0,00';
    return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (iso) => {
    if (!iso) return '--';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    } catch { return iso; }
  };

  const getDueInfo = (vencimento) => {
    if (!vencimento) return { class: '', label: '', icon: null };
    const v = new Date(vencimento);
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const dueUTC = new Date(Date.UTC(v.getUTCFullYear(), v.getUTCMonth(), v.getUTCDate()));
    const diffMs = dueUTC - todayUTC;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { class: 'due-overdue', label: 'Vencido', icon: <AlertCircle size={10} /> };
    if (diffDays <= 3) return { class: 'due-soon', label: `Vence em ${diffDays}d`, icon: <Clock size={10} /> };
    return { class: 'due-ok', label: '', icon: null };
  };

  if (tickets.length === 0) {
    return (
      <div className="dt-empty">
        <AlertCircle size={32} />
        <p>Nenhum chamado encontrado.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(tickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTickets = tickets.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => onPageChange(Math.max(currentPage - 1, 1));
  const handleNextPage = () => onPageChange(Math.min(currentPage + 1, totalPages));

  const allSelected = currentTickets.length > 0 && currentTickets.every(t => selectedIds.has(t.id));

  return (
    <div className={`dt-container ${isCompact ? 'is-compact' : ''}`}>
      <div className="dt-table-wrapper">
        <table className="dt-table">
          <thead>
            <tr>
              <th className="dt-col-select">
                <input type="checkbox" checked={allSelected} onChange={(e) => onSelectAll(currentTickets.map(t=>t.id), e.target.checked)} className="dt-checkbox" />
              </th>
              {visibleColumns.has('status') && <th>Status</th>}
              {visibleColumns.has('numero') && <th>Nº Chamado</th>}
              {visibleColumns.has('notaFiscal') && <th className="hide-tablet">Nota Fiscal</th>}
              {visibleColumns.has('vencimento') && <th>Vencimento</th>}
              {visibleColumns.has('valor') && <th>Valor</th>}
              {visibleColumns.has('razao') && <th className="hide-mobile">Razão Social</th>}
              {visibleColumns.has('actions') && <th className="text-right">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {currentTickets.map(t => {
              const dueInfo = getDueInfo(t.vencimento);
              const isSelected = selectedIds.has(t.id);
              const isActive = activeRowId === t.id;
              const isHighValue = (t.valor || 0) > 10000;
              const isCancelled = t.situacao === 'Cancelado';
              
              return (
                <tr 
                  key={t.id} 
                  className={`${isSelected ? 'selected' : ''} ${isActive ? 'active-nav' : ''} ${isHighValue ? 'row-high-value' : ''} ${isCancelled ? 'row-cancelled' : ''}`}
                  onClick={() => onPreview(t)}
                >
                  <td className="dt-col-select">
                    <input type="checkbox" checked={isSelected} onChange={(e) => { e.stopPropagation(); onToggleSelect(t.id); }} className="dt-checkbox" />
                  </td>
                  {visibleColumns.has('status') && (
                    <td><StatusBadge currentStatus={t.situacao} onUpdate={(ns) => onUpdateStatus(t.id, ns)} /></td>
                  )}
                  {visibleColumns.has('numero') && (
                    <td className="dt-bold">#{t.numero} {isHighValue && <Star size={10} fill="#FFD700" color="#FFD700" />}</td>
                  )}
                  {visibleColumns.has('notaFiscal') && <td className="hide-tablet"><Highlight text={t.notaFiscal} query={query} /></td>}
                  {visibleColumns.has('vencimento') && (
                    <td>
                      <div className="dt-due-cell">
                        <span>{formatDate(t.vencimento)}</span>
                        {dueInfo.label && !isCompact && <span className={`dt-due-badge ${dueInfo.class}`}>{dueInfo.icon} {dueInfo.label}</span>}
                      </div>
                    </td>
                  )}
                  {visibleColumns.has('valor') && <td className="dt-price">{formatCurrency(t.valor)}</td>}
                  {visibleColumns.has('razao') && <td className="hide-mobile dt-truncate" title={t.razao}><Highlight text={t.razao} query={query} /></td>}
                  {visibleColumns.has('actions') && (
                    <td className="text-right">
                      <div className="dt-actions">
                        <button className={`dt-btn view ${isActive && activeAction === 0 ? 'kb-focus' : ''}`} onClick={(e) => { e.stopPropagation(); onPreview(t); }}><Eye size={14} /></button>
                        <button className={`dt-btn edit ${isActive && activeAction === 1 ? 'kb-focus' : ''}`} onClick={(e) => { e.stopPropagation(); onEdit(t); }}><Edit size={14} /></button>
                        <button className={`dt-btn delete ${isActive && activeAction === 2 ? 'kb-focus' : ''}`} onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}><Trash size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="dt-pagination">
          <div className="dt-pag-info">Mostrando <strong>{startIndex+1}</strong>-<strong>{Math.min(startIndex+itemsPerPage, tickets.length)}</strong> de {tickets.length}</div>
          <div className="dt-pag-controls">
            <button onClick={handlePrevPage} disabled={currentPage === 1} className="dt-pag-btn"><ChevronLeft size={16} /></button>
            <div className="dt-pag-pages">Página <strong>{currentPage}</strong> de {totalPages}</div>
            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="dt-pag-btn"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
