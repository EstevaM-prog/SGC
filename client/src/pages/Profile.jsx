import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, User, Mail, Lock, Camera, LogOut, Edit, Save, X, Eye, EyeOff,
  ShieldCheck, UserCircle2, Users, Settings, RefreshCw, Key, Share2, Plus, Check,
  CheckCircle2, Layout, Building2, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { formatImageUrl } from '../Axios/conect.js';

/* ── Page options for permissions ── */
const PAGE_OPTIONS = [
  { id:'dashboard',   label:'Dashboard',        Icon:Layout },
  { id:'list',        label:'Lista de Chamados', Icon:Users },
  { id:'activities',  label:'Atividades',        Icon:Zap },
  { id:'shopping',    label:'Compras',           Icon:Building2 },
  { id:'freight',     label:'Fretes',            Icon:Settings },
  { id:'ponto',       label:'Ponto',             Icon:Settings },
  { id:'procedures',  label:'Procedimentos',     Icon:Settings },
];

export default function Profile({ currentUser, onLogout, onNavigate, onUpdateUser, addActivity }) {
  const storedUser     = JSON.parse(localStorage.getItem('user_db')   || 'null') || {};
  const currentSession = JSON.parse(localStorage.getItem('session_v1')|| 'null') || {};

  const [avatar, setAvatar]           = useState(localStorage.getItem('user_avatar') || null);
  const [editing, setEditing]         = useState(false);
  const [showPass, setShowPass]       = useState(false);
  const [isSaving, setIsSaving]       = useState(false);
  const [activeTab, setActiveTab]     = useState('personal');
  const [teams, setTeams]             = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showJoinTeam, setShowJoinTeam]     = useState(false);
  const [teamForm, setTeamForm]       = useState({ name:'', description:'' });
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [selectedTeam, setSelectedTeam]     = useState(null);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  const [form, setForm] = useState({
    name:     storedUser.name     || currentUser?.name  || '',
    email:    storedUser.email    || currentUser?.email || '',
    password: storedUser.password || '',
  });
  const fileRef = useRef();
  const initials = (form.name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  useEffect(() => { fetchProfile(); }, []);
  useEffect(() => { if (activeTab==='team') fetchTeams(); }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const r = await api.get('/users/me');
      if (r.status===200) { setForm({ name:r.data.name, email:r.data.email, password:'' }); setAvatar(r.data.avatarUrl); }
    } catch { toast.error('Erro ao carregar perfil'); }
  };

  const fetchTeams = async () => {
    if (!currentSession.id) currentSession.id = 'manual-'+Date.now();
    setLoadingTeams(true);
    try {
      const r = await api.get(`/teams?userId=${currentSession.id||''}`);
      if (r.status===200) setTeams(r.data);
    } catch (e) { console.error(e); }
    finally { setLoadingTeams(false); }
  };

  const handlePhoto = async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5*1024*1024) { toast.error('Máximo 5MB'); return; }
    const formData = new FormData();
    formData.append('avatar', file);
    const t = toast.loading('Enviando imagem...');
    try {
      const r = await api.post('/users/avatar', formData, { headers:{'Content-Type':'multipart/form-data'} });
      if (r.status===200) {
        setAvatar(r.data.avatarUrl);
        localStorage.setItem('user_avatar', r.data.avatarUrl);
        onUpdateUser?.({ ...currentUser, avatar:r.data.avatarUrl });
        toast.success('Foto atualizada!', { id:t });
      }
    } catch { toast.error('Erro no upload', { id:t }); }
  };

  const handleChange = e => setForm(p=>({...p,[e.target.id]:e.target.value}));

  const handleSave = async e => {
    e.preventDefault();
    if (isSaving) return;
    if (!form.name.trim())  { toast.error('Nome não pode estar vazio'); return; }
    if (!form.email.trim()) { toast.error('E-mail não pode estar vazio'); return; }
    if (form.password && form.password.length<6) { toast.error('Senha mínimo 6 caracteres'); return; }
    setIsSaving(true);
    const t = toast.loading('Salvando...');
    try {
      const r = await api.put('/users/me', form);
      if (r.status===200) { onUpdateUser?.({ name:form.name, email:form.email }); toast.success('Perfil atualizado!', {id:t}); setEditing(false); }
    } catch (e) { toast.error(e.response?.data?.error || 'Erro ao salvar', {id:t}); }
    finally { setIsSaving(false); }
  };

  const handleCreateTeam = async e => {
    e.preventDefault();
    if (isCreatingTeam) return;
    if (!teamForm.name.trim()) return toast.error('Dê um nome à equipe!');
    setIsCreatingTeam(true);
    const t = toast.loading('Criando equipe...');
    try {
      const r = await api.post('/teams', {...teamForm, userId:currentSession.id});
      if (r.status===201) { toast.success('Equipe criada!', {id:t}); setShowCreateTeam(false); setTeamForm({name:'',description:''}); fetchTeams(); }
      else toast.error('Erro ao criar equipe', {id:t});
    } catch (e) { toast.error(e.response?.data?.error || 'Falha de conexão', {id:t}); }
    finally { setIsCreatingTeam(false); }
  };

  const handleJoinTeam = async e => {
    e.preventDefault();
    const code = inviteCodeInput.trim();
    if (!code) return toast.error('Digite um código válido!');
    const t = toast.loading('Entrando em equipe...');
    try {
      const r = await api.post('/teams/join', {inviteCode:code, userId:currentSession.id});
      if (r.status===200) { toast.success('Bem-vindo à equipe!', {id:t}); setShowJoinTeam(false); setInviteCodeInput(''); fetchTeams(); }
      else toast.error('Código inválido ou já é membro', {id:t});
    } catch (e) { toast.error(e.response?.data?.error || 'Falha de conexão', {id:t}); }
  };

  const handleResetTeamCode = async id => {
    try {
      const r = await api.put(`/teams/${id}/reset-code`);
      if (r.status===200) { toast.success('Código resetado!'); fetchTeams(); }
    } catch { toast.error('Erro ao resetar código'); }
  };

  const togglePermission = async (team, pageId) => {
    const hasAccess = team.permissions?.some(p => p.name === pageId);
    try {
      const r = await api.put(`/teams/${team.id}/permissions`, {permissionName:pageId, enabled:!hasAccess});
      if (r.status===200) { toast.success(`Acesso ${!hasAccess?'concedido':'revogado'}`); fetchTeams(); }
    } catch { toast.error('Erro ao atualizar permissões'); }
  };

  const copyToClipboard = text => { navigator.clipboard.writeText(text); toast.success('Código copiado!'); };

  /* ───────────────────── render ───────────────────── */
  return (
    <div className="view-section active" style={{ maxWidth:760, margin:'0 auto' }}>

      {/* ── Back nav ── */}
      <button
        onClick={() => onNavigate('list')}
        className="sgc-btn-ghost"
        style={{ gap:8, marginBottom:'1.5rem', fontWeight:700 }}
      >
        <ArrowLeft size={16}/> Painel Administrativo
      </button>

      {/* ── Tab Bar ── */}
      <div className="sgc-tabs" style={{ alignSelf:'flex-start', marginBottom:'2rem', width:'fit-content' }}>
        <button className={`sgc-tab-btn ${activeTab==='personal'?'active':''}`} onClick={()=>setActiveTab('personal')}>
          <User size={14}/> Perfil
        </button>
        <button className={`sgc-tab-btn ${activeTab==='team'?'active':''}`} onClick={()=>setActiveTab('team')}>
          <Users size={14}/> Minha Equipe
        </button>
      </div>

      {activeTab==='personal' ? (
        /* ═══════════════ PERSONAL TAB ═══════════════ */
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

          {/* Avatar + name hero card */}
          <div className="sgc-card" style={{ flexDirection:'row', display:'flex', alignItems:'center', gap:'1.5rem' }}>
            {/* Avatar */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{
                width:86, height:86, borderRadius:22, overflow:'hidden',
                background:'linear-gradient(135deg, #0066FF, #10B981)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.75rem', fontWeight:900, color:'#fff',
                boxShadow:'0 8px 28px rgba(0,102,255,0.3)',
                border:'3px solid rgba(0,102,255,0.2)'
              }}>
                {avatar
                  ? <img src={formatImageUrl(avatar)} alt="Avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  : <span>{initials}</span>
                }
              </div>
              <label style={{
                position:'absolute', bottom:-4, right:-4,
                width:30, height:30, borderRadius:9,
                background:'linear-gradient(135deg,#0066FF,#10B981)',
                color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer', boxShadow:'0 4px 12px rgba(0,102,255,0.35)',
                border:'2px solid var(--card)', transition:'transform 0.25s'
              }}
                onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'}
                onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
              >
                <Camera size={13}/>
                <input type="file" accept="image/*" ref={fileRef} style={{ display:'none' }} onChange={handlePhoto}/>
              </label>
            </div>

            {/* name / email */}
            <div style={{ flex:1, minWidth:0 }}>
              <h2 style={{ margin:0, fontSize:'1.4rem', fontWeight:900, letterSpacing:'-0.03em',
                background:'linear-gradient(90deg, #0066FF, #10B981)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                Olá, {form.name.split(' ')[0]} 👋
              </h2>
              <p style={{ margin:'4px 0 0', color:'var(--muted-foreground)', fontSize:'0.875rem' }}>{form.email}</p>
            </div>

            {/* status badge */}
            <span className="sgc-badge green" style={{ flexShrink:0 }}>
              <CheckCircle2 size={11}/> Verificado
            </span>
          </div>

          {/* Info cards / Edit form */}
          {!editing ? (
            <>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                {[
                  { Icon:UserCircle2, label:'Nome de Exibição', value:form.name,       hint:null },
                  { Icon:Mail,        label:'Endereço de E-mail', value:form.email,    hint:null },
                  { Icon:ShieldCheck, label:'Segurança',          value:'Conta Verificada', hint:'green' },
                ].map(({ Icon, label, value, hint }) => (
                  <div key={label} className="sgc-card" style={{ flexDirection:'row', display:'flex', alignItems:'center', gap:'1rem', padding:'1rem 1.25rem' }}>
                    <div className={`sgc-kpi-icon ${hint==='green'?'green':'blue'}`} style={{ width:42, height:42, flexShrink:0 }}>
                      <Icon size={18}/>
                    </div>
                    <div>
                      <p style={{ margin:0, fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--muted-foreground)' }}>{label}</p>
                      <p style={{ margin:0, fontWeight:700, fontSize:'1rem', color: hint==='green' ? '#10B981' : 'var(--foreground)' }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button className="sgc-btn-primary" onClick={()=>setEditing(true)} style={{ flex:1, justifyContent:'center' }}>
                  <Edit size={15}/> Editar Perfil
                </button>
                <button
                  onClick={onLogout}
                  style={{ width:46, height:46, borderRadius:12, border:'1.5px solid rgba(239,68,68,0.25)', color:'#ef4444', background:'rgba(239,68,68,0.06)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.25s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.12)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,0.06)';}}
                  title="Sair"
                ><LogOut size={18}/></button>
              </div>
            </>
          ) : (
            <div className="sgc-card">
              <div className="sgc-card-header">
                <h3 className="sgc-card-title">
                  <span className="sgc-card-icon"><Edit size={15}/></span>
                  Editar Informações
                </h3>
              </div>
              <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <div className="sgc-form-group">
                  <label className="sgc-label">Nome Completo</label>
                  <div style={{ position:'relative' }}>
                    <User size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#0066FF', pointerEvents:'none' }}/>
                    <input className="sgc-input" id="name" type="text" style={{ paddingLeft:38 }} value={form.name} onChange={handleChange} required disabled={isSaving}/>
                  </div>
                </div>
                <div className="sgc-form-group">
                  <label className="sgc-label">E-mail Profissional</label>
                  <div style={{ position:'relative' }}>
                    <Mail size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#0066FF', pointerEvents:'none' }}/>
                    <input className="sgc-input" id="email" type="email" style={{ paddingLeft:38 }} value={form.email} onChange={handleChange} required disabled={isSaving}/>
                  </div>
                </div>
                <div className="sgc-form-group">
                  <label className="sgc-label">Trocar Senha <span style={{ textTransform:'none', fontWeight:500, opacity:0.6 }}>(opcional)</span></label>
                  <div style={{ position:'relative' }}>
                    <Lock size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#0066FF', pointerEvents:'none' }}/>
                    <input className="sgc-input" id="password" type={showPass?'text':'password'} style={{ paddingLeft:38, paddingRight:42 }}
                      value={form.password} onChange={handleChange} placeholder="Mínimo 6 dígitos" disabled={isSaving}/>
                    <button type="button" onClick={()=>setShowPass(v=>!v)}
                      style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--muted-foreground)', cursor:'pointer' }}>
                      {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>
                <div style={{ display:'flex', gap:'0.75rem', paddingTop:'0.5rem' }}>
                  <button type="button" className="sgc-btn-outline" onClick={()=>setEditing(false)} disabled={isSaving} style={{ flex:1, justifyContent:'center' }}>
                    Cancelar
                  </button>
                  <button type="submit" className="sgc-btn-primary" disabled={isSaving} style={{ flex:1.5, justifyContent:'center' }}>
                    <Save size={15}/> {isSaving ? 'Salvando...' : 'Confirmar'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

      ) : (
        /* ═══════════════ TEAM TAB ═══════════════ */
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

          {/* Team header */}
          <div className="sgc-page-header" style={{ marginBottom:0 }}>
            <div className="sgc-page-title-block">
              <h2 style={{ margin:0, fontSize:'1.4rem', fontWeight:900, letterSpacing:'-0.03em',
                background:'linear-gradient(90deg,#0066FF,#10B981)', WebkitBackgroundClip:'text',
                WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                Gestão de Equipes
              </h2>
              <p style={{ margin:0, fontSize:'0.82rem', color:'var(--muted-foreground)' }}>Crie ou participe de grupos de trabalho</p>
            </div>
            <div className="sgc-page-actions">
              <button className="sgc-btn-outline" onClick={()=>setShowJoinTeam(true)}>Entrar em Equipe</button>
              <button className="sgc-btn-primary" onClick={()=>setShowCreateTeam(true)}><Plus size={15}/> Criar Equipe</button>
            </div>
          </div>

          {/* Create team form */}
          {showCreateTeam && (
            <div className="sgc-card" style={{ borderColor:'rgba(0,102,255,0.25)', background:'rgba(0,102,255,0.03)' }}>
              <div className="sgc-card-header">
                <h3 className="sgc-card-title"><span className="sgc-card-icon"><Plus size={15}/></span> Configurar Nova Equipe</h3>
              </div>
              <form onSubmit={handleCreateTeam} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <div className="sgc-form-group">
                  <label className="sgc-label">Nome da Equipe</label>
                  <input className="sgc-input" type="text" placeholder="Ex: Time de Suporte" value={teamForm.name}
                    onChange={e=>setTeamForm(p=>({...p,name:e.target.value}))}/>
                </div>
                <div className="sgc-form-group">
                  <label className="sgc-label">Descrição (opcional)</label>
                  <input className="sgc-input" type="text" placeholder="Setor ou objetivo" value={teamForm.description}
                    onChange={e=>setTeamForm(p=>({...p,description:e.target.value}))}/>
                </div>
                <div style={{ display:'flex', gap:'0.75rem' }}>
                  <button type="button" className="sgc-btn-outline" onClick={()=>setShowCreateTeam(false)} disabled={isCreatingTeam}>Cancelar</button>
                  <button type="submit" className="sgc-btn-primary" disabled={isCreatingTeam} style={{ flex:1, justifyContent:'center' }}>
                    {isCreatingTeam ? 'Criando...' : 'Criar Agora'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Join team form */}
          {showJoinTeam && (
            <div className="sgc-card">
              <div className="sgc-card-header">
                <h3 className="sgc-card-title"><span className="sgc-card-icon"><Key size={15}/></span> Entrar em Equipe</h3>
                <button className="sgc-btn-ghost" style={{ width:32, height:32, padding:0, justifyContent:'center' }} onClick={()=>setShowJoinTeam(false)}><X size={15}/></button>
              </div>
              <p style={{ fontSize:'0.82rem', color:'var(--muted-foreground)', marginBottom:'1rem' }}>
                Insira o código enviado pelo administrador.
              </p>
              <form onSubmit={handleJoinTeam} style={{ display:'flex', gap:'0.75rem' }}>
                <input className="sgc-input" type="text" placeholder="SGC-0000" value={inviteCodeInput}
                  onChange={e=>setInviteCodeInput(e.target.value.toUpperCase())} style={{ flex:1 }}/>
                <button type="submit" className="sgc-btn-primary">Entrar</button>
              </form>
            </div>
          )}

          {/* Teams list */}
          {loadingTeams ? (
            <div className="sgc-card">
              <div className="sgc-empty"><div className="sgc-empty-icon"><Users size={26}/></div><span className="sgc-empty-desc">Carregando equipes...</span></div>
            </div>
          ) : teams.length === 0 ? (
            <div className="sgc-card">
              <div className="sgc-empty">
                <div className="sgc-empty-icon"><Users size={26}/></div>
                <span className="sgc-empty-title">Sem equipes</span>
                <span className="sgc-empty-desc">Crie ou entre em uma equipe para começar.</span>
              </div>
            </div>
          ) : teams.map(team => {
            const myRole   = team.members?.find(m => m.userId === currentSession.id)?.role;
            const isAdmin  = myRole === 'ADMIN';
            const isOpen   = selectedTeam?.id === team.id;

            return (
              <div key={team.id} className="sgc-card" style={{ padding:0, overflow:'hidden' }}>
                {/* Team row */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.25rem 1.5rem', cursor:'pointer' }}
                  onClick={()=>setSelectedTeam(isOpen ? null : team)}>
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                    <div className="sgc-kpi-icon blue"><Users size={18}/></div>
                    <div>
                      <div style={{ fontWeight:800, fontSize:'0.95rem' }}>{team.name}</div>
                      <div style={{ fontSize:'0.78rem', color:'var(--muted-foreground)' }}>{team.description||'Sem descrição'}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                    {isAdmin && <span className="sgc-badge green">ADMIN</span>}
                    <span className={`sgc-badge ${isOpen?'blue':'gray'}`}>{isOpen?'Minimizar':'Gerenciar'}</span>
                  </div>
                </div>

                {/* Expand: invite code + permissions */}
                {isOpen && (
                  <div style={{ borderTop:'1px solid rgba(0,102,255,0.08)', padding:'1.5rem' }}>

                    {/* Invite code */}
                    <p className="sgc-label" style={{ marginBottom:'0.75rem' }}>Código de Convite</p>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', background:'rgba(0,102,255,0.04)', border:'1.5px dashed rgba(0,102,255,0.2)', borderRadius:12, padding:'0.75rem 1rem', marginBottom:'2rem' }}>
                      <Key size={16} style={{ color:'#0066FF', flexShrink:0 }}/>
                      <span style={{ flex:1, fontFamily:'monospace', fontWeight:800, fontSize:'1.1rem', letterSpacing:'0.1em', color:'var(--foreground)' }}>{team.inviteCode}</span>
                      <button className="sgc-btn-ghost" style={{ gap:4 }} onClick={()=>copyToClipboard(team.inviteCode)}>
                        <Share2 size={14}/> Copiar
                      </button>
                      {isAdmin && (
                        <button className="sgc-btn-ghost" style={{ gap:4 }} onClick={()=>handleResetTeamCode(team.id)}>
                          <RefreshCw size={14}/> Resetar
                        </button>
                      )}
                    </div>

                    {/* Permissions */}
                    <p className="sgc-label" style={{ marginBottom:'0.75rem' }}>Permissões de Acesso (RBAC)</p>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'0.6rem' }}>
                      {PAGE_OPTIONS.map(page => {
                        const has = team.permissions?.some(p=>p.name===page.id) ?? true;
                        return (
                          <div key={page.id} style={{
                            display:'flex', alignItems:'center', justifyContent:'space-between',
                            padding:'0.75rem 1rem', borderRadius:12,
                            background: has ? 'rgba(0,102,255,0.04)' : 'rgba(0,0,0,0.02)',
                            border:`1px solid ${has?'rgba(0,102,255,0.14)':'rgba(0,0,0,0.06)'}`,
                            transition:'all 0.25s'
                          }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                              <page.Icon size={14} style={{ color: has ? '#0066FF' : 'var(--muted-foreground)' }}/>
                              <span style={{ fontSize:'0.82rem', fontWeight:600, color: has ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{page.label}</span>
                            </div>
                            {isAdmin ? (
                              <button onClick={()=>togglePermission(team,page.id)} style={{
                                width:38, height:20, borderRadius:10,
                                background: has ? 'linear-gradient(90deg,#0066FF,#10B981)' : 'rgba(0,0,0,0.12)',
                                border:'none', position:'relative', cursor:'pointer', transition:'background 0.25s',
                                boxShadow: has ? '0 3px 8px rgba(0,102,255,0.3)' : 'none'
                              }}>
                                <div style={{ position:'absolute', top:2, left: has?20:2, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left 0.25s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}/>
                              </button>
                            ) : (
                              has
                                ? <Check size={14} style={{ color:'#10B981' }}/>
                                : <X    size={14} style={{ color:'#ef4444' }}/>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {!isAdmin && <p style={{ fontSize:'0.73rem', color:'var(--muted-foreground)', marginTop:'0.75rem', fontStyle:'italic' }}>* Somente o administrador pode alterar permissões.</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
