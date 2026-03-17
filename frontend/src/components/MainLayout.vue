<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-box">
          <span class="logo-icon">🤟</span>
          <h3>Libras<span>System</span></h3>
        </div>
      </div>

      <nav class="sidebar-nav">
        <ul>
          <li :class="{ active: $route.path === '/dashboard' }" @click="router.push('/dashboard')">
            <span class="icon">📊</span> Dashboard
          </li>
          <li :class="{ active: $route.path === '/cursos' }" @click="router.push('/cursos')">
            <span class="icon">📚</span> Meus Cursos
          </li>
          <li :class="{ active: $route.path === '/usuarios' }" @click="router.push('/usuarios')">
            <span class="icon">👥</span> Alunos
          </li>
          <li :class="{ active: $route.path === '/financeiro' }" @click="router.push('/financeiro')">
            <span class="icon">💰</span> Financeiro
          </li>
          <li :class="{ active: $route.path === '/materiais' }" @click="router.push('/materiais')">
            <span class="icon">📂</span> Apostilas
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <button @click="logout" class="btn-logout">Sair</button>
      </div>
    </aside>

    <main class="main-content">
      <header class="content-header">
        <div class="header-info">
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageDescription }}</p>
        </div>
        <div class="user-profile">
          <span>Professor Admin</span>
          <div class="avatar">AD</div>
        </div>
      </header>

      <section class="page-body">
        <slot></slot>
      </section>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

defineProps(['pageTitle', 'pageDescription']);

const logout = () => {
  localStorage.removeItem('token');
  router.push('/');
};
</script>

<style scoped>
:root {
  --primary: #8e44ad;
  --bg-light: #f8f9fd;
  --sidebar-w: 260px;
}

.app-container { display: flex; min-height: 100vh; background-color: #f8f9fd; font-family: 'Inter', sans-serif; }

/* Sidebar Estilo Hospitalar/Clean */
.sidebar { 
  width: 260px; background: white; display: flex; flex-direction: column;
  padding: 30px 20px; border-right: 1px solid #edf2f7; position: fixed; height: 100vh;
}
.logo-box { display: flex; align-items: center; gap: 10px; margin-bottom: 40px; padding: 0 10px; }
.logo-icon { font-size: 1.5rem; background: #f3e8ff; padding: 5px; border-radius: 8px; }
.logo-box h3 { font-size: 1.2rem; color: #2d3748; }
.logo-box span { color: #8e44ad; }

.sidebar-nav ul { list-style: none; padding: 0; }
.sidebar-nav li { 
  padding: 12px 15px; margin-bottom: 8px; cursor: pointer; border-radius: 12px;
  transition: 0.2s; color: #718096; display: flex; align-items: center; gap: 12px; font-weight: 500;
}
.sidebar-nav li:hover { background: #f7fafc; color: #8e44ad; }
.sidebar-nav li.active { background: #f3e8ff; color: #8e44ad; }

.btn-logout { 
  margin-top: auto; width: 100%; padding: 12px; border: none; 
  background: #fff5f5; color: #e53e3e; border-radius: 12px; cursor: pointer; font-weight: bold;
}

/* Área Principal */
.main-content { flex: 1; margin-left: 260px; padding: 40px; }
.content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
.header-info h1 { font-size: 1.8rem; color: #1a202c; }
.header-info p { color: #a0aec0; margin-top: 4px; }

.user-profile { display: flex; align-items: center; gap: 12px; }
.avatar { width: 40px; height: 40px; background: #8e44ad; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }

.page-body { animation: fadeIn 0.3s ease-in; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>