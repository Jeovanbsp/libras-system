<template>
  <MainLayout pageTitle="Gestão de Usuários" pageDescription="Cadastre e gerencie os alunos e administradores da plataforma.">
    <div class="layout-split">
      
      <div class="glass-card side-form">
        <h3 class="form-title">
          <UserPlus :size="20" class="text-brand" /> Novo Usuário
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
            <input v-model="form.password" type="password" placeholder="Mínimo 6 caracteres" required />
          </div>

          <div class="form-group">
            <label>Nível de Acesso</label>
            <select v-model="form.role">
              <option value="aluno">Aluno (Área de Estudos)</option>
              <option value="admin">Administrador (Sistema)</option>
            </select>
          </div>

          <button type="submit" class="btn-primary">
            <UserCheck :size="18" /> Cadastrar Usuário
          </button>
        </form>
      </div>

      <div class="glass-card list-box">
        <h3 class="form-title">
          <Users :size="20" class="text-brand" /> Usuários Cadastrados
        </h3>
        <div class="user-list">
          <div v-for="user in usuarios" :key="user._id" class="user-item">
            <div class="item-main">
              <strong>{{ user.nome }}</strong>
              <span class="item-email">
                <Mail :size="12" /> {{ user.email }}
              </span>
            </div>
            <div class="item-actions">
              <span :class="['role-badge', user.role === 'admin' ? 'role-admin' : 'role-aluno']">
                {{ user.role === 'admin' ? 'Administrador' : 'Aluno' }}
              </span>
              <button @click="removerUsuario(user._id)" class="btn-del-mini" title="Excluir Usuário">
                <Trash2 :size="18" />
              </button>
            </div>
          </div>
          
          <div v-if="usuarios.length === 0" class="empty-msg">
            <Inbox :size="40" class="opacity-20" />
            <p>Nenhum usuário cadastrado ainda.</p>
          </div>
        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { UserPlus, UserCheck, Users, Mail, Trash2, Inbox } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const usuarios = ref([]);
const form = ref({ nome: '', email: '', password: '', role: 'aluno' });

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
    form.value = { nome: '', email: '', password: '', role: 'aluno' };
    alert('Usuário cadastrado com sucesso!');
    carregarUsuarios();
  } catch (error) {
    alert('Erro ao cadastrar: ' + (error.response?.data?.msg || 'Verifique os dados'));
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
.layout-split { display: grid; grid-template-columns: 380px 1fr; gap: 30px; align-items: start; }
.glass-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0, 74, 173, 0.05); }
.text-brand { color: #004aad; }

.form-title { margin-bottom: 25px; color: #1e293b; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }

.modern-form label { display: block; font-size: 0.8rem; font-weight: 700; color: #64748b; margin: 15px 0 5px; text-transform: uppercase; }
.modern-form input, .modern-form select { 
  width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; 
  background: #f8fafc; font-size: 0.95rem; color: #1e293b; transition: 0.2s; box-sizing: border-box;
}
.modern-form input:focus, .modern-form select:focus { outline: none; border-color: #004aad; box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1); background: white; }

.btn-primary { 
  width: 100%; background: #004aad; color: white; border: none; padding: 16px; 
  border-radius: 14px; margin-top: 25px; font-weight: 800; cursor: pointer; transition: 0.3s;
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.btn-primary:hover { background: #003a8c; transform: translateY(-2px); }

.user-item { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; border-bottom: 1px solid #f1f5f9; }
.user-item:hover { background: #f8fafc; border-radius: 12px; padding: 18px 10px; margin: 0 -10px; }

.item-main strong { display: block; color: #1e293b; font-size: 1rem; margin-bottom: 4px; }
.item-email { font-size: 0.85rem; color: #64748b; display: flex; align-items: center; gap: 5px; }

.item-actions { display: flex; align-items: center; gap: 15px; }
.role-badge { font-weight: 800; font-size: 0.7rem; padding: 6px 12px; border-radius: 8px; text-transform: uppercase; }
.role-admin { color: #6d28d9; background: #f5f3ff; }
.role-aluno { color: #004aad; background: #eff6ff; }

.btn-del-mini { background: transparent; border: none; padding: 10px; border-radius: 10px; cursor: pointer; color: #94a3b8; transition: 0.2s; }
.btn-del-mini:hover { color: #ef4444; background: #fef2f2; }

.empty-msg { text-align: center; padding: 40px; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 10px; }
</style>