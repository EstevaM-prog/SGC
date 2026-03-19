import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ponto_db_v1';

const initializer = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler fretes localStorage', e);
  }
  return [];
};

