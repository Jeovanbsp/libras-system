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
          <li :class="{ active: $route.path === '/aluno/dashboard' }" @click="router.push('/aluno/dashboard')">
            <span class="icon">🏠</span> Meu Painel
          </li>
          <li :class="{ active: $route.path === '/aluno/cursos' }" @click="router.push('/aluno/cursos')">
            <span class="icon">📖</span> Meus Cursos
          </li>
          <li :class="{ active: $route.path === '/aluno/loja' }" @click="router.push('/aluno/loja')">
            <span class="icon">🛒</span> Catálogo de Cursos
          </li>
          <li :class="{ active: $route.path === '/aluno/materiais' }" @click="router.push('/aluno/materiais')">
            <span class="icon">📂</span> Materiais e PDFs
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <button @click="logout" class="btn-logout">Sair da Conta</button>
      </div>
    </aside>

    <main class="main-content">
      <header class="content-header">
        <div class="header-info">
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageDescription }}</p>
        </div>
        <div class="user-profile">
          <div class="user-text">
            <span class="name">Aluno(a)</span>
            <span class="role">Área de Estudos</span>
          </div>
          <div class="avatar">AL</div>
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
  localStorage.removeItem('userRole');
  router.push('/aluno/login');
};
</script>

<style scoped>
/* MESMA IDENTIDADE VISUAL DO ADMIN, APLICADA AO ALUNO */
.app-container { display: flex; min-height: 100vh; background-color: #f8fafc; font-family: 'Inter', sans-serif; }

.sidebar { 
  width: 260px; background: white; display: flex; flex-direction: column;
  padding: 30px 20px; border-right: 1px solid #e2e8f0; position: fixed; height: 100vh;
}
.logo-box { display: flex; align-items: center; gap: 12px; margin-bottom: 40px; padding: 0 10px; }
.logo-icon { font-size: 1.5rem; background: #eff6ff; color: #1e40af; padding: 6px; border-radius: 10px; }
.logo-box h3 { font-size: 1.25rem; color: #1e293b; font-weight: 800; }
.logo-box span { color: #1e40af; } 

.sidebar-nav ul { list-style: none; padding: 0; }
.sidebar-nav li { 
  padding: 12px 16px; margin-bottom: 6px; cursor: pointer; border-radius: 12px;
  transition: 0.2s; color: #64748b; display: flex; align-items: center; gap: 12px; font-weight: 500;
}
.sidebar-nav li:hover { background: #f1f5f9; color: #1e40af; }
.sidebar-nav li.active { background: #1e40af; color: white; box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2); }

.btn-logout { 
  margin-top: auto; width: 100%; padding: 12px; border: 1px solid #fee2e2; 
  background: #fff; color: #ef4444; border-radius: 12px; cursor: pointer; font-weight: bold; transition: 0.2s;
}
.btn-logout:hover { background: #fef2f2; }

.main-content { flex: 1; margin-left: 260px; padding: 40px 60px; }
.content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
.header-info h1 { font-size: 1.875rem; color: #0f172a; font-weight: 700; margin: 0; }
.header-info p { color: #64748b; margin-top: 4px; font-size: 0.95rem; }

.user-profile { display: flex; align-items: center; gap: 12px; }
.user-text { display: flex; flex-direction: column; text-align: right; }
.user-text .name { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
.user-text .role { font-size: 0.8rem; color: #64748b; font-weight: 500; }
.avatar { width: 45px; height: 45px; background: #1e40af; color: white; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; }

.page-body { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>