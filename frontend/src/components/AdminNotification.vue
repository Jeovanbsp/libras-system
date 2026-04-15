<template>
  <!-- Componente lógico, não renderiza HTML direto -->
  <div style="display: none;"></div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import { toast } from 'vue3-toastify';
import { useRouter } from 'vue-router';
import 'vue3-toastify/dist/index.css'; // GARANTE QUE O ESTILO DA NOTIFICAÇÃO APAREÇA

const router = useRouter();
let socket = null;

// Pega a URL do backend da variável de ambiente ou usa o localhost como padrão
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

onMounted(() => {
  // Conexão com o backend usando a URL dinâmica
  socket = io(API_URL); 

  socket.on('adminLog', (log) => {
    // Notificação formatada para o sistema
    toast.info(`NOTIFICAÇÃO DE SISTEMA: ${log.action}`, {
      // Concatenando a descrição para aparecer no corpo da notificação
      autoClose: 8000,
      position: 'top-right',
      closeOnClick: true,
      pauseOnHover: true,
      // Ao clicar na notificação, leva para a página de logs
      onClick: () => {
        router.push('/admin/logs');
      }
    });
    
    // Opcional: Log no console para debug
    console.log("Nova atividade detectada:", log);
  });
});

onUnmounted(() => {
  if (socket) socket.disconnect();
});
</script>