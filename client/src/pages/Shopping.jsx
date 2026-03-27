import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RotateCcw, XCircle, ShoppingCart, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import TableActions from '../components/TableActions';

const EMPTY = {
  situacao:'', numero:'', solicitacao:'', pedido:'',
  prazoEntrega:'', valor:'', prazoPagto:'',
  razao:'', cnpj:'', requisitante:'', obs:''
};

const STATUS = ['Aberto','3Orçamento','2Orçamento','1Orçamento','ParaEntrega','Solucionado','Cancelado'];
const STATUS_LABELS = {
  'Aberto':'Aberto','3Orçamento':'Falta 3 Orçamentos','2Orçamento':'Falta 2 Orçamentos',
  '1Orçamento':'Falta 1 Orçamento','ParaEntrega':'Aguardando Entrega',
  'Solucionado':'Solucionado','Cancelado':'Cancelado',
};

const STATUS_COLOR = {
  'Aberto':'blue','3Orçamento':'amber','2Orçamento':'amber','1Orçamento':'amber',
  'ParaEntrega':'violet','Solucionado':'green','Cancelado':'red',
};

const fmtCur = v => isNaN(v) ? '' : Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const fmtDate = d => {
  if (!d) return '';
  try { const dt=new Date(d); return `${String(dt.getUTCDate()).padStart(2,'0')}/${String(dt.getUTCMonth()+1).padStart(2,'0')}/${dt.getUTCFullYear()}`; }
  catch { return d; }
};

