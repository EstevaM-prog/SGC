import jwt from 'jsonwebtoken';
import prisma from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

export const checkPermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      // Busca se o usuário pertence a algum time que tenha essa permissão (no novo formato Many-to-Many)
      const userTeams = await prisma.team.findMany({
        where: {
          members: { some: { userId: req.userId } }
        },
        include: { permissions: true }
      });

      const hasPermission = userTeams.some(team => 
        team.permissions.some(p => p.name === permissionKey)
      );

      if (!hasPermission) {
        return res.status(403).json({ error: `Sem permissão de acesso para: ${permissionKey}` });
      }

      next();
    } catch (err) {
      res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  };
};
