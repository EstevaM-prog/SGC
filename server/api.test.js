import request from 'supertest';
import { app, server } from './index.js';

describe('API Health Check', () => {
  afterAll(() => {
    server.close();
  });

  it('deve retornar status 200 e mensagem de ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
