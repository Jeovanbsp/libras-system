<template>
  <div class="login-wrapper">
    <div class="glass-card login-box">
      <div class="logo-box">
        <span class="logo-icon">🔐</span>
        <h1>Nova<span>Senha</span></h1>
      </div>
      
      <p class="subtitle">Digite sua nova senha abaixo.</p>

      <form @submit.prevent="handleReset" class="modern-form">
        <div class="input-group">
          <label>Nova Senha</label>
          <input v-model="password" type="password" placeholder="Mínimo 6 caracteres" required />
        </div>
        
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Salvando...' : 'Redefinir Senha' }}
        </button>
      </form>

      <div v-if="message" class="success-msg">✅ {{ message }}</div>
      <div v-if="error" class="error-msg">⚠️ {{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const router = useRouter();
const password = ref('');
const loading = ref(false);
const message = ref('');
const error = ref('');

const handleReset = async () => {
  loading.ref = true;
  try {
    await api.post(`/auth/reset-password/${route.params.token}`, { password: password.value });
    message.value = "Senha alterada! Redirecionando...";
    setTimeout(() => router.push('/aluno/login'), 3000);
  } catch (err) {
    error.value = "Link inválido ou expirado.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Aproveita os mesmos estilos que você já tem no LoginView.vue */
.success-msg { color: #059669; background: #ecfdf5; padding: 14px; border-radius: 12px; margin-top: 20px; font-weight: 700; border: 1px solid #a7f3d0; }
</style>