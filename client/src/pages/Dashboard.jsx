import React, { useState, useMemo } from 'react';
import {
  BarChart3, Clock, CheckCircle2, FileInput,
  Settings2, TrendingUp, Calendar, AlertCircle, XCircle
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import '../styles/pages/Dashboard.css';

/* ─── Mini Calendar ─────────────────────────────────────── */
const Calendario = ({ selectedDate, onDateClick }) => {
  const [view, setView] = useState(new Date());
  const ano = view.getFullYear();
  const mes = view.getMonth();
  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const DIAS  = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const firstDay  = new Date(ano, mes, 1).getDay();
  const daysCount = new Date(ano, mes + 1, 0).getDate();
  const blanks    = Array(firstDay).fill(null);
  const days      = Array.from({ length: daysCount }, (_, i) => i + 1);
  const nav = off => setView(new Date(ano, mes + off, 1));

  return (
    <div className="sgc-card" style={{ margin: 0, height: '100%' }}>
      {/* header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
        <button onClick={() => nav(-1)} className="sgc-btn-ghost" style={{ height:32, padding:'0 0.5rem' }}>‹</button>
        <span style={{ fontWeight:700, fontSize:'0.9rem' }}>{MESES[mes]} {ano}</span>
        <button onClick={() => nav(1)}  className="sgc-btn-ghost" style={{ height:32, padding:'0 0.5rem' }}>›</button>
      </div>
      {/* weekday labels */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:4 }}>
        {DIAS.map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:'0.68rem', fontWeight:700, color:'#0066FF', padding:'2px 0', opacity:0.6 }}>{d}</div>
        ))}
      </div>
      {/* day cells */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
        {blanks.map((_,i) => <div key={`b${i}`} />)}
        {days.map(dia => {
          const d = new Date(ano, mes, dia);
          const isToday    = new Date().toLocaleDateString() === d.toLocaleDateString();
          const isSelected = selectedDate?.toLocaleDateString() === d.toLocaleDateString();
          return (
            <div
              key={dia}
              onClick={() => onDateClick(d)}
              style={{
                height:36, display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'0.8rem', borderRadius:9, cursor:'pointer', fontWeight: isToday||isSelected ? 700 : 400,
                background: isSelected ? '#0066FF' : isToday ? 'rgba(0,102,255,0.1)' : 'transparent',
                color: isSelected ? '#fff' : isToday ? '#0066FF' : 'var(--foreground)',
                border: isSelected ? '1.5px solid #0066FF' : isToday ? '1.5px solid rgba(0,102,255,0.3)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >{dia}</div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Dashboard ─────────────────────────────────────────── */
export default function Dashboard({ tickets = [] }) {
  const [period, setPeriod]           = useState('Year');
  const [selectedDate, setSelectedDate] = useState(null);

  const filtered = useMemo(() => {
    const now = new Date();
    return tickets.filter(t => {
      if (t.deleted) return false;
      if (!t.updatedAt) return true;
      const diff = Math.ceil(Math.abs(now - new Date(t.updatedAt)) / 86400000);
      return period === 'Today'  ? diff <= 1 && now.getDate() === new Date(t.updatedAt).getDate()
           : period === 'Week'   ? diff <= 7
           : period === 'Month'  ? diff <= 30
           : diff <= 365;
    });
  }, [tickets, period]);

  const total        = filtered.length;
  const open         = filtered.filter(t => (t.situacao||'').toLowerCase() !== 'solucionado').length;
  const solucionado  = filtered.filter(t => (t.situacao||'').toLowerCase() === 'solucionado').length;
  const escriturar   = filtered.filter(t => (t.situacao||'').toLowerCase() === 'escriturar').length;
  const processando  = filtered.filter(t => (t.situacao||'').toLowerCase() === 'processando').length;

  const statusData = [
    { name:'Aberto',      value:open,        color:'#0066FF' },
    { name:'Escriturar',  value:escriturar,  color:'#7c3aed' },
    { name:'Solucionado', value:solucionado, color:'#10B981' },
    { name:'Processando', value:processando, color:'#f59e0b' },
  ].filter(d => d.value > 0);

  const monthlyData = useMemo(() => {
    const M = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const map = {};
    filtered.forEach(t => {
      if (!t.updatedAt || !t.valor) return;
      const label = M[new Date(t.updatedAt).getMonth()];
      const val = typeof t.valor === 'number'
        ? t.valor
        : parseFloat((t.valor+'').replace(/[^\d,]/g,'').replace(',','.')) || 0;
      map[label] = (map[label] || 0) + val;
    });
    return M.map(m => ({ name:m, valor: map[m]||0 })).filter(d => d.valor > 0 || period === 'Year');
  }, [filtered, period]);

  const statusList = useMemo(() => {
    let list = filtered.filter(t => ['aberto','processando','escriturar'].includes((t.situacao||'').toLowerCase()));
    if (selectedDate) {
      const sel = selectedDate.toLocaleDateString();
      list = list.filter(t => {
        const d = t.updatedAt ? new Date(t.updatedAt) : t.createdAt ? new Date(t.createdAt) : null;
        return d && d.toLocaleDateString() === sel;
      });
    }
    return list;
  }, [filtered, selectedDate]);

  const fmt = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);

  const kpis = [
    { label:'Total de Chamados', value:total,       icon:<BarChart3 size={22}/>,   cls:'gradient' },
    { label:'Em Aberto',         value:open,         icon:<AlertCircle size={22}/>, cls:'blue' },
    { label:'Solucionados',      value:solucionado,  icon:<CheckCircle2 size={22}/>,cls:'green' },
    { label:'Escriturar',        value:escriturar,   icon:<FileInput size={22}/>,   cls:'violet' },
    { label:'Processando',       value:processando,  icon:<Settings2 size={22}/>,   cls:'amber' },
  ];

  return (
    <section className="view-section active">

      {/* ── Page Header ── */}
      <div className="sgc-page-header">
        <div className="sgc-page-title-block">
          <h1 className="sgc-page-title">Dashboard</h1>
          <p className="sgc-page-subtitle">Análise detalhada e indicadores de performance</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <Calendar size={16} style={{ color:'#0066FF' }} />
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="sgc-select"
            style={{ minWidth:150 }}
          >
            <option value="Today">Hoje</option>
            <option value="Week">Esta Semana</option>
            <option value="Month">Este Mês</option>
            <option value="Year">Este Ano</option>
          </select>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="sgc-kpi-grid" style={{ gridTemplateColumns:'repeat(5,1fr)', marginBottom:'1.75rem' }}>
        {kpis.map((k, i) => (
          <div key={i} className="sgc-kpi-card" style={{ animationDelay:`${i*0.07}s` }}>
            <div className={`sgc-kpi-icon ${k.cls}`}>{k.icon}</div>
            <div className="sgc-kpi-body">
              <span className="sgc-kpi-label">{k.label}</span>
              <span className="sgc-kpi-value">{k.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,440px),1fr))', gap:'1.25rem', marginBottom:'1.75rem' }}>

        {/* Bar Chart */}
        <div className="sgc-card">
          <div className="sgc-card-header">
            <h3 className="sgc-card-title">
              <span className="sgc-card-icon"><TrendingUp size={16}/></span>
              Gastos Mensais (R$)
            </h3>
          </div>
          <div style={{ width:'100%', height:280 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,102,255,0.08)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill:'var(--muted-foreground)', fontSize:12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill:'var(--muted-foreground)', fontSize:11 }} tickFormatter={v=>`R$ ${v>=1000?(v/1000).toFixed(1)+'k':v}`} />
                <Tooltip
                  cursor={{ fill:'rgba(0,102,255,0.04)' }}
                  contentStyle={{ borderRadius:12, border:'1px solid rgba(0,102,255,0.15)', background:'var(--card)', boxShadow:'0 8px 32px rgba(0,0,0,0.12)' }}
                  formatter={v=>[fmt(v),'Gastos']}
                />
                <Bar dataKey="valor" fill="url(#blueGreen)" radius={[8,8,0,0]} barSize={28} />
                <defs>
                  <linearGradient id="blueGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0066FF" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="sgc-card">
          <div className="sgc-card-header">
            <h3 className="sgc-card-title">
              <span className="sgc-card-icon"><Settings2 size={16}/></span>
              Distribuição de Status
            </h3>
          </div>
          <div style={{ width:'100%', height:280 }}>
            {statusData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value">
                    {statusData.map((e,i) => <Cell key={i} fill={e.color} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius:12, border:'1px solid rgba(0,102,255,0.15)', background:'var(--card)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle"
                    formatter={v=><span style={{ fontSize:'0.85rem', fontWeight:500 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="sgc-empty" style={{ padding:'3rem 1rem' }}>
                <div className="sgc-empty-icon"><AlertCircle size={28}/></div>
                <span className="sgc-empty-desc">Nenhum dado para este período</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Calendar + Pending Table ── */}
      <div className="dashboard-grid-footer">
        <div style={{ height:'100%' }}>
          <Calendario
            selectedDate={selectedDate}
            onDateClick={d => setSelectedDate(p => p?.toLocaleDateString() === d.toLocaleDateString() ? null : d)}
          />
        </div>

        <div className="sgc-card" style={{ margin:0, height:'100%', minHeight:380 }}>
          <div className="sgc-card-header">
            <h3 className="sgc-card-title">
              <span className="sgc-card-icon"><Clock size={16}/></span>
              {selectedDate ? `Pendências — ${selectedDate.toLocaleDateString('pt-BR')}` : 'Pendências por Status'}
            </h3>
            {selectedDate && (
              <button className="sgc-btn-ghost" onClick={() => setSelectedDate(null)} style={{ gap:'4px', fontSize:'0.8rem' }}>
                <XCircle size={14}/> Limpar
              </button>
            )}
          </div>

          <div className="sgc-table-wrap">
            <table className="sgc-table">
              <thead><tr>
                <th>Em Aberto</th>
                <th>Processando</th>
                <th>Escriturar</th>
                <th>Vencimento</th>
              </tr></thead>
              <tbody>
                {statusList.length > 0 ? statusList.slice(0,15).map(t => {
                  const s = (t.situacao||'').toLowerCase();
                  const cell = (
                    <div style={{ padding:'2px 0' }}>
                      <div style={{ fontWeight:700, fontSize:'0.85rem' }}>NF: {t.notaFiscal||'---'}</div>
                      <div style={{ fontSize:'0.78rem', color:'#0066FF', fontWeight:600 }}>{fmt(typeof t.valor==='number'?t.valor:0)}</div>
                      <div style={{ fontSize:'0.65rem', opacity:0.5, fontFamily:'monospace' }}>#{(t.id||'').slice(-8).toUpperCase()}</div>
                    </div>
                  );
                  const venc = t.vencimento ? (() => { const d=new Date(t.vencimento); return `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}`; })() : '—';
                  return (
                    <tr key={t.id}>
                      <td>{s==='aberto'      ? cell : ''}</td>
                      <td>{s==='processando' ? cell : ''}</td>
                      <td>{s==='escriturar'  ? cell : ''}</td>
                      <td style={{ fontWeight:500 }}>{venc}</td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={4} style={{ textAlign:'center', padding:'3rem', color:'var(--muted-foreground)' }}>
                    {selectedDate ? 'Nenhuma pendência neste dia.' : 'Nenhuma pendência neste período.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}