<template>
  <div class="student-page">
    <h1>ÁREA DO ALUNO</h1>
    <p>Bem-vindo ao seu portal de estudos!</p>
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
.student-page { padding: 30px; background: #f9f9f9; min-height: 100vh; }
h1 { color: #42b983; }
button { background: #42b983; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 5px; }
</style>