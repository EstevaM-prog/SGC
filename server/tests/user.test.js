import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { createUser, loginUser } from '../src/controllers/user.controller.js';
import prisma from '../src/db.js';
import * as mailer from '../src/utils/mailer.js';

// Simulamos o envio de e-mail para não falhar nos testes
jest.spyOn(mailer, 'sendVerificationEmail').mockResolvedValue(true);
jest.spyOn(mailer, 'generateSecurityCode').mockReturnValue('123456');

describe('Controller: Usuários (Auth)', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: { 
        name: 'Test', 
        email: 'user@test.com', 
        password: 'password123', 
        confirmPassword: 'password123' 
      }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.restoreAllMocks();
  });

  test('Deve criar um usuário com senha criptografada', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
    const createSpy = jest.spyOn(prisma.user, 'create').mockImplementation(({ data }) => {
      expect(data.password).toMatch(/^\$2[bcde]\$10\$.*/);
      return { ...data, id: 'u1' };
    });
    // Mock do token
    jest.spyOn(prisma.token, 'create').mockResolvedValue({});

    await createUser(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(createSpy).toHaveBeenCalled();
  });

  test('Deve realizar login e retornar um token JWT', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      id: 'u1', name: 'Test', email: 'user@test.com', password: hashedPassword, isVerified: true
    });

    await loginUser(mockReq, mockRes);

    expect(mockRes.status).not.toHaveBeenCalledWith(401);
    const response = mockRes.json.mock.calls[0][0];
    expect(response.token).toBeDefined();
  });
});
