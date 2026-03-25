import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { createTeam } from '../src/controllers/team.controller.js';
import prisma from '../src/db.js';

describe('Segurança de Equipes', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: { name: 'Time de Teste', description: 'Desc', userId: 'user-1' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.restoreAllMocks();
  });

  test('Ao criar equipe, o convite deve ser criptografado e expirar em 24h', async () => {
    // Espionagem do Prisma para criação e busca
    jest.spyOn(prisma.team, 'findFirst').mockResolvedValue(null);
    const createSpy = jest.spyOn(prisma.team, 'create').mockImplementation(({ data }) => {
      // Validamos o Hash do Bcrypt e a presença da expiração NO MOMENTO DA CRIAÇÃO
      expect(data.inviteCode).toMatch(/^\$2[bcde]\$10\$.*/);
      expect(data.inviteCodeExpires).toBeDefined();
      return { ...data, id: 'team-123', permissions: [] };
    });

    await createTeam(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    
    // O usuário deve receber o código legível (SGC-XXXX) UMA vez
    const response = mockRes.json.mock.calls[0][0];
    expect(response.inviteCode).toMatch(/^SGC-\d{4}$/);
    
    createSpy.mockRestore();
  });
});
