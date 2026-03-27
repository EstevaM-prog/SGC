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

    // Generate unique code SGC-XXXX
    const rawInviteCode = 'SGC-' + Math.floor(1000 + Math.random() * 9000);
    const hashedInviteCode = await bcrypt.hash(rawInviteCode, 10);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    const team = await prisma.team.create({
      data: {
        name,
        description,
        inviteCode: hashedInviteCode,
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
    const rawInviteCode = 'SGC-' + Math.floor(1000 + Math.random() * 9000);
    const hashedInviteCode = await bcrypt.hash(rawInviteCode, 10);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        inviteCode: hashedInviteCode,
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
    
    // Como o código é um hash, não podemos usar findUnique diretamente.
    const teams = await prisma.team.findMany({
      where: {
        inviteCodeExpires: { gt: new Date() }
      }
    });

    console.log(`[joinTeam] Encontradas ${teams.length} equipes não expiradas.`);
    
    let foundTeam = null;
    for (const team of teams) {
      if (!team.inviteCode) continue;
      const isMatch = await bcrypt.compare(inviteCode, team.inviteCode);
      if (isMatch) {
        foundTeam = team;
        break;
      }
    }

    if (!foundTeam) {
      console.warn(`[joinTeam] Nenhuma equipe com código coincidente encontrada (ou código já expirou). Equipes checadas: ${teams.length}`);
      return res.status(404).json({ error: 'Código inválido ou expirado' });
    }

    const team = await prisma.team.update({
      where: { id: foundTeam.id },
      data: {
        members: {
          create: {
            userId,
            role: 'MEMBER',
            permissions: {}
          }
        }
      },
      include: {
        members: {
          where: { userId }
        }
      }
    });

    res.status(201).json({ team: foundTeam, member: team.members[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao entrar na equipe. Talvez você já seja membro?' });
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
