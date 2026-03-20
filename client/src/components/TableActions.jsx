import React, { useRef } from 'react';
import { Upload, Download, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function TableActions({ data, onImport, filename = 'relatorio' }) {
  const fileInputRef = useRef(null);

  // --- EXPORT LOGIC ---
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Prepare data for autotable
    if (data.length === 0) return alert('Nenhum dado para exportar');
    
    const headers = Object.keys(data[0]);
    const body = data.map(item => Object.values(item));

    doc.text(filename.toUpperCase(), 14, 15);
    
    doc.autoTable({
      head: [headers],
      body: body,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });
    
    doc.save(`${filename}.pdf`);
  };

  // --- IMPORT LOGIC ---
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const importedData = XLSX.utils.sheet_to_json(ws);
      
      if (onImport) onImport(importedData);
      
      // Reset input
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="table-actions-toolbar" style={{ display: 'flex', gap: '8px' }}>
      <input 
        type="file" 
        accept=".xlsx, .xls, .csv" 
        onChange={handleImport} 
        style={{ display: 'none' }} 
        ref={fileInputRef} 
      />
      
      <button 
        type="button" 
        className="btn-outline" 
        onClick={() => fileInputRef.current.click()}
        title="Importar Excel/CSV"
      >
        <Upload size={16} />
        <span>Importar</span>
      </button>

      <div className="dropdown" style={{ position: 'relative' }}>
        <button 
          type="button" 
          className="btn-outline dropdown-toggle" 
          onClick={(e) => {
            const menu = e.currentTarget.nextSibling;
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
          }}
          title="Exportar dados"
        >
          <Download size={16} />
          <span>Exportar</span>
        </button>
        <div 
          className="dropdown-menu card" 
          style={{ 
            display: 'none', 
            position: 'absolute', 
            top: '100%', 
            right: 0, 
            zIndex: 100, 
            minWidth: '150px',
            padding: '8px',
            marginTop: '4px'
          }}
          onMouseLeave={(e) => e.currentTarget.style.display = 'none'}
        >
          <button 
            className="action-item" 
            onClick={exportToExcel}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--foreground)' }}
          >
            <FileSpreadsheet size={16} color="#1D6F42" />
            Excel (.xlsx)
          </button>
          <button 
            className="action-item" 
            onClick={exportToPDF}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--foreground)' }}
          >
            <FileText size={16} color="#E74C3C" />
            PDF (.pdf)
          </button>
        </div>
      </div>
    </div>
  );
}
