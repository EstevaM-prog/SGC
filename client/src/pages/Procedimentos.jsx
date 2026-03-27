import React, { useState } from 'react';
import { Plus, Search, BookOpen, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProcedures } from '../hooks/useProcedures';
import Modal from '../components/Modal';
import ProcedureCard from '../components/ProcedureCard';
import '../styles/pages/Procedures.css';

export default function Procedimentos({ addActivity }) {
  const { procedures, addProcedure, updateProcedure, deleteProcedure } = useProcedures();
  const [searchTerm, setSearchTerm]   = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ titulo: '', descricao: '', categoria: 'Geral' });

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ titulo: '', descricao: '', categoria: 'Geral' });
    setShowModal(true);
  };

  const handleOpenEdit = (proc) => {
    setEditingId(proc.id);
    setFormData({ titulo: proc.titulo, descricao: proc.descricao, categoria: proc.categoria || 'Geral' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const t = toast.loading(editingId ? 'Atualizando guia...' : 'Publicando guia...');
    try {
      await new Promise(r => setTimeout(r, 600));
      if (editingId) {
        await updateProcedure(editingId, { ...formData });
      } else {
        await addProcedure({ ...formData, createdAt: new Date().toISOString() });
      }
      if (addActivity) addActivity({
        text: editingId ? `Procedimento "${formData.titulo}" Atualizado` : `Novo Procedimento "${formData.titulo}" Criado`,
        description: `Manual técnico na categoria ${formData.categoria}.`,
        type: editingId ? 'warning' : 'info', iconType: 'edit'
      });
      toast.success('Salvo com sucesso!', { id: t });
      setEditingId(null);
      setShowModal(false);
    } catch (err) {
      toast.error('Erro ao salvar!', { id: t });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = procedures.filter(p =>
    p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.descricao||'').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.categoria||'').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="view-procedures" className="view-section active">

      {/* ── Page Header ── */}
      <div className="sgc-page-header">
        <div className="sgc-page-title-block">
          <h1 className="sgc-page-title">Procedimentos Internos</h1>
          <p className="sgc-page-subtitle">Biblioteca de guias, normas e fluxos operacionais</p>
        </div>
        <div className="sgc-page-actions">
          <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
            <Search size={15} style={{ position:'absolute', left:12, color:'#0066FF', pointerEvents:'none' }} />
            <input
              type="search"
              placeholder="Pesquisar manual..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width:240, height:42, paddingLeft:36, paddingRight:12,
                background:'var(--card)', border:'1.5px solid rgba(0,102,255,0.14)',
                borderRadius:12, outline:'none', fontSize:'0.875rem', color:'var(--foreground)',
                transition:'all 0.25s'
              }}
              onFocus={e => { e.target.style.borderColor='#0066FF'; e.target.style.boxShadow='0 0 0 3px rgba(0,102,255,0.1)'; }}
              onBlur={e  => { e.target.style.borderColor='rgba(0,102,255,0.14)'; e.target.style.boxShadow=''; }}
            />
          </div>
          <button className="sgc-btn-primary" onClick={handleOpenNew}>
            <Plus size={16} /> Novo Guia
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="procedures-container">
        {filtered.length === 0 ? (
          <div className="sgc-card">
            <div className="sgc-empty">
              <div className="sgc-empty-icon"><BookOpen size={28}/></div>
              <span className="sgc-empty-title">Nenhum procedimento encontrado</span>
              <span className="sgc-empty-desc">Tente ajustar sua busca ou adicione um novo guia.</span>
              {searchTerm && (
                <button className="sgc-btn-outline" onClick={() => setSearchTerm('')} style={{ marginTop:'0.75rem' }}>
                  Limpar Pesquisa
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="procedures-grid">
            {filtered.map(p => (
              <ProcedureCard key={p.id} procedure={p} onEdit={handleOpenEdit} onDelete={deleteProcedure} />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal Form ── */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editingId ? 'Editar Procedimento' : 'Criar Novo Procedimento'}>
        <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div className="sgc-form-group">
            <label className="sgc-label">Título do Guia *</label>
            <input className="sgc-input" type="text" placeholder="Ex: Guia de Compras de Materiais"
              value={formData.titulo} onChange={e => setFormData({...formData, titulo:e.target.value})}
              required disabled={isSubmitting} />
          </div>
          <div className="sgc-form-group">
            <label className="sgc-label">Categoria</label>
            <select className="sgc-input" value={formData.categoria}
              onChange={e => setFormData({...formData, categoria:e.target.value})} disabled={isSubmitting}>
              <option>Geral</option><option>Administrativo</option><option>Logística</option>
              <option>Compras</option><option>Suporte</option><option>TI</option>
            </select>
          </div>
          <div className="sgc-form-group">
            <label className="sgc-label">Descrição Curta *</label>
            <textarea className="sgc-textarea" rows={4} placeholder="Descreva brevemente o que o usuário encontrará..."
              value={formData.descricao} onChange={e => setFormData({...formData, descricao:e.target.value})}
              required disabled={isSubmitting} />
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.75rem', paddingTop:'0.5rem' }}>
            <button type="button" className="sgc-btn-outline" onClick={() => setShowModal(false)} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="sgc-btn-primary" disabled={isSubmitting}>
              <Save size={15}/> {isSubmitting ? 'Salvando...' : 'Publicar Guia'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
