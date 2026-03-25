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
      console.error('Erro ao buscar compras:', err);
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
        toast.success('Compra salva!');
      }
    } catch (err) {
      toast.error('Erro ao salvar compra.');
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
      await api.delete(`/shopping/${id}`);
      setTickets(prev => prev.filter(t => t.id !== id));
      toast.success('Compra enviada para lixeira');
    } catch (err) {
      toast.error('Erro ao remover compra.');
    }
  };

  const restoreTicket = async (id) => {
    try {
      await api.post(`/shopping/${id}/restore`);
      setTickets(prev => prev.map(t => t.id === id ? { ...t, deleted: false } : t));
      toast.success('Compra restaurada!');
    } catch (err) {
      toast.error('Erro ao restaurar compra.');
    }
  };

  const permanentDeleteTicket = async (id) => {
    try {
      await api.delete(`/shopping/${id}/permanent`);
      setTickets(prev => prev.filter(t => t.id !== id));
      toast.success('Compra excluída para sempre!');
    } catch (err) {
      toast.error('Erro ao excluir compra.');
    }
  };

  return { 
    tickets, 
    loading, 
    fetchTickets, 
    addTicket, 
    updateTicket, 
    softDeleteTicket,
    restoreTicket,
    permanentDeleteTicket
  };
}
