import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';

const routes = [
  { 
    path: '/', 
    redirect: '/aluno/login' 
  },
  { 
    path: '/aluno/login', 
    name: 'Login', 
    component: LoginView 
  },
  
  // ==========================================
  // ROTAS PÚBLICAS (RECUPERAÇÃO DE SENHA)
  // ==========================================
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPasswordView.vue')
  },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: () => import('../views/ResetPasswordView.vue')
  },

  // ==========================================
  // ROTAS DO ALUNO
  // ==========================================
  {
    path: '/aluno/dashboard',
    name: 'StudentDashboard',
    component: () => import('../views/aluno/StudentDashboard.vue'), 
    meta: { requiresAuth: true, role: 'aluno' }
  },
  {
    path: '/aluno/cursos',
    name: 'StudentCursos',
    component: () => import('../views/aluno/StudentCurso.vue'),
    meta: { requiresAuth: true, role: 'aluno' }
  },
  {
    path: '/aluno/loja',
    name: 'LojaCursos',
    component: () => import('../views/aluno/LojaCursos.vue'),
    meta: { requiresAuth: true, role: 'aluno' }
  },
  {
    path: '/aluno/materiais',
    name: 'StudentMateriais',
    component: () => import('../views/aluno/StudentMaterias.vue'),
    meta: { requiresAuth: true, role: 'aluno' }
  },
  {
    path: '/aluno/curso/:id',
    name: 'SalaAula',
    component: () => import('../views/aluno/SalaAulaView.vue'),
    meta: { requiresAuth: true, role: 'aluno' }
  },

  // ==========================================
  // ROTAS DO ADMINISTRADOR
  // ==========================================
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/AdminDashboard.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/profissionais',
    name: 'Profissionais',
    component: () => import('../views/ProfissionaisView.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/cursos',
    name: 'AdminCursos',
    component: () => import('../views/CursosView.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/usuarios',
    name: 'AdminUsuarios',
    component: () => import('../views/UsuariosView.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/b2b',
    name: 'ClientesB2B',
    component: () => import('../views/ClientesB2BView.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/financeiro',
    name: 'AdminFinanceiro',
    component: () => import('../views/FinanceiroView.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/calculadora',
    name: 'Calculadora',
    component: () => import('../views/CalculadoraView.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/materiais',
    name: 'AdminMateriais',
    component: () => import('../views/MateriaisView.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Middleware de Segurança (Navigation Guard)
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // 1. Se a rota exige autenticação e não há token, vai para o login
  if (to.meta.requiresAuth && !token) {
    next('/aluno/login');
  } 
  // 2. Se a rota exige um cargo (role) específico e o usuário não o possui
  else if (to.meta.role && to.meta.role !== userRole) {
    // Redireciona conforme o cargo atual
    userRole === 'admin' ? next('/admin/dashboard') : next('/aluno/dashboard');
  } 
  // 3. Caso contrário, permite o acesso
  else {
    next();
  }
});

export default router;