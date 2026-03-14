import React, { useState } from 'react';
import { Plus, Trash2, FileText, Search, Clock } from 'lucide-react';
import { useProcedures } from '../hooks/useProcedures';
import '../styles/pages/Procedures.css';

export default function Procedimentos() {
  const { procedures, addProcedure, deleteProcedure } = useProcedures();
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = () => {
    const titulo = prompt('Título do Procedimento:');
    if (!titulo) return;
    const descricao = prompt('Descrição:');
    addProcedure({ titulo, descricao });
  };

  const filtered = procedures.filter(p => 
    p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.descricao || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="view-procedures" className="view-section active">
      <div className="section-header">
        <div>
          <h2 className="section-title">Procedimentos</h2>
          <p className="section-subtitle">Documentação e guias de processos do sistema</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="tb-search" style={{ border: '1px solid var(--border)' }}>
             <Search size={16} className="tb-search-icon" />
             <input 
               type="search" 
               placeholder="Buscar guia..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="tb-search-input" 
             />
          </div>
          <button className="btn-new-process" onClick={handleAdd}>
            <Plus className="icon-sm" size={16} />
            Novo Guia
          </button>
        </div>
      </div>

      <div className="procedures-grid">
         {filtered.length === 0 ? (
           <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
             <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
             <p>Nenhum procedimento encontrado.</p>
           </div>
         ) : (
           filtered.map(p => (
             <div key={p.id} className="procedure-card">
               <div className="proc-icon-wrap">
                 <FileText size={24} />
               </div>
               <div className="proc-content">
                 <h4 className="proc-title">{p.titulo}</h4>
                 <p className="proc-desc">{p.descricao}</p>
                 <div className="proc-footer">
                   <span className="proc-date">
                     <Clock size={12} />
                     {new Date(p.createdAt).toLocaleDateString()}
                   </span>
                   <button className="proc-delete-btn" onClick={() => deleteProcedure(p.id)} title="Excluir">
                     <Trash2 size={16} />
                   </button>
                 </div>
               </div>
             </div>
           ))
         )}
      </div>
    </section>
  );
}
