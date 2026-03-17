<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-box">
          <span class="logo-icon">🤟</span>
          <h3>Libras<span>Portal</span></h3>
        </div>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li :class="{ active: $route.path === '/aluno/dashboard' }" @click="router.push('/aluno/dashboard')">
            <span class="icon">🏠</span> Início
          </li>
          <li :class="{ active: $route.path === '/aluno/cursos' }" @click="router.push('/aluno/cursos')">
            <span class="icon">📖</span> Meus Cursos
          </li>
          <li :class="{ active: $route.path === '/aluno/materiais' }" @click="router.push('/aluno/materiais')">
            <span class="icon">📂</span> Apostilas
          </li>
        </ul>
      </nav>
      <div class="sidebar-footer">
        <button @click="logout" class="btn-logout">Sair do Portal</button>
      </div>
    </aside>

    <main class="main-content">
      <header class="content-header">
        <div class="header-info">
          <h1>Olá, {{ nomeAluno }}! 👋</h1>
          <p>Que bom ter você praticando Libras hoje.</p>
        </div>
        <div class="user-badge">Aluno</div>
      </header>
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const nomeAluno = localStorage.getItem('userNome') || 'Estudante';

const logout = () => {
  localStorage.clear();
  router.push('/');
};
</script>

<style scoped>
/* Reutiliza o estilo do MainLayout, mas com cores mais suaves (ex: Verde/Azul) */
.app-container { display: flex; min-height: 100vh; background-color: #f0f4f8; font-family: 'Inter', sans-serif; }
.sidebar { width: 260px; background: white; padding: 30px 20px; border-right: 1px solid #e2e8f0; position: fixed; height: 100vh; display: flex; flex-direction: column; }
.logo-box h3 span { color: #2ecc71; }
.sidebar-nav li { padding: 12px 15px; margin-bottom: 8px; cursor: pointer; border-radius: 12px; transition: 0.2s; color: #64748b; display: flex; align-items: center; gap: 12px; }
.sidebar-nav li.active { background: #ecfdf5; color: #10b981; font-weight: 600; }
.main-content { flex: 1; margin-left: 260px; padding: 40px; }
.content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.user-badge { background: #10b981; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
.btn-logout { width: 100%; padding: 12px; border: none; background: #fff1f2; color: #e11d48; border-radius: 12px; cursor: pointer; margin-top: auto; }
</style>