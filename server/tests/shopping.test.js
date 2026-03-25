import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import { createShopping, getShopping } from '../src/controllers/shopping.controller.js';
import prisma from '../src/db.js';

describe('Controller: Shopping (Compras)', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: { razao: 'Test SA', cnpj: '00.000/0001-00', valor: 500.50 },
      params: { id: 'test-1' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.restoreAllMocks();
  });

  test('Deve criar uma compra e formatar o valor como número', async () => {
    const createSpy = jest.spyOn(prisma.shoppingTicket, 'create').mockResolvedValue({ id: '1', ...mockReq.body });

    await createShopping(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ valor: 500.50 })
    }));
  });
});
