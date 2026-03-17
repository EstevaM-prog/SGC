import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  FileInput,
  Settings2,
  TrendingUp,
  Calendar,
  AlertCircle,
  XCircle,
  Pencil
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import '../styles/pages/Dashboard.css';

const Calendario = ({ selectedDate, onDateClick }) => {
  const [dataVisualizacao, setDataVisualizacao] = useState(new Date());

  const ano = dataVisualizacao.getFullYear();
  const mes = dataVisualizacao.getMonth();

  // Nomes dos meses e dias
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Lógica para calcular os dias
  const primeiroDiaDoMes = new Date(ano, mes, 1).getDay(); // 0 (Dom) a 6 (Sáb)
  const diasNoMes = new Date(ano, mes + 1, 0).getDate(); // Ex: 31

  // Criar arrays para o render
  const espacosVazios = Array(primeiroDiaDoMes).fill(null);
  const diasDoMes = Array.from({ length: diasNoMes }, (_, i) => i + 1);

  // Navegação
  const mudarMes = (offset) => {
    const novaData = new Date(ano, mes + offset, 1);
    setDataVisualizacao(novaData);
  };

  return (
    <div className="card" style={{ padding: '1.5rem', height: '100%', margin: 0 }}>
      <div className='calender-container'>
        <div className="calendar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <button className="action-btn" onClick={() => mudarMes(-1)}>&lt;</button>
          <h4 style={{ margin: 0 }}>{meses[mes]} {ano}</h4>
          <button className="action-btn" onClick={() => mudarMes(1)}>&gt;</button>
        </div>

        <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {diasSemana.map(d => (
            <div key={d} className="weekday-label" style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', padding: '4px 0' }}>
              {d}
            </div>
          ))}

          {/* Renderiza espaços vazios até o dia 1 */}
          {espacosVazios.map((_, i) => <div key={`empty-${i}`} className="day empty" style={{ height: '40px' }}></div>)}

          {/* Renderiza os dias reais */}
          {diasDoMes.map(dia => {
            const d = new Date(ano, mes, dia);
            const isToday = new Date().toLocaleDateString() === d.toLocaleDateString();
            const isSelected = selectedDate && selectedDate.toLocaleDateString() === d.toLocaleDateString();

            return (
              <div
                key={dia}
                className={`day active ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => onDateClick(d)}
                style={{
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--primary)' : (isToday ? 'var(--primary-glow)' : 'transparent'),
                  color: isSelected ? 'white' : (isToday ? 'var(--primary)' : 'inherit'),
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                  transition: 'all 0.2s ease',
                  fontWeight: isSelected || isToday ? '700' : '400'
                }}>
                {dia}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function Dashboard({ tickets = [] }) {
  const [period, setPeriod] = useState('Year');
  const [selectedDate, setSelectedDate] = useState(null);

  // Filter logic based on the selected period
  const filteredTickets = useMemo(() => {
    const now = new Date();
    return tickets.filter(t => {
      if (t.deleted) return false;
      if (!t.updatedAt) return true; // Fallback for old data

      const ticketDate = new Date(t.updatedAt);
      const diffTime = Math.abs(now - ticketDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (period) {
        case 'Today':
          return diffDays <= 1 && now.getDate() === ticketDate.getDate();
        case 'Week':
          return diffDays <= 7;
        case 'Month':
          return diffDays <= 30;
        case 'Year':
          return diffDays <= 365;
        default:
          return true;
      }
    });
  }, [tickets, period]);

  // Status list filtered by selected date if exists
  const statusListTickets = useMemo(() => {
    let list = filteredTickets.filter(t => ['aberto', 'processando', 'escriturar'].includes((t.situacao || '').toLowerCase()));

    if (selectedDate) {
      const selectedStr = selectedDate.toLocaleDateString();
      list = list.filter(t => {
        const date = t.updatedAt ? new Date(t.updatedAt) : (t.createdAt ? new Date(t.createdAt) : null);
        return date && date.toLocaleDateString() === selectedStr;
      });
    }

    return list;
  }, [filteredTickets, selectedDate]);

  // KPIs
  const total = filteredTickets.length;
  const open = filteredTickets.filter(t => (t.situacao || '').toLowerCase() === 'aberto').length;
  const solucionado = filteredTickets.filter(t => (t.situacao || '').toLowerCase() === 'solucionado').length;
  const escriturar = filteredTickets.filter(t => (t.situacao || '').toLowerCase() === 'escriturar').length;
  const processando = filteredTickets.filter(t => (t.situacao || '').toLowerCase() === 'processando').length;

  // Chart Data: Status Distribution (Pie)
  const statusData = [
    { name: 'Aberto', value: open, color: '#2563eb' },
    { name: 'Escriturar', value: escriturar, color: '#7c3aed' },
    { name: 'Solucionado', value: solucionado, color: '#10b981' },
    { name: 'Processando', value: processando, color: '#f59e0b' }
  ].filter(d => d.value > 0);

  // Chart Data: Monthly Expenditure (Bar)
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dataMap = {};

    filteredTickets.forEach(t => {
      if (!t.updatedAt || !t.valor) return;
      const date = new Date(t.updatedAt);
      const monthLabel = months[date.getMonth()];

      let val = 0;
      if (typeof t.valor === 'number') {
        val = t.valor;
      } else if (typeof t.valor === 'string') {
        // Handle R$ 1.234,56 format
        val = parseFloat(t.valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
      }

      dataMap[monthLabel] = (dataMap[monthLabel] || 0) + val;
    });

    return months.map(m => ({
      name: m,
      valor: dataMap[m] || 0
    })).filter(d => d.valor > 0 || period === 'Year');
  }, [filteredTickets, period]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <section className="view-section active">
      <header className="section-header">
        <div>
          <h2 className="section-title">Dashboard Profissional</h2>
          <p className="section-subtitle">Análise detalhada e indicadores de performance</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Calendar size={18} style={{ color: 'var(--muted-foreground)' }} />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="custom-select"
            style={{ width: '160px' }}
          >
            <option value="Today">Hoje</option>
            <option value="Week">Esta Semana</option>
            <option value="Month">Este Mês</option>
            <option value="Year">Este Ano</option>
          </select>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-content-wrapper">
            <div>
              <p className="stat-label">Total de Chamados</p>
              <h3 className="stat-value">{total}</h3>
            </div>
            <div className="stat-icon gradient-primary">
              <BarChart3 size={22} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content-wrapper">
            <div>
              <p className="stat-label">Em Aberto</p>
              <h3 className="stat-value">{open}</h3>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
              <AlertCircle size={22} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content-wrapper">
            <div>
              <p className="stat-label">Solucionados</p>
              <h3 className="stat-value">{solucionado}</h3>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <CheckCircle2 size={22} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content-wrapper">
            <div>
              <p className="stat-label">Escriturar</p>
              <h3 className="stat-value">{escriturar}</h3>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
              <FileInput size={22} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content-wrapper">
            <div>
              <p className="stat-label">Processando</p>
              <h3 className="stat-value">{processando}</h3>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <Settings2 size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Expenditure Bar Chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', fontWeight: 700 }}>
              <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
              Gastos Mensais (R$)
            </h4>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={(val) => `R$ ${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`}
                />
                <Tooltip
                  cursor={{ fill: 'var(--secondary)', opacity: 0.4 }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                  formatter={(value) => [formatCurrency(value), 'Gastos']}
                />
                <Bar
                  dataKey="valor"
                  fill="var(--primary)"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', fontWeight: 700 }}>
              <Settings2 size={20} style={{ color: 'var(--primary)' }} />
              Distribuição de Status
            </h4>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            {statusData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      background: 'var(--card)',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
                <AlertCircle size={40} style={{ marginBottom: '0.5rem', opacity: 0.2 }} />
                Nenhum dado para exibir neste período.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-Side: Calendar and Status Table */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '1.5rem',
        alignItems: 'stretch'
      }}>
        <div style={{ height: '100%' }}>
          <Calendario
            selectedDate={selectedDate}
            onDateClick={(date) => setSelectedDate(prev => prev?.toLocaleDateString() === date.toLocaleDateString() ? null : date)}
          />
        </div>

        <div className="card" style={{ padding: '1.5rem', margin: 0, height: '100%', minHeight: '400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 className="panel-title" style={{ margin: 0 }}>
              {selectedDate ? `Pendências - ${selectedDate.toLocaleDateString('pt-BR')}` : 'Visualização por Status das Pendências'}
            </h3>
            {selectedDate && (
              <button
                className="action-btn"
                onClick={() => setSelectedDate(null)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                title="Limpar filtro de data"
              >
                <XCircle size={14} /> Limpar Filtro
              </button>
            )}
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Em aberto</th>
                  <th style={{ width: '25%' }}>Processando</th>
                  <th style={{ width: '25%' }}>Escriturar</th>
                  <th style={{ width: '25%' }}>Vencimento</th>
                </tr>
              </thead>
              <tbody>
                {statusListTickets.length > 0 ? (
                  statusListTickets.slice(0, 15).map(t => {
                    const status = (t.situacao || '').toLowerCase();
                    const ticketInfo = (
                      <div className="status-cell-content" style={{ padding: '4px 0' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>NF: {t.notaFiscal || '---'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, margin: '2px 0' }}>
                          {formatCurrency(typeof t.valor === 'number' ? t.valor : 0)}
                        </div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.6, fontFamily: 'monospace' }}>
                          #{t.id ? t.id.slice(-8).toUpperCase() : '---'}
                        </div>
                      </div>
                    );

                    return (
                      <tr key={t.id}>
                        <td>{status === 'aberto' ? ticketInfo : ''}</td>
                        <td>{status === 'processando' ? ticketInfo : ''}</td>
                        <td>{status === 'escriturar' ? ticketInfo : ''}</td>
                        <td style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                          {t.vencimento ? new Date(t.vencimento).toLocaleDateString('pt-BR') : '-'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>
                      {selectedDate
                        ? 'Nenhuma pendência encontrada para este dia.'
                        : 'Nenhuma pendência encontrada para este período.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
