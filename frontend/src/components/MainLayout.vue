<template>
  <div class="app-container">
    
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
          <li :class="{ active: $route.path === '/admin/dashboard' }" @click="navegar('/admin/dashboard')">
            <LayoutDashboard :size="20" class="nav-icon" /> Dashboard
          </li>
          <li :class="{ active: $route.path === '/admin/cursos' }" @click="navegar('/admin/cursos')">
            <BookOpen :size="20" class="nav-icon" /> Cursos
          </li>
          
          <li :class="{ active: $route.path === '/admin/forum' }" @click="navegar('/admin/forum')">
            <MessageSquare :size="20" class="nav-icon" /> Fórum dos Alunos
          </li>

          <li :class="{ active: $route.path === '/admin/profissionais' }" @click="navegar('/admin/profissionais')">
            <HandMetal :size="20" class="nav-icon" /> Profissionais
          </li>
          <li :class="{ active: $route.path === '/admin/usuarios' }" @click="navegar('/admin/usuarios')">
            <Users :size="20" class="nav-icon" /> Alunos
          </li>
          <li :class="{ active: $route.path === '/admin/b2b' }" @click="navegar('/admin/b2b')">
            <Building2 :size="20" class="nav-icon" /> Clientes B2B
          </li>
          
          <li :class="{ active: $route.path === '/admin/servicos' }" @click="navegar('/admin/servicos')">
            <CalendarPlus :size="20" class="nav-icon" /> Serviços / Eventos
          </li>

          <li :class="{ active: $route.path === '/admin/estoque' }" @click="navegar('/admin/estoque')">
            <Package :size="20" class="nav-icon" /> Controlo de Stock
          </li>

          <li v-if="userRole === 'admin'" :class="{ active: $route.path === '/admin/financeiro' }" @click="navegar('/admin/financeiro')">
            <BadgeDollarSign :size="20" class="nav-icon" /> Financeiro
          </li>

          <li :class="{ active: $route.path === '/admin/materiais' }" @click="navegar('/admin/materiais')">
            <FileText :size="20" class="nav-icon" /> Apostilas
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <button @click="logout" class="btn-logout">
          <LogOut :size="18" style="margin-right: 8px" /> Sair do Sistema
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
            <span class="name">Professor Admin</span>
            <span class="role">Administrador</span>
          </div>
          <div class="avatar">AD</div>
          
          <button @click="logout" class="btn-header-logout" title="Sair do Sistema">
            <LogOut :size="22" />
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// Importado o ícone MessageSquare
import { 
  LayoutDashboard, BookOpen, HandMetal, Users, Building2,
  CalendarPlus, BadgeDollarSign, FileText, Package, LogOut,
  Menu as MenuIcon, X, MessageSquare
} from 'lucide-vue-next';

const router = useRouter();
defineProps(['pageTitle', 'pageDescription']);

const userRole = ref(localStorage.getItem('userRole') || 'aluno');
const isMenuOpen = ref(false); 

const toggleMenu = () => { isMenuOpen.value = !isMenuOpen.value; };

const navegar = (rota) => {
  router.push(rota);
  isMenuOpen.value = false; 
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId'); // Remove o ID também no logout
  router.push('/aluno/login');
};
</script>

<style scoped>
/* O CSS permanece o mesmo do seu ficheiro original */
.app-container { display: flex; min-height: 100vh; background-color: #f8fafc; font-family: 'Inter', sans-serif; flex-direction: column; }
.mobile-header { display: none; }
.sidebar-overlay { display: none; }
.btn-close-menu { display: none; }
.sidebar { width: 260px; background: white; display: flex; flex-direction: column; padding: 30px 20px; border-right: 1px solid #e2e8f0; position: fixed; height: 100vh; z-index: 1000; transition: transform 0.3s ease; }
.logo-container-sidebar { display: flex; justify-content: center; align-items: center; margin-bottom: 30px; width: 100%; }
.sidebar-logo { width: 100%; max-width: 200px; height: auto; object-fit: contain; }
.sidebar-nav ul { list-style: none; padding: 0; }
.sidebar-nav li { padding: 12px 16px; margin-bottom: 6px; cursor: pointer; border-radius: 12px; transition: 0.2s; color: #64748b; display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 0.95rem; }
.nav-icon { color: #94a3b8; transition: 0.2s; }
.sidebar-nav li:hover { background: #f1f5f9; color: #004aad; }
.sidebar-nav li:hover .nav-icon { color: #004aad; }
.sidebar-nav li.active { background: #004aad; color: white; box-shadow: 0 4px 12px rgba(0, 74, 173, 0.2); }
.sidebar-nav li.active .nav-icon { color: white; }
.sidebar-footer { margin-top: auto; }
.btn-logout { width: 100%; padding: 12px; border: 1px solid #fee2e2; background: #fff; color: #ef4444; border-radius: 12px; cursor: pointer; font-weight: bold; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
.btn-logout:hover { background: #fef2f2; }
.main-content { flex: 1; margin-left: 260px; padding: 40px 60px; transition: margin-left 0.3s ease; }
.content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
.header-info h1 { font-size: 1.875rem; color: #0f172a; font-weight: 700; }
.header-info p { color: #64748b; margin-top: 4px; }
.user-profile { display: flex; align-items: center; gap: 12px; }
.user-text { display: flex; flex-direction: column; text-align: right; }
.user-text .name { font-weight: 600; color: #1e293b; font-size: 0.9rem; }
.user-text .role { font-size: 0.75rem; color: #94a3b8; }
.avatar { width: 42px; height: 42px; background: #004aad; color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.btn-header-logout { background: transparent; border: 1px solid #fecaca; color: #ef4444; cursor: pointer; padding: 8px; margin-left: 15px; border-radius: 10px; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; }
.btn-header-logout:hover { background: #fee2e2; color: #dc2626; transform: scale(1.05); }
.page-body { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 992px) {
  .mobile-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 25px; background: white; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 900; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
  .mobile-logo { height: 40px; object-fit: contain; }
  .btn-mobile-menu { background: transparent; border: none; color: #004aad; cursor: pointer; }
  .sidebar { transform: translateX(-100%); width: 280px; box-shadow: 10px 0 25px rgba(0,0,0,0.1); }
  .sidebar-open { transform: translateX(0); }
  .sidebar-header { display: flex; justify-content: space-between; align-items: center; }
  .btn-close-menu { display: block; background: transparent; border: none; color: #64748b; cursor: pointer; }
  .logo-container-sidebar { margin-bottom: 0; width: auto; }
  .sidebar-logo { max-width: 150px; }
  .sidebar-overlay { display: block; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); z-index: 999; backdrop-filter: blur(2px); }
  .main-content { margin-left: 0; padding: 25px 20px; }
  .content-header { flex-direction: column; align-items: flex-start; gap: 20px; }
  .user-profile { align-self: flex-end; }
}
</style>