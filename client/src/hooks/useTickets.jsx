import { useState, useEffect } from 'react';
import api from '../Axios/conect.js';
import toast from 'react-hot-toast';

export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/tickets');
      if (resp.status === 200) {
        setTickets(resp.data);
      }
    } catch (err) {
      console.error('Erro ao buscar tickets:', err);
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
        toast.success('Chamado salvo no banco!');
      }
    } catch (err) {
      toast.error('Erro ao salvar chamado.');
    }
  };

  const updateTicket = async (id, updatedData) => {
    try {
      const resp = await api.put(`/tickets/${id}`, updatedData);
      if (resp.status === 200) {
        setTickets(prev => prev.map(t => t.id === id ? resp.data : t));
        toast.success('Chamado atualizado!');
      }
    } catch (err) {
      toast.error('Erro ao atualizar chamado.');
    }
  };

  const softDeleteTicket = async (id) => {
    try {
      await api.delete(`/tickets/${id}`);
      setTickets(prev => prev.filter(t => t.id !== id));
      toast.success('Movido para a lixeira');
    } catch (err) {
      toast.error('Erro ao deletar chamado.');
    }
  };

  // Funções para a Lixeira (Trash)
  const restoreTicket = async (id) => {
    try {
      const resp = await api.post(`/tickets/${id}/restore`);
      if (resp.status === 200) {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, deleted: false } : t));
        toast.success('Chamado restaurado!');
      }
    } catch (err) {
      toast.error('Erro ao restaurar chamado.');
    }
  };

  const permanentDeleteTicket = async (id) => {
    try {
      await api.delete(`/tickets/${id}/permanent`);
      setTickets(prev => prev.filter(t => t.id !== id));
      toast.success('Excluído definitivamente!');
    } catch (err) {
      toast.error('Erro ao excluir definitivamente.');
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
