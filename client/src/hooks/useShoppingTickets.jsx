import { useState, useEffect } from 'react';
import api from '../Axios/conect.js';
import toast from 'react-hot-toast';

export function useShoppingTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/shopping');
      if (resp.status === 200) {
        setTickets(resp.data);
      }
    } catch (err) {
      console.error('Erro ao buscar compras da API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const addTicket = async (data) => {
    try {
      const resp = await api.post('/shopping', data);
      if (resp.status === 201) {
        setTickets(prev => [resp.data, ...prev]);
        toast.success('Compra salva na API!');
      }
    } catch (err) {
      toast.error('Erro ao salvar compra no servidor.');
    }
  };

  const updateTicket = async (id, updatedData) => {
    try {
      const resp = await api.put(`/shopping/${id}`, updatedData);
      if (resp.status === 200) {
        setTickets(prev => prev.map(t => t.id === id ? resp.data : t));
        toast.success('Compra atualizada!');
      }
    } catch (err) {
      toast.error('Erro ao atualizar compra.');
    }
  };

  const softDeleteTicket = async (id) => {
    try {
      const resp = await api.delete(`/shopping/${id}`);
      if (resp.status === 200) {
        setTickets(prev => prev.filter(t => t.id !== id));
        toast.success('Compra removida (API)');
      }
    } catch (err) {
      toast.error('Erro ao excluir no banco de dados.');
    }
  };

  return { tickets, loading, fetchTickets, addTicket, updateTicket, softDeleteTicket };
}
