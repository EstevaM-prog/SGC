import React, { useState, useEffect } from 'react';
import { Edit, Trash, RotateCcw, XCircle } from 'lucide-react';

const EMPTY_FORM = {
  situacao: '', numero: '', solicitacao: '', pedido: '',
  prazoEntrega: '', valor: '', prazoPagto: '',
  razao: '', cnpj: '', requisitante: '', obs: ''
};

export default function Shopping({ tickets, addTicket, updateTicket, softDeleteTicket, restoreTicket, permanentDeleteTicket }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Restore draft
  useEffect(() => {
    if (!editingId) {
      const saved = localStorage.getItem('sgc_shopping_draft');
      if (saved) { try { setFormData(JSON.parse(saved)); } catch (e) { } }
    }
  }, [editingId]);

  // Save draft
  useEffect(() => {
    if (!editingId) {
      localStorage.setItem('sgc_shopping_draft', JSON.stringify(formData));
    }
  }, [formData, editingId]);

  const active = tickets.filter(t => !t.deleted);
  const trash = tickets.filter(t => t.deleted);

  const filtered = active.filter(t => !statusFilter || t.situacao === statusFilter);

  const formatCurrency = (v) => isNaN(v) ? '' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatDate = (d) => { try { return new Date(d).toLocaleDateString('pt-BR'); } catch { return d; } };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedValor = parseFloat(formData.valor.replace(/\./g, '').replace(',', '.'));
    const payload = { ...formData, valor: isNaN(parsedValor) ? 0 : parsedValor };
    if (editingId) { updateTicket(editingId, payload); }
    else { addTicket(payload); }
    setShowForm(false); setEditingId(null); setFormData(EMPTY_FORM);
    if (!editingId) localStorage.removeItem('sgc_shopping_draft');
  };

  const cancelForm = () => { setShowForm(false); setEditingId(null); setFormData(EMPTY_FORM); };

  /* ─── LIST VIEW ─── */
  if (!showForm) return (
    <section className="view-section active">
      <div className="section-header">
        <div>
          <h2 className="section-title">{showTrash ? 'Lixeira – Compras' : 'Compras'}</h2>
          <p className="section-subtitle">{showTrash ? 'Itens excluídos' : 'Gestão de aquisições e compras'}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-outline" onClick={() => setShowTrash(v => !v)}>
            {showTrash ? 'Voltar à Lista' : `Lixeira (${trash.length})`}
          </button>

          {!showTrash && <button className="btn-primary" onClick={() => setShowForm(true)}>Nova Compra</button>}
        </div>
      </div>

      {!showTrash && (
        <div className="filter-call list" style={{ marginBottom: '1.5rem' }}>
          <label className="filter-label text-xs font-semibold uppercase text-muted-foreground">Filtrar por status:</label>
          <select className="custom-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ width: 200, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--input)', color: 'var(--foreground)', marginLeft: 8 }}>
            <option value="">Todos</option>
            <option value="Aberto">Aberto</option>
            <option value="Processando">Processando</option>
            <option value="Solucionado">Solucionado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr>
              <th>Status</th><th>Nº Chamado</th><th>Nº Solicitação</th><th>Pedido</th>
              <th>Prazo Entrega</th><th>Valor (R$)</th><th>Prazo Pagto</th>
              <th>Razão Social</th><th>CNPJ</th><th>Requisitante</th>
              <th className="small">Observação</th><th className="text-right">Ações</th>
            </tr></thead>
            <tbody>
              {(showTrash ? trash : filtered).length === 0
                ? <tr><td colSpan="12" className="empty-state">{showTrash ? 'Lixeira vazia.' : 'Nenhuma compra cadastrada. Clique em "Nova Compra" para começar.'}</td></tr>
                : (showTrash ? trash : filtered).map(t => (
                  <tr key={t.id}>
                    <td><span className={`status-badge status-${(t.situacao || '').toLowerCase().replace(/\s+/g, '-')}`}>{t.situacao}</span></td>
                    <td>{t.numero}</td><td>{t.solicitacao}</td><td>{t.pedido}</td>
                    <td>{formatDate(t.prazoEntrega)}</td>
                    <td>{formatCurrency(t.valor)}</td>
                    <td>{formatDate(t.prazoPagto)}</td>
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
      </div>
    </section>
  );

  /* ─── FORM VIEW ─── */
  return (
    <section className="view-section active">
      <div className="form-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">{editingId ? 'Editar Compra' : 'Nova Compra'}</h2>
            <p className="section-subtitle">Preencha as informações da compra abaixo</p>
          </div>
        </div>
        <form className="card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="situacao">Status *</label>
              <select id="situacao" value={formData.situacao} onChange={handleChange} required>
                <option value="" disabled>Selecione o status</option>
                <option value="Aberto">Aberto</option>
                <option value="Processando">Processando</option>
                <option value="Escriturar">Escriturar</option>
                <option value="Solucionado">Solucionado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="numero">Nº Chamado *</label>
              <input id="numero" value={formData.numero} onChange={handleChange} placeholder="Ex: CH-2025-001" required />
            </div>
            <div className="form-group">
              <label htmlFor="solicitacao">Nº Solicitação</label>
              <input id="solicitacao" value={formData.solicitacao} onChange={handleChange} placeholder="Nº da solicitação" />
            </div>
            <div className="form-group">
              <label htmlFor="pedido">Pedido</label>
              <input id="pedido" value={formData.pedido} onChange={handleChange} placeholder="Número do pedido" />
            </div>
            <div className="form-group">
              <label htmlFor="prazoEntrega">Prazo de Entrega</label>
              <input type="date" id="prazoEntrega" value={formData.prazoEntrega} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="valor">Valor (R$) *</label>
              <input id="valor" value={formData.valor} onChange={handleChange} placeholder="0,00" required />
            </div>
            <div className="form-group">
              <label htmlFor="prazoPagto">Prazo Pagamento</label>
              <input type="date" id="prazoPagto" value={formData.prazoPagto} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="razao">Razão Social *</label>
              <input id="razao" value={formData.razao} onChange={handleChange} placeholder="Empresa" required />
            </div>
            <div className="form-group">
              <label htmlFor="cnpj">CNPJ *</label>
              <input id="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" maxLength="18" required />
            </div>
            <div className="form-group full-width">
              <label htmlFor="requisitante">Requisitante</label>
              <input id="requisitante" value={formData.requisitante} onChange={handleChange} placeholder="Nome completo" />
            </div>
            <div className="form-group full-width">
              <label htmlFor="obs">Observação</label>
              <textarea id="obs" value={formData.obs} onChange={handleChange} rows="3" placeholder="Notas adicionais..." />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={cancelForm}>Cancelar</button>
            <button type="submit" className="btn-primary">Salvar Compra</button>
          </div>
        </form>
      </div>
    </section>
  );
}
