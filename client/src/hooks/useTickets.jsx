import { useState, useEffect } from 'react';
import api from '../Axios/conect.js';
import toast from 'react-hot-toast';

export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Busca inicial da API
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/tickets');
      if (resp.status === 200) {
        setTickets(resp.data);
      }
    } catch (err) {
      console.error('Erro ao buscar tickets da API:', err);
      toast.error('Não foi possível carregar os chamados do servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const addTicket = async (data) => {
    try {
      const resp = await api.post('/tickets', data);
      if (resp.status === 201) {
        setTickets(prev => [resp.data, ...prev]);
        toast.success('Chamado salvo no banco de dados!');
      }
    } catch (err) {
      toast.error('Erro ao salvar chamado no servidor.');
    }
  };

  const updateTicket = async (id, updatedData) => {
    try {
      const resp = await api.put(`/tickets/${id}`, updatedData);
      if (resp.status === 200) {
        setTickets(prev => prev.map(t => t.id === id ? resp.data : t));
        toast.success('Alteração sincronizada!');
      }
    } catch (err) {
      toast.error('Erro ao atualizar no servidor.');
    }
  };

  const softDeleteTicket = async (id) => {
    try {
      const resp = await api.delete(`/tickets/${id}`);
      if (resp.status === 200) {
        setTickets(prev => prev.filter(t => t.id !== id));
        toast.success('Movido para a lixeira (DB)');
      }
    } catch (err) {
      toast.error('Erro ao deletar no banco de dados.');
    }
  };

  return { tickets, loading, fetchTickets, addTicket, updateTicket, softDeleteTicket };
}
