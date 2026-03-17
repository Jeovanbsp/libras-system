<template>
  <div class="admin-page">
    <h1>PAINEL DO ADMINISTRADOR</h1>
    <p>Área de gerenciamento do sistema.</p>
    <button @click="logout">Sair</button>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      localStorage.clear();
      this.$router.push('/aluno/login');
    }
  }
}
</script>

<style scoped>
.admin-page { padding: 30px; background: #2c3e50; color: white; min-height: 100vh; }
h1 { color: #e74c3c; }
button { background: #e74c3c; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 5px; }
</style>