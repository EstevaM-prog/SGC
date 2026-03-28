import prisma from '../db.js';

export const checkHealth = async (req, res) => {
  const start = Date.now();

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'pending',
      server: 'up'
    },
    latency: 0
  };

  try {
    // Teste ultra-rápido de conexão com o Banco via instância global Prisma
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'up';

    // Se o usuário pedir explícitamente para checar as APIs no ar (?external=true),
    // pingamos as URLs do Render/Railway. Fica restrito ao `external=true` para
    // evitar que o servidor em Produção entre em "Loop Infinito" chamando a si mesmo!
    if (req.query.external === 'true') {
      health.external_apis = [];
      await Promise.all(apis.map(async (url) => {
        try {
          const fetchStart = Date.now();
          const response = await fetch(url);
          health.external_apis.push({
            name: url.split('//')[1].split('.')[0],
            url,
            status: response.ok ? 'up' : 'down',
            statusCode: response.status,
            latency: `${Date.now() - fetchStart}ms`
          });
        } catch (err) {
          health.external_apis.push({ name: url.split('//')[1].split('.')[0], url, status: 'offline' });
        }
      }));
    }

    // Calcula quanto tempo a API levou para responder internamente
    health.latency = `${Date.now() - start}ms`;

    return res.status(200).json(health);
  } catch (error) {
    health.status = 'error';
    health.services.database = 'down';
    health.error = error.message;
    health.latency = `${Date.now() - start}ms`;

    return res.status(503).json(health);
  }
};

// ============================================
// PINGER (Mantém o plano free do Render acordado)
// ============================================

const apis = [
  'https://sgc-03ln.onrender.com/api/health',
  'https://sgc-2-mvsv.onrender.com/api/health'
  // Adicione aqui as do Railway quando tiver as URLs
];

const wakeUp = async () => {
  // Evitar que o pinger rode nos testes locais do Jest/K6 (poluição e travamento)
  if (process.env.NODE_ENV === 'test') return;

  console.log(`--- [${new Date().toLocaleTimeString()}] Ping Anti-Sleep ---`);

  // Usando Promise.all para pingar todos ao mesmo tempo (mais rápido)
  await Promise.all(apis.map(async (url) => {
    try {
      const start = Date.now();
      const res = await fetch(url);
      const duration = Date.now() - start;

      if (res.ok) {
        console.log(`✅ OK: ${url.split('.')[0]} (${duration}ms)`);
      } else {
        console.log(`⚠️ ERRO ${res.status}: ${url}`);
      }
    } catch (error) {
      console.error(`❌ OFFLINE: ${url}`);
    }
  }));
};

if (process.env.NODE_ENV !== 'test') {
  // Damos 5 segundos antes do primeiro ping para garantir que o server local já subiu
  setTimeout(wakeUp, 60000);
  const TREZE_MINUTOS = 13 * 60 * 1000;
  setInterval(wakeUp, TREZE_MINUTOS);
}