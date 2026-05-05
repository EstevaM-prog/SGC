import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Plus, LayoutGrid, Table, ChevronRight, ChevronLeft,
  Edit, Trash2, XCircle, Search, SlidersHorizontal,
  ArrowUpDown, FileText, Clock, Banknote, User,
  Hash, Calendar, CheckCircle2, AlertCircle, Inbox,
  Eye, Filter, RotateCcw, X, Download, Share2, Building2, Briefcase,
  Columns, Trello, Star, MoreVertical, History, Bookmark, MessageSquare,
  Copy, FileDown, ExternalLink, TrendingUp, ChevronDown, List, Layers, Trash,
  Monitor, GripVertical, Calculator, Receipt
} from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import TableActions from '../components/TableActions';
import '../styles/pages/TicketList.css';

const STATUS_CYCLE = ['Aberto', 'Escriturar', 'Processando', 'Solucionado', 'Cancelado'];

const STATUS_CONFIG = {
  aberto:      { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  label: 'Aberto' },
  processando: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  label: 'Processando' },
  escriturar:  { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',  label: 'Escriturar' },
  solucionado: { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  label: 'Solucionado' },
  cancelado:   { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   label: 'Cancelado' },
};

const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

/* ─── Search Highlighter ─── */
const Highlight = ({ text, query }) => {
  if (!query || !text) return <span>{text}</span>;
  const parts = (text + '').split(new RegExp(`(${query})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <mark key={i} className="tl-highlight">{part}</mark> 
          : part
      )}
    </span>
  );
};

const formatDate = (iso, full = false) => {
  if (!iso) return '--';
  try {
    const options = full 
      ? { day: '2-digit', month: 'long', year: 'numeric' }
      : { day: '2-digit', month: 'short' };
    return new Date(iso).toLocaleDateString('pt-BR', options);
  } catch { return '--'; }
};

/* ─── Sparkline Component ─── */
const MiniTrend = ({ data }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="tl-mini-trend">
      {data.map((v, i) => (
        <div key={i} className="tl-trend-bar" style={{ height: `${(v / max) * 100}%` }} title={`${v} chamados`} />
      ))}
    </div>
  );
};

/* ─── Status Cycle Button ─── */
const StatusCycleBtn = ({ currentStatus, onUpdate }) => {
  const st = STATUS_CONFIG[(currentStatus || '').toLowerCase()] || STATUS_CONFIG.aberto;
  const handleCycle = (e) => {
    e.stopPropagation();
    const currentIndex = STATUS_CYCLE.indexOf(currentStatus) === -1 ? 0 : STATUS_CYCLE.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % STATUS_CYCLE.length;
    onUpdate(STATUS_CYCLE[nextIndex]);
  };
  return (
    <button className="tl-card-status clickable" style={{ background: st.bg, color: st.color, border: 'none' }} onClick={handleCycle}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.color }} />
      {currentStatus}
    </button>
  );
};

/* ─── Audit Trail Item ─── */
const AuditItem = ({ entry }) => (
  <div className="tl-audit-item">
    <div className="tl-audit-icon"><History size={12} /></div>
    <div className="tl-audit-details">
      <p className="tl-audit-text"><strong>{entry.user || 'Sistema'}</strong> {entry.action}</p>
      <span className="tl-audit-date">{new Date(entry.date).toLocaleString('pt-BR')}</span>
    </div>
  </div>
);

/* ─── Ticket Preview ─── */
const TicketPreview = ({ ticket, onClose, onEdit, onDelete, onUpdateTicket, isSplit = false }) => {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('notes');
  useEffect(() => { if (ticket) setNotes(ticket.comments || []); }, [ticket]);
  if (!ticket) return isSplit ? <div className="tl-preview-placeholder"><Inbox size={48} /><p>Selecione um chamado</p></div> : null;
  const st = STATUS_CONFIG[(ticket.situacao || '').toLowerCase()] || STATUS_CONFIG.aberto;
  const handleAddNote = () => {
    if (!note.trim()) return;
    const newNote = { id: Date.now(), text: note, user: 'Você', date: new Date().toISOString() };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes); setNote('');
    onUpdateTicket?.(ticket.id, { comments: updatedNotes });
    toast.success('Nota adicionada!');
  };
  const handleDeleteNote = (noteId) => {
    const updatedNotes = notes.filter(n => n.id !== noteId);
    setNotes(updatedNotes);
    onUpdateTicket?.(ticket.id, { comments: updatedNotes });
    toast.success('Nota excluída');
  };
  return (
    <div className={isSplit ? "tl-split-preview" : "tl-drawer-overlay"} onClick={!isSplit ? onClose : undefined}>
      <div className={isSplit ? "tl-split-inner" : "tl-drawer"} onClick={e => e.stopPropagation()}>
        <div className="tl-drawer-header">
          <div><span className="tl-drawer-subtitle">Detalhes</span><h2 className="tl-drawer-title">#{ticket.numero}</h2></div>
          {!isSplit && <button className="tl-drawer-close" onClick={onClose}><X size={20} /></button>}
        </div>
        <div className="tl-drawer-content">
          <div className="tl-drawer-section">
            <div className="tl-drawer-status-pill" style={{ background: st.bg, color: st.color }}><CheckCircle2 size={14} /> {ticket.situacao}</div>
            <div className="tl-drawer-price-large">{fmt(ticket.valor)}</div>
          </div>
          <div className="tl-drawer-grid">
            <div className="tl-drawer-item"><span className="tl-drawer-label"><User size={12} /> Requisitante</span><span className="tl-drawer-value">{ticket.requisitante}</span></div>
            <div className="tl-drawer-item"><span className="tl-drawer-label"><Building2 size={12} /> Razão Social</span><span className="tl-drawer-value">{ticket.razao}</span></div>
            <div className="tl-drawer-item"><span className="tl-drawer-label"><FileText size={12} /> Nota Fiscal</span><span className="tl-drawer-value">{ticket.notaFiscal}</span></div>
            <div className="tl-drawer-item"><span className="tl-drawer-label"><Calendar size={12} /> Vencimento</span><span className="tl-drawer-value">{formatDate(ticket.vencimento, true)}</span></div>
          </div>
          <div className="tl-drawer-tabs">
            <button className={`tl-tab-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>Notas</button>
            <button className={`tl-tab-btn ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>Histórico</button>
          </div>
          {activeTab === 'notes' ? (
            <div className="tl-comments-section">
              <div className="tl-comment-input-wrap">
                <textarea placeholder="Nova nota..." value={note} onChange={e => setNote(e.target.value)} />
                <button onClick={handleAddNote} className="sgc-btn-primary">Salvar</button>
              </div>
              <div className="tl-comments-list">
                {notes.map(n => (
                  <div key={n.id} className="tl-comment-bubble">
                    <div className="tl-comment-header">
                      <strong>{n.user}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <button className="tl-comment-delete" onClick={() => handleDeleteNote(n.id)}><Trash2 size={10} /></button>
                      </div>
                    </div>
                    <p>{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="tl-audit-trail">
              {ticket.history?.map((entry, idx) => <AuditItem key={idx} entry={entry} />)}
            </div>
          )}
        </div>
        <div className="tl-drawer-footer">
          <button className="sgc-btn-outline" onClick={() => onEdit(ticket)} style={{ flex: 1 }}>Editar</button>
          <button className="sgc-btn-outline danger" onClick={() => { onDelete(ticket.id); if(!isSplit) onClose(); }} style={{ flex: 1 }}>Excluir</button>
        </div>
      </div>
    </div>
  );
};

/* ─── Kanban View ─── */
const KanbanView = ({ tickets, onPreview, onUpdateStatus }) => {
  return (
    <div className="tl-kanban">
      {STATUS_CYCLE.map(status => {
        const columnTickets = tickets.filter(t => t.situacao === status);
        const st = STATUS_CONFIG[status.toLowerCase()] || STATUS_CONFIG.aberto;
        return (
          <div 
            key={status} className="tl-kanban-col"
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
            onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
            onDrop={(e) => {
              e.preventDefault(); e.currentTarget.classList.remove('drag-over');
              const id = e.dataTransfer.getData('ticketId');
              if (id) onUpdateStatus(id, status);
            }}
          >
            <div className="tl-kanban-col-header" style={{ borderTopColor: st.color }}>
              <div className="tl-kanban-col-title">{status}<span className="tl-kanban-col-count">{columnTickets.length}</span></div>
            </div>
            <div className="tl-kanban-col-cards">
              {columnTickets.map(t => (
                <div key={t.id} className="tl-kanban-card" onClick={() => onPreview(t)} draggable onDragStart={(e) => e.dataTransfer.setData('ticketId', t.id)}>
                  <div className="tl-kanban-card-top"><span className="tl-kanban-card-num">#{t.numero}</span><span className="tl-kanban-card-price">{fmt(t.valor)}</span></div>
                  <p className="tl-kanban-card-razao">{t.razao}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Card Component ─── */
const TicketCard = ({ ticket, onEdit, onDelete, onPreview, onUpdateStatus, selected, onSelect, query, isActive, activeAction }) => {
  return (
    <div className={`tl-card ${selected ? 'selected' : ''} ${isActive ? 'active-nav' : ''}`} onClick={() => onPreview(ticket)}>
      <div className="tl-card-top">
        <input type="checkbox" checked={selected} onChange={(e) => { e.stopPropagation(); onSelect(ticket.id); }} className="tl-card-checkbox" />
        <span className="tl-card-number">#{ticket.numero}</span>
        <div style={{ flex: 1 }} />
        <StatusCycleBtn currentStatus={ticket.situacao} onUpdate={(ns) => onUpdateStatus(ticket.id, ns)} />
      </div>
      <div className="tl-card-razao"><Highlight text={ticket.razao} query={query} /></div>
      <div className="tl-card-bottom">
        <span className="tl-card-price">{fmt(ticket.valor)}</span>
        <div className="tl-card-actions" onClick={e => e.stopPropagation()}>
          <button className={`tl-card-action-btn ${isActive && activeAction === 0 ? 'kb-focus' : ''}`} onClick={() => onPreview(ticket)}><Eye size={13} /></button>
          <button className={`tl-card-action-btn ${isActive && activeAction === 1 ? 'kb-focus' : ''}`} onClick={() => onEdit(ticket)}><Edit size={13} /></button>
          <button className={`tl-card-action-btn ${isActive && activeAction === 2 ? 'kb-focus' : ''}`} onClick={() => onDelete(ticket.id)}><Trash2 size={13} /></button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
export default function TicketList({ tickets = [], searchTerm, onNewTicket, onAddTicket, onEdit, onDelete, onUpdateTicket }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [previewTicket, setPreviewTicket] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeAction, setActiveAction] = useState(0); 
  const [currentPage, setCurrentPage] = useState(1);
  const [splitWidth, setSplitWidth] = useState(40);
  const isResizing = useRef(false);
  const itemsPerPage = isCompact ? 20 : 10;

  const validTickets = useMemo(() => tickets.filter(r => !r.deleted && r.type !== 'cnpj_record'), [tickets]);

  const filtered = useMemo(() => {
    return validTickets.filter(t => {
      if (statusFilter && t.situacao !== statusFilter) return false;
      if (dateRange.start && new Date(t.dataEmissao) < new Date(dateRange.start)) return false;
      if (dateRange.end && new Date(t.dataEmissao) > new Date(dateRange.end)) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (t.numero?.toLowerCase().includes(q) || t.razao?.toLowerCase().includes(q));
      }
      return true;
    });
  }, [validTickets, statusFilter, searchTerm, dateRange]);

  const currentTickets = useMemo(() => {
    return filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totals = useMemo(() => {
    const page = currentTickets.reduce((s, t) => s + (Number(t.valor) || 0), 0);
    const filter = filtered.reduce((s, t) => s + (Number(t.valor) || 0), 0);
    return { page, filter };
  }, [currentTickets, filtered]);

  const statusCounts = useMemo(() => {
    const counts = {};
    STATUS_CYCLE.forEach(s => { counts[s] = validTickets.filter(t => t.situacao === s).length; });
    counts._total = validTickets.length;
    return counts;
  }, [validTickets]);

  const trendData = useMemo(() => {
    const days = Array(7).fill(0);
    validTickets.forEach(t => {
      const diff = Math.floor((new Date() - new Date(t.createdAt)) / 86400000);
      if (diff >= 0 && diff < 7) days[6 - diff]++;
    });
    return days;
  }, [validTickets]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const activeRowId = filtered[activeIndex]?.id;

  const handleUpdateStatus = (id, newStatus) => { 
    const ticket = validTickets.find(t => t.id === id);
    const history = [...(ticket.history || []), { user: 'Você', action: `alterou status para ${newStatus}`, date: new Date().toISOString() }];
    onUpdateTicket(id, { situacao: newStatus, history }); 
    toast.success(`Status: ${newStatus}`);
  };

  const startResizing = useCallback(() => { isResizing.current = true; document.body.style.cursor = 'col-resize'; }, []);
  const stopResizing = useCallback(() => { isResizing.current = false; document.body.style.cursor = 'default'; }, []);
  const resize = useCallback((e) => {
    if (!isResizing.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) setSplitWidth(newWidth);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => { window.removeEventListener('mousemove', resize); window.removeEventListener('mouseup', stopResizing); };
  }, [resize, stopResizing]);

  /* ── Keyboard Shortcuts ── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(prev => Math.min(prev + 1, filtered.length - 1)); setActiveAction(0); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(prev => Math.max(prev - 1, 0)); setActiveAction(0); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); setActiveAction(prev => Math.min(prev + 1, 2)); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); setActiveAction(prev => Math.max(prev - 1, 0)); }
      else if (e.key === 'Tab') { e.preventDefault(); setCurrentPage(prev => (prev % totalPages) + 1); setActiveIndex(-1); }
      else if (e.key === 'Enter' && activeIndex !== -1) {
        const t = filtered[activeIndex];
        if (activeAction === 0) setPreviewTicket(t);
        else if (activeAction === 1) onEdit(t);
        else if (activeAction === 2) onDelete(t.id);
      }
      else if (e.key === 'Escape') { setPreviewTicket(null); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtered, activeIndex, activeAction, totalPages, onEdit, onDelete]);

  return (
    <section className="view-section active">
      <div className={`tl-wrapper ${isSplitView ? 'split-active' : ''}`}>
        
        <div className="tl-performance-bar">
          <div className="tl-perf-item">
            <div className="tl-perf-info"><span className="tl-perf-label">Soma da Página</span><span className="tl-perf-val">{fmt(totals.page)}</span></div>
            <Calculator size={22} className="tl-perf-icon" style={{ color: 'var(--primary)' }} />
          </div>
          <div className="tl-perf-divider" />
          <div className="tl-perf-item">
            <div className="tl-perf-info"><span className="tl-perf-label">Total (Filtro)</span><span className="tl-perf-val" style={{ color: 'var(--primary)' }}>{fmt(totals.filter)}</span></div>
            <Banknote size={22} className="tl-perf-icon" style={{ color: 'var(--primary)' }} />
          </div>
          <div className="tl-perf-divider" />
          <div className="tl-perf-item">
            <div className="tl-perf-info"><span className="tl-perf-label">Eficiência</span><span className="tl-perf-val">{Math.round((validTickets.filter(t=>t.situacao==='Solucionado').length / validTickets.length || 0) * 100)}%</span></div>
            <TrendingUp size={24} className="tl-perf-icon" />
          </div>
          <div className="tl-perf-divider hide-mobile" />
          <div className="tl-perf-item hide-mobile">
            <div className="tl-perf-info"><span className="tl-perf-label">Atividade</span><span className="tl-perf-val">{trendData.reduce((a,b)=>a+b, 0)} Novos</span></div>
            <MiniTrend data={trendData} />
          </div>
        </div>

        <div className="tl-topbar">
          <div className="tl-title-area"><h1>Chamados</h1><p>{filtered.length} registros</p></div>
          <div className="tl-actions">
            <button className="sgc-btn-ghost" onClick={() => setShowFilters(!showFilters)} title="Filtros"><Filter size={18} /></button>
            <TableActions data={filtered} onImport={() => {}} filename="chamados" />
            <button className="sgc-btn-primary" onClick={onNewTicket}><Plus size={15} /> Novo</button>
          </div>
        </div>

        {showFilters && (
          <div className="tl-advanced-filters">
            <div className="tl-filter-group">
              <label>Período de Emissão</label>
              <div className="tl-date-inputs">
                <input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))} />
                <span>até</span>
                <input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))} />
              </div>
            </div>
            <button className="tl-filter-clear" onClick={() => setDateRange({ start: '', end: '' })}>Limpar Filtros</button>
          </div>
        )}

        <div className="tl-stats-strip">
          <div className={`tl-stat-chip ${!statusFilter ? 'active' : ''}`} onClick={() => setStatusFilter('')}>
            <span className="tl-stat-dot" style={{ background: 'var(--primary)' }} />
            <div className="tl-stat-info"><span className="tl-stat-count">{statusCounts._total}</span><span className="tl-stat-label">Todos</span></div>
          </div>
          {STATUS_CYCLE.map(s => {
            const cfg = STATUS_CONFIG[s.toLowerCase()] || { color: '#ccc' };
            return (
              <div key={s} className={`tl-stat-chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                <span className="tl-stat-dot" style={{ background: cfg.color }} />
                <div className="tl-stat-info"><span className="tl-stat-count">{statusCounts[s] || 0}</span><span className="tl-stat-label">{s}</span></div>
              </div>
            );
          })}
        </div>

        <div className="tl-toolbar">
          <div className="tl-toolbar-left">
            <div className="tl-view-toggle">
              <button className={`tl-view-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')} title="Tabela"><Table size={14} /></button>
              <button className={`tl-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Cards"><LayoutGrid size={14} /></button>
              <button className={`tl-view-btn ${viewMode === 'kanban' ? 'active' : ''}`} onClick={() => setViewMode('kanban')} title="Kanban"><Trello size={14} /></button>
            </div>
            <div className="tl-divider-v" />
            <button className={`tl-compact-toggle ${isSplitView ? 'active' : ''}`} onClick={() => setIsSplitView(!isSplitView)}><Monitor size={14} /> <span>Split View</span></button>
            <button className={`tl-compact-toggle ${isCompact ? 'active' : ''}`} onClick={() => setIsCompact(!isCompact)}><Layers size={14} /> <span>Compacto</span></button>
            
            {selectedIds.size > 0 && (
              <>
                <div className="tl-divider-v" />
                <div className="tl-bulk-bar">
                  <div className="tl-bulk-info"><strong>{selectedIds.size}</strong> itens</div>
                  <div className="tl-bulk-btns">
                    <button className="tl-bulk-btn danger" onClick={() => { Array.from(selectedIds).forEach(id => onDelete(id)); setSelectedIds(new Set()); toast.success('Removidos'); }}><Trash size={14}/></button>
                    <button className="tl-bulk-btn ghost" onClick={() => setSelectedIds(new Set())}><X size={14}/></button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="tl-main-content" style={isSplitView ? { gridTemplateColumns: `${splitWidth}% 10px 1fr` } : {}}>
          <div className="tl-list-area">
            <div className="tl-view-content" key={viewMode}>
              {viewMode === 'table' ? (
                <DataTable tickets={filtered} onEdit={onEdit} onDelete={onDelete} onPreview={setPreviewTicket} onUpdateStatus={handleUpdateStatus} query={searchTerm} selectedIds={selectedIds} onToggleSelect={id => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; })} onSelectAll={(ids, c) => setSelectedIds(prev => { const n = new Set(prev); c ? ids.forEach(i=>n.add(i)) : ids.forEach(i=>n.delete(i)); return n; })} isCompact={isCompact} activeRowId={activeRowId} activeAction={activeAction} currentPage={currentPage} onPageChange={setCurrentPage} />
              ) : viewMode === 'grid' ? (
                <div className={`tl-card-grid ${isCompact ? 'compact' : ''}`}>
                  {currentTickets.map((t, idx) => <TicketCard key={t.id} ticket={t} onEdit={onEdit} onDelete={onDelete} onPreview={setPreviewTicket} onUpdateStatus={handleUpdateStatus} query={searchTerm} onSelect={id => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; })} selected={selectedIds.has(t.id)} isActive={activeIndex === (currentPage-1)*itemsPerPage + idx} activeAction={activeAction} />)}
                </div>
              ) : (
                <KanbanView tickets={filtered} onPreview={setPreviewTicket} onUpdateStatus={handleUpdateStatus} />
              )}
            </div>
          </div>
          {isSplitView && (
            <>
              <div className="tl-split-resizer" onMouseDown={startResizing}><GripVertical size={14} /></div>
              <TicketPreview ticket={previewTicket} isSplit={true} onEdit={onEdit} onDelete={onDelete} onUpdateTicket={onUpdateTicket} />
            </>
          )}
        </div>
        {!isSplitView && <TicketPreview ticket={previewTicket} onClose={() => setPreviewTicket(null)} onEdit={onEdit} onDelete={onDelete} onUpdateTicket={onUpdateTicket} />}
      </div>
    </section>
  );
}
