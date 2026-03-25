import axios from 'axios';

const api = axios.create({
  // Aqui deve ser a URL do seu servidor, não o ID do serviço
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

// Interceptor para injetar o Token JWT e o Service ID automaticamente
api.interceptors.request.use((config) => {
  try {
    const sessionStr = localStorage.getItem('session_v1');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    }

    // O Service ID enviado nos Headers (Correto!)
    config.headers['X-Service-ID'] = import.meta.env.VITE_SERVICE_ID || 'srv-d6vcouc50q8c739im5vg';

  } catch (err) {
    console.error('Erro ao ler sessão do localStorage:', err);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;