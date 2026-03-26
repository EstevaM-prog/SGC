import jwt from 'jsonwebtoken';
import prisma from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    console.warn('Bloqueio 401: Token não fornecido no Header Request', {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers
    });
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error('Bloqueio 401: Token inválido ou expirado:', err.message);
    res.status(401).json({ error: 'Token inválido' });
  }
};

export const checkPermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      const userTeams = await prisma.team.findMany({
        where: { members: { some: { userId: req.userId } } },
        include: { permissions: true }
      });

      const hasPermission = userTeams.some(team => 
        team.permissions.some(p => p.name === permissionKey)
      );

      if (!hasPermission) {
        console.warn(`Bloqueio 403: Usuário ${req.userId} não possui permissão ${permissionKey}`);
        return res.status(403).json({ error: `Sem permissão: ${permissionKey}` });
      }

      next();
    } catch (err) {
      console.error('Erro 500 no checkPermission:', err);
      res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  };
};

export const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      
      if (!user || !allowedRoles.includes(user.role)) {
        console.warn(`Bloqueio 403: Usuário ${req.userId} (Role: ${user?.role}) tentou acessar área restrita.`);
        return res.status(403).json({ error: 'Acesso negado: Nível de permissão insuficiente.' });
      }

      next();
    } catch (err) {
      console.error('Erro no checkRole:', err);
      res.status(500).json({ error: 'Erro ao verificar cargos' });
    }
  };
};
