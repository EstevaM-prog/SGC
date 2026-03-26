import React, { useState, useEffect } from 'react';
import { User, Shield, Check, X, Loader2 } from 'lucide-react';
import api from '../Axios/conect.js';
import toast from 'react-hot-toast';

export default function TeamMembers({ teamId, currentUserRole }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // stores memberId being updated

  const fetchMembers = async () => {
    try {
      const resp = await api.get(`/teams/${teamId}/members`);
      setMembers(resp.data);
    } catch (err) {
      toast.error('Erro ao carregar membros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) fetchMembers();
  }, [teamId]);

  const togglePermission = async (userId, currentPerms, key) => {
    if (currentUserRole !== 'ADMIN') {
      toast.error('Apenas administradores podem alterar permissões');
      return;
    }

    setUpdating(userId);
    const newPerms = { ...currentPerms, [key]: !currentPerms[key] };

    try {
      await api.patch(`/teams/${teamId}/members/${userId}/permissions`, { 
        permissions: newPerms 
      });
      setMembers(prev => prev.map(m => 
        m.userId === userId ? { ...m, permissions: newPerms } : m
      ));
      toast.success('Permissão atualizada');
    } catch (err) {
      toast.error('Falha ao atualizar permissão');
    } finally {
      setUpdating(null);
    }
  };

  const permissionFlags = [
    { key: 'can_edit_freight', label: 'Editar Fretes' },
    { key: 'can_view_billing', label: 'Ver Faturamento' },
    { key: 'can_manage_tickets', label: 'Gerir Chamados' },
    { key: 'can_access_trash', label: 'Acessar Lixeira' }
  ];

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="team-members-container bg-card/50 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Shield size={20} className="text-indigo-400" />
          Membros da Equipe
        </h3>
        <span className="text-sm text-muted-foreground">{members.length} membros</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-semibold">Membro</th>
              <th className="px-6 py-4 font-semibold">Função</th>
              <th className="px-6 py-4 font-semibold">Permissões (Feature Flags)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {members.map(member => (
              <tr key={member.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center overflow-hidden border border-white/10">
                      {member.user.avatarUrl ? (
                         <img src={member.user.avatarUrl} alt={member.user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} className="text-indigo-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{member.user.name}</div>
                      <div className="text-xs text-muted-foreground">{member.user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    member.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {permissionFlags.map(flag => (
                      <button
                        key={flag.key}
                        disabled={updating === member.userId}
                        onClick={() => togglePermission(member.userId, member.permissions || {}, flag.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                          (member.permissions || {})[flag.key] 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/10 text-rose-400/60 border border-rose-500/10 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                        }`}
                      >
                        {(member.permissions || {})[flag.key] ? <Check size={12} /> : <X size={12} />}
                        {flag.label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
