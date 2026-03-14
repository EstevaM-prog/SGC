import { useState, useEffect } from 'react';

const STORAGE_KEY = 'procedimentos_db_v1';

const initializer = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler procedimentos localStorage', e);
  }
  return [];
};

export function useProcedures() {
  const [procedures, setProcedures] = useState(initializer);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(procedures));
    } catch (e) {
      console.error('Erro ao salvar procedimentos:', e);
    }
  }, [procedures]);

  const addProcedure = (data) => {
    const newItem = {
      ...data,
      id: 'proc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProcedures(prev => [newItem, ...prev]);
  };

  const updateProcedure = (id, updatedData) => {
    setProcedures(prev => prev.map(p => p.id === id ? { ...p, ...updatedData, updatedAt: new Date().toISOString() } : p));
  };

  const deleteProcedure = (id) => {
    setProcedures(prev => prev.filter(p => p.id !== id));
  };

  return { procedures, addProcedure, updateProcedure, deleteProcedure };
}
