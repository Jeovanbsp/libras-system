import axios from 'axios';

// Detecta automaticamente se o site está rodando em produção (Vercel) ou local
const isProduction = import.meta.env.PROD;

const api = axios.create({
  // Se for produção, usa a URL do seu backend na Vercel. 
  // Se for local, usa o localhost:3000.
  baseURL: isProduction 
    ? 'https://librasalvador-api.vercel.app/api' // <-- COLOQUE A URL DO SEU BACKEND AQUI
    : 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;