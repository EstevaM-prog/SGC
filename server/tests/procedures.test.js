import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import { createProdureceres, getProdureceres } from '../src/controllers/producreceres.js';
import prisma from '../src/db.js';

describe('Controller: Procedures (Procedimentos)', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: { titulo: 'Novo Guia', descricao: 'Passo a passo', categoria: 'TI' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.restoreAllMocks();
  });

  test('Deve criar novo procedimento informativo', async () => {
    const createSpy = jest.spyOn(prisma.procedimento, 'create').mockResolvedValue({ id: 'pr1', ...mockReq.body });

    await createProdureceres(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ titulo: 'Novo Guia' })
    }));
  });
});
