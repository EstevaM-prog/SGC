import React, { useState, useEffect } from 'react';
import api from '../Axios/conect.js';
import { Trash2, ShoppingCart, Truck, List, RotateCcw, AlertTriangle } from 'lucide-react';
import DataTable from '../components/DataTable';

export default function Trash({ 
  tickets = [], onRestore, onPermanentDelete,
  shoppingTickets = [], onRestoreShopping, onPermanentDeleteShopping,
  freightTickets  = [], onRestoreFreight,  onPermanentDeleteFreight,
}) {
  const [activeTab, setActiveTab] = useState('chamados');
  const [chamadosDeleted, setChamadosDeleted] = useState([]);
  const [shoppingDeleted, setShoppingDeleted] = useState([]);
  const [freightDeleted, setFreightDeleted] = useState([]);

  useEffect(() => {
    const fetchTrash = async () => {
      try {
        const [cResp, sResp, fResp] = await Promise.all([
          api.get('/trash/chamados'),
          api.get('/trash/shopping'),
          api.get('/trash/freight')
        ]);
        if (cResp.status === 200) setChamadosDeleted(cResp.data);
        if (sResp.status === 200) setShoppingDeleted(sResp.data);
        if (fResp.status === 200) setFreightDeleted(fResp.data);
      } catch (err) {
        console.error('Erro ao buscar lixeira:', err);
      }
    };
    fetchTrash();
  }, []);

  const TABS = [
    { id:'chamados', label:'Chamados', Icon:List,         count:chamadosDeleted.length },
    { id:'shopping', label:'Compras',  Icon:ShoppingCart, count:shoppingDeleted.length },
    { id:'freight',  label:'Fretes',   Icon:Truck,        count:freightDeleted.length  },
  ];

  // Helper wrappers to update local state immediately on action success
  const handleRestore = async (id) => {
    await onRestore(id);
    setChamadosDeleted(prev => prev.filter(t => t.id !== id));
  };
  const handlePermanentDelete = async (id) => {
    await onPermanentDelete(id);
    setChamadosDeleted(prev => prev.filter(t => t.id !== id));
  };

  const handleRestoreShopping = async (id) => {
    await onRestoreShopping(id);
    setShoppingDeleted(prev => prev.filter(t => t.id !== id));
  };
  const handlePermanentDeleteShopping = async (id) => {
    await onPermanentDeleteShopping(id);
    setShoppingDeleted(prev => prev.filter(t => t.id !== id));
  };

  const handleRestoreFreight = async (id) => {
    await onRestoreFreight(id);
    setFreightDeleted(prev => prev.filter(t => t.id !== id));
  };
  const handlePermanentDeleteFreight = async (id) => {
    await onPermanentDeleteFreight(id);
    setFreightDeleted(prev => prev.filter(t => t.id !== id));
  };

  const current =
    activeTab === 'chamados' ? { data:chamadosDeleted, onRestore:handleRestore, onDelete:handlePermanentDelete } :
    activeTab === 'shopping' ? { data:shoppingDeleted, onRestore:handleRestoreShopping, onDelete:handlePermanentDeleteShopping } :
                               { data:freightDeleted,  onRestore:handleRestoreFreight,  onDelete:handlePermanentDeleteFreight  };

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
