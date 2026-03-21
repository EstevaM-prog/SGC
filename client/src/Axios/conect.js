import axios from 'axios';

// Criando uma instância para não repetir a URL em todo lugar
const api = axios.create({
  // Tenta usar a variável de ambiente do Vite, senão usa o localhost
  baseURL: import.meta.env.VITE_API_URL || 'https://sgc-03ln.onrender.com/api'
});

export const buscarDados = async () => {
  try {
    const response = await api.get('/users'); // Rota definida no Express
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    throw error;
  }
};

export default api;