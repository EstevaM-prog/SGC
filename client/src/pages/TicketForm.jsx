import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, X, Info, Landmark, Calendar, 
  Receipt, User, FileText, AlertCircle, 
  CheckCircle2, CreditCard, Plus, HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/pages/TicketForm.css';

export default function TicketForm({ ticket, onSave, onCancel, addActivity }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeNfInput, setActiveNfInput] = useState('');
  
  const getInitialState = (t) => {
    const formatDateForInput = (dateStr) => {
      if (!dateStr) return '';
      return new Date(dateStr).toISOString().split('T')[0];
    };

    if (t) {
      return {
        ...t,
        valor: t.valor ? Number(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '',
        vencimento: formatDateForInput(t.vencimento),
        dataEmissao: formatDateForInput(t.dataEmissao),
        notasFiscais: t.notaFiscal ? t.notaFiscal.split(',').map(n => n.trim()).filter(Boolean) : []
      };
    }
    return {
      situacao: 'Aberto', numero: '', dataEmissao: '', pedido: '', notasFiscais: [],
      vencimento: '', valor: '', forma: '', razao: '', cnpj: '', setor: '',
      codEtica: 'nao', requisitante: '', obs: ''
    };
  };

  const [formData, setFormData] = useState(getInitialState(ticket));
  const [errors, setErrors] = useState({});

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

  // Form Progress Calculation
  const progress = useMemo(() => {
    const requiredFields = ['numero', 'dataEmissao', 'valor', 'vencimento', 'forma', 'razao', 'cnpj', 'requisitante'];
    const filled = requiredFields.filter(field => !!formData[field] && String(formData[field]).trim() !== '');
    return Math.round((filled.length / requiredFields.length) * 100);
  }, [formData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setErrors(prev => ({ ...prev, [id]: null })); // clear error on type

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

  const handleAddNf = (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      e.preventDefault();
      const val = activeNfInput.trim();
      if (val && !formData.notasFiscais.includes(val)) {
        setFormData(prev => ({ ...prev, notasFiscais: [...prev.notasFiscais, val] }));
      }
      setActiveNfInput('');
    }
  };

  const removeNotaFiscal = (index) => {
    setFormData(prev => ({
      ...prev,
      notasFiscais: prev.notasFiscais.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.numero) newErrors.numero = 'Obrigatório';
    if (!formData.dataEmissao) newErrors.dataEmissao = 'Obrigatório';
    if (!formData.valor || formData.valor === '0,00') newErrors.valor = 'Valor inválido';
    if (!formData.vencimento) newErrors.vencimento = 'Obrigatório';
    if (!formData.forma) newErrors.forma = 'Selecione uma forma';
    if (!formData.razao || formData.razao.length < 3) newErrors.razao = 'Mínimo 3 caracteres';
    if (!formData.cnpj || formData.cnpj.length < 14) newErrors.cnpj = 'CNPJ inválido';
    if (!formData.requisitante || formData.requisitante.length < 3) newErrors.requisitante = 'Mínimo 3 caracteres';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Corrija os campos em vermelho.');
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Also trigger add nf if something was typed
    if (activeNfInput) {
      handleAddNf({ key: 'Enter', preventDefault: () => {} });
    }

    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading(ticket ? 'Atualizando chamado...' : 'Criando chamado...');

    try {
      const parsedValor = parseFloat(formData.valor.replace(/\./g, '').replace(/,/g, '.'));
      const convertDate = (dateStr) => dateStr ? new Date(dateStr + 'T00:00:00.000Z').toISOString() : null;

      const payload = {
        ...formData,
        notaFiscal: formData.notasFiscais.join(', '),
        valor: isNaN(parsedValor) ? 0 : parsedValor,
        vencimento: convertDate(formData.vencimento),
        dataEmissao: convertDate(formData.dataEmissao)
      };
      delete payload.notasFiscais;

      await new Promise(resolve => setTimeout(resolve, 600)); // smooth UX delay
      await onSave(payload);
      
      if (addActivity) {
        addActivity({
          text: ticket ? `Chamado #${payload.numero} Atualizado` : `Novo Chamado #${payload.numero} Criado`,
          description: `Chamado para ${payload.razao} no valor de R$ ${formData.valor}.`,
          user: payload.requisitante,
          type: ticket ? 'warning' : 'info',
          iconType: 'ticket'
        });
      }

      toast.success("Salvo com sucesso!", { id: loadingToast });
      if (!ticket) localStorage.removeItem('sgc_ticket_draft');
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar!", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="view-section active">
      <div className="tf-wrapper">
        
        {/* ── TOP BAR (Sticky) ── */}
        <div className="tf-topbar">
          <div className="tf-title-area">
            <h1>{ticket ? 'Editar Chamado' : 'Novo Chamado'}</h1>
            <p>
              {ticket ? `Atualizando registro #${ticket.numero}` : 'Preencha os dados abaixo para gerar um novo registro'}
            </p>
          </div>
          <div className="tf-actions">
            <button type="button" className="sgc-btn-ghost" onClick={onCancel}>
              <X size={15} /> Cancelar
            </button>
            <button type="button" className="sgc-btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
              <Save size={15} /> {isSubmitting ? 'Salvando...' : 'Salvar Chamado'}
            </button>
          </div>
          <div className="tf-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <form className="tf-body" onSubmit={handleSubmit}>

          {/* ── SECTION: GERAL ── */}
          <div className="tf-section">
            <div className="tf-section-header">
              <div className="tf-section-icon"><Info size={18} /></div>
              <div>
                <h3 className="tf-section-title">Informações Gerais</h3>
                <p className="tf-section-subtitle">Dados básicos de identificação</p>
              </div>
            </div>
            
            <div className="tf-grid cols-3">
              <div className="tf-group">
                <label className="tf-label">Status <span className="tf-required">*</span></label>
                <select id="situacao" className="tf-select" value={formData.situacao} onChange={handleChange}>
                  <option value="Aberto">Aberto</option>
                  <option value="Processando">Processando</option>
                  <option value="Escriturar">Escriturar</option>
                  <option value="Solucionado">Solucionado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              <div className="tf-group">
                <label className="tf-label">Nº do Chamado <span className="tf-required">*</span></label>
                <div className="tf-input-wrapper">
                  <FileText className="tf-input-icon" size={15} />
                  <input type="text" id="numero" className={`tf-input has-icon ${errors.numero ? 'error' : ''}`} value={formData.numero} onChange={handleChange} placeholder="Ex: 2025001" />
                </div>
                {errors.numero && <span className="tf-error-text"><AlertCircle size={12}/> {errors.numero}</span>}
              </div>

              <div className="tf-group">
                <label className="tf-label">Data de Emissão <span className="tf-required">*</span></label>
                <div className="tf-input-wrapper">
                  <Calendar className="tf-input-icon" size={15} />
                  <input type="date" id="dataEmissao" className={`tf-input has-icon ${errors.dataEmissao ? 'error' : ''}`} value={formData.dataEmissao} onChange={handleChange} />
                </div>
                {errors.dataEmissao && <span className="tf-error-text"><AlertCircle size={12}/> {errors.dataEmissao}</span>}
              </div>

              <div className="tf-group">
                <label className="tf-label">Setor Responsável</label>
                <select id="setor" className="tf-select" value={formData.setor} onChange={handleChange}>
                  <option value="">Nenhum específico</option>
                  <option value="Diretoria">Diretoria</option>
                  <option value="Rh">Recursos Humanos</option>
                  <option value="Dsi">DSI (TI)</option>
                  <option value="Compras">Compras</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div className="tf-group">
                <label className="tf-label">Requisitante <span className="tf-required">*</span></label>
                <div className="tf-input-wrapper">
                  <User className="tf-input-icon" size={15} />
                  <input type="text" id="requisitante" className={`tf-input has-icon ${errors.requisitante ? 'error' : ''}`} value={formData.requisitante} onChange={handleChange} placeholder="Nome do solicitante" />
                </div>
                {errors.requisitante && <span className="tf-error-text"><AlertCircle size={12}/> {errors.requisitante}</span>}
              </div>
            </div>
          </div>

          {/* ── SECTION: FINANCEIRO ── */}
          <div className="tf-section">
            <div className="tf-section-header">
              <div className="tf-section-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}><Landmark size={18} /></div>
              <div>
                <h3 className="tf-section-title">Financeiro & Faturamento</h3>
                <p className="tf-section-subtitle">Valores, datas de vencimento e notas fiscais</p>
              </div>
            </div>
            
            <div className="tf-grid">
              <div className="tf-group">
                <label className="tf-label">Valor Total (R$) <span className="tf-required">*</span></label>
                <div className="tf-input-wrapper">
                  <Landmark className="tf-input-icon" size={15} />
                  <input type="text" id="valor" className={`tf-input has-icon ${errors.valor ? 'error' : ''}`} value={formData.valor} onChange={handleChange} placeholder="0,00" />
                </div>
                {errors.valor && <span className="tf-error-text"><AlertCircle size={12}/> {errors.valor}</span>}
              </div>

              <div className="tf-group">
                <label className="tf-label">Data de Vencimento <span className="tf-required">*</span></label>
                <div className="tf-input-wrapper">
                  <Calendar className="tf-input-icon" size={15} />
                  <input type="date" id="vencimento" className={`tf-input has-icon ${errors.vencimento ? 'error' : ''}`} value={formData.vencimento} onChange={handleChange} />
                </div>
                {errors.vencimento && <span className="tf-error-text"><AlertCircle size={12}/> {errors.vencimento}</span>}
              </div>

              <div className="tf-group">
                <label className="tf-label">Forma de Pagamento <span className="tf-required">*</span></label>
                <div className="tf-input-wrapper">
                  <CreditCard className="tf-input-icon" size={15} />
                  <select id="forma" className={`tf-select has-icon ${errors.forma ? 'error' : ''}`} value={formData.forma} onChange={handleChange}>
                    <option value="">Selecione...</option>
                    <option value="Boleto">Boleto Bancário</option>
                    <option value="Deposito em conta">Depósito / PIX</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>
                {errors.forma && <span className="tf-error-text"><AlertCircle size={12}/> {errors.forma}</span>}
              </div>

              <div className="tf-group">
                <label className="tf-label">Pedido de Compra</label>
                <div className="tf-input-wrapper">
                  <Receipt className="tf-input-icon" size={15} />
                  <input type="text" id="pedido" className="tf-input has-icon" value={formData.pedido} onChange={handleChange} placeholder="Nº do pedido (opcional)" />
                </div>
              </div>

              <div className="tf-group full">
                <label className="tf-label">Notas Fiscais</label>
                <div className="tf-tags-input">
                  {formData.notasFiscais.map((nf, idx) => (
                    <div key={idx} className="tf-tag">
                      {nf} <X size={12} className="tf-tag-remove" onClick={() => removeNotaFiscal(idx)} />
                    </div>
                  ))}
                  <input 
                    type="text" 
                    className="tf-tag-input-field" 
                    placeholder={formData.notasFiscais.length === 0 ? "Digite a NF e aperte Enter" : "Adicionar NF..."}
                    value={activeNfInput}
                    onChange={e => setActiveNfInput(e.target.value)}
                    onKeyDown={handleAddNf}
                    onBlur={handleAddNf}
                  />
                </div>
                <div className="tf-helper"><HelpCircle size={12}/> Aperte Enter para adicionar múltiplas NFs</div>
              </div>
            </div>
          </div>

          {/* ── SECTION: FORNECEDOR ── */}
          <div className="tf-section">
            <div className="tf-section-header">
              <div className="tf-section-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}><User size={18} /></div>
              <div>
                <h3 className="tf-section-title">Dados do Fornecedor</h3>
                <p className="tf-section-subtitle">Identificação da empresa prestadora</p>
              </div>
            </div>
            
            <div className="tf-grid">
              <div className="tf-group">
                <label className="tf-label">Razão Social / Nome <span className="tf-required">*</span></label>
                <input type="text" id="razao" className={`tf-input ${errors.razao ? 'error' : ''}`} value={formData.razao} onChange={handleChange} placeholder="Nome do fornecedor" />
                {errors.razao && <span className="tf-error-text"><AlertCircle size={12}/> {errors.razao}</span>}
              </div>

              <div className="tf-group">
                <label className="tf-label">CNPJ / CPF <span className="tf-required">*</span></label>
                <input type="text" id="cnpj" className={`tf-input ${errors.cnpj ? 'error' : ''}`} value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" />
                {errors.cnpj && <span className="tf-error-text"><AlertCircle size={12}/> {errors.cnpj}</span>}
              </div>

              <div className="tf-group">
                <label className="tf-label">Código de Ética Assinado?</label>
                <select id="codEtica" className="tf-select" value={formData.codEtica} onChange={handleChange}>
                  <option value="nao">Não</option>
                  <option value="sim">Sim</option>
                </select>
              </div>

              <div className="tf-group full">
                <label className="tf-label">Observações Adicionais</label>
                <textarea id="obs" className="tf-textarea" value={formData.obs} onChange={handleChange} placeholder="Detalhes importantes, link para arquivos anexos, etc." />
              </div>
            </div>
          </div>

        </form>
      </div>
    </section>
  );
}
