import React, { useMemo, useRef, useState } from 'react';
import { Edit, Download, Upload, Table, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import '../styles/pages/CNPJ.css';

export default function CNPJ({ tickets, onEdit, onAddTicket, onUpdateTicket, addActivity }) {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const formatCNPJ = (v = '') => {
    if (!v) return '';
    let val = v.replace(/[^a-zA-Z0-9]/g,'').toUpperCase().slice(0,14);
    if (val.length > 12) return val.replace(/^(.{2})(.{3})(.{3})(.{4})(.{2}).*/, '$1.$2.$3/$4-$5');
    if (val.length > 8)  return val.replace(/^(.{2})(.{3})(.{3})(.{4}).*/, '$1.$2.$3/$4');
    if (val.length > 5)  return val.replace(/^(.{2})(.{3})(.{0,3}).*/, '$1.$2.$3');
    if (val.length > 2)  return val.replace(/^(.{2})(.{0,3}).*/, '$1.$2');
    return val;
  };

  const uniqueList = useMemo(() => {
    const map = new Map();
    tickets.filter(r => !r.deleted && (r.cnpj||'').trim() !== '').forEach(t => {
      const key = t.cnpj.replace(/\D/g,'');
      const ex  = map.get(key);
      if (!ex || new Date(t.updatedAt) > new Date(ex.updatedAt)) map.set(key, t);
    });
    return Array.from(map.values()).sort((a,b) => a.razao.localeCompare(b.razao));
  }, [tickets]);

  const handleExport = () => {
    toast.success('Exportando lista...');
    const data = uniqueList.map(i => ({
      'Razão Social': i.razao, 'CNPJ': i.cnpj,
      'Requisitante': i.requisitante, 'Setor': i.setor,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Empresas');
    XLSX.writeFile(wb, `Lista_CNPJ_${new Date().toISOString().split('T')[0]}.xlsx`);
    if (addActivity) addActivity({ text:'Exportação de CNPJs', description:`${data.length} empresas exportadas.`, type:'info' });
  };

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (!file || isImporting) return;
    setIsImporting(true);
    const t = toast.loading('Processando arquivo...');
    const reader = new FileReader();
    reader.onload = async evt => {
      try {
        const wb = XLSX.read(evt.target.result, { type:'binary' });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        if (!data.length) { toast.error('Arquivo vazio!', { id:t }); setIsImporting(false); return; }
        await new Promise(r => setTimeout(r, 800));
        let added = 0, updated = 0;
        data.forEach(row => {
          const rawCnpj = (row['CNPJ']||row['cnpj']||'').toString();
          const cleanCnpj = rawCnpj.replace(/\D/g,'');
          const razao = row['Razão Social']||row['razao']||'';
          if (!cleanCnpj || !razao) return;
          const ex = uniqueList.find(i => i.cnpj.replace(/\D/g,'') === cleanCnpj);
          const payload = { razao, cnpj:formatCNPJ(cleanCnpj), requisitante:row['Requisitante']||'', setor:row['Setor']||'', updatedAt:new Date().toISOString() };
          if (ex) { onUpdateTicket(ex.id, payload); updated++; }
          else { onAddTicket(payload); added++; }
        });
        if (addActivity) addActivity({ text:'Importação de Arquivo', description:`${added} novos, ${updated} atualizados.`, type:'success' });
        toast.success('Importado com sucesso!', { id:t });
      } catch { toast.error('Erro ao processar!', { id:t }); }
      finally { setIsImporting(false); e.target.value=''; }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <section id="view-cnpj" className="view-section active">

      {/* ── Page Header ── */}
      <div className="sgc-page-header">
        <div className="sgc-page-title-block">
          <h1 className="sgc-page-title">Tabela CNPJ</h1>
          <p className="sgc-page-subtitle">
            Banco de dados de parceiros e clientes — {uniqueList.length} empresa{uniqueList.length !== 1?'s':''} cadastrada{uniqueList.length !== 1?'s':''}
          </p>
        </div>
        <div className="sgc-page-actions">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx,.xls,.csv" style={{ display:'none' }} />
          <button className="sgc-btn-outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
            <Upload size={15}/> {isImporting ? 'Importando...' : 'Importar'}
          </button>
          <button className="sgc-btn-primary" onClick={handleExport}>
            <Download size={15}/> Exportar Excel
          </button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="sgc-kpi-grid" style={{ gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', marginBottom:'1.5rem' }}>
        <div className="sgc-kpi-card">
          <div className="sgc-kpi-icon gradient"><Table size={20}/></div>
          <div className="sgc-kpi-body">
            <span className="sgc-kpi-label">Empresas Cadastradas</span>
            <span className="sgc-kpi-value">{uniqueList.length}</span>
          </div>
        </div>
        <div className="sgc-kpi-card">
          <div className="sgc-kpi-icon green"><Edit size={20}/></div>
          <div className="sgc-kpi-body">
            <span className="sgc-kpi-label">Última Atualização</span>
            <span className="sgc-kpi-value" style={{ fontSize:'1rem' }}>
              {uniqueList[0]?.updatedAt ? new Date(uniqueList[0].updatedAt).toLocaleDateString('pt-BR') : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      {uniqueList.length === 0 ? (
        <div className="sgc-card">
          <div className="sgc-empty">
            <div className="sgc-empty-icon"><AlertTriangle size={28}/></div>
            <span className="sgc-empty-title">Nenhuma empresa cadastrada</span>
            <span className="sgc-empty-desc">Importe um arquivo Excel/CSV ou crie um chamado para adicionar empresas.</span>
          </div>
        </div>
      ) : (
        <div className="sgc-card" style={{ padding:0, overflow:'hidden' }}>
          <div className="sgc-table-wrap" style={{ border:'none' }}>
            <table className="sgc-table">
              <thead><tr>
                <th>Razão Social</th><th>CNPJ</th><th>Requisitante</th><th>Setor</th><th style={{ textAlign:'right' }}>Ações</th>
              </tr></thead>
              <tbody>
                {uniqueList.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight:700 }}>{item.razao}</td>
                    <td style={{ fontFamily:'monospace', fontSize:'0.85rem', letterSpacing:'0.5px', color:'#0066FF' }}>{item.cnpj}</td>
                    <td>{item.requisitante}</td>
                    <td>
                      {item.setor
                        ? <span className="sgc-badge blue">{item.setor}</span>
                        : <span style={{ color:'var(--muted-foreground)', fontSize:'0.8rem' }}>—</span>
                      }
                    </td>
                    <td>
                      <div style={{ display:'flex', justifyContent:'flex-end' }}>
                        <button className="sgc-btn-ghost" style={{ width:34, height:34, padding:0, justifyContent:'center', color:'#0066FF' }}
                          onClick={() => onEdit(item)} title="Editar">
                          <Edit size={15}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
