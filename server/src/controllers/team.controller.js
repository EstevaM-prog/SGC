import prisma from '../db.js';
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
          include: { user: { select: { id: true, name: true, avatar: true } } }
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

    // Como o código é um hash, não podemos usar findUnique diretamente.
    // Vamos buscar por ID do time se tivéssemos, mas como só temos o código, 
    // precisamos buscar equipes com convites ativos e comparar.
    const teams = await prisma.team.findMany({
      where: {
        inviteCodeExpires: { gt: new Date() }
      }
    });

    let foundTeam = null;
    for (const team of teams) {
      const isMatch = await bcrypt.compare(inviteCode, team.inviteCode);
      if (isMatch) {
        foundTeam = team;
        break;
      }
    }

    if (!foundTeam) return res.status(404).json({ error: 'Código inválido ou expirado' });

    const member = await prisma.teamMember.create({
      data: {
        teamId: foundTeam.id,
        userId,
        role: 'MEMBER'
      }
    });

    res.status(201).json({ team: foundTeam, member });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao entrar na equipe. Talvez você já seja membro?' });
  }
};
