import { useState, useEffect } from 'react';
import api from '../Axios/conect.js';
import toast from 'react-hot-toast';

export function usePontoTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/ponto');
      if (resp.status === 200) {
        setTickets(resp.data);
      }
    } catch (err) {
      console.error('Erro ao buscar batidas de ponto:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const addTicket = async (data) => {
    try {
      const resp = await api.post('/ponto', data);
      if (resp.status === 201) {
        setTickets(prev => [resp.data, ...prev]);
        toast.success('Ponto batido com sucesso (DB)!');
      }
    } catch (err) {
      toast.error('Erro ao registrar ponto no servidor.');
    }
  };

  const updateTicket = async (id, updatedData) => {
    try {
      const resp = await api.put(`/ponto/${id}`, updatedData);
      if (resp.status === 200) {
        setTickets(prev => prev.map(t => t.id === id ? resp.data : t));
        toast.success('Registro de ponto atualizado!');
      }
    } catch (err) {
      toast.error('Erro ao atualizar ponto.');
    }
  };

  const softDeleteTicket = async (id) => {
    try {
      const resp = await api.delete(`/ponto/${id}`);
      if (resp.status === 200) {
        setTickets(prev => prev.filter(t => t.id !== id));
        toast.success('Registro removido do banco.');
      }
    } catch (err) {
      toast.error('Erro ao deletar registro de ponto.');
    }
  };

  return { tickets, loading, fetchTickets, addTicket, updateTicket, softDeleteTicket };
}