export default function Shopping({ tickets, addTicket, updateTicket, softDeleteTicket, restoreTicket, permanentDeleteTicket, addActivity }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [editingId, setEditingId]       = useState(null);
  const [showTrash, setShowTrash]       = useState(false);
  const [formData, setFormData]         = useState(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!editingId) {
      const s = localStorage.getItem('sgc_shopping_draft');
      if (s) { try { setFormData(JSON.parse(s)); } catch {} }
    }
  }, [editingId]);

  useEffect(() => {
    if (!editingId) localStorage.setItem('sgc_shopping_draft', JSON.stringify(formData));
  }, [formData, editingId]);

  const active   = tickets.filter(t => !t.deleted);
  const trash    = tickets.filter(t => t.deleted);
  const filtered = active.filter(t => !statusFilter || t.situacao === statusFilter);

  const handleChange = e => {
    const { id, value } = e.target;
    if (id === 'cnpj') {
      let v = value.replace(/\D/g,'').slice(0,14);
      if (v.length>=12) v=v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/,'$1.$2.$3/$4-$5');
      else if (v.length>=8) v=v.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4}).*/,'$1.$2.$3/$4');
      else if (v.length>=5) v=v.replace(/^(\d{2})(\d{3})(\d{0,3}).*/,'$1.$2.$3');
      else if (v.length>=3) v=v.replace(/^(\d{2})(\d{0,3}).*/,'$1.$2');
      setFormData(p=>({...p,[id]:v})); return;
    }
    if (id === 'valor') {
      let v = value.replace(/\D/g,'');
      if (!v) { setFormData(p=>({...p,[id]:''})); return; }
      while (v.length<3) v='0'+v;
      const fmt = v.slice(0,-2).replace(/\B(?=(\d{3})+(?!\d))/g,'.')+','+v.slice(-2);
      setFormData(p=>({...p,[id]:fmt})); return;
    }
    setFormData(p=>({...p,[id]:value}));
  };

  const handleEdit = t => {
    const toInput = d => { try { return new Date(d).toISOString().split('T')[0]; } catch { return ''; } };
    setFormData({ ...t, valor: t.valor ? Number(t.valor).toLocaleString('pt-BR',{minimumFractionDigits:2}) : '', prazoEntrega:toInput(t.prazoEntrega), prazoPagto:toInput(t.prazoPagto) });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const id = toast.loading(editingId ? 'Atualizando compra...' : 'Salvando compra...');
    try {
      const parsedValor = parseFloat(formData.valor.replace(/\./g,'').replace(',','.'));
      const toISO = d => d ? new Date(d+'T00:00:00.000Z').toISOString() : null;
      const payload = { ...formData, valor:isNaN(parsedValor)?0:parsedValor, prazoEntrega:toISO(formData.prazoEntrega), prazoPagto:toISO(formData.prazoPagto) };
      await new Promise(r=>setTimeout(r,700));
      if (editingId) await updateTicket(editingId, payload);
      else await addTicket(payload);
      if (addActivity) addActivity({ text: editingId ? `Compra #${payload.numero} Atualizada` : `Nova Compra #${payload.numero}`, description:`${payload.razao} — R$ ${formData.valor}`, type:editingId?'warning':'success' });
      toast.success('Salvo com sucesso!', { id });
      setShowForm(false); setEditingId(null); setFormData(EMPTY);
      if (!editingId) localStorage.removeItem('sgc_shopping_draft');
    } catch { toast.error('Erro ao salvar!', { id }); }
    finally { setIsSubmitting(false); }
  };

  const cancelForm = () => { setShowForm(false); setEditingId(null); setFormData(EMPTY); };

  /* ── LIST VIEW ── */
  if (!showForm) return (
    <section className="view-section active">

      {/* ── Page Header ── */}
      <div className="sgc-page-header">
        <div className="sgc-page-title-block">
          <h1 className="sgc-page-title">{showTrash ? 'Lixeira — Compras' : 'Compras'}</h1>
          <p className="sgc-page-subtitle">{showTrash ? 'Itens excluídos desta seção' : 'Gestão de aquisições e pedidos de compra'}</p>
        </div>
        <div className="sgc-page-actions">
          <TableActions
            data={filtered.map(({id,type,deleted,createdAt,updatedAt,...rest})=>rest)}
            onImport={items => { if(window.confirm(`Importar ${items.length} registros?`)) items.forEach(i=>addTicket({...i})); }}
            filename="relatorio-compras"
          />
          <button className="sgc-btn-outline" onClick={() => setShowTrash(v=>!v)}>
            {showTrash ? '← Voltar à Lista' : `Lixeira (${trash.length})`}
          </button>
          {!showTrash && (
            <button className="sgc-btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16}/> Nova Compra
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      {!showTrash && (
        <div className="sgc-filter-bar">
          <Filter size={14} style={{ color:'#0066FF' }} />
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <button className={`sgc-tab-btn ${!statusFilter?'active':''}`} style={{ height:34, padding:'0 0.75rem', fontSize:'0.8rem' }} onClick={()=>setStatusFilter('')}>
              Todos ({active.length})
            </button>
            {STATUS.map(s => {
              const cnt = active.filter(t=>t.situacao===s).length;
              if (!cnt) return null;
              return (
                <button key={s} className={`sgc-tab-btn ${statusFilter===s?'active':''}`}
                  style={{ height:34, padding:'0 0.75rem', fontSize:'0.8rem' }}
                  onClick={()=>setStatusFilter(statusFilter===s?'':s)}>
                  {STATUS_LABELS[s]} ({cnt})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Table ── */}
      {(showTrash ? trash : filtered).length === 0 ? (
        <div className="sgc-card">
          <div className="sgc-empty">
            <div className="sgc-empty-icon"><ShoppingCart size={28}/></div>
            <span className="sgc-empty-title">{showTrash ? 'Lixeira vazia' : 'Nenhuma compra cadastrada'}</span>
            <span className="sgc-empty-desc">{showTrash ? 'Nenhum item excluído.' : 'Clique em "Nova Compra" para começar.'}</span>
          </div>
        </div>
      ) : (
        <div className="sgc-card" style={{ padding:0, overflow:'hidden' }}>
          <div className="sgc-table-wrap" style={{ border:'none', overflowX:'auto' }}>
            <table className="sgc-table">
              <thead><tr>
                <th>Status</th><th>Nº Chamado</th><th>Solicitação</th><th>Pedido</th>
                <th>Prazo Entrega</th><th>Valor</th><th>Prazo Pagto</th>
                <th>Razão Social</th><th>CNPJ</th><th>Requisitante</th>
                <th>Obs</th><th style={{ textAlign:'right' }}>Ações</th>
              </tr></thead>
              <tbody>
                {(showTrash ? trash : filtered).map(t => (
                  <tr key={t.id}>
                    <td><span className={`sgc-badge ${STATUS_COLOR[t.situacao]||'gray'}`}>{t.situacao}</span></td>
                    <td style={{ fontWeight:600 }}>{t.numero}</td>
                    <td>{t.solicitacao}</td><td>{t.pedido}</td>
                    <td>{fmtDate(t.prazoEntrega)}</td>
                    <td style={{ fontWeight:600, color:'#10B981' }}>{fmtCur(t.valor)}</td>
                    <td>{fmtDate(t.prazoPagto)}</td>
                    <td>{t.razao}</td>
                    <td style={{ fontFamily:'monospace', fontSize:'0.8rem' }}>{t.cnpj}</td>
                    <td>{t.requisitante}</td>
                    <td style={{ maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={t.obs}>{t.obs}</td>
                    <td>
                      <div style={{ display:'flex', justifyContent:'flex-end', gap:4 }}>
                        {showTrash ? (<>
                          <button className="sgc-btn-ghost" style={{ width:32, height:32, padding:0, justifyContent:'center', color:'#10B981' }} onClick={()=>restoreTicket(t.id)} title="Restaurar"><RotateCcw size={14}/></button>
                          <button className="sgc-btn-ghost" style={{ width:32, height:32, padding:0, justifyContent:'center', color:'#ef4444' }} onClick={()=>permanentDeleteTicket(t.id)} title="Excluir"><XCircle size={14}/></button>
                        </>) : (<>
                          <button className="sgc-btn-ghost" style={{ width:32, height:32, padding:0, justifyContent:'center', color:'#0066FF' }} onClick={()=>handleEdit(t)} title="Editar"><Edit size={14}/></button>
                          <button className="sgc-btn-ghost" style={{ width:32, height:32, padding:0, justifyContent:'center', color:'#ef4444' }} onClick={()=>softDeleteTicket(t.id)} title="Excluir"><Trash2 size={14}/></button>
                        </>)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );

  /* ── FORM VIEW ── */
  return (
    <section className="view-section active">
      <div className="sgc-page-header">
        <div className="sgc-page-title-block">
          <h1 className="sgc-page-title">{editingId ? 'Editar Compra' : 'Nova Compra'}</h1>
          <p className="sgc-page-subtitle">Preencha os dados da aquisição</p>
        </div>
        <button className="sgc-btn-outline" onClick={cancelForm}><XCircle size={15}/> Cancelar</button>
      </div>

      <div className="sgc-card">
        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'1rem', marginBottom:'1rem' }}>
            <div className="sgc-form-group">
              <label className="sgc-label">Status *</label>
              <select className="sgc-input" id="situacao" value={formData.situacao} onChange={handleChange} required disabled={isSubmitting}>
                <option value="" disabled>Selecione</option>
                {STATUS.map(s=><option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="sgc-form-group">
              <label className="sgc-label">Nº Chamado *</label>
              <input className="sgc-input" id="numero" value={formData.numero} onChange={handleChange} placeholder="CH-2025-001" required disabled={isSubmitting}/>
            </div>
            <div className="sgc-form-group">
              <label className="sgc-label">Nº Solicitação</label>
              <input className="sgc-input" id="solicitacao" value={formData.solicitacao} onChange={handleChange} placeholder="Nº solicitação" disabled={isSubmitting}/>
            </div>
            <div className="sgc-form-group">
              <label className="sgc-label">Pedido</label>
              <input className="sgc-input" id="pedido" value={formData.pedido} onChange={handleChange} placeholder="Nº pedido" disabled={isSubmitting}/>
            </div>
            <div className="sgc-form-group">
              <label className="sgc-label">Prazo Entrega</label>
              <input className="sgc-input" id="prazoEntrega" type="date" value={formData.prazoEntrega} onChange={handleChange} disabled={isSubmitting}/>
            </div>
            <div className="sgc-form-group">
              <label className="sgc-label">Prazo Pagamento</label>
              <input className="sgc-input" id="prazoPagto" type="date" value={formData.prazoPagto} onChange={handleChange} disabled={isSubmitting}/>
            </div>
            <div className="sgc-form-group">
              <label className="sgc-label">Valor (R$) *</label>
              <input className="sgc-input" id="valor" value={formData.valor} onChange={handleChange} placeholder="0,00" required disabled={isSubmitting}/>
            </div>
            <div className="sgc-form-group">
              <label className="sgc-label">Razão Social *</label>
              <input className="sgc-input" id="razao" value={formData.razao} onChange={handleChange} placeholder="Empresa" required disabled={isSubmitting}/>
            </div>
            <div className="sgc-form-group">
              <label className="sgc-label">CNPJ *</label>
              <input className="sgc-input" id="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" maxLength={18} required disabled={isSubmitting}/>
            </div>
            <div className="sgc-form-group">
              <label className="sgc-label">Requisitante</label>
              <input className="sgc-input" id="requisitante" value={formData.requisitante} onChange={handleChange} placeholder="Nome completo" disabled={isSubmitting}/>
            </div>
          </div>
          <div className="sgc-form-group" style={{ marginBottom:'1.5rem' }}>
            <label className="sgc-label">Observação</label>
            <textarea className="sgc-textarea" id="obs" value={formData.obs} onChange={handleChange} rows={3} placeholder="Notas adicionais..." disabled={isSubmitting}/>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.75rem' }}>
            <button type="button" className="sgc-btn-outline" onClick={cancelForm} disabled={isSubmitting}>Cancelar</button>
            <button type="submit" className="sgc-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Compra'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
