import React, { useState, useMemo } from 'react';
import {
  BarChart3, Clock, CheckCircle2, FileInput,
  Settings2, TrendingUp, Calendar, AlertCircle,
  ArrowUpRight, ArrowDownRight, ChevronRight,
  ChevronLeft, Zap, Plus, Users, ShoppingBag,
  FileText, Trash2, Headphones, Target, Activity,
  LayoutDashboard, Bell, ArrowRight, History
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, LineChart, Line,
  BarChart, Bar
} from 'recharts';
import { DashboardSkeleton } from '../components/Skeleton';
import '../styles/pages/Dashboard.css';

/* ─── helpers ─── */
const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const STATUS_COLORS = {
  aberto:      { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)'  },
  processando: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  escriturar:  { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)'  },
  solucionado: { color: '#10B981', bg: 'rgba(16,185,129,0.1)'  },
  cancelado:   { color: '#EF4444', bg: 'rgba(239,68,68,0.1)'   },
};

const getStatus = (s = '') => STATUS_COLORS[(s+'').toLowerCase()] || STATUS_COLORS.aberto;

/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '10px 14px', boxShadow: 'var(--shadow-lg)'
    }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: 4, fontWeight: 700 }}>{label}</p>
      <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
        {fmt(payload[0].value)}
      </p>
    </div>
  );
};

