import axios from 'axios';

const isProduction = import.meta.env.PROD;

const api = axios.create({
  // Atualizado para apontar para o Render em produção
  baseURL: isProduction 
    ? 'https://libras-system.onrender.com/api' 
    : 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;