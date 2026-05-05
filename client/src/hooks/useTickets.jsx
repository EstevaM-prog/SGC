import { useState, useEffect } from 'react';
import api from '../Axios/conect.js';
import toast from 'react-hot-toast';

export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    const session = localStorage.getItem('session_v1');
    if (!session) return;

    setLoading(true);
    try {
      const resp = await api.get('/tickets');
      if (resp.status === 200) {
        // Suporte para resposta estruturada { items: [] } ou array direto
        const data = resp.data.items || resp.data;
        setTickets(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Erro ao buscar tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('session_v1')) {
      fetchTickets();
    }
  }, []);

  const addTicket = async (data) => {
    try {
      const resp = await api.post('/tickets', data);
      if (resp.status === 201) {
        // O interceptor já mostra o toast.success(message)
        const newTicket = resp.data.data || resp.data;
        setTickets(prev => [newTicket, ...prev]);
      }
    } catch (err) {
      // O interceptor já mostra o toast.error
    }
  };

  const updateTicket = async (id, updatedData) => {
    if (!id) {
      console.error('Tentativa de atualização sem ID válido');
      return;
    }
    try {
      const resp = await api.put(`/tickets/${id}`, updatedData);
      if (resp.status === 200) {
        // Extrai o dado da resposta padronizada { data: {...}, message: "..." }
        const updated = resp.data.data || resp.data;
        
        setTickets(prev => prev.map(t => {
          if (t.id === id) {
            // Mantemos os campos antigos e sobrepomos apenas o que veio da API
            // Isso evita que o chamado "suma" se a API retornar um objeto parcial
            return { ...t, ...updated };
          }
          return t;
        }));
      }
    } catch (err) {
      console.error('Erro ao atualizar ticket:', err);
    }
  };

  const softDeleteTicket = async (id) => {
    if (!id) return;
    try {
      await api.delete(`/tickets/${id}`);
      setTickets(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      // Erro tratado no interceptor
    }
  };

  const restoreTicket = async (id) => {
    if (!id) return;
    try {
      const resp = await api.post(`/tickets/${id}/restore`);
      if (resp.status === 200) {
        const restored = resp.data.data || resp.data;
        setTickets(prev => prev.map(t => t.id === id ? restored : t));
      }
    } catch (err) {
      // Erro tratado no interceptor
    }
  };

  const permanentDeleteTicket = async (id) => {
    if (!id) return;
    try {
      await api.delete(`/tickets/${id}/permanent`);
      setTickets(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      // Erro tratado no interceptor
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
