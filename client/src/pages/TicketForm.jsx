import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import '../styles/pages/TicketForm.css';

export default function TicketForm({ ticket, onSave, onCancel, addActivity }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const getInitialState = (t) => {
// ... existing state initialization ...
    // ... rest of the helper functions
    const formatDateForInput = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return d.toISOString().split('T')[0];
    };

    if (t) {
      return {
        ...t,
        valor: t.valor ? Number(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '',
        vencimento: formatDateForInput(t.vencimento),
        dataEmissao: formatDateForInput(t.dataEmissao)
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

  // ... (Draft logic same as before)
  useEffect(() => {
    if (!ticket) {
      const savedDraft = localStorage.getItem('sgc_ticket_draft');
      if (savedDraft) {
        try { setFormData(JSON.parse(savedDraft)); } catch (e) { console.error(e); }
      }
    }
  }, [ticket]);

  useEffect(() => {
    if (!ticket) {
      localStorage.setItem('sgc_ticket_draft', JSON.stringify(formData));
    }
  }, [formData, ticket]);

  useEffect(() => {
    setFormData(getInitialState(ticket));
    setErrors({});
  }, [ticket]);

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === 'cnpj') {
      let v = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 14);
      if (v.length > 12) v = v.replace(/^(.{2})(.{3})(.{3})(.{4})(.{2}).*/, '$1.$2.$3/$4-$5');
      else if (v.length > 8) v = v.replace(/^(.{2})(.{3})(.{3})(.{0,4}).*/, '$1.$2.$3/$4');
      else if (v.length > 5) v = v.replace(/^(.{2})(.{3})(.{0,3}).*/, '$1.$2.$3');
      else if (v.length > 2) v = v.replace(/^(.{2})(.{0,3}).*/, '$1.$2');
      setFormData(prev => ({ ...prev, [id]: v }));
      return;
    }

    if (id === 'valor') {
      let v = value.replace(/\D/g, '');
      if (v.length === 0) { setFormData(prev => ({ ...prev, [id]: '' })); return; }
      while (v.length < 3) v = '0' + v;
      const fmt = v.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ',' + v.slice(-2);
      setFormData(prev => ({ ...prev, [id]: fmt }));
      return;
    }

    if (id === 'numero') {
      setFormData(prev => ({ ...prev, [id]: value.replace(/\D/g, '').slice(0, 12) }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (formData.razao.length > 0 && formData.razao.length < 3) newErrors.razao = 'Mínimo 3 caracteres';
    if (formData.requisitante.length < 3) newErrors.requisitante = 'Mínimo 3 caracteres';
    if (!formData.numero) newErrors.numero = 'Obrigatório';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Por favor, corrija os erros no formulário.');
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading(ticket ? 'Atualizando chamado...' : 'Criando chamado...');

    try {
      const parsedValor = parseFloat(formData.valor.replace(/\./g, '').replace(/,/g, '.'));
      const convertDate = (dateStr) => dateStr ? new Date(dateStr + 'T00:00:00.000Z').toISOString() : null;

      const payload = {
        ...formData,
        valor: isNaN(parsedValor) ? 0 : parsedValor,
        vencimento: convertDate(formData.vencimento),
        dataEmissao: convertDate(formData.dataEmissao)
      };

      await new Promise(resolve => setTimeout(resolve, 800));
      await onSave(payload);
      
      if (addActivity) {
        addActivity({
          text: ticket ? `Chamado #${payload.numero} Atualizado` : `Novo Chamado #${payload.numero} Criado`,
          description: `Chamado para ${payload.razao} no valor de R$ ${formData.valor}. Status: ${payload.situacao}. Requisitante: ${payload.requisitante}`,
          user: payload.requisitante,
          type: ticket ? 'warning' : 'info',
          iconType: 'ticket'
        });
      }

      toast.success("Criado com sucesso!", { id: loadingToast });
      if (!ticket) localStorage.removeItem('sgc_ticket_draft');
    } catch (err) {
      console.error(err);
      toast.error("Erro no chamado!", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
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
              <select id="situacao" value={formData.situacao} onChange={handleChange} required disabled={isSubmitting}>
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
                type="text" id="numero" value={formData.numero} onChange={handleChange}
                maxLength="12" placeholder="Ex: 2025001" required disabled={isSubmitting} />
              {errors.numero && <span className="error-msg">{errors.numero}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dataEmissao">Data de Emissão *</label>
              <input type="date" id="dataEmissao" value={formData.dataEmissao} onChange={handleChange} required disabled={isSubmitting} />
            </div>

            <div className="form-group">
              <label htmlFor="pedido">Pedido</label>
              <input type="text" id="pedido" value={formData.pedido} onChange={handleChange} maxLength="12" disabled={isSubmitting} />
            </div>

            <div className="form-group">
              <label htmlFor="notaFiscal">Nota Fiscal *</label>
              <input type="text" id="notaFiscal" value={formData.notaFiscal} onChange={handleChange} maxLength="12" required disabled={isSubmitting} />
            </div>

            <div className="form-group">
              <label htmlFor="vencimento">Vencimento *</label>
              <input type="date" id="vencimento" value={formData.vencimento} onChange={handleChange} required disabled={isSubmitting} />
            </div>

            <div className="form-group">
              <label htmlFor="valor">Valor (R$) *</label>
              <input type="text" id="valor" value={formData.valor} onChange={handleChange} required disabled={isSubmitting} />
            </div>

            <div className="form-group">
              <label htmlFor="forma">Forma de Pagamento *</label>
              <select id="forma" value={formData.forma} onChange={handleChange} required disabled={isSubmitting}>
                <option value="">Selecione</option>
                <option value="Deposito em conta">Depósito em conta</option>
                <option value="Boleto">Boleto</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="razao">Razão Social *</label>
              <input type="text" id="razao" value={formData.razao} onChange={handleChange} required disabled={isSubmitting} />
              {errors.razao && <span className="error-msg">{errors.razao}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cnpj">CNPJ / CPF *</label>
              <input type="text" id="cnpj" value={formData.cnpj} onChange={handleChange} required disabled={isSubmitting} />
            </div>

            <div className="form-group">
              <label htmlFor="setor">Setor</label>
              <select id="setor" value={formData.setor} onChange={handleChange} disabled={isSubmitting}>
                <option value="">Selecione</option>
                <option value="Diretoria">Diretoria - 101</option>
                <option value="Rh">Rh - 213</option>
                <option value="Dsi">Dsi - 214</option>
                <option value="Facilites">Facilites - 215</option>
                <option value="Almox">Almox - 217</option>
                <option value="Compras">Compras - 218</option>
                <option value="Marketing">Marketing - 219</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="codEtica">Código de Ética</label>
              <select id="codEtica" value={formData.codEtica} onChange={handleChange} disabled={isSubmitting}>
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="requisitante">Nome do Requisitante *</label>
              <input type="text" id="requisitante" value={formData.requisitante} onChange={handleChange} required disabled={isSubmitting} />
              {errors.requisitante && <span className="error-msg">{errors.requisitante}</span>}
            </div>

            <div className="form-group full-width">
              <label htmlFor="obs">Observação</label>
              <textarea id="obs" value={formData.obs} onChange={handleChange} rows="4" disabled={isSubmitting}></textarea>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Chamado'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
