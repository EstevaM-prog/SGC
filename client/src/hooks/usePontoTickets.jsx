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
      console.error('Erro ao buscar ponto:', err);
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
        toast.success('Ponto registrado!');
      }
    } catch (err) {
      toast.error('Erro ao registrar ponto.');
    }
  };

  const updateTicket = async (id, updatedData) => {
    try {
      const resp = await api.put(`/ponto/${id}`, updatedData);
      if (resp.status === 200) {
        setTickets(prev => prev.map(t => t.id === id ? resp.data : t));
        toast.success('Ponto atualizado!');
      }
    } catch (err) {
      toast.error('Erro ao atualizar registro.');
    }
  };

  const softDeleteTicket = async (id) => {
    try {
      await api.delete(`/ponto/${id}`);
      setTickets(prev => prev.filter(t => t.id !== id));
      toast.success('Movido para lixeira');
    } catch (err) {
      toast.error('Erro ao remover registro.');
    }
  };

  // Funções de Lixeira para evitar Undefined Crash
  const restoreTicket = async (id) => {
    try {
      await api.post(`/ponto/${id}/restore`);
      setTickets(prev => prev.map(t => t.id === id ? { ...t, deleted: false } : t));
      toast.success('Registro restaurado!');
    } catch (err) {
      toast.error('Erro ao restaurar.');
    }
  };

  const permanentDeleteTicket = async (id) => {
    try {
      await api.delete(`/ponto/${id}/permanent`);
      setTickets(prev => prev.filter(t => t.id !== id));
      toast.success('Excluído permanentemente!');
    } catch (err) {
      toast.error('Erro ao excluir.');
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
