import React, { useState } from 'react';
import { Plus, Trash2, Clock, Calendar, CheckCircle2, XCircle, Pencil, Timer } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/pages/Ponto.css';

export default function Ponto({ tickets, addTicket, updateTicket, softDeleteTicket, addActivity }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    entrada: '', saida: ''
  });

  const INTERVALO = 60;
  const JORNADA   = 480;

  const calcMin = (e, s) => {
    if (!e || !s) return 0;
    const [h1,m1] = e.split(':').map(Number);
    const [h2,m2] = s.split(':').map(Number);
    let d = (h2*60+m2)-(h1*60+m1);
    if (d < 0) d += 1440;
    return d;
  };
  const saldo   = (e, s) => calcMin(e,s) === 0 ? 0 : calcMin(e,s) - INTERVALO - JORNADA;
  const fmtSaldo = min => `${min<0?'−':'+'}${Math.floor(Math.abs(min)/60)}h ${String(Math.abs(min)%60).padStart(2,'0')}m`;

  const handleEdit = t => {
    setEditingId(t.id);
    setFormData({ data:t.data, entrada:t.entrada, saida:t.saida });
    setShowForm(true);
  };

  const handleSave = async e => {
    e.preventDefault();
    const id = toast.loading(editingId ? 'Atualizando ponto...' : 'Registrando ponto...');
    try {
      const s     = saldo(formData.entrada, formData.saida);
      const sfmt  = fmtSaldo(s);
      const payload = { ...formData, resultado:sfmt, saldoMinutos:s, type:'ponto_record', updatedAt:new Date().toISOString() };
      await new Promise(r => setTimeout(r, 500));
      if (editingId) updateTicket(editingId, payload);
      else addTicket({ ...payload, createdAt: new Date().toISOString() });
      if (addActivity) addActivity({
        text: editingId ? 'Registro de Ponto Alterado' : 'Novo Registro de Ponto',
        description: `${formData.data} | ${formData.entrada} → ${formData.saida} | Saldo: ${sfmt}`,
        type: editingId ? 'warning' : 'info', iconType:'time'
      });
      toast.success('Salvo com sucesso!', { id });
      setEditingId(null);
      setFormData({ data: new Date().toISOString().split('T')[0], entrada:'', saida:'' });
      setShowForm(false);
    } catch { toast.error('Erro ao salvar!', { id }); }
  };

  const cancel = () => { setShowForm(false); setEditingId(null); setFormData({ data:new Date().toISOString().split('T')[0], entrada:'', saida:'' }); };

  const records = tickets.filter(t => t.type === 'ponto_record' && !t.deleted);
  const totalMin = records.reduce((a,t) => a + (t.saldoMinutos||0), 0);
  const totalFmt = fmtSaldo(totalMin);
  const isNeg = totalMin < 0;
  const isPos = totalMin > 0;

  return (
    <div className="view-section active">

      {/* ── Page Header ── */}
      <div className="sgc-page-header">
        <div className="sgc-page-title-block">
          <h1 className="sgc-page-title">Registro de Ponto</h1>
          <p className="sgc-page-subtitle">Controle de horas trabalhadas e banco de horas</p>
        </div>
        <div className="sgc-page-actions">
          {/* Saldo card */}
          <div style={{
            display:'flex', alignItems:'center', gap:'0.875rem',
            padding:'0.6rem 1.1rem', borderRadius:14,
            background: isNeg ? 'rgba(239,68,68,0.08)' : isPos ? 'rgba(16,185,129,0.08)' : 'rgba(0,102,255,0.06)',
            border: `1.5px solid ${isNeg ? 'rgba(239,68,68,0.2)' : isPos ? 'rgba(16,185,129,0.2)' : 'rgba(0,102,255,0.15)'}`,
          }}>
            <Timer size={18} style={{ color: isNeg ? '#ef4444' : isPos ? '#10B981' : '#0066FF' }} />
            <div>
              <div style={{ fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--muted-foreground)' }}>Saldo Acumulado</div>
              <div style={{ fontSize:'1rem', fontWeight:800, color: isNeg ? '#ef4444' : isPos ? '#10B981' : 'var(--foreground)' }}>{totalFmt}</div>
            </div>
            <span className={`sgc-badge ${isNeg ? 'red' : isPos ? 'green' : 'blue'}`}>{isNeg ? 'DEVEDOR' : isPos ? 'EXTRAS' : 'ZERADO'}</span>
          </div>

          <button
            className={showForm ? 'sgc-btn-outline' : 'sgc-btn-primary'}
            onClick={showForm ? cancel : () => setShowForm(true)}
          >
            {showForm ? <><XCircle size={16}/> Cancelar</> : <><Plus size={16}/> Bater Ponto</>}
          </button>
        </div>
      </div>

      {/* ── Form ── */}
      {showForm && (
        <div className="sgc-card" style={{ marginBottom:'1.5rem', animation:'page-enter 0.35s both' }}>
          <div className="sgc-card-header">
            <h3 className="sgc-card-title">
              <span className="sgc-card-icon"><Clock size={15}/></span>
              {editingId ? 'Editar Registro' : 'Novo Registro de Ponto'}
            </h3>
          </div>
          <form onSubmit={handleSave} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
            <div className="sgc-form-group">
              <label className="sgc-label"><Calendar size={12}/> Data</label>
              <input className="sgc-input" type="date" value={formData.data}
                onChange={e => setFormData({...formData,data:e.target.value})} required />
            </div>
            <div className="sgc-form-group">
              <label className="sgc-label"><Clock size={12}/> Entrada</label>
              <input className="sgc-input" type="time" value={formData.entrada}
                onChange={e => setFormData({...formData,entrada:e.target.value})} required />
            </div>
            <div className="sgc-form-group">
              <label className="sgc-label"><Clock size={12}/> Saída</label>
              <input className="sgc-input" type="time" value={formData.saida}
                onChange={e => setFormData({...formData,saida:e.target.value})} required />
            </div>
            <div className="sgc-form-group" style={{ justifyContent:'flex-end' }}>
              <label className="sgc-label" style={{ opacity:0 }}>.</label>
              <button type="submit" className="sgc-btn-primary" style={{ justifyContent:'center' }}>
                <CheckCircle2 size={15}/> {editingId ? 'Salvar Edição' : 'Salvar Registro'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Table ── */}
      {records.length > 0 ? (
        <div className="sgc-card" style={{ padding:0, overflow:'hidden' }}>
          <div className="sgc-table-wrap" style={{ border:'none' }}>
            <table className="sgc-table">
              <thead><tr>
                <th>Data</th><th>Entrada</th><th>Saída</th><th>Resultado</th><th style={{ textAlign:'right' }}>Ações</th>
              </tr></thead>
              <tbody>
                {records.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight:600 }}>{new Date(t.data+'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td>{t.entrada}</td>
                    <td>{t.saida}</td>
                    <td>
                      <span className={`sgc-badge ${(t.resultado||'').startsWith('+') ? 'green' : 'red'}`}>
                        {t.resultado}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:'flex', justifyContent:'flex-end', gap:6 }}>
                        <button className="sgc-btn-ghost" style={{ width:34, height:34, padding:0, justifyContent:'center', color:'#0066FF' }}
                          onClick={() => handleEdit(t)} title="Editar">
                          <Pencil size={15}/>
                        </button>
                        <button className="sgc-btn-ghost" style={{ width:34, height:34, padding:0, justifyContent:'center', color:'#ef4444' }}
                          onClick={() => softDeleteTicket(t.id)} title="Remover">
                          <Trash2 size={15}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="sgc-card">
          <div className="sgc-empty">
            <div className="sgc-empty-icon"><Clock size={28}/></div>
            <span className="sgc-empty-title">Nenhum registro encontrado</span>
            <span className="sgc-empty-desc">Clique em "Bater Ponto" para começar.</span>
          </div>
        </div>
      )}
    </div>
  );
}
