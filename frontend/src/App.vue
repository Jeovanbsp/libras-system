<template>
  <div id="app">
    <!-- Componente de escuta das notificações ativado apenas para ADMIN -->
    <AdminNotification v-if="isFullAdmin" />
    
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import AdminNotification from './components/AdminNotification.vue';

// Verifica se o usuário logado é o Administrador Principal
const isFullAdmin = computed(() => {
  const role = localStorage.getItem('userRole');
  return role === 'admin';
});
</script>

<style>
/* Seus estilos globais */
body { 
  margin: 0; 
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
  background: #f0f2f5; 
  color: #333;
}

/* Estilização para garantir que o toast não fique escondido */
.Toastify__toast-container {
  z-index: 9999;
}
</style>