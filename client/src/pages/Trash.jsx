import React, { useState } from 'react';
import { Trash2, ShoppingCart, Truck, List, RotateCcw, AlertTriangle } from 'lucide-react';
import DataTable from '../components/DataTable';

export default function Trash({ 
  tickets = [], onRestore, onPermanentDelete,
  shoppingTickets = [], onRestoreShopping, onPermanentDeleteShopping,
  freightTickets  = [], onRestoreFreight,  onPermanentDeleteFreight,
}) {
  const [activeTab, setActiveTab] = useState('chamados');

  const chamadosDeleted = tickets.filter(r => r.deleted);
  const shoppingDeleted = shoppingTickets.filter(r => r.deleted);
  const freightDeleted  = freightTickets.filter(r => r.deleted);

  const TABS = [
    { id:'chamados', label:'Chamados', Icon:List,         count:chamadosDeleted.length },
    { id:'shopping', label:'Compras',  Icon:ShoppingCart, count:shoppingDeleted.length },
    { id:'freight',  label:'Fretes',   Icon:Truck,        count:freightDeleted.length  },
  ];

  const current =
    activeTab === 'chamados' ? { data:chamadosDeleted, onRestore, onDelete:onPermanentDelete } :
    activeTab === 'shopping' ? { data:shoppingDeleted, onRestore:onRestoreShopping, onDelete:onPermanentDeleteShopping } :
                               { data:freightDeleted,  onRestore:onRestoreFreight,  onDelete:onPermanentDeleteFreight  };

  const total = chamadosDeleted.length + shoppingDeleted.length + freightDeleted.length;

  return (
    <section id="view-trash" className="view-section active">

      {/* ── Page Header ── */}
      <div className="sgc-page-header">
        <div className="sgc-page-title-block">
          <h1 className="sgc-page-title">Lixeira</h1>
          <p className="sgc-page-subtitle">
            {total > 0 ? `${total} item${total !== 1 ? 's' : ''} excluído${total !== 1 ? 's' : ''}` : 'Nenhum item excluído'}
          </p>
        </div>

        {/* Warning badge */}
        {total > 0 && (
          <div className="sgc-badge amber" style={{ padding:'6px 14px', fontSize:'0.8rem', gap:6 }}>
            <AlertTriangle size={13} />
            Itens serão removidos permanentemente após 30 dias
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="sgc-tabs" style={{ marginBottom:'1.5rem', alignSelf:'flex-start' }}>
        {TABS.map(({ id, label, Icon, count }) => (
          <button
            key={id}
            className={`sgc-tab-btn ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={14} />
            {label}
            {count > 0 && (
              <span style={{
                background: activeTab === id ? 'rgba(255,255,255,0.25)' : 'rgba(0,102,255,0.12)',
                color: activeTab === id ? '#fff' : '#0066FF',
                padding:'1px 7px', borderRadius:99, fontSize:'0.7rem', fontWeight:800
              }}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Table Card ── */}
      {current.data.length > 0 ? (
        <div className="sgc-card" style={{ padding:0, overflow:'hidden' }}>
          <DataTable
            tickets={current.data}
            onRestore={current.onRestore}
            onPermanentDelete={current.onDelete}
            isTrash={true}
          />
        </div>
      ) : (
        <div className="sgc-card">
          <div className="sgc-empty">
            <div className="sgc-empty-icon"><Trash2 size={28}/></div>
            <span className="sgc-empty-title">Lixeira vazia</span>
            <span className="sgc-empty-desc">Nenhum item excluído nesta seção.</span>
          </div>
        </div>
      )}
    </section>
  );
}
