<template>
  <!-- Componente lógico, não renderiza HTML direto -->
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import { toast } from 'vue3-toastify';
import { useRouter } from 'vue-router';

const router = useRouter();
let socket = null;

onMounted(() => {
  // Conexão com o backend
  socket = io('http://localhost:3000'); 

  socket.on('adminLog', (log) => {
    // Notificação sem emojis, usando apenas texto e estilo do sistema
    toast.info(`NOTIFICAÇÃO DE SISTEMA: ${log.action}`, {
      description: `Usuário: ${log.userName} realizou uma alteração técnica.`,
      position: 'top-right',
      closeOnClick: true,
      pauseOnHover: true,
      // Ao clicar na notificação, leva para a página de logs
      onClick: () => {
        router.push('/admin/logs');
      }
    });
  });
});

onUnmounted(() => {
  if (socket) socket.disconnect();
});
</script>