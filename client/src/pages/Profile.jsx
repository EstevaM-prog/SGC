import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, User, Mail, Lock, Camera, LogOut, Edit, Save, X, Eye, EyeOff, 
  ShieldCheck, UserCircle2, Users, Settings, RefreshCw, Key, Share2, Plus, 
  Check, ChevronRight, Layout
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/pages/Auth.css';

import api from '../Axios/conect.js';

// Page options for permissions
const PAGE_OPTIONS = [
  { id: 'dashboard', label: 'Dashboard', Icon: Layout },
  { id: 'list', label: 'Lista de Chamados', Icon: Users },
  { id: 'activities', label: 'Atividades', Icon: ShieldCheck },
  { id: 'shopping', label: 'Compras', Icon: Settings },
  { id: 'freight', label: 'Fretes', Icon: Settings },
  { id: 'ponto', label: 'Ponto', Icon: Settings },
  { id: 'procedures', label: 'Procedimentos', Icon: Settings },
];

export default function Profile({ currentUser, onLogout, onNavigate, onUpdateUser, addActivity }) {
  const storedUser = JSON.parse(localStorage.getItem('user_db') || 'null') || {};
  const currentSession = JSON.parse(localStorage.getItem('session_v1') || 'null') || {};

  const [avatar, setAvatar] = useState(localStorage.getItem('user_avatar') || null);
  const [editing, setEditing] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isJoiningTeam, setIsJoiningTeam] = useState(false);
  
  // Tab/Section state
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'team'
  
  // Team state
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showJoinTeam, setShowJoinTeam] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', description: '' });
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);

  const [form, setForm] = useState({
    name: storedUser.name || currentUser?.name || '',
    email: storedUser.email || currentUser?.email || '',
    password: storedUser.password || '',
  });

  const fileRef = useRef();

  const initials = (form.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  /* ── Initial Fetch ─────────────────────────────────────────── */
  useEffect(() => {
    if (activeTab === 'team') {
      fetchTeams();
    }
  }, [activeTab]);

  const fetchTeams = async () => {
    if (!currentSession.id) {
       // Mock ID if missing in session
       currentSession.id = 'manual-' + Date.now();
    }
    setLoadingTeams(true);
    try {
      const resp = await api.get(`/teams?userId=${currentSession.id || ''}`);
      if (resp.status === 200) {
        setTeams(resp.data);
      }
    } catch (err) {
      console.error('Erro ao buscar equipes:', err);
    } finally {
      setLoadingTeams(false);
    }
  };

  /* ── Photo upload ──────────────────────────────────────────── */
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { toast.error('A imagem é muito grande! Máximo 1MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target.result;
      setAvatar(data);
      localStorage.setItem('user_avatar', data);
      onUpdateUser?.({ ...currentUser, avatar: data });
      toast.success('Foto de perfil atualizada!');
    };
    reader.readAsDataURL(file);
  };

  /* ── Form handlers (Personal) ──────────────────────────────── */
  const handleChange = (e) => setForm(p => ({ ...p, [e.target.id]: e.target.value }));
  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    if (!form.name.trim()) { toast.error('O nome não pode estar vazio.'); return; }
    if (!form.email.trim()) { toast.error('O e-mail não pode estar vazio.'); return; }
    if (form.password && form.password.length < 6) { toast.error('A senha deve ter ao menos 6 caracteres.'); return; }

    setIsSaving(true);
    const loadingToast = toast.loading('Salvando alterações...');

    try {
      await new Promise(r => setTimeout(r, 600));
      const updated = { ...storedUser, name: form.name, email: form.email };
      if (form.password) updated.password = form.password;
      localStorage.setItem('user_db', JSON.stringify(updated));
      const session = JSON.parse(localStorage.getItem('session_v1') || '{}');
      localStorage.setItem('session_v1', JSON.stringify({ ...session, name: form.name, email: form.email }));
      onUpdateUser?.({ name: form.name, email: form.email });

      if (addActivity) {
        addActivity({
          text: `Perfil atualizado`,
          description: `${form.name} alterou seus dados cadastrais.`,
          user: form.name, type: 'info', iconType: 'user'
        });
      }
      toast.success("Perfil atualizado!", { id: loadingToast });
      setEditing(false);
    } catch (err) {
      toast.error("Erro ao salvar perfil!", { id: loadingToast });
    } finally { setIsSaving(false); }
  };

  /* ── Team Logic ────────────────────────────────────────────── */
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (isCreatingTeam) return;
    if (!teamForm.name.trim()) return toast.error('Dê um nome à equipe!');

    setIsCreatingTeam(true);
    const loading = toast.loading('Criando equipe...');
    try {
      const resp = await api.post('/teams', { ...teamForm, userId: currentSession.id });
      if (resp.status === 201) {
        toast.success('Equipe criada com sucesso!', { id: loading });
        setShowCreateTeam(false);
        setTeamForm({ name: '', description: '' });
        fetchTeams();
      } else {
        toast.error('Erro ao criar equipe.', { id: loading });
      }
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Falha de conexão com o servidor.', { id: loading }); 
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    const loading = toast.loading('Entrando em equipe...');
    try {
      const resp = await api.post('/teams/join', { inviteCode: inviteCodeInput, userId: currentSession.id });
      if (resp.status === 200) {
        toast.success('Você agora faz parte da equipe!', { id: loading });
        setShowJoinTeam(false);
        setInviteCodeInput('');
        fetchTeams();
      } else {
        toast.error('Código inválido ou você já é membro.', { id: loading });
      }
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Falha de conexão.', { id: loading }); 
    }
  };

  const handleResetTeamCode = async (teamId) => {
    try {
      const resp = await api.put(`/teams/${teamId}/reset-code`);
      if (resp.status === 200) {
        toast.success('Código de convite resetado!');
        fetchTeams();
      }
    } catch (err) { toast.error('Erro ao resetar código.'); }
  };

  const togglePermission = async (team, pageId) => {
    // Agora permissões são um array de objetos. Verificamos se existe o registro lá.
    const hasAccess = team.permissions?.some(p => p.name === pageId);
    
    try {
      const resp = await api.put(`/teams/${team.id}/permissions`, { 
        permissionName: pageId, 
        enabled: !hasAccess 
      });
      if (resp.status === 200) {
        toast.success(`Acesso ${!hasAccess ? 'concedido' : 'revogado'} para ${pageId}.`);
        fetchTeams();
      }
    } catch (err) { toast.error('Erro ao atualizar permissões na tabela.'); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Código copiado!');
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card" style={{ maxWidth: 640 }}>
        {/* Header with Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <button className="auth-link" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }} onClick={() => onNavigate('list')}>
            <ArrowLeft size={18} /> Painel Administrativo
          </button>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
            <button 
              onClick={() => setActiveTab('personal')}
              style={{ padding: '6px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'personal' ? 'var(--primary)' : 'transparent', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              Perfil
            </button>
            <button 
              onClick={() => setActiveTab('team')}
              style={{ padding: '6px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'team' ? 'var(--primary)' : 'transparent', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
              Minha Equipe
            </button>
          </div>
        </div>

        {activeTab === 'personal' ? (
          /* ── PERSONAL SECTION ────────────────────────────────── */
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 88, height: 88, borderRadius: '24px', overflow: 'hidden', background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, color: '#fff', boxShadow: '0 8px 32px rgba(124,58,237,0.3)', border: '2px solid rgba(255,255,255,0.1)' }}>
                  {avatar ? <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{initials}</span>}
                </div>
                <label className="camera-label" style={{ position: 'absolute', bottom: -6, right: -6, width: 32, height: 32, borderRadius: '10px', background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '3px solid #13151b', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                  <Camera size={14} /><input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={handlePhoto} />
                </label>
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Olá, {form.name.split(' ')[0]}</h1>
                <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>{form.email}</p>
              </div>
            </div>

            {!editing ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                  {[ { icon: <UserCircle2 size={20} />, label: 'Nome de Exibição', value: form.name }, { icon: <Mail size={20} />, label: 'Endereço de E-mail', value: form.email }, { icon: <ShieldCheck size={20} />, label: 'Segurança', value: 'Conta Verificada ✓', color: '#34d399' }].map(({ icon, label, value, color }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.25rem' }}>
                      <div style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa', width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{label}</p>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: color || '#fff' }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setEditing(true)} className="auth-btn-primary" style={{ flex: 1, margin: 0, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}><Edit size={18} /> Editar Perfil</button>
                  <button onClick={onLogout} style={{ width: 48, height: 48, borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Sair"><LogOut size={20} /></button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSave} className="auth-form">
                <div className="auth-field"><label htmlFor="name">Nome Completo</label><div className="auth-input-wrap"><User size={18} className="auth-input-icon" /><input id="name" type="text" value={form.name} onChange={handleChange} required disabled={isSaving} /></div></div>
                <div className="auth-field"><label htmlFor="email">E-mail Profissional</label><div className="auth-input-wrap"><Mail size={18} className="auth-input-icon" /><input id="email" type="email" value={form.email} onChange={handleChange} required disabled={isSaving} /></div></div>
                <div className="auth-field"><label htmlFor="password">Trocar Senha <span>(opcional)</span></label><div className="auth-input-wrap"><Lock size={18} className="auth-input-icon" /><input id="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Mínimo 6 dígitos" disabled={isSaving} /><button type="button" className="auth-eye-btn" onClick={() => setShowPass(v => !v)}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setEditing(false)} style={{ flex: 1, height: 48, borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                  <button type="submit" disabled={isSaving} className="auth-btn-primary" style={{ flex: 1.5, margin: 0 }}>{isSaving ? 'Salvando...' : 'Confirmar'}</button>
                </div>
              </form>
            )}
          </>
        ) : (
          /* ── TEAM SECTION ──────────────────────────────────── */
          <div style={{ animation: 'authFadeInScale 0.3s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div><h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Gestão de Equipes</h2><p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Crie ou participe de grupos de trabalho</p></div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setShowJoinTeam(true)} className="auth-link" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '10px' }}>Entrar em Equipe</button>
                <button onClick={() => setShowCreateTeam(true)} className="auth-btn-primary" style={{ width: 'auto', margin: 0, padding: '8px 16px', borderRadius: '10px' }}><Plus size={18} style={{ marginRight: 4 }} /> Criar</button>
              </div>
            </div>

            {showCreateTeam && (
              <div style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid var(--primary)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ marginTop: 0, color: '#fff', fontSize: '1.1rem' }}>Configurar Nova Equipe</h3>
                <form onSubmit={handleCreateTeam} className="auth-form">
                  <div className="auth-field"><label>Nome da Equipe</label><input type="text" placeholder="Ex: Time de Suporte" value={teamForm.name} onChange={e => setTeamForm(p => ({ ...p, name: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid #333', color: '#fff' }} /></div>
                  <div className="auth-field"><label>Descrição (opcional)</label><input type="text" placeholder="Setor ou objetivo" value={teamForm.description} onChange={e => setTeamForm(p => ({ ...p, description: e.target.value }))} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid #333', color: '#fff' }} /></div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" onClick={() => setShowCreateTeam(false)} disabled={isCreatingTeam} style={{ flex: 1, height: 40, borderRadius: '8px', border: '1px solid #333', background: 'transparent', color: '#fff', cursor: 'pointer' }}>Cancelar</button>
                    <button type="submit" className="auth-btn-primary" disabled={isCreatingTeam} style={{ flex: 1, margin: 0 }}>
                      {isCreatingTeam ? 'Criando...' : 'Criar Agora'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {showJoinTeam && (
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ marginTop: 0, color: '#fff', fontSize: '1.1rem' }}>Participar de Equipe</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>Insira o código enviado pelo administrador.</p>
                <form onSubmit={handleJoinTeam} style={{ display: 'flex', gap: '0.75rem' }}>
                  <input type="text" placeholder="SGC-0000" value={inviteCodeInput} onChange={e => setInviteCodeInput(e.target.value.toUpperCase())} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#000', border: '1px solid #333', color: '#fff' }} />
                  <button type="submit" className="auth-btn-primary" style={{ width: 'auto', margin: 0 }}>Entrar</button>
                  <button type="button" onClick={() => setShowJoinTeam(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X /></button>
                </form>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {loadingTeams ? <p style={{ color: '#64748b' }}>Carregando equipes...</p> : 
                teams.length === 0 ? <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Você ainda não faz parte de nenhuma equipe.</p> :
                teams.map(team => {
                  const isAdmin = team.members.find(m => m.userId === currentSession.id)?.role === 'ADMIN';
                  const isSelected = selectedTeam?.id === team.id;
                  return (
                    <div key={team.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
                      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(124,58,237,0.15)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={20} />
                          </div>
                          <div><h4 style={{ margin: 0, color: '#fff', fontWeight: 700 }}>{team.name}</h4><p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{team.description || 'Sem descrição'}</p></div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {isAdmin && <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>ADMIN</span>}
                          <button onClick={() => setSelectedTeam(isSelected ? null : team)} style={{ background: 'none', border: 'none', color: isSelected ? 'var(--primary)' : '#64748b', cursor: 'pointer' }}>
                             <Settings size={20} />
                          </button>
                        </div>
                      </div>

                      {isSelected && (
                        <div style={{ padding: '1.5rem', paddingTop: 0, borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}>
                          <div style={{ marginTop: '1.5rem' }}>
                            <h5 style={{ margin: '0 0 1rem', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Convidar Membros</h5>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#000', padding: '10px 14px', borderRadius: '10px', border: '1px solid #333' }}>
                              <Key size={16} style={{ color: 'var(--primary)' }} />
                              <span style={{ flex: 1, fontFamily: 'monospace', fontSize: '1.1rem', color: '#fff' }}>{team.inviteCode}</span>
                              <button onClick={() => copyToClipboard(team.inviteCode)} className="action-btn" title="Copiar"><Share2 size={16} /></button>
                              {isAdmin && <button onClick={() => handleResetTeamCode(team.id)} className="action-btn" title="Resetar Código"><RefreshCw size={16} /></button>}
                            </div>
                          </div>

                          <div style={{ marginTop: '2rem' }}>
                            <h5 style={{ margin: '0 0 1rem', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Permissões de Acesso (RBAC)</h5>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                              {PAGE_OPTIONS.map(page => {
                                const hasAccess = team.permissions?.[page.id] ?? true;
                                return (
                                  <div key={page.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <page.Icon size={16} style={{ color: hasAccess ? 'var(--primary)' : '#64748b' }} />
                                      <span style={{ fontSize: '0.85rem', color: hasAccess ? '#fff' : '#64748b' }}>{page.label}</span>
                                    </div>
                                    {isAdmin ? (
                                      <button 
                                        onClick={() => togglePermission(team, page.id)}
                                        style={{ width: 40, height: 20, borderRadius: '10px', background: hasAccess ? 'var(--primary)' : '#334155', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                                        <div style={{ position: 'absolute', top: 2, left: hasAccess ? 22 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s ease' }} />
                                      </button>
                                    ) : (
                                      hasAccess ? <Check size={16} style={{ color: '#10b981' }} /> : <X size={16} style={{ color: '#ef4444' }} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {!isAdmin && <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1rem', fontStyle: 'italic' }}>* Somente o administrador da equipe pode alterar permissões.</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
               }
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .camera-label:hover { background: #6d28d9 !important; transform: scale(1.05); }
        .action-btn { background: none; border: none; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; transition: all 0.2s; }
        .action-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }
      `}</style>
    </div>
  );
}
