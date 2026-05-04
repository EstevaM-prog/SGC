import React, { useState, useEffect } from 'react';
import { Headphones, Send, Search, CheckCircle2, Loader2, MessageSquare, Zap, ArrowRight } from 'lucide-react';
import api from '../Axios/conect.js';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import '../styles/pages/Support.css';

const HELP_CARDS = [
  {
    Icon: Zap,
    title: 'Início Rápido',
    desc: 'Vídeos e tutoriais para novos usuários começarem em 5 minutos.',
    color: 'amber',
    iconColor: '#f59e0b',
  },
  {
    Icon: MessageSquare,
    title: 'Comunidade',
    desc: 'Tire dúvidas com outros gestores no nosso fórum interativo.',
    color: 'blue',
    iconColor: '#0066FF',
  },
];

export default function Suporte({ addActivity, currentUser }) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    category: 'Dúvida',
    subject: '',
    message: ''
  });
  const [sending, setSending]       = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (currentUser)
      setFormData(p => ({ ...p, name: currentUser.name || '', email: currentUser.email || '' }));
  }, [currentUser]);

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSending(true);
    try {
      const resp = await api.post('/api/support', formData);
      if (resp.status === 200) {
        setShowSuccess(true);
        addActivity({ title:'Suporte Solicitado', description:`${formData.category}: ${formData.subject}`, type:'info' });
        setFormData(p => ({ ...p, subject:'', message:'' }));
      }
    } catch { toast.error('Não foi possível enviar a mensagem agora.'); }
    finally { setSending(false); }
  };

  return (
    <div className="view-section active">

      {/* ── Page Header ── */}
      <div className="sgc-page-header">
        <div className="sgc-page-title-block">
          <h1 className="sgc-page-title">Suporte</h1>
          <p className="sgc-page-subtitle">Como podemos ajudar hoje?</p>
        </div>
        <div className="sgc-badge green" style={{ padding:'6px 14px', fontSize:'0.8rem', gap:5 }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:'#10B981', display:'inline-block', boxShadow:'0 0 6px #10B981' }} />
          Atendimento Online
        </div>
      </div>

      {/* ── Search Hero ── */}
      <div className="sgc-card" style={{ marginBottom:'1.5rem', padding:'2rem', textAlign:'center', background:'linear-gradient(135deg, rgba(0,102,255,0.04) 0%, rgba(16,185,129,0.04) 100%)' }}>
        <p style={{ fontSize:'1rem', color:'var(--muted-foreground)', marginBottom:'1.25rem' }}>
          Pesquise na nossa base de conhecimento
        </p>
        <div style={{ maxWidth:520, margin:'0 auto', position:'relative', display:'flex', alignItems:'center' }}>
          <Search size={17} style={{ position:'absolute', left:14, color:'#0066FF', pointerEvents:'none' }} />
          <input
            type="text"
            placeholder="Buscar por erros, manuais, financeiro..."
            style={{
              width:'100%', height:48, paddingLeft:44, paddingRight:16,
              background:'var(--card)', border:'1.5px solid rgba(0,102,255,0.18)',
              borderRadius:14, outline:'none', fontSize:'0.9rem', color:'var(--foreground)',
              transition:'border-color 0.25s, box-shadow 0.25s',
            }}
            onFocus={e => { e.target.style.borderColor='#0066FF'; e.target.style.boxShadow='0 0 0 3px rgba(0,102,255,0.1)'; }}
            onBlur={e  => { e.target.style.borderColor='rgba(0,102,255,0.18)'; e.target.style.boxShadow=''; }}
          />
        </div>
      </div>

      {/* ── Layout: Help Cards + Form ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'1.25rem', alignItems:'start' }}>

        {/* Left: help + hours cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {HELP_CARDS.map(({ Icon, title, desc, iconColor }) => (
            <div key={title} className="sgc-card" style={{ cursor:'pointer' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:'0.875rem' }}>
                <div style={{ width:38, height:38, borderRadius:10, background:`rgba(${iconColor==='#0066FF'?'0,102,255':'245,158,11'},0.1)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={18} style={{ color:iconColor }} />
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:4 }}>{title}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--muted-foreground)', lineHeight:1.5 }}>{desc}</div>
                </div>
              </div>
              <div style={{ marginTop:'0.875rem', display:'flex', alignItems:'center', gap:4, fontSize:'0.78rem', color:'#0066FF', fontWeight:600 }}>
                Ver mais <ArrowRight size={13}/>
              </div>
            </div>
          ))}

          {/* Hours card */}
          <div style={{ padding:'1.25rem', borderRadius:16, background:'linear-gradient(135deg, rgba(0,102,255,0.08) 0%, rgba(16,185,129,0.06) 100%)', border:'1px solid rgba(0,102,255,0.14)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
              <Headphones size={28} style={{ color:'#0066FF', flexShrink:0 }} />
              <div>
                <div style={{ fontSize:'0.68rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', background:'linear-gradient(90deg,#0066FF,#10B981)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:3 }}>
                  Atendimento ao Vivo
                </div>
                <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--foreground)' }}>Seg à Sex, 08h – 18h</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="sgc-card" style={{ position:'relative', overflow:'hidden' }}>
          {/* decorative glow */}
          <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, background:'radial-gradient(circle, rgba(0,102,255,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-60, left:-60, width:200, height:200, background:'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />

          <div className="sgc-card-header">
            <h3 className="sgc-card-title">
              <span className="sgc-card-icon"><Send size={15}/></span>
              Enviar Solicitação
            </h3>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.1rem', position:'relative', zIndex:1 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div className="sgc-form-group">
                <label className="sgc-label">Nome Completo</label>
                <input className="sgc-input" type="text" required value={formData.name} onChange={e => set('name',e.target.value)} placeholder="Seu nome" />
              </div>
              <div className="sgc-form-group">
                <label className="sgc-label">E-mail para Retorno</label>
                <input className="sgc-input" type="email" required value={formData.email} onChange={e => set('email',e.target.value)} placeholder="seu@email.com" />
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div className="sgc-form-group">
                <label className="sgc-label">Categoria</label>
                <select className="sgc-input sgc-form-select" value={formData.category} onChange={e => set('category',e.target.value)}>
                  <option>Dúvida</option>
                  <option>Erro Técnico</option>
                  <option>Financeiro</option>
                  <option>Sugestão</option>
                </select>
              </div>
              <div className="sgc-form-group">
                <label className="sgc-label">Assunto</label>
                <input className="sgc-input" type="text" required value={formData.subject} onChange={e => set('subject',e.target.value)} placeholder="Resumo do problema" />
              </div>
            </div>

            <div className="sgc-form-group">
              <label className="sgc-label">Descrição do Problema</label>
              <textarea className="sgc-textarea" rows={5} required value={formData.message} onChange={e => set('message',e.target.value)} placeholder="Descreva em detalhes o que está acontecendo..." />
            </div>

            <button type="submit" className="sgc-btn-primary" disabled={sending}
              style={{ width:'100%', height:48, justifyContent:'center', fontSize:'0.95rem' }}>
              {sending ? <><Loader2 size={18} className="spin" /> Enviando...</> : <>Acessar Suporte Especializado <Send size={16}/></>}
            </button>
          </form>
        </div>

      </div>

      {/* ── Success Modal ── */}
      {showSuccess && (
        <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="Solicitação Recebida!">
          <div style={{ textAlign:'center', padding:'2rem 1rem' }}>
            <div style={{ width:72, height:72, background:'rgba(16,185,129,0.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem', color:'#10B981' }}>
              <CheckCircle2 size={40} />
            </div>
            <h3 style={{ fontWeight:800, marginBottom:8 }}>Enviado com Sucesso!</h3>
            <p style={{ color:'var(--muted-foreground)', lineHeight:1.6 }}>
              Cópia do chamado enviada para <strong style={{ color:'var(--foreground)' }}>{formData.email}</strong>.<br/>
              Nossa equipe responderá o mais breve possível.
            </p>
            <button className="sgc-btn-outline" onClick={() => setShowSuccess(false)} style={{ marginTop:'1.5rem', width:160, justifyContent:'center' }}>
              Entendido
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}