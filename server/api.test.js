import { expect, describe, test } from '@jest/globals';
import request from 'supertest';
import { app } from './index.js';

describe('API Health Check', () => {
  test('deve retornar status 200 e mensagem de ok', async () => {
    // Definimos o NODE_ENV para test para que o index.js não tente iniciar o server
    process.env.NODE_ENV = 'test';
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });
});
