<template>
  <div class="app-container">
    <StudentNotification />

    <!-- Header Mobile -->
    <div class="mobile-header">
      <div class="mobile-logo-box">
        <img src="@/assets/logo.png" alt="Libras System" class="mobile-logo" />
      </div>
      <button @click="toggleMenu" class="btn-mobile-menu">
        <MenuIcon :size="28" />
      </button>
    </div>

    <div v-if="isMenuOpen" class="sidebar-overlay" @click="toggleMenu"></div>

    <aside :class="['sidebar', { 'sidebar-open': isMenuOpen }]">
      <div class="sidebar-header">
        <div class="logo-container-sidebar">
          <img src="@/assets/logo.png" alt="Libras System" class="sidebar-logo" />
        </div>
        <button class="btn-close-menu" @click="toggleMenu"><X :size="24" /></button>
      </div>

      <nav class="sidebar-nav">
        <ul>
          <li :class="{ active: $route.path === '/aluno/dashboard' }" @click="navegar('/aluno/dashboard')">
            <LayoutDashboard :size="20" class="nav-icon" /> Meu Painel
          </li>
          <li :class="{ active: $route.path === '/aluno/cursos' }" @click="navegar('/aluno/cursos')">
            <BookOpen :size="20" class="nav-icon" /> Meus Cursos
          </li>
          <li :class="{ active: $route.path === '/aluno/loja' }" @click="navegar('/aluno/loja')">
            <ShoppingBag :size="20" class="nav-icon" /> Catálogo de Cursos
          </li>
          <li :class="{ active: $route.path === '/aluno/materiais' }" @click="navegar('/aluno/materiais')">
            <FileText :size="20" class="nav-icon" /> Materiais e PDFs
          </li>
          <li :class="{ active: $route.path === '/aluno/forum' }" @click="navegar('/aluno/forum')">
            <MessageSquare :size="20" class="nav-icon" /> Fórum
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <button @click="logout" class="btn-logout">
          <LogOut :size="18" /> Sair da Conta
        </button>
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
            <span class="name">{{ userName }}</span>
            <span class="role">Área de Estudos</span>
          </div>
          <div class="avatar">{{ avatarInitials }}</div>
          <button @click="logout" class="btn-header-logout" title="Sair do Sistema">
            <LogOut :size="20" />
          </button>
        </div>
      </header>

      <section class="page-body">
        <slot></slot>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  LayoutDashboard, BookOpen, ShoppingBag, FileText,
  LogOut, MessageSquare, Menu as MenuIcon, X
} from 'lucide-vue-next';
import StudentNotification from './StudentNotification.vue';

const router = useRouter();
defineProps(['pageTitle', 'pageDescription']);

const userName = ref('Aluno');
const isMenuOpen = ref(false);

const avatarInitials = computed(() => {
  if (!userName.value) return 'AL';
  const parts = userName.value.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return userName.value.substring(0, 2).toUpperCase();
});

onMounted(() => {
  const storedName = localStorage.getItem('userName');
  if (storedName) userName.value = storedName;
});

const toggleMenu = () => { isMenuOpen.value = !isMenuOpen.value; };

const navegar = (rota) => {
  router.push(rota);
  isMenuOpen.value = false;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('rememberedEmail');
  localStorage.removeItem('rememberedPassword');
  router.push('/aluno/login');
};
</script>

<style scoped>
.app-container { display: flex; min-height: 100vh; background-color: #f8fafc; font-family: 'Inter', sans-serif; flex-direction: column; }

.mobile-header { display: none; }
.sidebar-overlay { display: none; }
.btn-close-menu { display: none; }

.sidebar {
  width: 260px;
  background: white;
  display: flex;
  flex-direction: column;
  padding: 30px 20px;
  border-right: 1px solid #e2e8f0;
  position: fixed;
  height: 100vh;
  top: 0; left: 0;
  z-index: 1000;
  transition: transform 0.3s ease;
  overflow-y: auto;
  box-sizing: border-box;
}

.sidebar::-webkit-scrollbar { width: 6px; }
.sidebar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

.sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  flex-shrink: 0;
}

.logo-container-sidebar { display: flex; justify-content: center; align-items: center; width: 100%; }
.sidebar-logo { width: 100%; max-width: 200px; height: auto; object-fit: contain; }

.sidebar-nav { flex: 1; overflow-y: auto; }
.sidebar-nav ul { list-style: none; padding: 0; margin: 0; }
.sidebar-nav li {
  padding: 12px 16px;
  margin-bottom: 6px;
  cursor: pointer;
  border-radius: 12px;
  transition: 0.2s;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 0.95rem;
}

.nav-icon { color: #94a3b8; transition: 0.2s; flex-shrink: 0; }
.sidebar-nav li:hover { background: #f1f5f9; color: #004aad; }
.sidebar-nav li:hover .nav-icon { color: #004aad; }
.sidebar-nav li.active { background: #004aad; color: white; box-shadow: 0 4px 12px rgba(0,74,173,0.2); }
.sidebar-nav li.active .nav-icon { color: white; }

.sidebar-footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.btn-logout {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #fee2e2;
  background: white;
  color: #ef4444;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.9rem;
  font-family: inherit;
}
.btn-logout:hover { background: #fef2f2; border-color: #fca5a5; }

.main-content { flex: 1; margin-left: 260px; padding: 40px 60px; }
.content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; gap: 20px; }
.header-info h1 { font-size: 1.875rem; color: #0f172a; font-weight: 700; margin: 0; }
.header-info p { color: #64748b; margin-top: 4px; font-size: 0.95rem; margin-bottom: 0; }

.user-profile { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.user-text { display: flex; flex-direction: column; text-align: right; }
.user-text .name { font-weight: 700; color: #1e293b; font-size: 0.9rem; }
.user-text .role { font-size: 0.75rem; color: #94a3b8; }
.avatar { width: 42px; height: 42px; background: #004aad; color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0; }

.btn-header-logout {
  background: white;
  border: 1px solid #fecaca;
  color: #ef4444;
  cursor: pointer;
  padding: 8px 12px;
  margin-left: 8px;
  border-radius: 10px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.btn-header-logout:hover { background: #fee2e2; color: #dc2626; transform: scale(1.05); }

.page-body { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 992px) {
  .mobile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 999;
  }
  .mobile-logo-box { display: flex; align-items: center; }
  .mobile-logo { height: 36px; object-fit: contain; }
  .btn-mobile-menu { background: transparent; border: none; color: #004aad; cursor: pointer; padding: 4px; }

  .sidebar {
    transform: translateX(-100%);
    width: 280px;
    box-shadow: 10px 0 25px rgba(0,0,0,0.1);
    top: 60px;
    height: calc(100vh - 60px);
  }
  .sidebar-open { transform: translateX(0); }

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .btn-close-menu { display: block; background: transparent; border: none; color: #64748b; cursor: pointer; padding: 0; }
  .logo-container-sidebar { width: auto; }
  .sidebar-logo { max-width: 150px; }

  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 60px; left: 0;
    width: 100%;
    height: calc(100% - 60px);
    background: rgba(15,23,42,0.6);
    z-index: 998;
    backdrop-filter: blur(2px);
  }

  .main-content { margin-left: 0; padding: 25px 20px; }
  .content-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  .user-profile { align-self: flex-end; }
}

@media (max-width: 600px) {
  .main-content { padding: 20px 15px; }
  .header-info h1 { font-size: 1.5rem; }
  .user-profile { width: 100%; justify-content: space-between; }
  .user-text { text-align: left; }
  .sidebar { width: 100%; }
}
</style>
