<template>
  <MainLayout pageTitle="Gestão de Alunos" pageDescription="Cadastre e gerencie os usuários da plataforma.">
    <div class="layout-split">
      
      <div class="glass-card side-form">
        <h3 class="form-title">
          <span class="icon-badge">👥</span> Novo Usuário
        </h3>
        <form @submit.prevent="salvarUsuario" class="modern-form">
          <div class="form-group">
            <label>Nome Completo</label>
            <input v-model="form.nome" placeholder="Ex: Maria Souza" required />
          </div>

          <div class="form-group">
            <label>E-mail</label>
            <input v-model="form.email" type="email" placeholder="maria@email.com" required />
          </div>

          <div class="form-group">
            <label>Senha de Acesso</label>
            <input v-model="form.senha" type="password" placeholder="Mínimo 6 caracteres" required />
          </div>

          <div class="form-group">
            <label>Nível de Acesso</label>
            <select v-model="form.role">
              <option value="aluno">Aluno (Área de Estudos)</option>
              <option value="admin">Administrador (Sistema)</option>
            </select>
          </div>

          <button type="submit" class="btn-primary">Cadastrar Usuário</button>
        </form>
      </div>

      <div class="glass-card list-box">
        <h3 class="form-title">
          <span class="icon-badge">📋</span> Usuários Cadastrados
        </h3>
        <div class="user-list">
          <div v-for="user in usuarios" :key="user._id" class="user-item">
            <div class="item-main">
              <strong>{{ user.nome }}</strong>
              <span class="item-email">{{ user.email }}</span>
            </div>
            <div class="item-actions">
              <span :class="['role-badge', user.role === 'admin' ? 'role-admin' : 'role-aluno']">
                {{ user.role }}
              </span>
              <button @click="removerUsuario(user._id)" class="btn-del-mini" title="Excluir">🗑️</button>
            </div>
          </div>
          <div v-if="usuarios.length === 0" class="empty-msg">Nenhum usuário cadastrado.</div>
        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const usuarios = ref([]);
const form = ref({ nome: '', email: '', senha: '', role: 'aluno' });

const carregarUsuarios = async () => {
  try {
    const res = await api.get('/usuarios');
    usuarios.value = res.data;
  } catch (error) {
    console.error('Erro ao carregar usuários');
  }
};

const salvarUsuario = async () => {
  try {
    await api.post('/auth/register', form.value);
    form.value = { nome: '', email: '', senha: '', role: 'aluno' };
    carregarUsuarios();
  } catch (error) {
    alert('Erro ao cadastrar: ' + (error.response?.data?.message || 'Verifique os dados'));
  }
};

const removerUsuario = async (id) => {
  if (confirm("Deseja realmente apagar este usuário?")) {
    try {
      await api.delete(`/usuarios/${id}`);
      carregarUsuarios();
    } catch (error) {
      alert("Erro ao excluir usuário.");
    }
  }
};

onMounted(carregarUsuarios);
</script>

<style scoped>
.layout-split { display: grid; grid-template-columns: 350px 1fr; gap: 30px; align-items: start; }
.glass-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05); }

.form-title { margin-bottom: 25px; color: #1e293b; font-size: 1.2rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
.icon-badge { background: #eff6ff; padding: 8px; border-radius: 10px; font-size: 1rem; }

.modern-form label { display: block; font-size: 0.8rem; font-weight: 700; color: #64748b; margin: 15px 0 5px; text-transform: uppercase; letter-spacing: 0.5px; }
.modern-form input, .modern-form select { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; font-size: 0.95rem; color: #1e293b; font-weight: 500; transition: all 0.2s ease; }
.modern-form input:focus, .modern-form select:focus { outline: none; border-color: #1e40af; box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.15); background: white; }

.btn-primary { width: 100%; background: #1e40af; color: white; border: none; padding: 16px; border-radius: 14px; margin-top: 25px; font-weight: bold; font-size: 1rem; cursor: pointer; transition: all 0.3s; }
.btn-primary:hover { background: #1e3a8a; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(30, 64, 175, 0.25); }

.user-list { display: flex; flex-direction: column; }
.user-item { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; border-bottom: 1px solid #f1f5f9; transition: background 0.2s; }
.user-item:hover { background: #f8fafc; border-radius: 12px; padding: 20px 10px; margin: 0 -10px; }

.item-main strong { display: block; color: #1e293b; font-size: 1.05rem; margin-bottom: 4px; }
.item-email { font-size: 0.85rem; color: #64748b; font-weight: 500; }

.item-actions { display: flex; align-items: center; gap: 15px; }
.role-badge { font-weight: 800; font-size: 0.75rem; padding: 6px 12px; border-radius: 8px; text-transform: uppercase; }
.role-admin { color: #6d28d9; background: #f5f3ff; }
.role-aluno { color: #1e40af; background: #eff6ff; }

.btn-del-mini { background: transparent; border: none; padding: 8px; border-radius: 10px; cursor: pointer; transition: 0.2s; opacity: 0.5; filter: grayscale(1); }
.user-item:hover .btn-del-mini { opacity: 1; filter: grayscale(0); }
.btn-del-mini:hover { background: #fee2e2; }

.empty-msg { text-align: center; padding: 40px; color: #94a3b8; font-weight: 500; }
</style>