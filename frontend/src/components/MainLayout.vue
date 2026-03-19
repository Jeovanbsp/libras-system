<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-container-sidebar">
          <img src="@/assets/logo.png" alt="Libras System" class="sidebar-logo" />
        </div>
      </div>

      <nav class="sidebar-nav">
        <ul>
          <li :class="{ active: $route.path === '/admin/dashboard' }" @click="router.push('/admin/dashboard')">
            <LayoutDashboard :size="20" class="nav-icon" /> Dashboard
          </li>
          <li :class="{ active: $route.path === '/admin/cursos' }" @click="router.push('/admin/cursos')">
            <BookOpen :size="20" class="nav-icon" /> Cursos
          </li>
          <li :class="{ active: $route.path === '/admin/profissionais' }" @click="router.push('/admin/profissionais')">
            <HandMetal :size="20" class="nav-icon" /> Profissionais
          </li>
          <li :class="{ active: $route.path === '/admin/usuarios' }" @click="router.push('/admin/usuarios')">
            <Users :size="20" class="nav-icon" /> Alunos
          </li>
          <li :class="{ active: $route.path === '/admin/b2b' }" @click="router.push('/admin/b2b')">
            <Building2 :size="20" class="nav-icon" /> Clientes B2B
          </li>
          <li :class="{ active: $route.path === '/admin/financeiro' }" @click="router.push('/admin/financeiro')">
            <BadgeDollarSign :size="20" class="nav-icon" /> Financeiro
          </li>
          <li :class="{ active: $route.path === '/admin/materiais' }" @click="router.push('/admin/materiais')">
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
// Importação dos ícones profissionais
import { 
  LayoutDashboard, 
  BookOpen, 
  HandMetal, 
  Users, 
  Building2, 
  BadgeDollarSign, 
  FileText,
  LogOut
} from 'lucide-vue-next';

const router = useRouter();
defineProps(['pageTitle', 'pageDescription']);

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  router.push('/aluno/login');
};
</script>

<style scoped>
.app-container { display: flex; min-height: 100vh; background-color: #f8fafc; font-family: 'Inter', sans-serif; }

.sidebar { 
  width: 260px; background: white; display: flex; flex-direction: column;
  padding: 30px 20px; border-right: 1px solid #e2e8f0; position: fixed; height: 100vh;
}

.logo-container-sidebar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  width: 100%;
}

.sidebar-logo {
  width: 100%; 
  max-width: 220px;
  height: auto;
  object-fit: contain;
}

.sidebar-nav ul { list-style: none; padding: 0; }
.sidebar-nav li { 
  padding: 12px 16px; margin-bottom: 6px; cursor: pointer; border-radius: 12px;
  transition: 0.2s; color: #64748b; display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 0.95rem;
}

/* Estilo para o ícone Lucide */
.nav-icon {
  color: #94a3b8; /* Cinza para itens inativos */
  transition: 0.2s;
}

.sidebar-nav li:hover { background: #f1f5f9; color: #004aad; }
.sidebar-nav li:hover .nav-icon { color: #004aad; }

.sidebar-nav li.active { 
  background: #004aad; 
  color: white; 
  box-shadow: 0 4px 12px rgba(0, 74, 173, 0.2); 
}
.sidebar-nav li.active .nav-icon { color: white; }

.btn-logout { 
  margin-top: auto; width: 100%; padding: 12px; border: 1px solid #fee2e2; 
  background: #fff; color: #ef4444; border-radius: 12px; cursor: pointer; font-weight: bold; 
  transition: 0.2s; display: flex; align-items: center; justify-content: center;
}
.btn-logout:hover { background: #fef2f2; }

.main-content { flex: 1; margin-left: 260px; padding: 40px 60px; }
.content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
.header-info h1 { font-size: 1.875rem; color: #0f172a; font-weight: 700; }
.header-info p { color: #64748b; margin-top: 4px; }

.user-profile { display: flex; align-items: center; gap: 12px; }
.user-text { display: flex; flex-direction: column; text-align: right; }
.user-text .name { font-weight: 600; color: #1e293b; font-size: 0.9rem; }
.user-text .role { font-size: 0.75rem; color: #94a3b8; }
.avatar { width: 42px; height: 42px; background: #004aad; color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold; }

.page-body { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>