import React from 'react';
import { Headset, Mail, MapPin, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/pages/Support.css';

export default function Suporte({ addActivity }) {
  const [formData, setFormData] = React.useState({
    nome: '',
    email: '',
    assunto: '',
    mensagem: ''
  });
  const [loading, setLoading] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    const loadingToast = toast.loading('Enviando sua mensagem...');

    try {
      const response = await fetch("https://formsubmit.co/ajax/estevam0x0@gmail.com", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          Nome: formData.nome,
          Email: formData.email,
          Assunto: formData.assunto,
          Mensagem: formData.mensagem,
          _subject: `Novo contato SGC: ${formData.assunto}`
        })
      });

      if (response.ok) {
        if (addActivity) {
          addActivity({
            text: `Contato de Suporte Enviado`,
            description: `Assunto: ${formData.assunto} | Por: ${formData.nome} (${formData.email})`,
            user: formData.nome,
            type: 'info',
            iconType: 'edit'
          });
        }
        
        toast.success("Criado com sucesso!", { id: loadingToast });
        setFormData({ nome: '', email: '', assunto: '', mensagem: '' });
      } else {
        toast.error("Erro no chamado!", { id: loadingToast });
      }
    } catch (error) {
      console.error("Erro no FormSubmit:", error);
      toast.error("Erro no chamado!", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="view-suporte" className="view-section active">
      <div className="suporte-background-gradient"></div>
      <div className="suporte-estrelas"></div>

      {/* Header */}
      <div className="suporte-header">
        <div className="suporte-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Headset /> SGC Ajuda
        </div>
      </div>

      <div className="suporte-container">
        {/* Lado Esquerdo: Informações e FAQ */}
        <div className="suporte-info-section">
          <div className="suporte-page-title">
            <h1>Como podemos ajudar?</h1>
            <p>Tem alguma dúvida, sugestão ou encontrou um problema? Nossa equipe está pronta para te ouvir.</p>
          </div>

          <div className="suporte-contact-cards">
            <div className="suporte-contact-card">
              <div className="suporte-contact-icon"><Mail /></div>
              <div className="suporte-contact-info">
                <h4>E-mail</h4>
                <span>suporte@sgc.com</span>
              </div>
            </div>
            <div className="suporte-contact-card">
              <div className="suporte-contact-icon"><MapPin /></div>
              <div className="suporte-contact-info">
                <h4>Escritório</h4>
                <span>São Paulo, SP - Brasil</span>
              </div>
            </div>
          </div>

          <div className="suporte-faq-section">
            <h3>Perguntas Frequentes</h3>

            <details className="suporte-faq-item">
              <summary>Como criar um novo chamado?</summary>
              <div className="suporte-faq-answer">
                Clique no botão "Novo Chamado" na barra superior ou na sidebar. Preencha todos os campos
                obrigatórios marcados com asterisco (*) e clique em "Salvar Chamado".
              </div>
            </details>

            <details className="suporte-faq-item">
              <summary>Como editar um chamado existente?</summary>
              <div className="suporte-faq-answer">
                Na lista de chamados, clique no botão de editar (ícone de lápis) na coluna Ações. Modifique os
                campos desejados e clique em "Salvar Chamado".
              </div>
            </details>

            <details className="suporte-faq-item">
              <summary>Como restaurar um chamado da lixeira?</summary>
              <div className="suporte-faq-answer">
                Acesse a seção "Lixeira" no menu lateral. Localize o chamado que deseja restaurar e clique no botão
                de restauração. O chamado voltará para a lista principal.
              </div>
            </details>
          </div>
        </div>

        {/* Lado Direito: Formulário */}
        <div className="suporte-form-section">
          <h2>Envie uma mensagem</h2>

          <form id="supportForm" onSubmit={handleSubmit} data-form>
            <div className="suporte-form-group">
              <label htmlFor="support-name">Seu Nome</label>
              <input
                type="text" id="support-name" name="nome"
                className="suporte-form-control" placeholder="Digite seu nome completo"
                value={formData.nome} onChange={handleChange} required
              />
            </div>

            <div className="suporte-form-group">
              <label htmlFor="support-email">E-mail para contato</label>
              <input
                type="email" id="support-email" name="email"
                className="suporte-form-control" placeholder="seu@email.com"
                value={formData.email} onChange={handleChange} required
              />
            </div>

            <div className="suporte-form-group">
              <label htmlFor="support-subject">Assunto</label>
              <select
                id="support-subject" name="assunto"
                className="suporte-form-control" required
                value={formData.assunto} onChange={handleChange}
              >
                <option value="" disabled>Selecione o motivo</option>
                <option value="Relatar um problema">Relatar um problema</option>
                <option value="Dúvida sobre o sistema">Dúvida sobre o sistema</option>
                <option value="Sugestão de melhoria">Sugestão de melhoria</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="suporte-form-group">
              <label htmlFor="support-message">Mensagem</label>
              <textarea
                id="support-message" name="mensagem"
                className="suporte-form-control" placeholder="Descreva detalhadamente como podemos ajudar..."
                value={formData.mensagem} onChange={handleChange} required
              ></textarea>
            </div>

            <button
              type="submit"
              data-button
              className="suporte-btn-submit"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Enviando...' : 'Enviar Mensagem'}
            </button>
          </form>
        </div>
      </div>

    </section>
  );
}
