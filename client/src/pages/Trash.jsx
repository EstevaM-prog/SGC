import React, { useState } from 'react';
import { ShoppingCart, Truck, List } from 'lucide-react';
import DataTable from '../components/DataTable';

export default function Trash({ 
  tickets, 
  onRestore, 
  onPermanentDelete,
  shoppingTickets = [],
  onRestoreShopping,
  onPermanentDeleteShopping,
  freightTickets = [],
  onRestoreFreight,
  onPermanentDeleteFreight
}) {
  const [activeTab, setActiveTab] = useState('chamados');

  const chamadosDeleted  = tickets.filter(r => r.deleted);
  const shoppingDeleted  = shoppingTickets.filter(r => r.deleted);
  const freightDeleted   = freightTickets.filter(r => r.deleted);

  return (
    <section id="view-trash" className="view-section active">
      <div className="section-header">
        <div>
          <h2 className="section-title">Lixeira</h2>
          <p className="section-subtitle">Gerencie os itens excluídos de todos os setores</p>
        </div>

        <div className="trash-tabs" style={{ display: 'flex', gap: '0.5rem', background: 'var(--secondary)', padding: '0.25rem', borderRadius: '10px' }}>
          <button 
            className={`tab-btn ${activeTab === 'chamados' ? 'active' : ''}`}
            onClick={() => setActiveTab('chamados')}
            style={{ 
              padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', 
              display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer',
              background: activeTab === 'chamados' ? 'var(--card)' : 'transparent',
              color: activeTab === 'chamados' ? 'var(--primary)' : 'var(--muted-foreground)',
              fontWeight: 600, transition: 'var(--transition)'
            }}
          >
            <List size={16} /> Chamados ({chamadosDeleted.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'shopping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shopping')}
            style={{ 
              padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', 
              display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer',
              background: activeTab === 'shopping' ? 'var(--card)' : 'transparent',
              color: activeTab === 'shopping' ? 'var(--primary)' : 'var(--muted-foreground)',
              fontWeight: 600, transition: 'var(--transition)'
            }}
          >
            <ShoppingCart size={16} /> Compras ({shoppingDeleted.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'freight' ? 'active' : ''}`}
            onClick={() => setActiveTab('freight')}
            style={{ 
              padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', 
              display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer',
              background: activeTab === 'freight' ? 'var(--card)' : 'transparent',
              color: activeTab === 'freight' ? 'var(--primary)' : 'var(--muted-foreground)',
              fontWeight: 600, transition: 'var(--transition)'
            }}
          >
            <Truck size={16} /> Fretes ({freightDeleted.length})
          </button>
        </div>
      </div>

      <div className="card">
        {activeTab === 'chamados' && (
          <DataTable 
            tickets={chamadosDeleted} 
            onRestore={onRestore} 
            onPermanentDelete={onPermanentDelete} 
            isTrash={true}
          />
        )}
        {activeTab === 'shopping' && (
          <DataTable 
            tickets={shoppingDeleted} 
            onRestore={onRestoreShopping} 
            onPermanentDelete={onPermanentDeleteShopping} 
            isTrash={true}
          />
        )}
        {activeTab === 'freight' && (
          <DataTable 
            tickets={freightDeleted} 
            onRestore={onRestoreFreight} 
            onPermanentDelete={onPermanentDeleteFreight} 
            isTrash={true}
          />
        )}
      </div>
    </section>
  );
}
