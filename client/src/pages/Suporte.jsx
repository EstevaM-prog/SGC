import React, { useState } from 'react';
import { Headphones, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../Axios/conect.js';
import toast from 'react-hot-toast';

export default function Suporte({ addActivity }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const resp = await api.post('/support', formData);
      if (resp.status === 200) {
        toast.success('Sua mensagem foi enviada ao suporte!');
        addActivity({
          title: 'Suporte Solicitado',
          description: `Mensagem enviada sobre: ${formData.subject}`,
          type: 'info'
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      toast.error('Não foi possível enviar a mensagem agora.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="sg-page-anim" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div className="sg-card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--primary-glow)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
            <Headphones size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Canal de Suporte</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '4px' }}>Estamos aqui para ajudar com suas dúvidas técnicas ou operacionais.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="sg-field">
              <label>Seu Nome</label>
              <input 
                type="text" required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Estevam"
              />
            </div>
            <div className="sg-field">
              <label>E-mail para Retorno</label>
              <input 
                type="email" required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="seu-email@exemplo.com"
              />
            </div>
          </div>

          <div className="sg-field">
            <label>Assunto</label>
            <input 
              type="text" required
              value={formData.subject}
              onChange={e => setFormData({...formData, subject: e.target.value})}
              placeholder="Qual o problema?"
            />
          </div>

          <div className="sg-field">
            <label>Mensagem Detalhada</label>
            <textarea 
              rows={5} required
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              placeholder="Descreva o que está acontecendo..."
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-alt)', color: 'var(--foreground)' }}
            />
          </div>

          <button 
            type="submit" 
            className="sg-btn-primary" 
            disabled={sending}
            style={{ width: '100%', height: '48px', marginTop: '1rem' }}
          >
            {sending ? 'Enviando...' : 'Enviar Mensagem'}
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}