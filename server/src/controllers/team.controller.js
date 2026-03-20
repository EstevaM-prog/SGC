import prisma from '../db.js';

export const createTeam = async (req, res) => {
  try {
    const { name, description, userId } = req.body;

    // Generate unique code SGC-XXXX
    const inviteCode = 'SGC-' + Math.floor(1000 + Math.random() * 9000);

    const team = await prisma.team.create({
      data: {
        name,
        description,
        inviteCode,
        permissions: { dashboard: true, activities: true, forms: true }, // Default
        members: {
          create: {
            userId,
            role: 'ADMIN'
          }
        }
      },
      include: {
        members: true
      }
    });

    res.status(201).json(team);
  } catch (err) {
    console.error('Error creating team:', err);
    res.status(500).json({ error: 'Erro ao criar equipe' });
  }
};

export const getTeams = async (req, res) => {
  try {
    const { userId } = req.query;
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, avatar: true } } }
        }
      }
    });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar equipes' });
  }
};

export const resetInviteCode = async (req, res) => {
  try {
    const { teamId } = req.params;
    const inviteCode = 'SGC-' + Math.floor(1000 + Math.random() * 9000);
    const team = await prisma.team.update({
      where: { id: teamId },
      data: { inviteCode }
    });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao resetar código' });
  }
};

export const updatePermissions = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { permissions } = req.body;
    const team = await prisma.team.update({
      where: { id: teamId },
      data: { permissions }
    });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar permissões' });
  }
};

export const joinTeam = async (req, res) => {
  try {
    const { inviteCode, userId } = req.body;
    const team = await prisma.team.findUnique({
      where: { inviteCode }
    });

    if (!team) return res.status(404).json({ error: 'Código inválido' });

    const member = await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId,
        role: 'MEMBER'
      }
    });

    res.status(201).json({ team, member });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao entrar na equipe. Talvez você já seja membro?' });
  }
};
