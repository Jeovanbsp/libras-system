<template>
  <div class="login-wrapper">
    <div class="glass-card login-box">
      
      <div class="logo-container">
        <img src="@/assets/logo.png" alt="Libras System Logo" class="login-logo" />
      </div>
      
      <div class="title-box">
        <ShieldCheck :size="24" class="title-icon" />
        <h1>Nova<span>Senha</span></h1>
      </div>
      
      <p class="subtitle">Digite sua nova senha abaixo para recuperar o acesso.</p>

      <form @submit.prevent="handleReset" class="modern-form">
        <div class="input-group">
          <label>Nova Senha</label>
          <input v-model="password" type="password" placeholder="Mínimo 6 caracteres" required />
        </div>
        
        <button type="submit" class="btn-primary" :disabled="loading">
          <Save :size="18" style="margin-right: 8px" />
          {{ loading ? 'Salvando...' : 'Redefinir Senha' }}
        </button>
      </form>

      <div v-if="message" class="success-msg">
        {{ message }}
      </div>
      <div v-if="error" class="error-msg">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ShieldCheck, Save } from 'lucide-vue-next'; // Ícones profissionais
import api from '../services/api';

const route = useRoute();
const router = useRouter();
const password = ref('');
const loading = ref(false);
const message = ref('');
const error = ref('');

const handleReset = async () => {
  loading.value = true; // Corrigido de .ref para .value
  error.value = '';
  try {
    await api.post(`/auth/reset-password/${route.params.token}`, { password: password.value });
    message.value = "Senha alterada com sucesso! Redirecionando...";
    setTimeout(() => router.push('/aluno/login'), 3000);
  } catch (err) {
    error.value = "Link inválido ou expirado. Por favor, solicite uma nova recuperação.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-wrapper { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  height: 100vh; 
  background-color: #f1f5f9; 
  font-family: 'Inter', sans-serif;
}

.glass-card { 
  background: white; 
  padding: 40px; 
  border-radius: 28px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08); 
  width: 100%;
  max-width: 450px;
  text-align: center;
}

.logo-container {
  margin-bottom: 25px;
}

.login-logo {
  max-width: 280px;
  height: auto;
  object-fit: contain;
}

.title-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.title-icon {
  color: #004aad;
}

.title-box h1 { font-size: 1.5rem; color: #1e293b; font-weight: 800; margin: 0; }
.title-box span { color: #004aad; }

.subtitle { color: #64748b; font-size: 0.95rem; margin-bottom: 30px; }

.modern-form { display: flex; flex-direction: column; gap: 15px; text-align: left; }
.input-group { display: flex; flex-direction: column; gap: 8px; }
.modern-form label { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; }

.modern-form input { 
  width: 100%; padding: 16px; border: 1px solid #e2e8f0; border-radius: 14px; 
  background: #f8fafc; font-size: 1rem; color: #1e293b; box-sizing: border-box; 
}
.modern-form input:focus { outline: none; border-color: #004aad; box-shadow: 0 0 0 4px rgba(0, 74, 173, 0.1); background: white; }

.btn-primary { 
  width: 100%; background: #004aad; color: white; border: none; padding: 16px; 
  border-radius: 14px; margin-top: 10px; font-weight: 800; font-size: 1.05rem; cursor: pointer; 
  transition: all 0.3s; display: flex; align-items: center; justify-content: center;
}
.btn-primary:hover:not(:disabled) { background: #003a8c; transform: translateY(-2px); }

.success-msg { color: #059669; background: #ecfdf5; padding: 14px; border-radius: 12px; margin-top: 20px; font-weight: 700; border: 1px solid #a7f3d0; }
.error-msg { color: #dc2626; background: #fef2f2; padding: 14px; border-radius: 12px; margin-top: 20px; font-size: 0.9rem; font-weight: 700; border: 1px solid #fecaca; }
</style>