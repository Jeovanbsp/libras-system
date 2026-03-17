<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Libras System</h1>
      <form @submit.prevent="handleLogin">
        <input v-model="email" type="email" placeholder="E-mail" required />
        <input v-model="password" type="password" placeholder="Senha" required />
        <button type="submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Acessar' }}
        </button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
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

        const { token, role } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);

        if (role === 'admin') {
          this.$router.push('/admin/dashboard');
        } else {
          this.$router.push('/aluno/dashboard');
        }
      } catch (err) {
        this.error = "E-mail ou senha incorretos.";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-container { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f4f7f6; }
.login-card { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 320px; text-align: center; }
input { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
button { width: 100%; padding: 10px; background: #42b983; color: white; border: none; border-radius: 5px; cursor: pointer; }
.error { color: red; margin-top: 10px; font-size: 0.9rem; }
</style>