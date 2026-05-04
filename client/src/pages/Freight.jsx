import React, { useState, useEffect } from 'react';
import { Edit, Trash, RotateCcw, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import TableActions from '../components/TableActions';

const EMPTY_FORM = {
  situacao: '', numero: '', solicitacao: '', pedido: '',
  notaFiscal: '', dacte: '', valor: '',
  razao: '', cnpj: '', requisitante: '', obs: ''
};

export default function Freight({ tickets, addTicket, updateTicket, softDeleteTicket, restoreTicket, permanentDeleteTicket, addActivity }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Restore draft
  useEffect(() => {
    if (!editingId) {
      const saved = localStorage.getItem('sgc_freight_draft');
      if (saved) { try { setFormData(JSON.parse(saved)); } catch (e) { } }
    }
  }, [editingId]);

  // Save draft
  useEffect(() => {
    if (!editingId) {
      localStorage.setItem('sgc_freight_draft', JSON.stringify(formData));
    }
  }, [formData, editingId]);

  const active = tickets.filter(t => !t.deleted);
  const trash = tickets.filter(t => t.deleted);
  const filtered = active.filter(t => !statusFilter || t.situacao === statusFilter);

  const formatCurrency = (v) => isNaN(v) ? '' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatDate = (d) => {
    if (!d) return '';
    try {
      const date = new Date(d);
      const day = date.getUTCDate().toString().padStart(2, '0');
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    } catch { return d; }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === 'cnpj') {
      let v = value.replace(/\D/g, '').slice(0, 14);
      if (v.length >= 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
      else if (v.length >= 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4}).*/, '$1.$2.$3/$4');
      else if (v.length >= 5) v = v.replace(/^(\d{2})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
      else if (v.length >= 3) v = v.replace(/^(\d{2})(\d{0,3}).*/, '$1.$2');
      setFormData(p => ({ ...p, [id]: v })); return;
    }
    if (id === 'valor') {
      let v = value.replace(/\D/g, '');
      if (!v) { setFormData(p => ({ ...p, [id]: '' })); return; }
      while (v.length < 3) v = '0' + v;
      const fmt = v.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + v.slice(-2);
      setFormData(p => ({ ...p, [id]: fmt })); return;
    }
    setFormData(p => ({ ...p, [id]: value }));
  };

  const handleEdit = (t) => {
    setFormData({ ...t, valor: t.valor ? Number(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '' });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading(editingId ? 'Atualizando frete...' : 'Salvando novo frete...');

    try {
      const parsedValor = parseFloat(formData.valor.replace(/\./g, '').replace(',', '.'));
      const payload = { ...formData, valor: isNaN(parsedValor) ? 0 : parsedValor };

      await new Promise(r => setTimeout(r, 800)); // Simulando delay

      if (editingId) {
        await updateTicket(editingId, payload);
      } else {
        await addTicket(payload);
      }

      if (addActivity) {
        addActivity({
          text: editingId ? `Frete #${payload.numero} Atualizado` : `Novo Frete #${payload.numero} Criado`,
          description: `Frete para ${payload.razao} no valor de R$ ${formData.valor}. Status: ${payload.situacao}. Solicitante: ${payload.requisitante}`,
          user: payload.requisitante,
          type: editingId ? 'warning' : 'success',
          iconType: 'resolved'
        });
      }

      toast.success("Criado com sucesso!", { id: loadingToast });
      setShowForm(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);
      if (!editingId) localStorage.removeItem('sgc_freight_draft');
    } catch (err) {
      console.error(err);
      toast.error("Erro no chamado!", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelForm = () => { setShowForm(false); setEditingId(null); setFormData(EMPTY_FORM); };

  /* ─── LIST VIEW ─── */
  if (!showForm) return (
    <section className="view-section active">
      <div className="section-header">
        <div>
          <h2 className="section-title">{showTrash ? 'Lixeira – Fretes' : 'Fretes'}</h2>
          <p className="section-subtitle">{showTrash ? 'Itens excluídos' : 'Gestão de transportes e fretes'}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-outline" onClick={() => setShowTrash(v => !v)}>
            {showTrash ? 'Voltar à Lista' : `Lixeira (${trash.length})`}
          </button>
          {!showTrash && <button className="btn-primary" onClick={() => setShowForm(true)}>Novo Frete</button>}
        </div>
      </div>

      {!showTrash && (
        <div className="filter-section-container" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <label className="filter-label text-xs font-semibold uppercase text-muted-foreground">Filtrar por status:</label>
            <select className="custom-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ minWidth: 200, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--input)', color: 'var(--foreground)', marginLeft: 8 }}>
              <option value="">Todos os Status</option>
              <option value="Aberto">Aberto</option>
              <option value="3Orçamento">Falta 3 Orçamento</option>
              <option value="2Orçamento">Falta 2 Orçamento</option>
              <option value="1Orçamento">Falta 1 Orçamento</option>
              <option value="Contratado">Contratado</option>
              <option value="Solucionado">Solucionado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <TableActions 
            data={filtered.map(t => {
              const { id, type, deleted, createdAt, updatedAt, ...rest } = t;
              return rest;
            })}
            onImport={(items) => {
              if (window.confirm(`Importar ${items.length} registros para Fretes?`)) {
                items.forEach(item => addTicket({ ...item }));
              }
            }}
            filename="relatorio-fretes"
          />
        </div>
      )}

      <div className="card">
        {(() => {
          const displayList = showTrash ? trash : filtered;
          const totalPages = Math.ceil(displayList.length / itemsPerPage);
          const startIndex = (currentPage - 1) * itemsPerPage;
          const currentItems = displayList.slice(startIndex, startIndex + itemsPerPage);
          
          const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
          const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

          return (
            <>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr>
                    <th>Status</th><th>Nº Chamado</th><th>Nº Solicitação</th><th>Pedido</th>
                    <th>Nota Fiscal</th><th>Dacte</th><th>Valor (R$)</th>
                    <th>Razão Social</th><th>CNPJ</th><th>Requisitante</th>
                    <th className="small">Observação</th><th className="text-right">Ações</th>
                  </tr></thead>
                  <tbody>
                    {displayList.length === 0
                      ? <tr><td colSpan="12" className="empty-state">{showTrash ? 'Lixeira vazia.' : 'Nenhum frete cadastrado. Clique em "Novo Frete" para começar.'}</td></tr>
                      : currentItems.map(t => (
                        <tr key={t.id}>
                          <td><span className={`status-badge status-${(t.situacao || '').toLowerCase().replace(/\s+/g, '-')}`}>{t.situacao}</span></td>
                          <td>{t.numero}</td><td>{t.solicitacao}</td><td>{t.pedido}</td>
                          <td>{t.notaFiscal}</td><td>{t.dacte}</td>
                          <td>{formatCurrency(t.valor)}</td>
                          <td>{t.razao}</td><td>{t.cnpj}</td><td>{t.requisitante}</td>
                          <td className="small" title={t.obs}>{(t.obs || '').length > 60 ? t.obs.slice(0, 60) + '…' : t.obs}</td>
                          <td className="actions-cell"><div className="action-buttons">
                            {showTrash ? <>
                              <button className="action-btn" title="Restaurar" onClick={() => restoreTicket(t.id)}><RotateCcw size={16} /></button>
                              <button className="action-btn delete" title="Excluir" onClick={() => permanentDeleteTicket(t.id)}><XCircle size={16} /></button>
                            </> : <>
                              <button className="action-btn edit" title="Editar" onClick={() => handleEdit(t)}><Edit size={16} /></button>
                              <button className="action-btn delete" title="Lixeira" onClick={() => softDeleteTicket(t.id)}><Trash size={16} /></button>
                            </>}
                          </div></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              
              {totalPages > 1 && (
                <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                    Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, displayList.length)} de {displayList.length} registros
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={handlePrevPage} 
                      disabled={currentPage === 1}
                      className="btn-outline" 
                      style={{ padding: '0.5rem 1rem', height: 'auto', opacity: currentPage === 1 ? 0.5 : 1 }}
                    >
                      Anterior
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
                      {currentPage} / {totalPages}
                    </span>
                    <button 
                      onClick={handleNextPage} 
                      disabled={currentPage === totalPages}
                      className="btn-outline" 
                      style={{ padding: '0.5rem 1rem', height: 'auto', opacity: currentPage === totalPages ? 0.5 : 1 }}
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </section>
  );

  /* ─── FORM VIEW ─── */
  return (
    <section className="view-section active">
      <div className="form-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">{editingId ? 'Editar Frete' : 'Novo Frete'}</h2>
            <p className="section-subtitle">Preencha as informações do frete abaixo</p>
          </div>
        </div>
        <form className="card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="situacao">Status *</label>
              <select id="situacao" value={formData.situacao} onChange={handleChange} required disabled={isSubmitting}>
                <option value="" disabled>Selecione o status</option>
                <option value="Aberto">Aberto</option>
                <option value="3Orçamento">Falta 3 Orçamento</option>
                <option value="2Orçamento">Falta 2 Orçamento</option>
                <option value="1Orçamento">Falta 1 Orçamento</option>
                <option value="Contratado">Contratado</option>
                <option value="Solucionado">Solucionado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="numero">Nº Chamado *</label>
              <input id="numero" value={formData.numero} onChange={handleChange} placeholder="Ex: FRT-2025-001" required disabled={isSubmitting} />
            </div>
            <div className="form-group">
              <label htmlFor="solicitacao">Nº Solicitação</label>
              <input id="solicitacao" value={formData.solicitacao} onChange={handleChange} placeholder="Nº da solicitação" disabled={isSubmitting} />
            </div>
            <div className="form-group">
              <label htmlFor="pedido">Pedido</label>
              <input id="pedido" value={formData.pedido} onChange={handleChange} placeholder="Número do pedido" disabled={isSubmitting} />
            </div>
            <div className="form-group">
              <label htmlFor="notaFiscal">Nota Fiscal</label>
              <input id="notaFiscal" value={formData.notaFiscal} onChange={handleChange} placeholder="Número da NF" disabled={isSubmitting} />
            </div>
            <div className="form-group">
              <label htmlFor="dacte">Dacte</label>
              <input id="dacte" value={formData.dacte} onChange={handleChange} placeholder="Número do CT-e" disabled={isSubmitting} />
            </div>
            <div className="form-group">
              <label htmlFor="valor">Valor (R$) *</label>
              <input id="valor" value={formData.valor} onChange={handleChange} placeholder="0,00" required disabled={isSubmitting} />
            </div>
            <div className="form-group">
              <label htmlFor="razao">Razão Social *</label>
              <input id="razao" value={formData.razao} onChange={handleChange} placeholder="Transportadora" required disabled={isSubmitting} />
            </div>
            <div className="form-group">
              <label htmlFor="cnpj">CNPJ *</label>
              <input id="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" maxLength="18" required disabled={isSubmitting} />
            </div>
            <div className="form-group full-width">
              <label htmlFor="requisitante">Requisitante</label>
              <input id="requisitante" value={formData.requisitante} onChange={handleChange} placeholder="Nome completo" disabled={isSubmitting} />
            </div>
            <div className="form-group full-width">
              <label htmlFor="obs">Observação</label>
              <textarea id="obs" value={formData.obs} onChange={handleChange} rows="3" placeholder="Notas adicionais..." disabled={isSubmitting} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={cancelForm} disabled={isSubmitting}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
               {isSubmitting ? 'Salvando...' : 'Salvar Frete'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
