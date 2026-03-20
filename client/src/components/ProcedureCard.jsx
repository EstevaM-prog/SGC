import React, { useState } from 'react';
import { 
  FileText, 
  Trash2, 
  Pencil, 
  X, 
  ChevronRight, 
  Clock,
  Cpu,
  Briefcase,
  Truck,
  ShoppingCart,
  LifeBuoy,
  BookOpen
} from 'lucide-react';
import '../styles/components/ProcedureCard.css';

const getCategoryIcon = (category) => {
  switch (category) {
    case 'TI': return <Cpu size={20} />;
    case 'Administrativo': return <Briefcase size={20} />;
    case 'Logística': return <Truck size={20} />;
    case 'Compras': return <ShoppingCart size={20} />;
    case 'Suporte': return <LifeBuoy size={20} />;
    default: return <BookOpen size={20} />;
  }
};

export default function ProcedureCard({ procedure, onEdit, onDelete }) {
  const [isMaximized, setIsMaximized] = useState(false);

  const toggleMaximize = () => setIsMaximized(!isMaximized);

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(procedure);
    setIsMaximized(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este procedimento?')) {
      onDelete(procedure.id);
      setIsMaximized(false);
    }
  };

  return (
    <>
      {/* Minimized Card */}
      <div className="proc-card-mini" onClick={toggleMaximize}>
        <div className="proc-card-icon-wrap">
          {getCategoryIcon(procedure.categoria)}
        </div>
        <div className="proc-card-info">
          <span className="proc-card-category">{procedure.categoria || 'Geral'}</span>
          <h4 className="proc-card-title">{procedure.titulo}</h4>
        </div>
        <div className="proc-card-actions-mini">
          <button className="proc-card-edit-btn" onClick={handleEdit} title="Editar">
            <Pencil size={18} />
          </button>
          <button className="proc-card-read-btn" title="Ler Manual">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Maximized Overlay (Modal) */}
      {isMaximized && (
        <div className="proc-modal-overlay" onClick={toggleMaximize}>
          <div className="proc-modal-content" onClick={e => e.stopPropagation()}>
            <div className="proc-modal-header">
              <div className="proc-modal-badge-wrap">
                <span className="proc-modal-icon">{getCategoryIcon(procedure.categoria)}</span>
                <span className="proc-modal-category">{procedure.categoria || 'Geral'}</span>
              </div>
              <button className="proc-modal-close" onClick={toggleMaximize}>
                <X size={24} />
              </button>
            </div>

            <div className="proc-modal-body">
              <h2 className="proc-modal-title">{procedure.titulo}</h2>
              <div className="proc-modal-meta">
                <Clock size={14} />
                <span>Publicado em {new Date(procedure.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="proc-modal-description">
                {procedure.descricao}
              </div>
            </div>

            <div className="proc-modal-footer">
              <div className="proc-modal-actions">
                <button className="btn-edit-proc" onClick={handleEdit}>
                  <Pencil size={16} />
                  Editar
                </button>
                <button className="btn-delete-proc" onClick={handleDelete}>
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
              <button className="btn-close-proc" onClick={toggleMaximize}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
