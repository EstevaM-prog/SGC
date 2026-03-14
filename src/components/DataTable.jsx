import React from 'react';
import { Edit, Trash, RotateCcw, XCircle } from 'lucide-react';

export default function DataTable({ tickets, onEdit, onDelete, onRestore, onPermanentDelete, isTrash }) {
  const formatCurrency = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '';
    return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString('pt-BR'); } catch { return iso; }
  };

  const getDueInfo = (vencimento) => {
    if (!vencimento) return { class: '', label: '' };
    const v = new Date(vencimento);
    const today = new Date();
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffMs = v - todayZero;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { class: 'badge-due', label: ' (vencido)' };
    if (diffDays <= 3) return { class: 'badge-warning', label: ` (vence em ${diffDays}d)` };
    return { class: '', label: '' };
  };

  if (tickets.length === 0) {
    return (
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Nº Chamado</th>
              <th>Data Emissão</th>
              <th>Pedido</th>
              <th>Nota Fiscal</th>
              <th>Vencimento</th>
              <th>Valor (R$)</th>
              <th>Forma Pagto</th>
              <th>Razão Social</th>
              <th>CNPJ</th>
              <th>Requisitante</th>
              <th className="small">Observação</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="13" className="empty-state">
                {isTrash ? "A lixeira está vazia." : 'Nenhum chamado encontrado.'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Nº Chamado</th>
            <th>Data Emissão</th>
            <th>Pedido</th>
            <th>Nota Fiscal</th>
            <th>Vencimento</th>
            <th>Valor (R$)</th>
            <th>Forma Pagto</th>
            <th>Razão Social</th>
            <th>CNPJ</th>
            <th>Requisitante</th>
            <th className="small">Observação</th>
            <th className="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(t => {
            const dueInfo = getDueInfo(t.vencimento);
            return (
              <tr key={t.id}>
                <td>
                  <span className={`status-badge status-${(t.situacao || '').toLowerCase().replace(/\s+/g, '-')}`}>
                    {t.situacao}
                  </span>
                </td>
                <td>{t.numero}</td>
                <td>{formatDate(t.dataEmissao)}</td>
                <td>{t.pedido}</td>
                <td>{t.notaFiscal}</td>
                <td>
                  {formatDate(t.vencimento)}
                  {dueInfo.label && <span className={dueInfo.class}>{dueInfo.label}</span>}
                </td>
                <td>{formatCurrency(t.valor)}</td>
                <td>{t.forma}</td>
                <td>{t.razao}</td>
                <td>{t.cnpj}</td>
                <td>{t.requisitante}</td>
                <td className="small" title={t.obs}>
                  {t.obs && t.obs.length > 80 ? t.obs.substring(0, 80) + '...' : t.obs}
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    {isTrash ? (
                      <>
                        <button className="action-btn" title="Restaurar" onClick={() => onRestore(t.id)}>
                          <RotateCcw size={16} />
                        </button>
                        <button className="action-btn delete" title="Excluir Definitivo" onClick={() => onPermanentDelete(t.id)}>
                          <XCircle size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="action-btn edit" title="Editar" onClick={() => onEdit(t)}>
                          <Edit size={16} />
                        </button>
                        <button className="action-btn delete" title="Enviar para Lixeira" onClick={() => onDelete(t.id)}>
                          <Trash size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
