import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

// Interceptor para injetar o Token JWT automaticamente
api.interceptors.request.use((config) => {
  try {
    const sessionStr = localStorage.getItem('session_v1');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    }
    
    // Insira seu Service ID aqui (vindo do .env ou fixo se necessário)
    config.headers['X-Service-ID'] = import.meta.env.VITE_SERVICE_ID || 'SEU_ID_AQUI';

  } catch (err) {
    console.error('Erro ao ler sessão do localStorage:', err);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;