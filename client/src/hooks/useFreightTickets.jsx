import { useState, useEffect } from 'react';
import api from '../Axios/conect.js';
import toast from 'react-hot-toast';

export function useFreightTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/freights');
      if (resp.status === 200) {
        setTickets(resp.data);
      }
    } catch (err) {
      console.error('Erro ao buscar fretes da API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const addTicket = async (data) => {
    try {
      const resp = await api.post('/freights', data);
      if (resp.status === 201) {
        setTickets(prev => [resp.data, ...prev]);
        toast.success('Frete salvo na API!');
      }
    } catch (err) {
      toast.error('Erro ao salvar frete no servidor.');
    }
  };

  const updateTicket = async (id, updatedData) => {
    try {
      const resp = await api.put(`/freights/${id}`, updatedData);
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
      const resp = await api.delete(`/freights/${id}`);
      if (resp.status === 200) {
        setTickets(prev => prev.filter(t => t.id !== id));
        toast.success('Frete removido (DB)');
      }
    } catch (err) {
      toast.error('Erro ao deletar no banco de dados.');
    }
  };

  return { tickets, loading, fetchTickets, addTicket, updateTicket, softDeleteTicket };
}
