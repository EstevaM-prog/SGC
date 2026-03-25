import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import { checkPermission } from '../src/middlewares/auth.js';
import prisma from '../src/db.js';

describe('Middleware de Permissões RBAC', () => {
  let mockReq;
  let mockRes;
  let next;

  beforeEach(() => {
    mockReq = { userId: '1' };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    // Limpamos todos os mocks antes de cada teste
    jest.restoreAllMocks();
  });

  test('Deve retornar 403 se o usuário não tiver a permissão necessária', async () => {
    // Espionamos o prisma sem usar jest.mock() direto
    jest.spyOn(prisma.team, 'findMany').mockResolvedValue([
      { permissions: [{ name: 'dashboard' }] }
    ]);

    const middleware = checkPermission('shopping');
    await middleware(mockReq, mockRes, next);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalled();
  });

  test('Deve chamar next() se o usuário tiver a permissão necessária', async () => {
    jest.spyOn(prisma.team, 'findMany').mockResolvedValue([
      { permissions: [{ name: 'shopping' }] }
    ]);

    const middleware = checkPermission('shopping');
    await middleware(mockReq, mockRes, next);

    expect(next).toHaveBeenCalled();
  });
});
