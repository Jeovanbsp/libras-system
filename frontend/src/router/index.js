import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';

const routes = [
  { path: '/', redirect: '/aluno/login' },
  { 
    path: '/aluno/login', 
    name: 'Login', 
    component: LoginView 
  },
  {
    path: '/aluno/dashboard',
    name: 'StudentDashboard',
    component: () => import('../views/aluno/StudentDashboard.vue'),
    meta: { requiresAuth: true, role: 'aluno' }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Segurança: Impede acesso sem token e checa o cargo (role)
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (to.meta.requiresAuth && !token) {
    next('/aluno/login');
  } else if (to.meta.role && to.meta.role !== userRole) {
    // Se um aluno tentar entrar no /admin, manda pro dashboard dele
    userRole === 'admin' ? next('/admin/dashboard') : next('/aluno/dashboard');
  } else {
    next();
  }
});

export default router;