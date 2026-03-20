import React, { useState } from 'react';
import { Plus, Search, BookOpen, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProcedures } from '../hooks/useProcedures';
import Modal from '../components/Modal';
import ProcedureCard from '../components/ProcedureCard';
import '../styles/pages/Procedures.css';

export default function Procedimentos({ addActivity }) {
  const { procedures, addProcedure, updateProcedure, deleteProcedure } = useProcedures();
  // ... existing state ...
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: 'Geral'
  });

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ titulo: '', descricao: '', categoria: 'Geral' });
    setShowModal(true);
  };

  const handleOpenEdit = (proc) => {
    setEditingId(proc.id);
    setFormData({
      titulo: proc.titulo,
      descricao: proc.descricao,
      categoria: proc.categoria || 'Geral'
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading(editingId ? 'Atualizando guia...' : 'Publicando guia...');
    
    try {
      await new Promise(r => setTimeout(r, 600));

      if (editingId) {
        await updateProcedure(editingId, { ...formData });
      } else {
        await addProcedure({
          ...formData,
          createdAt: new Date().toISOString()
        });
      }

      if (addActivity) {
        addActivity({
          text: editingId ? `Procedimento "${formData.titulo}" Atualizado` : `Novo Procedimento "${formData.titulo}" Criado`,
          description: `Manual técnico na categoria ${formData.categoria}: ${formData.descricao.substring(0, 100)}...`,
          type: editingId ? 'warning' : 'info',
          iconType: 'edit'
        });
      }
      
      toast.success("Criado com sucesso!", { id: loadingToast });
      setEditingId(null);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro no chamado!", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = procedures.filter(p => 
    p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.descricao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.categoria || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="view-procedures" className="view-section active">
      <div className="section-header">
        <div>
          <h2 className="section-title">Procedimentos Internos</h2>
          <p className="section-subtitle">Biblioteca de guias, normas e fluxos operacionais</p>
        </div>

        <div className="procedures-actions">
          <div className="tb-search search-procedures">
             <Search size={16} className="tb-search-icon" />
             <input 
               type="search" 
               placeholder="Pesquisar manual..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="tb-search-input" 
             />
          </div>
          <button className="btn-primary" onClick={handleOpenNew}>
            <Plus size={18} />
            <span>Novo Guia</span>
          </button>
        </div>
      </div>

      <div className="procedures-container">
        {filtered.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon-wrap">
              <BookOpen size={48} />
            </div>
            <h3>Nenhum procedimento encontrado</h3>
            <p>Tente ajustar sua busca ou adicione um novo guia de conhecimento.</p>
            {searchTerm && (
               <button className="btn-outline" onClick={() => setSearchTerm('')} style={{ marginTop: '1rem' }}>
                 Limpar Pesquisa
               </button>
            )}
          </div>
        ) : (
          <div className="procedures-grid">
            {filtered.map(p => (
              <ProcedureCard 
                key={p.id} 
                procedure={p} 
                onEdit={handleOpenEdit} 
                onDelete={deleteProcedure}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edição de Procedimento */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingId ? "Editar Procedimento" : "Criar Novo Procedimento"}
      >
        <form onSubmit={handleSave} className="proc-form">
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
              Título do Guia *
            </label>
            <input 
              type="text" 
              placeholder="Ex: Guia de Compras de Materiais" 
              value={formData.titulo} 
              onChange={e => setFormData({...formData, titulo: e.target.value})}
              required
              disabled={isSubmitting}
              className="form-control"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input)', color: 'var(--foreground)' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
              Categoria
            </label>
            <select 
              value={formData.categoria} 
              onChange={e => setFormData({...formData, categoria: e.target.value})}
              disabled={isSubmitting}
              className="form-control"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input)', color: 'var(--foreground)' }}
            >
              <option value="Geral">Geral</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Logística">Logística</option>
              <option value="Compras">Compras</option>
              <option value="Suporte">Suporte</option>
              <option value="TI">TI</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
              Descrição Curta *
            </label>
            <textarea 
              rows="4" 
              placeholder="Descreva brevemente o que o usuário encontrará neste guia..."
              value={formData.descricao}
              onChange={e => setFormData({...formData, descricao: e.target.value})}
              required
              disabled={isSubmitting}
              className="form-control"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input)', color: 'var(--foreground)', resize: 'vertical' }}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={() => setShowModal(false)} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              <Save size={18} />
              {isSubmitting ? 'Salvando...' : 'Publicar Guia'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
