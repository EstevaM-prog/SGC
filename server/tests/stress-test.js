import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // 1. Estágios: Simula a vida real (subida, pico e descida)
  stages: [
    { duration: '15s', target: 10 },  // Sobe para 10 usuários
    { duration: '30s', target: 10 },  // Mantém 10
    { duration: '15s', target: 30 },  // Sobe para 30
    { duration: '30s', target: 50 },  // Estresse: Max 50
    { duration: '15s', target: 0 },   // Recuperação
  ],

  // 2. Limiares (Thresholds): O teste falha automaticamente se a API ficar lenta
  thresholds: {
    http_req_failed: ['rate<0.50'],    // O teste para se mais de 50% das req falharem (ajuste conforme o limite)
    http_req_duration: ['p(95)<500'], // 95% das requisições devem responder em menos de 500ms
  },
};

export default function () {
  // Distribui os testes entre login e register dinamicamente
  const isLogin = Math.random() > 0.5;
  const url = isLogin
    ? 'http://localhost:3001/api/users/login'
    : 'http://localhost:3001/api/users';

  // Cria um email dinâmico no caso de registro para evitar que o k6 receba "400 Bad Request"
  // devido ao usuário já existir no banco de dados.
  const randomStr = Math.random().toString(36).substring(7);
  const email = isLogin ? 'estevam0x0@gmail.com' : `test_${randomStr}@gmail.com`;

  const payload = JSON.stringify({
    name: 'Stress Tester ' + randomStr,
    email,
    password: '123123',
    confirmPassword: '123123',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  // 3. Verificações detalhadas
  check(res, {
    'Status 200 (OK) ou 201 (Created)': (r) => r.status === 200 || r.status === 201,
    'Status 429 (Rate Limited)': (r) => r.status === 429,
    'Tempo de resposta < 200ms': (r) => r.timings.duration < 200,
  });

  // 4. "Think Time" dinâmico: 
  // Usuários reais não clicam exatamente a cada 0.1s. 
  // Um sleep entre 0.5s e 1.5s simula um humano navegando.
  sleep(Math.random() * 1 + 0.5);
}