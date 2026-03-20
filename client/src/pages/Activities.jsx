import React, { useState, useEffect } from 'react';
import { Search, History, Filter, Trash2, Calendar } from 'lucide-react';
import AllActives from '../components/AllActives';

/**
 * Página Principal de Histórico e Atividades
 */
export default function ActivitiesPage({ activities = [], onClear }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = activities.filter(a => 
    a.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (a.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="view-section active">
      <div className="section-header">
        <div>
          <h2 className="section-title">Log de Atividades</h2>
          <p className="section-subtitle">Histórico auditável de todas as ações e registros no sistema</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="tb-search" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
             <Search size={16} className="tb-search-icon" />
             <input 
               type="search" 
               placeholder="Pesquisar registro..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="tb-search-input" 
             />
          </div>
          <button className="btn-outline" onClick={onClear} title="Limpar histórico">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="activities-stats-header" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="stat-mini-card" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           <History size={16} className="icon-blue" />
           <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>{activities.length} Atividades Totais</span>
        </div>
        <div className="stat-mini-card" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           <Calendar size={16} className="icon-green" />
           <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>Últimos 30 dias</span>
        </div>
      </div>

      <div className="activities-list-area">
        <AllActives activities={filtered} />
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
         <button className="btn-outline" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            Carregar mais atividades antigo...
         </button>
      </div>
    </section>
  );
}