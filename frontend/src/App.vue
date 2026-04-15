<template>
  <div id="app">
    <!-- Se tiver menu de navegação, fica aqui -->
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/admin/foruns">Fóruns</router-link>
    </nav>

    <router-view /> <!-- Isso carrega as páginas -->
  </div>
</template>

<script setup>
// Lógica global aqui
</script>

<style>
/* Estilos globais */
body {
  margin: 0;
  font-family: Arial, sans-serif;
}
</style>