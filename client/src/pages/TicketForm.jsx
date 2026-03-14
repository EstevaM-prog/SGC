import React, { useState, useEffect } from 'react';
import '../styles/pages/TicketForm.css';

export default function TicketForm({ ticket, onSave, onCancel }) {
  const getInitialState = (t) => {
    if (t) {
      return {
        ...t,
        valor: t.valor ? Number(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''
      };
    }
    return {
      situacao: '', numero: '', dataEmissao: '', pedido: '', notaFiscal: '',
      vencimento: '', valor: '', forma: '', razao: '', cnpj: '', setor: '',
      codEtica: 'nao', requisitante: '', obs: ''
    };
  };

  const [formData, setFormData] = useState(getInitialState(ticket));
  const [errors, setErrors] = useState({});

  // Restore draft on mount if not editing existing
  useEffect(() => {
    if (!ticket) {
      const savedDraft = localStorage.getItem('sgc_ticket_draft');
      if (savedDraft) {
        try { setFormData(JSON.parse(savedDraft)); } catch (e) { console.error(e); }
      }
    }
  }, [ticket]);

  // Save draft whenever formData changes (only for new tickets)
  useEffect(() => {
    if (!ticket) {
      localStorage.setItem('sgc_ticket_draft', JSON.stringify(formData));
    }
  }, [formData, ticket]);

  // Update when ticket prop changes
  useEffect(() => {
    setFormData(getInitialState(ticket));
    setErrors({});
  }, [ticket]);

  const handleChange = (e) => {
    const { id, value } = e.target;

    // Mask logic
    if (id === 'cnpj') {
      // 1. Remove tudo que NÃO é letra ou número (Alfanumérico)
      // \W remove símbolos, mas mantém letras e números. 
      // O g garante que pegue a string toda.
      let v = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 14);

      // 2. Aplica a máscara visual (mantendo letras ou números nos espaços)
      if (v.length > 12) {
        v = v.replace(/^(.{2})(.{3})(.{3})(.{4})(.{2}).*/, '$1.$2.$3/$4-$5');
      } else if (v.length > 8) {
        v = v.replace(/^(.{2})(.{3})(.{3})(.{0,4}).*/, '$1.$2.$3/$4');
      } else if (v.length > 5) {
        v = v.replace(/^(.{2})(.{3})(.{0,3}).*/, '$1.$2.$3');
      } else if (v.length > 2) {
        v = v.replace(/^(.{2})(.{0,3}).*/, '$1.$2');
      }

      setFormData(prev => ({ ...prev, [id]: v }));
      return;
    }

    if (id === 'valor') {
      let v = value.replace(/\D/g, '');
      if (v.length === 0) {
        setFormData(prev => ({ ...prev, [id]: '' }));
        return;
      }
      while (v.length < 3) v = '0' + v;
      const cents = v.slice(-2);
      const intPart = v.slice(0, -2);
      const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      setFormData(prev => ({ ...prev, [id]: intFormatted + ',' + cents }));
      return;
    }

    if (id === 'pedido') {
      // 1. Remove tudo que não for número ou hífen
      // A regex [^0-9-] significa: "Tudo que NÃO for número de 0-9 ou o sinal de -"
      let v = value.replace(/[^0-9-]/g, '');

      // 2. Opcional: Impedir hífens duplicados (ex: --) para manter o dado limpo
      v = v.replace(/-{2,}/g, '-');

      // 3. Limitar o tamanho máximo se necessário (ex: 12 caracteres)
      v = v.slice(0, 12);

      setFormData(prev => ({ ...prev, [id]: v }));
      return;
    }

    if (id === 'numero') {
      // 1. Remove qualquer caractere que não seja número (0-9)
      // O uso do regex /\D/g é perfeito para isso
      const apenasNumeros = value.replace(/\D/g, '');

      // 2. Aplica o limite de caracteres e atualiza o estado
      setFormData(prev => ({
        ...prev,
        [id]: apenasNumeros.slice(0, 12)
      }));

      return; // Interrompe o handleChange para não processar o valor original abaixo
    }

    if (id === 'notaFiscal') {
      // 1. Remove qualquer caractere que não seja número (0-9)
      // O uso do regex /\D/g é perfeito para isso
      const apenasNumeros = value.replace(/\D/g, '');

      // 2. Aplica o limite de caracteres e atualiza o estado
      setFormData(prev => ({
        ...prev,
        [id]: apenasNumeros.slice(0, 12)
      }));

      return; // Interrompe o handleChange para não processar o valor original abaixo
    }

    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (formData.razao.length > 0 && formData.razao.length < 3) newErrors.razao = 'Mínimo 3 caracteres';
    if (formData.requisitante.length < 3) newErrors.requisitante = 'Mínimo 3 caracteres';
    if (formData.setor && formData.setor.length < 2) newErrors.setor = 'Mínimo 2 caracteres';
    if (formData.numero.length < 1) newErrors.numero = 'Obrigatório';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Parse value string to number
    const parsedValor = parseFloat(formData.valor.replace(/\./g, '').replace(/,/g, '.'));

    onSave({
      ...formData,
      valor: isNaN(parsedValor) ? 0 : parsedValor
    });

    // Clear draft after successful save
    if (!ticket) {
      localStorage.removeItem('sgc_ticket_draft');
    }
  };

  return (
    <section id="view-form" className="view-section active">
      <div className="form-container">
        <div className="section-header">
          <div>
            <h2 className="section-title">{ticket ? 'Editar Chamado' : 'Novo Chamado'}</h2>
            <p className="section-subtitle">Preencha as informações do chamado abaixo</p>
          </div>
        </div>

        <form className="card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="situacao">Status *</label>
              <select id="situacao" value={formData.situacao} onChange={handleChange} required>
                <option value="" disabled>Selecione o status</option>
                <option value="Aberto">Aberto</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Processando">Processando</option>
                <option value="Escriturar">Escriturar</option>
                <option value="Solucionado">Solucionado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="numero">Número do Chamado *</label>
              <input
                type="text"
                id="numero"
                value={formData.numero}
                onChange={handleChange}
                maxLength="12"
                placeholder="Ex: 2025001"
                required />
              {errors.numero && <span className="error-msg" style={{color: '#ef4444', fontSize: '0.75rem', marginTop: '4px'}}>{errors.numero}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dataEmissao">Data de Emissão *</label>
              <input type="date" id="dataEmissao" value={formData.dataEmissao} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="pedido">Pedido</label>
              <input
                type="text"
                id="pedido"
                value={formData.pedido}
                onChange={handleChange}
                maxLength="12"
                placeholder="Número do pedido" />
            </div>

            <div className="form-group">
              <label htmlFor="notaFiscal">Nota Fiscal *</label>
              <input type="text"
                id="notaFiscal"
                value={formData.notaFiscal}
                onChange={handleChange}
                maxLength="12"
                placeholder="Número da NF"
                required />
            </div>

            <div className="form-group">
              <label htmlFor="vencimento">Vencimento *</label>
              <input type="date"
                id="vencimento"
                value={formData.vencimento}
                onChange={handleChange}
                required />
            </div>

            <div className="form-group">
              <label htmlFor="valor">Valor (R$) *</label>
              <input type="text"
                id="valor"
                value={formData.valor}
                onChange={handleChange}
                placeholder="0,00"
                required />
            </div>

            <div className="form-group">
              <label htmlFor="forma">Forma de Pagamento *</label>
              <select id="forma" value={formData.forma} onChange={handleChange} required>
                <option value="">Selecione</option>
                <option value="Deposito em conta">Depósito em conta</option>
                <option value="Boleto">Boleto</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="razao">Razão Social *</label>
              <input 
                type="text" id="razao" value={formData.razao} onChange={handleChange} 
                placeholder="Empresa" minLength="3" maxLength="100" required 
              />
              {errors.razao && <span className="error-msg" style={{color: '#ef4444', fontSize: '0.75rem', marginTop: '4px'}}>{errors.razao}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cnpj">CNPJ / CPF *</label>
              <input 
                type="text" id="cnpj" value={formData.cnpj} onChange={handleChange} 
                placeholder="00.000.000/0000-00" minLength="11" maxLength="18" required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="setor">Setor</label>
              <select id="setor" value={formData.setor} onChange={handleChange}>
                <option value="">Selecione</option>
                <option value="Diretoria">Diretoria - 101</option>
                <option value="Rh">Rh - 213</option>
                <option value="Dsi">Dsi - 214</option>
                <option value="Facilites">Facilites - 215</option>
                <option value="Almox">Almox - 217</option>
                <option value="Compras">Compras - 218</option>
                <option value="Marketing">Marketing - 219</option>
                <option value="Projetos">Projetos - 413</option>
                <option value="Movimentacao">Movimentação - 4141</option>
                <option value="SupervisaoObras">Supervisão de Obras - 4151</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="codEtica">Código de Ética</label>
              <select id="codEtica" value={formData.codEtica} onChange={handleChange}>
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="requisitante">Nome do Requisitante *</label>
              <input 
                type="text" id="requisitante" value={formData.requisitante} onChange={handleChange} 
                minLength="3" maxLength="50" placeholder="Nome completo" required 
              />
              {errors.requisitante && <span className="error-msg" style={{color: '#ef4444', fontSize: '0.75rem', marginTop: '4px'}}>{errors.requisitante}</span>}
            </div>

            <div className="form-group full-width">
              <label htmlFor="obs">Observação</label>
              <textarea 
                id="obs" value={formData.obs} onChange={handleChange} 
                maxLength="500" placeholder="Anotações adicionais..." rows="4"
              ></textarea>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Salvar Chamado
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
