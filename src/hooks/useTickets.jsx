import { useState, useEffect } from 'react';

const STORAGE_KEY = 'chamados_db_v1';

const initializer = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler localStorage', e);
  }
  return [];
};

export function useTickets() {
  const [tickets, setTickets] = useState(initializer);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }, [tickets]);

  const addTicket = (ticketData) => {
    const newTicket = {
      ...ticketData,
      id: ticketData.id || 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
      deleted: false,
      deletedAt: null,
      updatedAt: new Date().toISOString()
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const updateTicket = (id, updatedData) => {
    setTickets(prev => prev.map(t => 
      t.id === id ? { ...t, ...updatedData, updatedAt: new Date().toISOString() } : t
    ));
  };

  const softDeleteTicket = (id) => {
    setTickets(prev => prev.map(t => 
      t.id === id ? { ...t, deleted: true, deletedAt: new Date().toISOString() } : t
    ));
  };

  const restoreTicket = (id) => {
    setTickets(prev => prev.map(t => 
      t.id === id ? { ...t, deleted: false, deletedAt: null } : t
    ));
  };

  const permanentDeleteTicket = (id) => {
    setTickets(prev => prev.filter(t => t.id !== id));
  };

  return {
    tickets,
    addTicket,
    updateTicket,
    softDeleteTicket,
    restoreTicket,
    permanentDeleteTicket
  };
}
