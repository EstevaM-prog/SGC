import React, { useState, useEffect } from 'react';
import { Headphones, Send, Search, CheckCircle2, Loader2, MessageSquare, Zap } from 'lucide-react';
import api from '../Axios/conect.js';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

export default function Suporte({ addActivity, currentUser }) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    category: 'Dúvida',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || '',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const resp = await api.post('/api/support', formData);
      if (resp.status === 200) {
        setShowSuccess(true);
        addActivity({
          title: 'Suporte Solicitado',
          description: `Chamado sobre ${formData.category}: ${formData.subject}`,
          type: 'info'
        });
        setFormData(prev => ({ ...prev, subject: '', message: '' }));
      }
    } catch (err) {
      toast.error('Não foi possível enviar a mensagem agora.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="support-container sg-page-anim max-w-5xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Como podemos ajudar hoje?
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Pesquise em nossa base de conhecimento ou envie uma solicitação direta para nossa equipe.
        </p>
        
        <div className="max-w-2xl mx-auto relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-400 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar por erros, manuais ou financeiro..."
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card border border-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
          />
        </div>
      </div>

      <div className="grid md:grid-template-columns-[1fr_2fr] gap-8">
        {/* Help Cards */}
        <div className="space-y-4">
          <div className="bg-card/50 p-6 rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-all cursor-pointer group">
            <Zap className="text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold mb-1">Início Rápido</h4>
            <p className="text-xs text-muted-foreground">Vídeos tutoriais para novos usuários começarem em 5 minutos.</p>
          </div>
          <div className="bg-card/50 p-6 rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-all cursor-pointer group">
            <MessageSquare className="text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold mb-1">Comunidade</h4>
            <p className="text-xs text-muted-foreground">Tire dúvidas com outros gestores no nosso fórum.</p>
          </div>
          <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-4">
            <Headphones className="text-indigo-400" size={32} />
            <div>
              <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest mb-1">Atendimento ao Vivo</p>
              <p className="text-sm font-medium">Segunda a Sexta, 08h às 18h</p>
            </div>
          </div>
        </div>

        {/* Support Form */}
        <div className="bg-card p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
          
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Send size={20} />
            </div>
            Enviar Solicitação
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                <input 
                  type="text" required 
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-400 transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Seu nome"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">E-mail para Retorno</label>
                <input 
                  type="email" required
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-400 transition-all"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                <select 
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-400 transition-all appearance-none cursor-pointer"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Dúvida">Dúvida Geral</option>
                  <option value="Erro Técnico">Erro Técnico / Bug</option>
                  <option value="Financeiro">Financeiro / Faturamento</option>
                  <option value="Sugestão">Sugestão de Melhoria</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Assunto</label>
                <input 
                  type="text" required
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-400 transition-all"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  placeholder="Resumo do problema"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Descrição do Problema</label>
              <textarea 
                rows={5} required
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-400 transition-all resize-none"
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                placeholder="Conte-nos em detalhes o que está acontecendo..."
              />
            </div>

            <button 
              type="submit" 
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={sending}
            >
              {sending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Enviando Solicitação...
                </>
              ) : (
                <>
                  Acessar Suporte Especializado
                  <Send size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <Modal 
          isOpen={showSuccess} 
          onClose={() => setShowSuccess(false)}
          title="Solicitação Recebida!"
        >
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 scale-up">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Sucesso!</h3>
            <p className="text-muted-foreground leading-relaxed">
              Enviamos uma cópia do chamado para <strong className="text-foreground">{formData.email}</strong>.<br/>
              Nossa equipe responderá o mais breve possível.
            </p>
            <button 
              onClick={() => setShowSuccess(false)}
              className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all"
            >
              Entendido
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}