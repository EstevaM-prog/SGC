import React, { useState, useRef } from 'react';
import { ArrowLeft, User, Mail, Lock, Camera, LogOut, Edit, Save, X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile({ currentUser, onLogout, onNavigate, onUpdateUser, addActivity }) {
  const storedUser = JSON.parse(localStorage.getItem('user_db') || 'null') || {};

  const [avatar, setAvatar] = useState(localStorage.getItem('user_avatar') || null);
  const [editing, setEditing] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: storedUser.name || currentUser?.name || '',
    email: storedUser.email || currentUser?.email || '',
    password: storedUser.password || '',
  });

  const fileRef = useRef();

  const initials = (form.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  /* ── Photo upload ──────────────────────────────────────────── */
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Limit to 1MB to prevent QuotaExceededError in localStorage
    if (file.size > 1024 * 1024) {
      toast.error('A imagem é muito grande! Máximo 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target.result;
      try {
        setAvatar(data);
        localStorage.setItem('user_avatar', data);
        onUpdateUser?.({ name: form.name, email: form.email, avatar: data });
        toast.success('Foto de perfil atualizada!');
      } catch (err) {
        console.error('Erro ao salvar avatar:', err);
        toast.error('Não foi possível salvar a imagem.');
      }
    };
    reader.readAsDataURL(file);
  };

  /* ── Form handlers ─────────────────────────────────────────── */
  const handleChange = (e) => setForm(p => ({ ...p, [e.target.id]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    if (!form.name.trim()) { toast.error('O nome não pode estar vazio.'); return; }
    if (!form.email.trim()) { toast.error('O e-mail não pode estar vazio.'); return; }
    if (form.password && form.password.length < 6) {
      toast.error('A senha deve ter ao menos 6 caracteres.'); return;
    }

    setIsSaving(true);
    const loadingToast = toast.loading('Salvando alterações...');

    // Persist to localStorage
    try {
      await new Promise(r => setTimeout(r, 600)); // Simulando delay

      const updated = { ...storedUser, name: form.name, email: form.email };
      if (form.password) updated.password = form.password;
      localStorage.setItem('user_db', JSON.stringify(updated));

      // Update active session
      const session = JSON.parse(localStorage.getItem('session_v1') || '{}');
      localStorage.setItem('session_v1', JSON.stringify({ ...session, name: form.name, email: form.email }));

      // ← Sync React state in App so Header re-renders immediately
      onUpdateUser?.({ name: form.name, email: form.email });

      if (addActivity) {
        addActivity({
          text: `Perfil de ${form.name} Atualizado`,
          description: `Alteração de dados cadastrais (E-mail: ${form.email})`,
          user: form.name,
          type: 'info',
          iconType: 'user'
        });
      }
      
      toast.success("Criado com sucesso!", { id: loadingToast });
      setEditing(false);
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      toast.error("Erro no chamado!", { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: storedUser.name || currentUser?.name || '',
      email: storedUser.email || currentUser?.email || '',
      password: storedUser.password || '',
    });
    setEditing(false);
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card" style={{ maxWidth: 460 }}>

        {/* Back */}
        <button className="auth-link"
          style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1.25rem' }}
          onClick={() => onNavigate('list')}>
          <ArrowLeft size={16} /> Voltar
        </button>

        <h1 className="auth-title" style={{ marginBottom: '1.5rem' }}>Meu Perfil</h1>

        {/* Avatar section */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
          marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)',
          borderRadius: 16, border: '1px solid var(--border)', padding: '1.5rem'
        }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%', overflow: 'hidden',
            background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 700, color: '#fff', flexShrink: 0,
            boxShadow: '0 0 0 3px rgba(124,58,237,0.35)',
          }}>
            {avatar
              ? <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span>{initials}</span>
            }
          </div>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
            fontSize: '0.85rem', border: '1px solid var(--border)', padding: '6px 14px',
            borderRadius: 8, background: 'var(--card)', color: 'var(--foreground)', transition: 'background .2s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--card)'}>
            <Camera size={14} /> Alterar Foto
            <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={handlePhoto} />
          </label>
        </div>

        {/* ── VIEW mode ── */}
        {!editing ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { icon: <User size={18} />, label: 'Nome', value: form.name },
                { icon: <Mail size={18} />, label: 'E-mail', value: form.email },
                { icon: <Lock size={18} />, label: 'Senha', value: '••••••••' },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem'
                }}>
                  <div style={{
                    background: 'rgba(124,58,237,0.1)', color: '#a78bfa',
                    width: 40, height: 40, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {icon}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{label}</p>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => setEditing(true)} style={{
                width: '100%', height: 44,
                background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
                color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}>
                <Edit size={16} /> Editar Perfil
              </button>
              <button onClick={onLogout} style={{
                width: '100%', height: 44, border: '1px solid #ef4444', color: '#ef4444',
                fontWeight: 600, borderRadius: 8, background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}>
                <LogOut size={16} /> Sair
              </button>
            </div>

          </>
        ) : (
          /* ── EDIT mode ── */
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="auth-field">
              <label htmlFor="name">Nome</label>
              <div className="auth-input-wrap">
                <User size={16} className="auth-input-icon" />
                <input id="name" type="text" value={form.name} onChange={handleChange} placeholder="Seu nome" required disabled={isSaving} />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">E-mail</label>
              <div className="auth-input-wrap">
                <Mail size={16} className="auth-input-icon" />
                <input id="email" type="email" value={form.email} onChange={handleChange} placeholder="voce@exemplo.com" required disabled={isSaving} />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">
                Nova Senha{' '}
                <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                  (deixe em branco para não alterar)
                </span>
              </label>
              <div className="auth-input-wrap">
                <Lock size={16} className="auth-input-icon" />
                <input id="password" type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={handleChange} placeholder="••••••••" disabled={isSaving} />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPass(v => !v)} disabled={isSaving}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button type="button" onClick={handleCancel} disabled={isSaving} style={{
                flex: 1, height: 44, background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--foreground)', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}>
                <X size={16} /> Cancelar
              </button>
              <button type="submit" disabled={isSaving} style={{
                flex: 2, height: 44, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
                color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}>
                <Save size={16} /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
