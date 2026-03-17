<template>
  <div class="login-wrapper">
    <div class="glass-card login-box">
      
      <div class="logo-box">
        <span class="logo-icon">🤟</span>
        <h1>Libras<span>System</span></h1>
      </div>
      
      <p class="subtitle">Bem-vindo(a)! Faça login para acessar sua conta.</p>

      <form @submit.prevent="handleLogin" class="modern-form">
        <div class="input-group">
          <label>E-mail de Acesso</label>
          <input v-model="email" type="email" placeholder="Digite seu e-mail" required />
        </div>
        
        <div class="input-group">
          <label>Senha</label>
          <input v-model="password" type="password" placeholder="Digite sua senha" required />
        </div>

        <div class="forgot-link-container">
          <router-link to="/forgot-password" class="forgot-link">Esqueceu sua senha?</router-link>
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Autenticando...' : 'Acessar Plataforma' }}
        </button>
      </form>

      <div v-if="error" class="error-msg">
        ⚠️ {{ error }}
      </div>
      
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  data() {
    return { email: '', password: '', error: null, loading: false };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/login', {
          email: this.email,
          password: this.password
        });

        // Ajustado para bater com a estrutura do seu authController: { token, user: { role } }
        const { token, user } = response.data;
        const role = user.role;

        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userName', user.nome);

        if (role === 'admin') {
          this.$router.push('/admin/dashboard');
        } else {
          this.$router.push('/aluno/dashboard');
        }
      } catch (err) {
        this.error = err.response?.data?.msg || "E-mail ou senha incorretos.";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
/* FUNDO DA TELA DE LOGIN */
.login-wrapper { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  height: 100vh; 
  background-color: #f8fafc; 
  font-family: 'Inter', sans-serif;
}

.glass-card { 
  background: white; 
  padding: 50px 40px; 
  border-radius: 28px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 20px 40px rgba(30, 64, 175, 0.08); 
  width: 100%;
  max-width: 420px;
  text-align: center;
}

.logo-box { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 10px; }
.logo-icon { font-size: 2rem; background: #eff6ff; color: #1e40af; padding: 12px; border-radius: 16px; line-height: 1; }
.logo-box h1 { font-size: 1.8rem; color: #1e293b; font-weight: 800; margin: 0; }
.logo-box span { color: #1e40af; }

.subtitle { color: #64748b; font-size: 0.95rem; margin-bottom: 30px; }

.modern-form { display: flex; flex-direction: column; gap: 15px; text-align: left; }
.input-group { display: flex; flex-direction: column; gap: 8px; }
.modern-form label { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.modern-form input { 
  width: 100%; padding: 16px; border: 1px solid #e2e8f0; border-radius: 14px; 
  background: #f8fafc; font-size: 1rem; color: #1e293b; font-weight: 500; box-sizing: border-box; 
}
.modern-form input:focus { outline: none; border-color: #1e40af; box-shadow: 0 0 0 4px rgba(30, 64, 175, 0.15); background: white; }

/* ESQUECEU SENHA */
.forgot-link-container { text-align: right; margin-bottom: 5px; }
.forgot-link { font-size: 0.8rem; color: #1e40af; font-weight: 700; text-decoration: none; }
.forgot-link:hover { text-decoration: underline; }

.btn-primary { 
  width: 100%; background: #1e40af; color: white; border: none; padding: 16px; 
  border-radius: 14px; margin-top: 10px; font-weight: 800; font-size: 1.05rem; cursor: pointer; transition: all 0.3s; 
}
.btn-primary:hover:not(:disabled) { background: #1e3a8a; transform: translateY(-2px); box-shadow: 0 10px 25px rgba(30, 64, 175, 0.3); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

.error-msg { color: #dc2626; background: #fef2f2; padding: 14px; border-radius: 12px; margin-top: 20px; font-size: 0.9rem; font-weight: 700; border: 1px solid #fecaca; }
</style>