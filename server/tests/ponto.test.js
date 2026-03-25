import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import { createPonto, getPonto } from '../src/controllers/ponto.controller.js';
import prisma from '../src/db.js';

describe('Controller: Ponto (Batidas)', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: { requisitante: 'Estevam', setor: 'TI' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.restoreAllMocks();
  });

  test('Deve registrar uma batida de ponto corretamente', async () => {
    // Note: Usamos o modelo 'chamado' conforme seu ponto.controller.js
    const createSpy = jest.spyOn(prisma.chamado, 'create').mockResolvedValue({ id: 'p1', ...mockReq.body });

    await createPonto(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(createSpy).toHaveBeenCalled();
  });
});
