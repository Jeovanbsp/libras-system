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
          <li :class="{ active: $route.path === '/aluno/dashboard' }" @click="router.push('/aluno/dashboard')">
            <LayoutDashboard :size="20" class="nav-icon" /> Meu Painel
          </li>
          <li :class="{ active: $route.path === '/aluno/cursos' }" @click="router.push('/aluno/cursos')">
            <BookOpen :size="20" class="nav-icon" /> Meus Cursos
          </li>
          <li :class="{ active: $route.path === '/aluno/loja' }" @click="router.push('/aluno/loja')">
            <ShoppingBag :size="20" class="nav-icon" /> Catálogo de Cursos
          </li>
          <li :class="{ active: $route.path === '/aluno/materiais' }" @click="router.push('/aluno/materiais')">
            <FileText :size="20" class="nav-icon" /> Materiais e PDFs
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <button @click="logout" class="btn-logout">
          <LogOut :size="18" style="margin-right: 8px" /> Sair da Conta
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// Importação dos ícones Lucide
import { 
  LayoutDashboard, 
  BookOpen, 
  ShoppingBag, 
  FileText, 
  LogOut 
} from 'lucide-vue-next';

const router = useRouter();
defineProps(['pageTitle', 'pageDescription']);

// ✅ Obter informações do usuário do localStorage
const userName = ref('Aluno');
const userEmail = ref('');

const avatarInitials = computed(() => {
  if (!userName.value) return 'AL';
  const parts = userName.value.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return userName.value.substring(0, 2).toUpperCase();
});

onMounted(() => {
  // Recuperar dados do localStorage
  const storedName = localStorage.getItem('userName');
  const storedEmail = localStorage.getItem('userEmail');
  
  if (storedName) userName.value = storedName;
  if (storedEmail) userEmail.value = storedEmail;
});

const logout = () => {
  // Limpar todos os dados do localStorage
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
.app-container { display: flex; min-height: 100vh; background-color: #f8fafc; font-family: 'Inter', sans-serif; }

.sidebar { 
  width: 260px; background: white; display: flex; flex-direction: column;
  padding: 30px 20px; border-right: 1px solid #e2e8f0; position: fixed; height: 100vh;
  overflow-y: auto;
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

.sidebar-nav ul { list-style: none; padding: 0; margin: 0; }
.sidebar-nav li { 
  padding: 12px 16px; margin-bottom: 6px; cursor: pointer; border-radius: 12px;
  transition: 0.2s; color: #64748b; display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 0.95rem;
}

/* Estilo para ícones Lucide inativos */
.nav-icon {
  color: #94a3b8;
  transition: 0.2s;
  flex-shrink: 0;
}

.sidebar-nav li:hover { background: #f1f5f9; color: #004aad; }
.sidebar-nav li:hover .nav-icon { color: #004aad; }

.sidebar-nav li.active { 
  background: #004aad; 
  color: white; 
  box-shadow: 0 4px 12px rgba(0, 74, 173, 0.2); 
}
.sidebar-nav li.active .nav-icon { color: white; }

.sidebar-footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.btn-logout { 
  width: 100%; padding: 12px; border: 1px solid #fee2e2; 
  background: #fff; color: #ef4444; border-radius: 12px; cursor: pointer; font-weight: bold; 
  transition: 0.2s; display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem;
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
.avatar { width: 45px; height: 45px; background: #004aad; color: white; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; flex-shrink: 0; }

.btn-header-logout { 
  background: transparent; 
  border: 1px solid #fecaca; 
  color: #ef4444; 
  cursor: pointer; 
  padding: 8px 12px; 
  margin-left: 15px; 
  border-radius: 10px; 
  transition: all 0.2s ease; 
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-header-logout:hover { 
  background: #fee2e2; 
  color: #dc2626; 
  transform: scale(1.05); 
}

.btn-header-logout:active {
  transform: scale(0.98);
}

.page-body { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 1024px) {
  .sidebar { width: 220px; padding: 20px 15px; }
  .main-content { margin-left: 220px; padding: 30px 40px; }
}

@media (max-width: 768px) {
  .sidebar { position: fixed; left: -260px; height: 100vh; z-index: 1000; }
  .sidebar.active { left: 0; }
  .main-content { margin-left: 0; padding: 20px; }
  .content-header { flex-direction: column; align-items: flex-start; gap: 20px; }
  .header-info h1 { font-size: 1.5rem; }
  .user-profile { align-self: flex-end; }
}
</style>
