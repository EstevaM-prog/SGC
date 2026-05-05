import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, User, Mail, Lock, Camera, LogOut, Edit, Save, X, Eye, EyeOff,
  ShieldCheck, UserCircle2, Users, Settings, RefreshCw, Key, Share2, Plus, Check,
  Layout, Building2, Zap, Truck, ClipboardList, Briefcase, AlertCircle, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { formatImageUrl } from '../Axios/conect.js';
import '../styles/pages/Profile.css';

const PAGE_OPTIONS = [
  { id: 'dashboard',  label: 'Dashboard',         Icon: Layout },
  { id: 'list',       label: 'Chamados',          Icon: ClipboardList },
  { id: 'activities', label: 'Atividades',        Icon: Zap },
  { id: 'shopping',   label: 'Compras',           Icon: Building2 },
  { id: 'freight',    label: 'Fretes',            Icon: Truck },
  { id: 'ponto',      label: 'Ponto',             Icon: Clock },
  { id: 'procedures', label: 'Procedimentos',     Icon: Settings },
];

export default function Profile({ currentUser, onLogout, onNavigate, onUpdateUser, addActivity }) {
  const storedUser     = JSON.parse(localStorage.getItem('user_db') || 'null') || {};
  const currentSession = JSON.parse(localStorage.getItem('session_v1') || 'null') || {};

  const [avatar, setAvatar]           = useState(localStorage.getItem('user_avatar') || null);
  const [editing, setEditing]         = useState(false);
  const [showPass, setShowPass]       = useState(false);
  const [isSaving, setIsSaving]       = useState(false);
  const [activeTab, setActiveTab]     = useState('personal');
  const [teams, setTeams]             = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showJoinTeam, setShowJoinTeam]     = useState(false);
  const [teamForm, setTeamForm]       = useState({ name: '', description: '' });
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [selectedTeam, setSelectedTeam]     = useState(null);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  const [form, setForm] = useState({
    name:     storedUser.name     || currentUser?.name  || '',
    email:    storedUser.email    || currentUser?.email || '',
    password: storedUser.password || '',
  });
  
  const fileRef = useRef();
  const initials = (form.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const firstName = form.name ? form.name.split(' ')[0] : 'Usuário';

  useEffect(() => { fetchProfile(); }, []);
  useEffect(() => { if (activeTab === 'team') fetchTeams(); }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const r = await api.get('/users/me');
      if (r.status === 200) { 
        setForm({ name: r.data.name, email: r.data.email, password: '' }); 
        setAvatar(r.data.avatarUrl); 
      }
    } catch { toast.error('Erro ao carregar perfil'); }
  };

  const fetchTeams = async () => {
    if (!currentSession.id) currentSession.id = 'manual-' + Date.now();
    setLoadingTeams(true);
    try {
      const r = await api.get(`/teams?userId=${currentSession.id || ''}`);
      if (r.status === 200) setTeams(r.data);
    } catch (e) { console.error(e); }
    finally { setLoadingTeams(false); }
  };

  const handlePhoto = async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Máximo 5MB'); return; }
    
    const formData = new FormData();
    formData.append('avatar', file);
    const t = toast.loading('Enviando imagem...');
    
    try {
      const r = await api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (r.status === 200) {
        setAvatar(r.data.avatarUrl);
        localStorage.setItem('user_avatar', r.data.avatarUrl);
        onUpdateUser?.({ ...currentUser, avatar: r.data.avatarUrl });
        toast.success('Foto atualizada!', { id: t });
      }
    } catch { toast.error('Erro no upload', { id: t }); }
  };

  const handleChange = e => setForm(p => ({ ...p, [e.target.id]: e.target.value }));

  const handleSave = async e => {
    e.preventDefault();
    if (isSaving) return;
    if (!form.name.trim()) { toast.error('O nome não pode estar vazio'); return; }
    if (!form.email.trim()) { toast.error('O e-mail não pode estar vazio'); return; }
    if (form.password && form.password.length < 6) { toast.error('A senha deve ter no mínimo 6 caracteres'); return; }
    
    setIsSaving(true);
    const t = toast.loading('Salvando alterações...');
    try {
      const r = await api.put('/users/me', form);
      if (r.status === 200) { 
        onUpdateUser?.({ name: form.name, email: form.email }); 
        toast.success('Perfil atualizado com sucesso!', { id: t }); 
        setEditing(false); 
      }
    } catch (e) { toast.error(e.response?.data?.error || 'Erro ao salvar', { id: t }); }
    finally { setIsSaving(false); }
  };

  const handleCreateTeam = async e => {
    e.preventDefault();
    if (isCreatingTeam) return;
    if (!teamForm.name.trim()) return toast.error('Dê um nome à equipe!');
    
    setIsCreatingTeam(true);
    const t = toast.loading('Criando equipe...');
    try {
      const r = await api.post('/teams', { ...teamForm, userId: currentSession.id });
      if (r.status === 201) { 
        toast.success('Equipe criada!', { id: t }); 
        setShowCreateTeam(false); 
        setTeamForm({ name: '', description: '' }); 
        fetchTeams(); 
      } else {
        toast.error('Erro ao criar equipe', { id: t });
      }
    } catch (e) { toast.error(e.response?.data?.error || 'Falha de conexão', { id: t }); }
    finally { setIsCreatingTeam(false); }
  };

  const handleJoinTeam = async e => {
    e.preventDefault();
    const code = inviteCodeInput.trim();
    if (!code) return toast.error('Digite um código válido!');
    
    const t = toast.loading('Entrando na equipe...');
    try {
      const r = await api.post('/teams/join', { inviteCode: code, userId: currentSession.id });
      if (r.status === 200) { 
        toast.success('Bem-vindo à equipe!', { id: t }); 
        setShowJoinTeam(false); 
        setInviteCodeInput(''); 
        fetchTeams(); 
      } else {
        toast.error('Código inválido ou você já é membro', { id: t });
      }
    } catch (e) { toast.error(e.response?.data?.error || 'Falha de conexão', { id: t }); }
  };

  const handleResetTeamCode = async id => {
    try {
      const r = await api.put(`/teams/${id}/reset-code`);
      if (r.status === 200) { toast.success('Código de convite resetado!'); fetchTeams(); }
    } catch { toast.error('Erro ao resetar código'); }
  };

  const togglePermission = async (team, pageId) => {
    const hasAccess = team.permissions?.some(p => p.name === pageId);
    try {
      const r = await api.put(`/teams/${team.id}/permissions`, { permissionName: pageId, enabled: !hasAccess });
      if (r.status === 200) { 
        toast.success(`Acesso ${!hasAccess ? 'concedido' : 'revogado'}`); 
        fetchTeams(); 
      }
    } catch { toast.error('Erro ao atualizar permissões'); }
  };

  const copyToClipboard = text => { 
    navigator.clipboard.writeText(text); 
    toast.success('Código copiado!'); 
  };

  return (
    <section className="view-section active">
      <div className="profile-wrapper">
        
        {/* ── Header Nav ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button onClick={() => onNavigate('dashboard')} className="sgc-btn-ghost" style={{ gap: 8, fontWeight: 700 }}>
            <ArrowLeft size={16} /> Voltar ao Painel
          </button>
          
          <button onClick={onLogout} className="sgc-btn-outline" style={{ color: 'var(--destructive)', borderColor: 'rgba(239,68,68,0.3)', gap: 8 }}>
            <LogOut size={15} /> Encerrar Sessão
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="profile-tabs">
          <button className={`profile-tab ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
            <User size={15} /> Minha Conta
          </button>
          <button className={`profile-tab ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}>
            <Users size={15} /> Equipes & Acessos
          </button>
        </div>

        {activeTab === 'personal' ? (
          /* ═══════════════ PERSONAL TAB ═══════════════ */
          <div style={{ animation: 'fadeUp 0.3s ease-out' }}>
            
            {/* Hero Card */}
            <div className="profile-hero">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar">
                  {avatar ? <img src={formatImageUrl(avatar)} alt="Avatar" /> : <span>{initials}</span>}
                </div>
                <label className="profile-avatar-btn" title="Alterar foto">
                  <Camera size={16} />
                  <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={handlePhoto} />
                </label>
              </div>
              <div className="profile-info">
                <h2 className="profile-name">Olá, {firstName} 👋</h2>
                <p className="profile-email">{form.email}</p>
              </div>
              <div className="profile-status">
                <ShieldCheck size={14} /> Conta Verificada
              </div>
            </div>

            {!editing ? (
              <>
                <div className="profile-grid">
                  <div className="profile-stat-card">
                    <div className="profile-stat-icon"><UserCircle2 size={20} /></div>
                    <div>
                      <p className="profile-stat-label">Nome de Exibição</p>
                      <p className="profile-stat-value">{form.name}</p>
                    </div>
                  </div>
                  <div className="profile-stat-card">
                    <div className="profile-stat-icon"><Mail size={20} /></div>
                    <div>
                      <p className="profile-stat-label">E-mail Vinculado</p>
                      <p className="profile-stat-value">{form.email}</p>
                    </div>
                  </div>
                  <div className="profile-stat-card">
                    <div className="profile-stat-icon success"><ShieldCheck size={20} /></div>
                    <div>
                      <p className="profile-stat-label">Status da Conta</p>
                      <p className="profile-stat-value" style={{ color: 'var(--accent)' }}>Ativa</p>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="sgc-btn-primary" onClick={() => setEditing(true)}>
                    <Edit size={16} /> Editar Informações
                  </button>
                </div>
              </>
            ) : (
              /* Edit Form */
              <div className="profile-form-card">
                <div className="profile-form-header">
                  <div className="profile-stat-icon" style={{ width: 36, height: 36 }}><Edit size={16} /></div>
                  <h3 className="profile-form-title">Editar Perfil</h3>
                </div>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="sgc-form-group">
                    <label className="sgc-label">Nome Completo</label>
                    <div className="modern-input-group">
                      <User className="modern-input-icon" size={16} />
                      <input id="name" type="text" className="modern-input" value={form.name} onChange={handleChange} required disabled={isSaving} />
                    </div>
                  </div>
                  <div className="sgc-form-group">
                    <label className="sgc-label">E-mail Profissional</label>
                    <div className="modern-input-group">
                      <Mail className="modern-input-icon" size={16} />
                      <input id="email" type="email" className="modern-input" value={form.email} onChange={handleChange} required disabled={isSaving} />
                    </div>
                  </div>
                  <div className="sgc-form-group">
                    <label className="sgc-label">Nova Senha (deixe em branco para não alterar)</label>
                    <div className="modern-input-group">
                      <Lock className="modern-input-icon" size={16} />
                      <input id="password" type={showPass ? 'text' : 'password'} className="modern-input" value={form.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" disabled={isSaving} />
                      <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" className="sgc-btn-outline" onClick={() => setEditing(false)} disabled={isSaving} style={{ flex: 1, justifyContent: 'center' }}>
                      Cancelar
                    </button>
                    <button type="submit" className="sgc-btn-primary" disabled={isSaving} style={{ flex: 1, justifyContent: 'center' }}>
                      <Save size={16} /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* ═══════════════ TEAM TAB ═══════════════ */
          <div style={{ animation: 'fadeUp 0.3s ease-out' }}>
            <div className="sgc-page-header">
              <div className="sgc-page-title-block">
                <h1 className="sgc-page-title">Workspaces & Equipes</h1>
                <p className="sgc-page-subtitle">Gerencie os acessos do seu time ou junte-se a uma nova equipe</p>
              </div>
              <div className="sgc-page-actions">
                <button className="sgc-btn-outline" onClick={() => { setShowJoinTeam(true); setShowCreateTeam(false); }}>Entrar com Código</button>
                <button className="sgc-btn-primary" onClick={() => { setShowCreateTeam(true); setShowJoinTeam(false); }}><Plus size={15}/> Criar Workspace</button>
              </div>
            </div>

            {/* Create Team Form */}
            {showCreateTeam && (
              <div className="profile-form-card" style={{ marginBottom: '1.5rem', borderColor: 'var(--primary-faded)' }}>
                <div className="profile-form-header">
                  <div className="profile-stat-icon" style={{ width: 36, height: 36 }}><Briefcase size={16} /></div>
                  <h3 className="profile-form-title">Novo Workspace</h3>
                </div>
                <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="sgc-form-group">
                    <label className="sgc-label">Nome da Equipe <span style={{ color: 'var(--destructive)' }}>*</span></label>
                    <input className="modern-input" type="text" placeholder="Ex: Suporte TI" value={teamForm.name} onChange={e => setTeamForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="sgc-form-group">
                    <label className="sgc-label">Descrição Breve</label>
                    <input className="modern-input" type="text" placeholder="Qual o propósito deste workspace?" value={teamForm.description} onChange={e => setTeamForm(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button type="button" className="sgc-btn-outline" onClick={() => setShowCreateTeam(false)} disabled={isCreatingTeam}>Cancelar</button>
                    <button type="submit" className="sgc-btn-primary" disabled={isCreatingTeam} style={{ flex: 1, justifyContent: 'center' }}>
                      {isCreatingTeam ? 'Criando...' : 'Criar Workspace'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Join Team Form */}
            {showJoinTeam && (
              <div className="profile-form-card" style={{ marginBottom: '1.5rem' }}>
                <div className="profile-form-header" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="profile-stat-icon" style={{ width: 36, height: 36 }}><Key size={16} /></div>
                    <h3 className="profile-form-title">Entrar em Workspace Existente</h3>
                  </div>
                  <button className="sgc-btn-ghost" style={{ padding: 6 }} onClick={() => setShowJoinTeam(false)}><X size={16} /></button>
                </div>
                <form onSubmit={handleJoinTeam} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                  <div className="sgc-form-group" style={{ flex: 1 }}>
                    <label className="sgc-label">Código de Convite</label>
                    <input className="modern-input" type="text" placeholder="SGC-XXXX" value={inviteCodeInput} onChange={e => setInviteCodeInput(e.target.value.toUpperCase())} />
                  </div>
                  <button type="submit" className="sgc-btn-primary" style={{ height: 42 }}>Ingressar</button>
                </form>
              </div>
            )}

            {/* Teams List */}
            {loadingTeams ? (
              <div className="sgc-card empty-state">Carregando seus workspaces...</div>
            ) : teams.length === 0 ? (
              <div className="sgc-card empty-state" style={{ padding: '4rem 2rem' }}>
                <Users size={48} style={{ color: 'var(--muted-foreground)', marginBottom: '1rem', opacity: 0.5 }} />
                <h3>Nenhum Workspace</h3>
                <p>Você ainda não faz parte de nenhuma equipe. Crie uma nova ou peça um código de convite.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {teams.map(team => {
                  const myRole  = team.members?.find(m => m.userId === currentSession.id)?.role;
                  const isAdmin = myRole === 'ADMIN';
                  const isOpen  = selectedTeam?.id === team.id;

                  return (
                    <div key={team.id} className="sgc-card" style={{ padding: 0, overflow: 'hidden', border: isOpen ? '1px solid var(--primary-faded)' : '1px solid var(--border)' }}>
                      <div 
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', cursor: 'pointer', background: isOpen ? 'var(--primary-faded)' : 'transparent' }}
                        onClick={() => setSelectedTeam(isOpen ? null : team)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div className="profile-stat-icon" style={{ width: 40, height: 40 }}><Briefcase size={18} /></div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{team.name}</h4>
                            <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{team.description || 'Workspace Geral'}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          {isAdmin && <span className="profile-status" style={{ padding: '4px 8px' }}>ADMIN</span>}
                          <button className="sgc-btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>{isOpen ? 'Fechar Config.' : 'Gerenciar'}</button>
                        </div>
                      </div>

                      {isOpen && (
                        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
                          <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acesso & Convites</h5>
                          
                          <div className="team-code-card">
                            <Key size={20} color="var(--primary)" />
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-foreground)' }}>CÓDIGO DA EQUIPE</p>
                              <span className="team-code-val">{team.inviteCode}</span>
                            </div>
                            <button className="sgc-btn-primary" onClick={() => copyToClipboard(team.inviteCode)}><Share2 size={16} /> Copiar</button>
                            {isAdmin && (
                              <button className="sgc-btn-outline" onClick={() => handleResetTeamCode(team.id)} title="Gerar novo código"><RefreshCw size={16} /></button>
                            )}
                          </div>

                          <h5 style={{ margin: '1.5rem 0 1rem 0', fontSize: '0.85rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Permissões de Módulo (RBAC)</h5>
                          <div className="permission-grid">
                            {PAGE_OPTIONS.map(page => {
                              const has = team.permissions?.some(p => p.name === page.id) ?? true;
                              const IconCmp = page.Icon;
                              return (
                                <div key={page.id} className={`permission-item ${has ? 'active' : ''}`}>
                                  <div className="permission-info">
                                    <IconCmp size={16} className="permission-icon" />
                                    <span className="permission-label">{page.label}</span>
                                  </div>
                                  {isAdmin ? (
                                    <button 
                                      type="button"
                                      className={`toggle-switch ${has ? 'active' : ''}`} 
                                      onClick={() => togglePermission(team, page.id)}
                                      aria-label={`Alternar permissão para ${page.label}`}
                                    >
                                      <span className="toggle-knob" />
                                    </button>
                                  ) : (
                                    has ? <Check size={16} color="var(--primary)" /> : <X size={16} color="var(--muted-foreground)" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {!isAdmin && <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '1rem' }}><AlertCircle size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }}/> Apenas administradores podem modificar permissões.</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
