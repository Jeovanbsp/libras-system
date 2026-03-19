<template>
  <div class="login-wrapper">
    <div class="glass-card login-box">
      
      <div class="logo-container">
        <img src="@/assets/logo.png" alt="Libras System Logo" class="login-logo" />
      </div>

      <p class="brand-phrase">Uma paixão pela Libras e pela Bahia</p>
      
      <p class="subtitle">Bem-vindo(a)! Faça login para acessar sua conta.</p>

      <form @submit.prevent="handleLogin" class="modern-form">
        <div class="input-group">
          <label>E-mail de Acesso</label>
          <input v-model="email" type="email" placeholder="Digite o seu e-mail" required />
        </div>
        
        <div class="input-group">
          <label>Senha</label>
          <input v-model="password" type="password" placeholder="Digite a sua senha" required />
        </div>

        <div class="options-row">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe" />
            <span>Lembrar de mim</span>
          </label>
          <router-link to="/forgot-password" class="forgot-link">Esqueceu sua senha?</router-link>
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Autenticando...' : 'Acessar a Plataforma' }}
        </button>
      </form>

      <div v-if="error" class="error-msg">
        ⚠️ {{ error }}
      </div>

      <div class="divider"></div>

      <div class="social-footer">
        <a href="https://www.instagram.com/libras_salvador/" target="_blank" class="social-link" title="Instagram">
          <Instagram :size="24" />
        </a>
        <a href="https://www.linkedin.com/in/libras-salvador/" target="_blank" class="social-link" title="Linkedin">
          <Linkedin :size="24" />
        </a>
        <a href="https://wa.me/5571988361371" target="_blank" class="social-link whatsapp" title="WhatsApp">
          <MessageCircle :size="24" />
        </a>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Instagram, Linkedin, MessageCircle } from 'lucide-vue-next';
import api from '../services/api';

const router = useRouter();
const email = ref('');
const password = ref('');
const rememberMe = ref(false); // Estado do checkbox
const error = ref(null);
const loading = ref(false);

// Ao carregar a página, verifica se existem dados salvos
onMounted(() => {
  const savedEmail = localStorage.getItem('rememberedEmail');
  const savedPassword = localStorage.getItem('rememberedPassword');
  
  if (savedEmail) {
    email.value = savedEmail;
    rememberMe.value = true;
  }
  if (savedPassword) {
    password.value = savedPassword;
  }
});

const handleLogin = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    });

    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userName', user.nome);

    // Lógica para memorizar ou esquecer os dados
    if (rememberMe.value) {
      localStorage.setItem('rememberedEmail', email.value);
      localStorage.setItem('rememberedPassword', password.value); // Memoriza a senha também
    } else {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
    }

    if (user.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/aluno/dashboard');
    }
  } catch (err) {
    error.value = err.response?.data?.msg || "E-mail ou senha incorretos.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-wrapper { display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f1f5f9; font-family: 'Inter', sans-serif; }
.glass-card { background: white; padding: 40px; border-radius: 28px; border: 1px solid #e2e8f0; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08); width: 100%; max-width: 460px; text-align: center; }

.logo-container { margin-bottom: 20px; display: flex; justify-content: center; }
.login-logo { max-width: 380px; width: 100%; height: auto; object-fit: contain; }

.brand-phrase { color: #004aad; font-size: 1.1rem; font-weight: 600; font-style: italic; margin-bottom: 25px; }
.subtitle { color: #64748b; font-size: 0.9rem; margin-bottom: 25px; }

.modern-form { display: flex; flex-direction: column; gap: 15px; text-align: left; }
.input-group { display: flex; flex-direction: column; gap: 8px; }
.modern-form label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
.modern-form input[type="email"], 
.modern-form input[type="password"] { 
  width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; 
  background: #f8fafc; font-size: 1rem; color: #1e293b; box-sizing: border-box; 
}

/* Row com checkbox e link */
.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -5px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  text-transform: none !important; /* Tira o uppercase do label padrão */
  color: #64748b !important;
  font-size: 0.85rem !important;
  font-weight: 500 !important;
}

.remember-me input {
  width: 16px;
  height: 16px;
  accent-color: #004aad;
  cursor: pointer;
}

.forgot-link { font-size: 0.8rem; color: #004aad; font-weight: 700; text-decoration: none; }
.forgot-link:hover { text-decoration: underline; }

.btn-primary { width: 100%; background: #004aad; color: white; border: none; padding: 16px; border-radius: 14px; margin-top: 10px; font-weight: 800; font-size: 1.05rem; cursor: pointer; transition: all 0.3s; }
.btn-primary:hover:not(:disabled) { background: #003a8c; transform: translateY(-2px); }

.divider { height: 1px; background: #e2e8f0; margin: 30px 0 20px; }
.social-footer { display: flex; justify-content: center; gap: 25px; }
.social-link { color: #94a3b8; transition: all 0.3s ease; }
.social-link:hover { color: #004aad; transform: translateY(-4px); }
.social-link.whatsapp:hover { color: #25d366; }

.error-msg { color: #dc2626; background: #fef2f2; padding: 14px; border-radius: 12px; margin-top: 20px; font-size: 0.9rem; font-weight: 700; border: 1px solid #fecaca; }
</style>