import React, { useMemo, useRef } from 'react';
import { Edit, Download, Upload, FileCheck, FileDown, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import '../styles/pages/CNPJ.css';

export default function CNPJ({ tickets, onEdit, onAddTicket, onUpdateTicket }) {
  const fileInputRef = useRef(null);

  // Helper: Mask CNPJ (handle letters/symbols like in TicketForm)
  const formatCNPJ = (v = '') => {
    if (!v) return '';
    let val = v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 14);
    if (val.length > 12) return val.replace(/^(.{2})(.{3})(.{3})(.{4})(.{2}).*/, '$1.$2.$3/$4-$5');
    if (val.length > 8)  return val.replace(/^(.{2})(.{3})(.{3})(.{4}).*/, '$1.$2.$3/$4');
    if (val.length > 5)  return val.replace(/^(.{2})(.{3})(.{0,3}).*/, '$1.$2.$3');
    if (val.length > 2)  return val.replace(/^(.{2})(.{0,3}).*/, '$1.$2');
    return val;
  };

  // Primary Key Logic: De-duplicate tickets by CNPJ
  const uniqueList = useMemo(() => {
    const map = new Map();
    tickets
      .filter(r => !r.deleted && (r.cnpj || '').trim() !== '')
      .forEach(t => {
        // We keep the most recent version (latest update)
        const cleanCnpj = t.cnpj.replace(/\D/g, '');
        const existing = map.get(cleanCnpj);
        if (!existing || new Date(t.updatedAt) > new Date(existing.updatedAt)) {
          map.set(cleanCnpj, t);
        }
      });
    return Array.from(map.values()).sort((a,b) => a.razao.localeCompare(b.razao));
  }, [tickets]);

  // Export to Excel (.xlsx)
  const handleExport = () => {
    const data = uniqueList.map(item => ({
      'Razão Social': item.razao,
      'CNPJ': item.cnpj,
      'Requisitante': item.requisitante,
      'Setor': item.setor,
      'Código Ética': item.codEtica === 'sim' ? 'Sim' : 'Não'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Empresas");
    XLSX.writeFile(wb, `Lista_CNPJ_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Import from Excel/CSV
  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert('O arquivo está vazio!');
          return;
        }

        let imported = 0;
        let updated = 0;
        let errors = 0;

        data.forEach(row => {
          const rawCnpj = row['CNPJ'] || row['cnpj'] || '';
          const cleanCnpj = row['CNPJ']?.toString().replace(/\D/g, '') || row['cnpj']?.toString().replace(/\D/g, '') || '';
          const razao = row['Razão Social'] || row['razao'] || '';
          const req = row['Requisitante'] || row['requisitante'] || '';
          const setor = row['Setor'] || row['setor'] || '';
          
          if (!cleanCnpj || !razao) {
            errors++;
            return;
          }

          // Check if exists in Current View (which de-duplicates from tickets)
          const existing = uniqueList.find(t => t.cnpj.replace(/\D/g, '') === cleanCnpj);

          const payload = {
            razao,
            cnpj: formatCNPJ(cleanCnpj),
            requisitante: req,
            setor: setor,
            updatedAt: new Date().toISOString()
          };

          if (existing) {
            onUpdateTicket(existing.id, payload);
            updated++;
          } else {
            onAddTicket(payload);
            imported++;
          }
        });

        alert(`Processamento Concluído:\n✅ Novas Empresas: ${imported}\n🔄 Atualizadas (Upsert): ${updated}\n❌ Erros: ${errors}`);
      } catch (err) {
        console.error(err);
        alert('Erro ao processar o arquivo. Verifique o formato!');
      }
      e.target.value = ''; // Reset input
    };
    reader.readAsBinaryString(file);
  };

  return (
    <section id="view-cnpj" className="view-section active">
      <div className="section-header">
        <div>
          <h2 className="section-title">Gerenciamento de Empresas (CNPJ)</h2>
          <p className="section-subtitle">Banco de dados de parceiros e clientes. Sincronizado com os chamados.</p>
        </div>

        <div className="section-header-actions" style={{ display: 'flex', gap: '0.75rem' }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".xlsx,.xls,.csv" 
            style={{ display: 'none' }} 
          />
          <button 
            className="tb-icon-btn" 
            onClick={handleImportClick} 
            title="Importar Excel/CSV"
            style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: 'auto', padding: '0 1rem', display: 'flex', gap: '8px' }}
          >
            <Upload size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Importar</span>
          </button>
          
          <button 
            className="tb-icon-btn" 
            onClick={handleExport} 
            title="Exportar para Excel"
            style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: 'auto', padding: '0 1rem', display: 'flex', gap: '8px' }}
          >
            <Download size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Exportar</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Razão Social</th>
                <th>CNPJ (Primary Key)</th>
                <th>Requisitante</th>
                <th>Setor</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {uniqueList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
                      <AlertTriangle size={32} style={{ margin: '0 auto 1rem' }} />
                      <p>Nenhuma empresa cadastrada ou arquivo importado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                uniqueList.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.razao}</td>
                    <td style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>{item.cnpj}</td>
                    <td>{item.requisitante}</td>
                    <td><span className="chip" style={{ background: 'var(--secondary)' }}>{item.setor || '-'}</span></td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button className="action-btn edit" title="Editar" onClick={() => onEdit(item)}>
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
