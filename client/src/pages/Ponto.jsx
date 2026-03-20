import React, { useState } from 'react';
import { Plus, Trash2, Clock, Calendar, CheckCircle2, XCircle, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/pages/Ponto.css';

export default function Ponto({ tickets, addTicket, updateTicket, softDeleteTicket, addActivity }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    entrada: '',
    saida: ''
  });

  // Configuração padrão: 1h de almoço (60min) e 8h de jornada (480min)
  const INTERVALO_PADRAO = 60;
  const JORNADA_PADRAO = 480;

  const calculateMinutes = (entrada, saida) => {
    if (!entrada || !saida) return 0;
    const [h1, m1] = entrada.split(':').map(Number);
    const [h2, m2] = saida.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60;
    return diff;
  };

  const getSaldoMinutos = (entrada, saida) => {
    const minutosTrabalhados = calculateMinutes(entrada, saida);
    if (minutosTrabalhados === 0) return 0;
    return minutosTrabalhados - INTERVALO_PADRAO - JORNADA_PADRAO;
  };

  const formatSaldo = (minutos) => {
    const sinal = minutos < 0 ? "-" : "+";
    const absMinutos = Math.abs(minutos);
    const hours = Math.floor(absMinutos / 60);
    const minutes = absMinutos % 60;
    return `${sinal}${hours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setFormData({
      data: t.data,
      entrada: t.entrada,
      saida: t.saida
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingId ? 'Atualizando ponto...' : 'Registrando ponto...');

    try {
      const saldoMin = getSaldoMinutos(formData.entrada, formData.saida);
      const saldoFormatado = formatSaldo(saldoMin);

      const recordData = {
        ...formData,
        resultado: saldoFormatado,
        saldoMinutos: saldoMin, // Guardamos o valor numérico para cálculos
        type: 'ponto_record',
        updatedAt: new Date().toISOString()
      };

      await new Promise(r => setTimeout(r, 600));

      if (editingId) {
        updateTicket(editingId, recordData);
      } else {
        addTicket({
          ...recordData,
          createdAt: new Date().toISOString()
        });
      }

      if (addActivity) {
        addActivity({
          text: editingId ? `Registro de Ponto Alterado` : `Novo Registro de Ponto`,
          description: `Data: ${new Date(formData.data + 'T00:00:00').toLocaleDateString('pt-BR')} | Entrada: ${formData.entrada} | Saída: ${formData.saida} | Saldo: ${saldoFormatado}`,
          type: editingId ? 'warning' : 'info',
          iconType: 'time'
        });
      }

      toast.success("Criado com sucesso!", { id: loadingToast });
      setEditingId(null);
      setFormData({
        data: new Date().toISOString().split('T')[0],
        entrada: '',
        saida: ''
      });
      setShowForm(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro no chamado!", { id: loadingToast });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      data: new Date().toISOString().split('T')[0],
      entrada: '',
      saida: ''
    });
  };

  const pontoRecords = tickets.filter(t => t.type === 'ponto_record' && !t.deleted);

  // Cálculo do saldo total (minutos totais acumulados)
  const totalSaldoMinutos = pontoRecords.reduce((acc, t) => acc + (t.saldoMinutos || 0), 0);
  const totalFormatado = formatSaldo(totalSaldoMinutos);
  const isNegative = totalSaldoMinutos < 0;
  const isPositive = totalSaldoMinutos > 0;

  return (
    <div className="view-section active">
      <div className="section-header ponto-header">
        <div className="ponto-title-wrap">
          <h2 className="section-title">Registro de Ponto</h2>
          <p className="section-subtitle">Gerencie seu controle de horas trabalhadas</p>
        </div>

        <div className="ponto-stats-wrap">
          <div className={`card ponto-balance-card`} style={{
            borderLeft: `4px solid ${isNegative ? 'var(--destructive)' : (isPositive ? 'var(--success)' : 'var(--border)')}`
          }}>
            <div className="ponto-balance-content">
              <label className="ponto-balance-label">
                Saldo Acumulado
              </label>
              <div className="ponto-balance-value-row">
                <span className="ponto-balance-value" style={{
                  color: isNegative ? 'var(--destructive)' : (isPositive ? 'var(--success)' : 'var(--foreground)')
                }}>
                  {totalFormatado}
                </span>
                <span className={`status-badge ${isNegative ? 'status-cancelado' : (isPositive ? 'status-solucionado' : '')}`} style={{ fontSize: '0.65rem' }}>
                  {isNegative ? 'DEVEDOR' : (isPositive ? 'EXTRAS' : 'ZERADO')}
                </span>
              </div>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={showForm ? handleCancel : () => setShowForm(true)}
          >
            {showForm ? <XCircle size={18} /> : <Plus size={18} />}
            <span>{showForm ? 'Cancelar' : 'Bater Ponto'}</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s ease' }}>
          <form onSubmit={handleSave} className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                <Calendar size={14} style={{ marginRight: '6px' }} /> Data
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.data}
                onChange={e => setFormData({ ...formData, data: e.target.value })}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input)', color: 'var(--foreground)' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                <Clock size={14} style={{ marginRight: '6px' }} /> Entrada
              </label>
              <input
                type="time"
                className="form-input"
                value={formData.entrada}
                onChange={e => setFormData({ ...formData, entrada: e.target.value })}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input)', color: 'var(--foreground)' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                <Clock size={14} style={{ marginRight: '6px' }} /> Saída
              </label>
              <input
                type="time"
                className="form-input"
                value={formData.saida}
                onChange={e => setFormData({ ...formData, saida: e.target.value })}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input)', color: 'var(--foreground)' }}
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <CheckCircle2 size={18} /> {editingId ? 'Salvar Edição' : 'Salvar Registro'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Data</th>
                <th style={{ padding: '1rem' }}>Entrada</th>
                <th style={{ padding: '1rem' }}>Saída</th>
                <th style={{ padding: '1rem' }}>Resultado</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pontoRecords.length > 0 ? (
                pontoRecords.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>{new Date(t.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td style={{ padding: '1rem' }}>{t.entrada}</td>
                    <td style={{ padding: '1rem' }}>{t.saida}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`status-badge ${t.resultado.startsWith('-') ? 'status-cancelado' : 'status-solucionado'}`}>
                        {t.resultado}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit"
                          onClick={() => handleEdit(t)}
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => softDeleteTicket(t.id)}
                          title="Remover"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                    Nenhum registro de ponto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