/* ─── Sparkline Component ─── */
const Sparkline = ({ data, color }) => (
  <ResponsiveContainer width="100%" height={30}>
    <LineChart data={data}>
      <Line type="monotone" dataKey="val" stroke={color} strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

/* ─── Activity Heatmap Component ─── */
const ActivityHeatmap = ({ tickets = [] }) => {
  const data = useMemo(() => {
    const map = {};
    const now = new Date();
    // Últimos 90 dias
    for (let i = 90; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      map[d.toDateString()] = 0;
    }
    tickets.forEach(t => {
      const d = new Date(t.createdAt).toDateString();
      if (map[d] !== undefined) map[d]++;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  }, [tickets]);

  const getColor = (count) => {
    if (count === 0) return 'rgba(var(--foreground-rgb), 0.05)';
    if (count < 3) return 'rgba(59, 130, 246, 0.3)';
    if (count < 6) return 'rgba(59, 130, 246, 0.6)';
    return 'rgba(59, 130, 246, 1)';
  };

  return (
    <div className="dash-heatmap-wrap">
      <div className="dash-heatmap-grid">
        {data.map((d, i) => (
          <div 
            key={i} 
            className="heatmap-cell" 
            style={{ background: getColor(d.count) }}
            title={`${d.date}: ${d.count} chamados`}
          />
        ))}
      </div>
      <div className="heatmap-labels">
        <span>Menos</span>
        <div className="heatmap-legend">
          {[0, 2, 5, 8].map(v => <div key={v} className="heatmap-cell" style={{ background: getColor(v) }} />)}
        </div>
        <span>Mais</span>
      </div>
    </div>
  );
};

/* ─── Main Dashboard ─── */
export default function Dashboard({ tickets = [], loading = false, onNavigate }) {
  const [period, setPeriod] = useState('Month');

  const filtered = useMemo(() => {
    if (!Array.isArray(tickets)) return [];
    const now = new Date();
    return tickets.filter(t => {
      if (!t || t.deleted) return false;
      const dateStr = t.updatedAt || t.createdAt;
      if (!dateStr) return true;
      const tDate = new Date(dateStr);
      const diff = Math.ceil(Math.abs(now - tDate) / 86400000);
      if (period === 'Today') return tDate.toDateString() === now.toDateString();
      if (period === 'Week')  return diff <= 7;
      if (period === 'Month') return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      return true;
    });
  }, [tickets, period]);

  const departmentData = useMemo(() => {
    const sectors = {};
    filtered.forEach(t => {
      const s = t.setor || 'N/A';
      sectors[s] = (sectors[s] || 0) + (Number(t.valor) || 0);
    });
    return Object.entries(sectors)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filtered]);

  const recentActivity = useMemo(() => {
    return [...tickets]
      .filter(t => !t.deleted)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        user: t.requisitante || 'Sistema',
        action: t.updatedAt ? 'atualizou status' : 'criou chamado',
        target: `#${t.numero}`,
        date: t.updatedAt || t.createdAt,
        status: t.situacao
      }));
  }, [tickets]);

  const alerts = useMemo(() => {
    const today = new Date().toDateString();
    return tickets.filter(t => {
      if (t.deleted || (t.situacao||'').toLowerCase() === 'solucionado') return false;
      const venc = t.vencimento ? new Date(t.vencimento) : null;
      if (!venc) return false;
      return venc.toDateString() === today || venc < new Date();
    }).slice(0, 3);
  }, [tickets]);

  const monthlyData = useMemo(() => {
    const M = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const map = {};
    filtered.forEach(t => {
      const d = t.updatedAt || t.createdAt;
      if (!d) return;
      const tDate = new Date(d);
      const label = M[tDate.getMonth()];
      map[label] = (map[label] || 0) + (Number(t.valor) || 0);
    });
    return M.map(m => ({ name: m, valor: map[m] || 0 }));
  }, [filtered]);

  const totals = useMemo(() => {
    const cur = filtered.reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
    const count = filtered.length;
    const solved = filtered.filter(t => (t.situacao||'').toLowerCase() === 'solucionado').length;
    return { cur, count, solved };
  }, [filtered]);

  if (loading) return <DashboardSkeleton />;

  return (
    <section className="view-section active">
      <div className="dash-wrapper">
        
        {/* ── ALERTS BAR ── */}
        {alerts.length > 0 && (
          <div className="dash-alerts-banner">
            <div className="alert-icon-box"><Bell size={20} /></div>
            <div className="alert-text">
              <strong>{alerts.length} Chamados Críticos</strong>
              <p>Existem chamados vencendo hoje ou atrasados que precisam de atenção imediata.</p>
            </div>
            <div className="alert-items">
              {alerts.map(a => (
                <div key={a.id} className="alert-item-pill">#{a.numero}</div>
              ))}
            </div>
            <button className="alert-btn" onClick={() => onNavigate('list')}>Resolver <ArrowRight size={14} /></button>
          </div>
        )}

        {/* ── HERO ── */}
        <div className="dash-hero">
          <div className="dash-hero-text">
            <h1>Gestão Operacional ⚡</h1>
            <p>Resumo detalhado dos processos para o período selecionado.</p>
          </div>
          <div className="dash-hero-actions">
            <div className="dash-period-tabs">
              {['Today', 'Week', 'Month', 'Year'].map(p => (
                <button key={p} className={`dash-period-tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                  {p === 'Today' ? 'Hoje' : p === 'Week' ? 'Semana' : p === 'Month' ? 'Mês' : 'Ano'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── KPI GRID with MoM ── */}
        <div className="dash-kpi-grid">
          {[
            { label: 'Chamados', value: totals.count, icon: <BarChart3 size={18} />, color: '#3B82F6', mom: '+12%', up: true },
            { label: 'Volume Financeiro', value: fmt(totals.cur), icon: <TrendingUp size={18} />, color: '#8B5CF6', mom: '+8.4%', up: true, isText: true },
            { label: 'Eficiência', value: totals.count > 0 ? Math.round((totals.solved/totals.count)*100)+'%' : '0%', icon: <Target size={18} />, color: '#10B981', mom: '+2%', up: true },
            { label: 'Em Processamento', value: filtered.filter(t=>(t.situacao||'').toLowerCase()==='processando').length, icon: <Activity size={18} />, color: '#F59E0B', mom: '-5%', up: false },
          ].map((k, i) => (
            <div key={i} className="dash-kpi-card" style={{ '--kpi-accent': k.color }}>
              <div className="kpi-top-row">
                <div className="kpi-icon-wrap" style={{ background: `${k.color}15`, color: k.color }}>{k.icon}</div>
                <div className={`kpi-mom ${k.up ? 'up' : 'down'}`}>{k.up ? '↑' : '↓'} {k.mom}</div>
              </div>
              <div className="kpi-value" style={{ fontSize: k.isText ? '1.35rem' : '2.25rem' }}>{k.value}</div>
              <div className="kpi-label">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="dash-main-grid">
          {/* Heatmap & Breakdown */}
          <div className="dash-col-left">
            <div className="dash-card">
              <div className="dash-card-header">
                <div><h3 className="dash-card-title">Intensidade de Chamados</h3><p className="dash-card-subtitle">Volume nos últimos 90 dias</p></div>
              </div>
              <ActivityHeatmap tickets={tickets} />
            </div>

            <div className="dash-card" style={{ marginTop: '2rem' }}>
              <div className="dash-card-header">
                <div><h3 className="dash-card-title">Gastos Mensais</h3><p className="dash-card-subtitle">Evolução financeira acumulada por mês</p></div>
                <TrendingUp size={16} color="var(--primary)" />
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyData} margin={{ left: -10, right: 20, top: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '0.65rem', opacity: 0.5 }} />
                  <YAxis axisLine={false} tickLine={false} style={{ fontSize: '0.65rem', opacity: 0.5 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="var(--primary)" 
                    strokeWidth={2} 
                    fill="url(#lineGrad)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--primary)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="dash-col-right">
            <div className="dash-card activity-feed">
              <div className="dash-card-header">
                <div><h3 className="dash-card-title">Atividade Recente</h3><p className="dash-card-subtitle">Últimas 5 interações</p></div>
                <History size={16} color="var(--muted-foreground)" />
              </div>
              <div className="activity-timeline">
                {recentActivity.map((a, i) => (
                  <div key={i} className="activity-item">
                    <div className="activity-dot" style={{ background: getStatus(a.status).color }} />
                    <div className="activity-content">
                      <p><strong>{a.user}</strong> {a.action} no chamado <strong>{a.target}</strong></p>
                      <span>{new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {a.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="dash-card-footer-btn" onClick={() => onNavigate('activities')}>Ver Histórico Completo</button>
            </div>

            <div className="dash-quick-actions-v2">
               <button className="qa-v2-btn"><Plus size={18} /> Novo Ticket</button>
               <button className="qa-v2-btn secondary"><FileText size={18} /> Exportar</button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}