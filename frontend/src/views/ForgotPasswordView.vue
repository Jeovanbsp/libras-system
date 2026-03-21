<template>
  <div class="auth-wrapper">
    <div class="glass-card auth-box">
      
      <div class="logo-container">
        <img src="@/assets/logo.png" alt="Libras System" class="login-logo" />
      </div>

      <div class="title-box">
        <KeyRound :size="24" class="text-brand" />
        <h1>Recuperar <span>Senha</span></h1>
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
          <Send v-if="!enviado && !loading" :size="18" />
          {{ loading ? 'Processando...' : enviado ? 'E-mail Enviado!' : 'Enviar Link' }}
        </button>

        <router-link to="/aluno/login" class="btn-back">
          <ArrowLeft :size="16" /> Voltar para o Login
        </router-link>
      </form>

      <div v-if="message" class="alert success">
        <CheckCircle2 :size="18" /> {{ message }}
      </div>
      <div v-if="error" class="alert error">
        <AlertCircle :size="18" /> {{ error }}
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { KeyRound, Send, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-vue-next';
import api from '../services/api'; // Importa a conexão com o backend

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
    error.value = err.response?.data?.message || err.response?.data?.error || "Erro ao solicitar recuperação.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-wrapper { height: 100vh; display: flex; align-items: center; justify-content: center; background: #f1f5f9; }
.auth-box { width: 420px; text-align: center; padding: 40px; background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }

.logo-container { margin-bottom: 25px; }
.login-logo { max-width: 250px; height: auto; }

.title-box { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px; }
.text-brand { color: #004aad; }
.title-box h1 { font-size: 1.5rem; color: #1e293b; font-weight: 800; margin: 0; }
.title-box span { color: #004aad; }

.subtitle { color: #64748b; font-size: 0.95rem; margin-bottom: 30px; }

.modern-form { text-align: left; }
.modern-form label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; margin-bottom: 8px; text-transform: uppercase; }
.modern-form input { 
  width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; 
  background: #f8fafc; margin-bottom: 20px; transition: 0.2s; box-sizing: border-box;
}
.modern-form input:focus { outline: none; border-color: #004aad; box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1); background: white; }

.btn-primary { 
  width: 100%; background: #004aad; color: white; border: none; padding: 16px; 
  border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s;
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.btn-primary:hover:not(:disabled) { background: #003a8c; transform: translateY(-2px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-back { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 25px; color: #64748b; text-decoration: none; font-size: 0.85rem; font-weight: 700; transition: 0.2s; }
.btn-back:hover { color: #004aad; }

.alert { padding: 15px; border-radius: 12px; margin-top: 25px; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; }
.success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
</style>