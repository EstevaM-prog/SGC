import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

// Interceptor de REQUISIÇÃO: Injeta Token e ID
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
    config.headers['X-Service-ID'] = import.meta.env.VITE_SERVICE_ID || 'srv-d6vcouc50q8c739im5vg';

  } catch (err) {
    console.error('Erro ao ler sessão do localStorage:', err);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de RESPOSTA: Trata erros globais (Ex: 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Sessão inválida. Redirecionando para o index...');
      localStorage.removeItem('session_v1');
      window.location.href = '/'; // Força a volta para a página inicial
    }
    return Promise.reject(error);
  }
);

export default api;