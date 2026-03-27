import prisma from '../db.js';
import auditLogger from '../utils/audit.logger.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const createTeam = async (req, res) => {
  try {
    const { name, description, userId } = req.body;

    // Verificar se já existe uma equipe com o mesmo nome criada por este usuário
    const existingTeam = await prisma.team.findFirst({
      where: {
        name,
        members: {
          some: { userId, role: 'ADMIN' }
        }
      }
    });

    if (existingTeam) {
      return res.status(400).json({ error: 'Você já possui uma equipe com este nome.' });
    }

    // Generate absolutely unique code SGC-XXXX
    let rawInviteCode;
    while (true) {
      rawInviteCode = 'SGC-' + Math.floor(1000 + Math.random() * 9000);
      const exists = await prisma.team.findFirst({ where: { inviteCode: rawInviteCode } });
      if (!exists) break;
    }
    
    // Agora salvamos diretamente o código gerado, garantindo facilidade de busca no DB
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    const team = await prisma.team.create({
      data: {
        name,
        description,
        inviteCode: rawInviteCode,
        inviteCodeExpires: expiresAt,
        // Conecta as permissões padrão (dashboard, etc - garante que existam)
        permissions: {
          connectOrCreate: [
            { where: { name: 'dashboard' }, create: { name: 'dashboard' } },
            { where: { name: 'list' }, create: { name: 'list' } }, // Essencial para a lista de chamados
            { where: { name: 'activities' }, create: { name: 'activities' } },
            { where: { name: 'forms' }, create: { name: 'forms' } },
            { where: { name: 'shopping' }, create: { name: 'shopping' } },
            { where: { name: 'freight' }, create: { name: 'freight' } },
            { where: { name: 'ponto' }, create: { name: 'ponto' } },
            { where: { name: 'procedures' }, create: { name: 'procedures' } }
          ]
        },
        members: {
          create: {
            userId,
            role: 'ADMIN'
          }
        }
      },
      include: {
        members: true,
        permissions: true
      }
    });

    // Retorna o código original para o administrador copiar apenas uma vez
    res.status(201).json({ ...team, inviteCode: rawInviteCode });
  } catch (err) {
    console.error('Error creating team:', err);
    res.status(500).json({ error: 'Erro ao criar equipe' });
  }
};

export const getTeams = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || userId === 'undefined') {
       return res.status(200).json([]); // Retorna lista vazia em vez de 500
    }
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        permissions: true,
        members: {
          include: { user: { select: { id: true, name: true, avatarUrl: true, email: true } } }
        }
      }
    });
    res.json(teams);
  } catch (err) {
    console.error('Falha ao buscar equipes:', err);
    res.status(500).json({ error: 'Erro ao buscar equipes' });
  }
};

export const resetInviteCode = async (req, res) => {
  try {
    const { teamId } = req.params;
    let rawInviteCode;
    while (true) {
      rawInviteCode = 'SGC-' + Math.floor(1000 + Math.random() * 9000);
      const exists = await prisma.team.findFirst({ where: { inviteCode: rawInviteCode } });
      if (!exists) break;
    }
    
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        inviteCode: rawInviteCode,
        inviteCodeExpires: expiresAt
      }
    });

    res.json({ ...team, inviteCode: rawInviteCode });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao resetar código' });
  }
};

export const updatePermissions = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { permissionName, enabled } = req.body; // toggle: "dashboard", true/false

    const updateData = enabled
      ? { connectOrCreate: { where: { name: permissionName }, create: { name: permissionName } } }
      : { disconnect: { name: permissionName } };

    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        permissions: updateData
      },
      include: { permissions: true }
    });
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao configurar permissão na tabela' });
  }
};

export const joinTeam = async (req, res) => {
  try {
    const { inviteCode, userId } = req.body;

    console.log(`[joinTeam] Buscando equipe com código: ${inviteCode} para o usuário ${userId}`);
    
    // Primeira tentativa de busca: Código limpo e exato (No novo padrão sem hash)
    let foundTeam = await prisma.team.findFirst({
      where: {
        inviteCode,
        inviteCodeExpires: { gt: new Date() }
      }
    });

    // Fallback Legacy: Se ainda existirem equipes antigas com o hash bcrypt (padrão antigo)
    if (!foundTeam) {
      const teams = await prisma.team.findMany({
        where: { inviteCodeExpires: { gt: new Date() } }
      });

      console.log(`[joinTeam] Buscando via Legacy Hash em ${teams.length} equipes...`);
      for (const team of teams) {
        if (!team.inviteCode || !team.inviteCode.startsWith('$2')) continue;
        const isMatch = await bcrypt.compare(inviteCode, team.inviteCode);
        if (isMatch) {
          foundTeam = team;
          break;
        }
      }
    }

    if (!foundTeam) {
      console.warn(`[joinTeam] Código de convite '${inviteCode}' inválido ou expirado para o usuário ${userId}`);
      return res.status(404).json({ error: 'Código inválido ou expirado' });
    }

    // 1. Verifica se já existe o membro para evitar erro de constraint única
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: { userId, teamId: foundTeam.id }
      }
    });

    if (existingMember) {
      console.log(`[joinTeam] Usuário ${userId} já está na equipe ${foundTeam.id}`);
      return res.status(200).json({ 
        message: 'Você já faz parte desta equipe!', 
        team: foundTeam, 
        member: existingMember 
      });
    }

    // 2. Inicializa as Feature Flags vazias (todas em false por padrão)
    // Isso garante que o Admin veja os botões na tela de membros
    const defaultPermissions = {
      can_edit_freight: false,
      can_view_billing: false,
      can_manage_tickets: false,
      can_access_trash: false
    };

    // 3. Cria o novo membro na equipe
    const team = await prisma.team.update({
      where: { id: foundTeam.id },
      data: {
        members: {
          create: {
            userId,
            role: 'MEMBER',
            permissions: defaultPermissions
          }
        }
      },
      include: {
        members: {
          where: { userId },
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } }
          }
        }
      }
    });

    res.status(201).json({ 
      message: 'Bem-vindo à equipe!', 
      team: foundTeam, 
      member: team.members[0] 
    });
  } catch (err) {
    console.error('[joinTeam Error]:', err);
    res.status(500).json({ error: 'Erro interno ao entrar na equipe.' });
  }
};

export const updateMemberPermissions = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const { permissions } = req.body;

    const updatedMember = await prisma.teamMember.update({
      where: {
        userId_teamId: { userId, teamId }
      },
      data: { permissions }
    });

    auditLogger.info(`Alteração de Feature Flag no usuário ${userId} pelo Admin ${req.userId}`, { 
      teamId, 
      permissions 
    });

    res.json(updatedMember);
  } catch (err) {
    console.error('Erro ao atualizar permissões do membro:', err);
    res.status(500).json({ error: 'Erro ao atualizar permissões do membro' });
  }
};

export const getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    const members = await prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar membros da equipe' });
  }
};
