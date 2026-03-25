import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import { createFreight, getFreight } from '../src/controllers/freight.controller.js';
import prisma from '../src/db.js';

describe('Controller: Freights (Fretes)', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: { numero: 'F-123', valor: 250 }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.restoreAllMocks();
  });

  test('Deve criar registro de frete com sucesso', async () => {
    const createSpy = jest.spyOn(prisma.freightTicket, 'create').mockResolvedValue({ id: 'f1', ...mockReq.body });

    await createFreight(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(createSpy).toHaveBeenCalled();
  });

  test('Deve listar apenas fretes não excluídos', async () => {
    const findSpy = jest.spyOn(prisma.freightTicket, 'findMany').mockResolvedValue([]);

    await getFreight(mockReq, mockRes);

    expect(findSpy).toHaveBeenCalledWith(expect.objectContaining({
      where: { deleted: false }
    }));
  });
});
