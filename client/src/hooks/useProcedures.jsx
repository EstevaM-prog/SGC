import { useState, useEffect } from 'react';
import api from '../Axios/conect.js';
import toast from 'react-hot-toast';

export function useProcedures() {
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProcedures = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/procedures');
      if (resp.status === 200) {
        setProcedures(resp.data);
      }
    } catch (err) {
      console.error('Erro ao buscar procedimentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcedures();
  }, []);

  const addProcedure = async (data) => {
    try {
      const resp = await api.post('/procedures', data);
      if (resp.status === 201) {
        setProcedures(prev => [resp.data, ...prev]);
        toast.success('Procedimento criado no banco!');
        return resp.data;
      }
    } catch (err) {
      toast.error('Erro ao criar procedimento na API.');
    }
  };

  const updateProcedure = async (id, updatedData) => {
    try {
      const resp = await api.put(`/procedures/${id}`, updatedData);
      if (resp.status === 200) {
        setProcedures(prev => prev.map(p => p.id === id ? resp.data : p));
        toast.success('Procedimento atualizado!');
      }
    } catch (err) {
      toast.error('Erro ao editar procedimento.');
    }
  };

  const deleteProcedure = async (id) => {
    try {
      const resp = await api.delete(`/procedures/${id}`);
      if (resp.status === 200) {
        setProcedures(prev => prev.filter(p => p.id !== id));
        toast.success('Procedimento excluído (DB)');
      }
    } catch (err) {
      toast.error('Erro ao excluir no banco.');
    }
  };

  return { procedures, loading, fetchProcedures, addProcedure, updateProcedure, deleteProcedure };
}
