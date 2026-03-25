import axios from 'axios';

// Criando uma instância para não repetir a URL em todo lugar 
const api = axios.create({
  // Tenta usar a variável de ambiente do Vite, senão usa o localhost
  baseURL: import.meta.env.VITE_API_URL || 'https://sgc-03ln.onrender.com/api'
});

// Interceptor para adicionar o token de autenticação automaticamente
api.interceptors.request.use((config) => {
  const session = JSON.parse(localStorage.getItem('session_v1') || 'null');
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const buscarDados = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    throw error;
  }
};

export default api;