<template>
  <div class="auth-wrapper">
    <div class="glass-card auth-box">
      <div class="logo-box">
        <span class="logo-icon">🔑</span>
        <h1>Recuperar<span>Senha</span></h1>
      </div>
      
      <p class="subtitle">Insira o seu e-mail para receber o link de redefinição.</p>

      <form @submit.prevent="handleForgot" class="modern-form">
        <div class="form-group">
          <label>E-mail Cadastrado</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="seu-email@exemplo.com" 
            required 
            :disabled="enviado"
          />
        </div>
        
        <button type="submit" class="btn-primary" :disabled="loading || enviado">
          {{ loading ? 'Processando...' : enviado ? 'E-mail Enviado!' : 'Enviar Link' }}
        </button>

        <router-link to="/aluno/login" class="btn-back">
          ← Voltar para o Login
        </router-link>
      </form>

      <div v-if="message" class="alert success">{{ message }}</div>
      <div v-if="error" class="alert error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api';

const email = ref('');
const loading = ref(false);
const enviado = ref(false);
const message = ref('');
const error = ref('');

const handleForgot = async () => {
  loading.value = true;
  error.value = '';
  message.value = '';

  try {
    const res = await api.post('/auth/forgot-password', { email: email.value });
    message.value = res.data.message;
    enviado.value = true;
  } catch (err) {
    error.value = err.response?.data?.message || "Erro ao solicitar recuperação.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-wrapper {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.auth-box { width: 400px; text-align: center; }

.logo-box { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 20px; }
.logo-icon { font-size: 1.8rem; background: #eff6ff; padding: 10px; border-radius: 12px; }
.logo-box h1 { font-size: 1.5rem; color: #1e293b; font-weight: 800; }
.logo-box span { color: #1e40af; }

.subtitle { color: #64748b; font-size: 0.9rem; margin-bottom: 25px; }

.modern-form { text-align: left; }
.modern-form label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; margin-bottom: 8px; text-transform: uppercase; }
.modern-form input { 
  width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; 
  background: #f8fafc; margin-bottom: 20px; transition: 0.2s;
}
.modern-form input:focus { outline: none; border-color: #1e40af; box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1); }

.btn-primary { 
  width: 100%; background: #1e40af; color: white; border: none; padding: 16px; 
  border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-back { display: block; text-align: center; margin-top: 20px; color: #64748b; text-decoration: none; font-size: 0.85rem; font-weight: 600; transition: 0.2s; }
.btn-back:hover { color: #1e40af; }

.alert { padding: 15px; border-radius: 10px; margin-top: 20px; font-size: 0.85rem; font-weight: 700; text-align: center; }
.success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
</style>