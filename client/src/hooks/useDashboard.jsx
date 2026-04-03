import { useState, useEffect } from 'react';
import api from '../Axios/conect.js';

export function useDashboard(period = 'Year') {
  const [data, setData] = useState({
    total: 0,
    somaGastos: 0,
    open: 0,
    solved: 0,
    escriturar: 0,
    processando: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    const session = localStorage.getItem('session_v1');
    if (!session) return;

    setLoading(true);
    try {
      const resp = await api.get(`/dashboard/summary?period=${period}`);
      if (resp.status === 200) {
        setData(resp.data);
      }
    } catch (err) {
      console.error('Erro ao buscar dashboard analítico:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [period]);

  return { data, loading, fetchSummary };
}
