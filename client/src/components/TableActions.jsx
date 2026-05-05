import React, { useRef, useState, useEffect } from 'react';
import { Upload, Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function TableActions({ data, onImport, filename = 'relatorio' }) {
  const fileInputRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- EXPORT LOGIC ---
  const exportToExcel = () => {
    try {
      if (!data || data.length === 0) return alert('Nenhum dado para exportar');
      
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Dados");
      XLSX.writeFile(wb, `${filename}.xlsx`);
      setShowDropdown(false);
    } catch (err) {
      console.error('Erro ao exportar Excel:', err);
      alert('Erro ao gerar arquivo Excel');
    }
  };

  const exportToPDF = () => {
    try {
      if (!data || data.length === 0) return alert('Nenhum dado para exportar');
      
      const doc = new jsPDF('l', 'mm', 'a4');
      const headers = Object.keys(data[0]);
      const body = data.map(item => Object.values(item));

      doc.setFontSize(16);
      doc.text(filename.replace(/-/g, ' ').toUpperCase(), 14, 15);
      
      doc.autoTable({
        head: [headers],
        body: body,
        startY: 22,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { top: 20 },
      });
      
      doc.save(`${filename}.pdf`);
      setShowDropdown(false);
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
      alert('Erro ao gerar arquivo PDF');
    }
  };

  // --- IMPORT LOGIC ---
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const importedData = XLSX.utils.sheet_to_json(ws);
        
        if (onImport && importedData.length > 0) {
          onImport(importedData);
        } else {
          alert('O arquivo parece estar vazio ou em formato inválido.');
        }
      } catch (err) {
        console.error('Erro ao importar arquivo:', err);
        alert('Erro ao ler o arquivo. Certifique-se de que é um Excel ou CSV válido.');
      }
      
      // Reset input
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="table-actions-container" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '8px 14px', 
          fontSize: '0.8rem', 
          height: '38px',
          borderRadius: '10px'
        }}
        title="Importar de Excel/CSV"
      >
        <Upload size={14} />
        <span className="desktop-only">Importar</span>
      </button>

      <div className="export-dropdown-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
        <button 
          type="button" 
          className="btn-outline" 
          onClick={() => setShowDropdown(!showDropdown)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 14px', 
            fontSize: '0.8rem', 
            height: '38px',
            borderRadius: '10px'
          }}
          title="Exportar dados"
        >
          <Download size={14} />
          <span className="desktop-only">Exportar</span>
          <ChevronDown size={12} style={{ transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {showDropdown && (
          <div 
            className="dropdown-menu shadow-lg" 
            style={{ 
              display: 'block', 
              position: 'absolute', 
              top: 'calc(100% + 6px)', 
              right: 0, 
              zIndex: 1000, 
              minWidth: '180px',
              padding: '6px',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              animation: 'fadeUp 0.2s ease-out'
            }}
          >
            <div style={{ padding: '6px 12px', fontSize: '0.65rem', fontWeight: 800, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Formato de saída
            </div>
            <button 
              className="dropdown-item" 
              onClick={exportToExcel}
              style={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '10px 12px', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                textAlign: 'left', 
                color: 'var(--foreground)',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '8px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <FileSpreadsheet size={16} color="#10B981" />
              Excel (.xlsx)
            </button>
            <button 
              className="dropdown-item" 
              onClick={exportToPDF}
              style={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '10px 12px', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                textAlign: 'left', 
                color: 'var(--foreground)',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '8px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <FileText size={16} color="#EF4444" />
              PDF (.pdf)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
