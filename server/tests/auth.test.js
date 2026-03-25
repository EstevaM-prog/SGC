import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { authenticate } from '../src/middlewares/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

describe('Middleware de Autenticação', () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  test('Deve retornar 401 se nenhum token for fornecido', () => {
    authenticate(mockReq, mockRes, nextFunction);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token não fornecido' });
  });

  test('Deve chamar next() se um token válido for fornecido', async () => {
    const token = jwt.sign({ userId: 'user-123' }, JWT_SECRET);
    mockReq.headers.authorization = `Bearer ${token}`;

    await authenticate(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockReq.userId).toBe('user-123');
  });

  test('Deve retornar 401 se o token for inválido', async () => {
    mockReq.headers.authorization = 'Bearer token-falso';

    await authenticate(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token inválido' });
  });
});
