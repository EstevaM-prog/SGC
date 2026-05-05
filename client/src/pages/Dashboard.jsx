import React, { useState, useMemo } from 'react';
import {
  BarChart3, Clock, CheckCircle2, FileInput,
  Settings2, TrendingUp, Calendar, AlertCircle,
  ArrowUpRight, ArrowDownRight, ChevronRight,
  ChevronLeft, Zap, Plus
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
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

/* ─── Mini Calendar ─── */
const Calendario = ({ selectedDate, onDateClick, tickets = [] }) => {
  const [view, setView] = useState(new Date());
  const ano = view.getFullYear();
  const mes = view.getMonth();
  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const DIAS  = ['D','S','T','Q','Q','S','S'];
  const firstDay  = new Date(ano, mes, 1).getDay();
  const daysCount = new Date(ano, mes + 1, 0).getDate();
  const blanks = Array(firstDay).fill(null);
  const days   = Array.from({ length: daysCount }, (_, i) => i + 1);
  const nav = off => setView(new Date(ano, mes + off, 1));

  const activityMap = useMemo(() => {
    const map = {};
    tickets.forEach(t => {
      const d = t.updatedAt || t.createdAt;
      if (!d) return;
      const key = new Date(d).toDateString();
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [tickets]);

  return (
    <div className="dash-calendar-card">
      <div className="cal-header">
        <span className="cal-month-label">
          <Calendar size={15} color="var(--primary)" />
          {MESES[mes]} {ano}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="cal-nav-btn" onClick={() => nav(-1)}>
            <ChevronLeft size={13} />
          </button>
          <button className="cal-nav-btn" onClick={() => nav(1)}>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <div className="cal-grid">
        {DIAS.map((d, i) => <div key={i} className="cal-weekday">{d}</div>)}
        {blanks.map((_, i) => <div key={`b${i}`} />)}
        {days.map(d => {
          const date     = new Date(ano, mes, d);
          const isToday  = new Date().toDateString() === date.toDateString();
          const isSel    = selectedDate?.toDateString() === date.toDateString();
          const hasDot   = !!activityMap[date.toDateString()];
          return (
            <div
              key={d}
              onClick={() => onDateClick(date)}
              className={`cal-day${isToday?' is-today':''}${isSel?' is-selected':''}`}
            >
              {d}
              {hasDot && <span className="cal-activity-dot" />}
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <button
          onClick={() => onDateClick(null)}
          style={{
            marginTop: '1rem', width: '100%', padding: '7px', border: 'none',
            background: 'var(--secondary)', borderRadius: 10, cursor: 'pointer',
            fontSize: '0.73rem', fontWeight: 700, color: 'var(--muted-foreground)',
            transition: 'all 0.2s'
          }}
        >
          Limpar seleção
        </button>
      )}
    </div>
  );
};

/* ─── Main Dashboard ─── */
export default function Dashboard({ tickets = [], loading = false }) {
  const [period, setPeriod] = useState('Month');
  const [selectedDate, setSelectedDate] = useState(null);

  const PERIODS = [
    { key: 'Today', label: 'Hoje' },
    { key: 'Week',  label: 'Semana' },
    { key: 'Month', label: 'Mês' },
    { key: 'Year',  label: 'Ano' },
  ];

  const filtered = useMemo(() => {
    if (!Array.isArray(tickets)) return [];
    const now = new Date();
    return tickets.filter(t => {
      if (!t || t.deleted) return false;
      const dateStr = t.updatedAt || t.createdAt;
      if (!dateStr) return true;
      const tDate = new Date(dateStr);
      if (isNaN(tDate.getTime())) return true;
      const diff = Math.ceil(Math.abs(now - tDate) / 86400000);
      if (period === 'Today') return tDate.toDateString() === now.toDateString();
      if (period === 'Week')  return diff <= 7;
      if (period === 'Month') return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      return true;
    });
  }, [tickets, period]);

  const pendencias = useMemo(() => {
    let list = (Array.isArray(tickets) ? tickets : []).filter(
      t => t && !t.deleted && (t.situacao || '').toLowerCase() !== 'solucionado'
    );
    if (selectedDate) {
      list = list.filter(t => {
        const d = t.updatedAt || t.createdAt;
        return d && new Date(d).toDateString() === selectedDate.toDateString();
      });
    }
    return list
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
      .slice(0, 7);
  }, [tickets, selectedDate]);

  const total       = filtered.length;
  const open        = filtered.filter(t => (t.situacao||'').toLowerCase() === 'aberto').length;
  const solucionado = filtered.filter(t => (t.situacao||'').toLowerCase() === 'solucionado').length;
  const escriturar  = filtered.filter(t => (t.situacao||'').toLowerCase() === 'escriturar').length;
  const processando = filtered.filter(t => (t.situacao||'').toLowerCase() === 'processando').length;

  const totalValor = filtered.reduce((acc, t) => {
    const v = typeof t.valor === 'number' ? t.valor : parseFloat((t.valor+'').replace(/[^\d,]/g,'').replace(',','.')) || 0;
    return acc + v;
  }, 0);

  const statusData = [
    { name: 'Aberto',      value: open,        color: '#3B82F6' },
    { name: 'Escriturar',  value: escriturar,  color: '#8B5CF6' },
    { name: 'Solucionado', value: solucionado, color: '#10B981' },
    { name: 'Processando', value: processando, color: '#F59E0B' },
  ].filter(d => d.value > 0);

  const monthlyData = useMemo(() => {
    const M = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const map = {};
    filtered.forEach(t => {
      if (!t) return;
      const dateStr = t.updatedAt || t.createdAt;
      if (!dateStr) return;
      const tDate = new Date(dateStr);
      if (isNaN(tDate.getTime())) return;
      const label = M[tDate.getMonth()];
      const val = typeof t.valor === 'number' ? t.valor
        : parseFloat((t.valor+'').replace(/[^\d,]/g,'').replace(',','.')) || 0;
      if (label) map[label] = (map[label] || 0) + val;
    });
    return M.map(m => ({ name: m, valor: map[m] || 0 }));
  }, [filtered]);

  if (loading) return <DashboardSkeleton />;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <section className="view-section active">
      <div className="dash-wrapper">

        {/* ── HERO BANNER ── */}
        <div className="dash-hero">
          <div className="dash-hero-text">
            <h1>{greeting}! &#128075;</h1>
            <p>Aqui está o resumo operacional para {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}.</p>
          </div>
          <div className="dash-hero-actions">
            <div className="dash-period-tabs" style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 3 }}>
              {PERIODS.map(p => (
                <button
                  key={p.key}
                  className={`dash-period-tab${period === p.key ? ' active' : ''}`}
                  style={period === p.key
                    ? { background: '#fff', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }
                    : { color: 'rgba(255,255,255,0.8)' }
                  }
                  onClick={() => setPeriod(p.key)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── KPI CARDS ── */}
        <div className="dash-kpi-grid">
          {[
            {
              label: 'Total de Chamados', value: total,
              icon: <BarChart3 size={18} />,
              kpiBg: 'rgba(59,130,246,0.12)', kpiColor: '#3B82F6',
              accent: '#3B82F6',
              badge: '+12%', badgeBg: 'rgba(16,185,129,0.1)', badgeColor: '#10B981', up: true
            },
            {
              label: 'Volume Financeiro', value: fmt(totalValor),
              isText: true,
              icon: <TrendingUp size={18} />,
              kpiBg: 'rgba(139,92,246,0.12)', kpiColor: '#8B5CF6',
              accent: '#8B5CF6',
              badge: '+8%', badgeBg: 'rgba(16,185,129,0.1)', badgeColor: '#10B981', up: true
            },
            {
              label: 'Solucionados', value: solucionado,
              icon: <CheckCircle2 size={18} />,
              kpiBg: 'rgba(16,185,129,0.12)', kpiColor: '#10B981',
              accent: '#10B981',
              badge: total > 0 ? Math.round((solucionado/total)*100)+'%' : '0%',
              badgeBg: 'rgba(16,185,129,0.1)', badgeColor: '#10B981', up: true
            },
            {
              label: 'Pendências Abertas', value: total - solucionado,
              icon: <AlertCircle size={18} />,
              kpiBg: 'rgba(245,158,11,0.12)', kpiColor: '#F59E0B',
              accent: '#F59E0B',
              badge: '-3%', badgeBg: 'rgba(239,68,68,0.1)', badgeColor: '#EF4444', up: false
            },
          ].map((k, i) => (
            <div
              key={i}
              className="dash-kpi-card"
              style={{ '--kpi-accent': k.accent, '--kpi-bg': k.kpiBg, '--kpi-color': k.kpiColor }}
            >
              <div className="kpi-top-row">
                <div className="kpi-icon-wrap">{k.icon}</div>
                <div
                  className="kpi-badge"
                  style={{ background: k.badgeBg, color: k.badgeColor }}
                >
                  {k.up ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
                  {k.badge}
                </div>
              </div>
              <div className="kpi-value" style={{ fontSize: k.isText ? '1.35rem' : '2.25rem' }}>
                {k.value}
              </div>
              <div className="kpi-label">{k.label}</div>
            </div>
          ))}
        </div>

        {/* ── CHARTS ROW ── */}
        <div className="dash-charts-row">
          {/* Area Chart */}
          <div className="dash-chart-card">
            <div className="dash-chart-header">
              <div>
                <h3 className="dash-chart-title">Evolução Financeira</h3>
                <p className="dash-chart-subtitle">Faturamento acumulado por mês</p>
              </div>
              <Zap size={16} color="var(--primary)" />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '0.7rem' }} />
                <YAxis axisLine={false} tickLine={false} style={{ fontSize: '0.7rem' }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fill="url(#areaGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Donut + breakdown */}
          <div className="dash-chart-card">
            <div className="dash-chart-header">
              <div>
                <h3 className="dash-chart-title">Status Atual</h3>
                <p className="dash-chart-subtitle">Distribuição de chamados</p>
              </div>
            </div>

            {statusData.length > 0 ? (
              <>
                <div style={{ position: 'relative' }}>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        innerRadius={52}
                        outerRadius={72}
                        paddingAngle={6}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {statusData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [v, 'Chamados']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="donut-center">
                    <div className="donut-center-value">{total}</div>
                    <div className="donut-center-label">Total</div>
                  </div>
                </div>

                <div className="status-breakdown-list">
                  {statusData.map((s, i) => (
                    <div key={i} className="status-breakdown-item">
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--foreground)', fontWeight: 600, flex: 1 }}>{s.name}</span>
                      <div className="status-breakdown-bar-bg">
                        <div
                          className="status-breakdown-bar-fill"
                          style={{ width: `${total > 0 ? (s.value / total) * 100 : 0}%`, background: s.color }}
                        />
                      </div>
                      <span className="status-breakdown-count">{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="dash-empty">
                <div className="dash-empty-icon"><AlertCircle size={22} /></div>
                <p>Sem dados para o período</p>
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER ROW: Calendar + Pending ── */}
        <div className="dash-footer-row">
          <Calendario
            selectedDate={selectedDate}
            onDateClick={d => setSelectedDate(d && selectedDate?.toDateString() === d.toDateString() ? null : d)}
            tickets={tickets}
          />

          <div className="dash-pending-card">
            <div className="pending-header">
              <div>
                <h3 className="dash-chart-title">
                  {selectedDate
                    ? `Pendências — ${selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`
                    : 'Últimas Pendências'}
                </h3>
                <p className="dash-chart-subtitle">
                  {pendencias.length} {pendencias.length === 1 ? 'chamado aguardando' : 'chamados aguardando'} atenção
                </p>
              </div>
              <div className="pending-header-actions">
                <button style={{
                  width: 30, height: 30, border: 'none', borderRadius: 9,
                  background: 'var(--secondary)', color: 'var(--muted-foreground)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s'
                }}>
                  <Settings2 size={14} />
                </button>
              </div>
            </div>

            <div className="dash-pending-list">
              {pendencias.length > 0 ? pendencias.map((t, idx) => {
                const initials = (t.requisitante || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                const st = getStatus(t.situacao);
                return (
                  <div key={idx} className="dash-pending-item">
                    <div className="dash-pending-avatar">{initials}</div>
                    <div className="dash-pending-body">
                      <div className="dash-pending-name">{t.razao || 'Fornecedor n/a'}</div>
                      <div className="dash-pending-meta">
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, flexShrink: 0 }} />
                        <span style={{ color: st.color, fontWeight: 700 }}>{t.situacao}</span>
                        {t.numero && <><span>·</span><span>#{t.numero}</span></>}
                        {t.vencimento && (
                          <><span>·</span><span>Venc. {new Date(t.vencimento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span></>
                        )}
                      </div>
                    </div>
                    <div className="dash-pending-value">{fmt(t.valor)}</div>
                    <ChevronRight size={14} className="dash-pending-arrow" />
                  </div>
                );
              }) : (
                <div className="dash-empty">
                  <div className="dash-empty-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                    <CheckCircle2 size={22} />
                  </div>
                  <p>{selectedDate ? 'Nenhuma pendência neste dia.' : 'Tudo em dia por aqui!'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}