<template>
  <div class="auth-wrapper">
    <div class="glass-card auth-box">
      <div class="logo-box">
        <span class="logo-icon">🔐</span>
        <h1>Nova<span>Senha</span></h1>
      </div>
      
      <p class="subtitle">Digite e confirme sua nova senha de acesso.</p>

      <form @submit.prevent="handleReset" class="modern-form">
        <div class="form-group">
          <label>Nova Senha</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="Mínimo 6 caracteres" 
            required 
          />
        </div>

        <div class="form-group">
          <label>Confirmar Senha</label>
          <input 
            v-model="confirmPassword" 
            type="password" 
            placeholder="Repita a nova senha" 
            required 
          />
        </div>
        
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Salvando...' : 'Redefinir Senha' }}
        </button>

        <router-link to="/aluno/login" class="btn-back">
          Cancelar e voltar
        </router-link>
      </form>

      <div v-if="message" class="alert success">{{ message }}</div>
      <div v-if="error" class="alert error">{{ error }}</div>
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
const confirmPassword = ref('');
const loading = ref(false);
const message = ref('');
const error = ref('');

const handleReset = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = "As senhas não coincidem.";
    return;
  }

  loading.value = true;
  error.value = '';
  
  try {
    const token = route.params.token;
    const res = await api.post(`/auth/reset-password/${token}`, { password: password.value });
    message.value = res.data.message;
    
    // Redireciona para o login após 3 segundos
    setTimeout(() => {
      router.push('/aluno/login');
    }, 3000);
  } catch (err) {
    error.value = err.response?.data?.message || "O link expirou ou é inválido.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Estilos seguindo o padrão que usamos no ForgotPassword */
.auth-wrapper { height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; }
.auth-box { width: 400px; text-align: center; }
.logo-box { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px; }
.logo-icon { font-size: 1.8rem; background: #eff6ff; padding: 10px; border-radius: 12px; }
.logo-box h1 { font-size: 1.5rem; color: #1e293b; font-weight: 800; }
.logo-box span { color: #1e40af; }
.subtitle { color: #64748b; font-size: 0.9rem; margin-bottom: 25px; }
.modern-form { text-align: left; }
.modern-form label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; margin-bottom: 8px; text-transform: uppercase; }
.modern-form input { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; margin-bottom: 15px; }
.btn-primary { width: 100%; background: #1e40af; color: white; border: none; padding: 16px; border-radius: 12px; font-weight: 800; cursor: pointer; }
.btn-back { display: block; text-align: center; margin-top: 20px; color: #64748b; text-decoration: none; font-size: 0.85rem; }
.alert { padding: 15px; border-radius: 10px; margin-top: 20px; font-size: 0.85rem; font-weight: 700; text-align: center; }
.success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
</style>