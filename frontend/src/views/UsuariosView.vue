<template>
  <MainLayout pageTitle="Gestão de Usuários" pageDescription="Cadastre e gerencie os alunos e administradores da plataforma.">
    <div class="layout-split">
      
      <div class="glass-card side-form">
        <h3 class="form-title">
          <UserPlus :size="20" class="text-brand" /> Novo Usuário
        </h3>
        
        <div v-if="mensagemFeedback" :class="['feedback-toast', tipoFeedback]">
          <CheckCircle2 v-if="tipoFeedback === 'success'" :size="20" />
          <AlertCircle v-else :size="20" />
          <p>{{ mensagemFeedback }}</p>
        </div>

        <form @submit.prevent="salvarUsuario" class="modern-form">
          <div class="form-group">
            <label>Nome Completo</label>
            <input v-model="form.nome" placeholder="Ex: Maria Souza" required />
          </div>

          <div class="form-group">
            <label>E-mail</label>
            <input v-model="form.email" type="email" placeholder="maria@email.com" required />
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>Senha de Acesso</label>
              <input v-model="form.password" type="password" placeholder="Mínimo 6 caracteres" required />
            </div>
            <div class="form-group-col" v-if="form.role === 'aluno'">
              <label>Turma (Opcional)</label>
              <input v-model="form.turma" placeholder="Ex: Turma A - 2026" />
            </div>
          </div>

          <div class="form-group">
            <label>Nível de Acesso</label>
            <select v-model="form.role" class="modern-select">
              <option value="aluno">Aluno (Área de Estudos)</option>
              <option value="admin_restrito">Administrador Restrito</option>
              <option v-if="userRole === 'admin'" value="admin">Administrador Geral</option>
            </select>
          </div>

          <button type="submit" class="btn-primary">
            <UserCheck :size="18" /> Cadastrar Usuário
          </button>
        </form>
      </div>

      <div class="list-section">
        
        <div class="glass-card search-bar">
          <div class="form-row" style="margin-bottom: 0;">
            <div class="form-group-col flex-2">
              <label class="text-xs font-bold text-gray-500">Buscar Aluno (Nome/Email):</label>
              <input v-model="filtros.busca" placeholder="Digite para pesquisar..." @input="carregarUsuarios" />
            </div>
            <div class="form-group-col">
              <label class="text-xs font-bold text-gray-500">Cadastrado a partir de:</label>
              <input v-model="filtros.dataInicio" type="date" @change="carregarUsuarios" />
            </div>
            <div class="form-group-col">
              <label class="text-xs font-bold text-gray-500">Até:</label>
              <input v-model="filtros.dataFim" type="date" @change="carregarUsuarios" />
            </div>
          </div>
        </div>

        <div class="glass-card list-box mt-4">
          <h3 class="form-title">
            <Users :size="20" class="text-brand" /> Usuários Encontrados ({{ usuarios.length }})
          </h3>
          <div class="user-list">
            <div v-for="user in usuarios" :key="user._id" class="user-item">
              <div class="item-main">
                <strong>{{ user.nome }}</strong>
                <span class="item-email">
                  <Mail :size="12" /> {{ user.email }}
                </span>
                <span class="text-xs text-gray-400 block mt-1">
                  Cadastrado em: {{ formatarData(user.dataCadastro || user.createdAt) }}
                </span>
              </div>
              <div class="item-actions">
                <span v-if="user.turma" class="turma-badge">{{ user.turma }}</span>
                <span :class="['role-badge', user.role === 'aluno' ? 'role-aluno' : 'role-admin']">
                  {{ user.role === 'admin' ? 'Administrador' : (user.role === 'admin_restrito' ? 'Adm Restrito' : 'Aluno') }}
                </span>
                
                <button 
                  v-if="userRole === 'admin' || (userRole === 'admin_restrito' && user.role === 'aluno')" 
                  @click="confirmarRemocao(user)" 
                  class="btn-del-mini" 
                  title="Excluir Usuário"
                >
                  <Trash2 :size="18" />
                </button>
              </div>
            </div>
            
            <div v-if="usuarios.length === 0" class="empty-msg">
              <Inbox :size="40" class="opacity-20" />
              <p>Nenhum usuário atende a esses filtros.</p>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div v-if="mostrarModalExclusao" class="modal-overlay" @click.self="cancelarRemocao">
      <div class="glass-card modal-content delete-modal">
        <div class="delete-icon-wrapper">
          <AlertTriangle :size="40" />
        </div>
        <h3>Excluir Usuário?</h3>
        <p>Tem certeza que deseja apagar o usuário <strong>{{ userParaExcluir?.nome }}</strong>?<br>Todo o progresso de aulas dele será perdido e esta ação é irreversível.</p>
        <div class="modal-actions-row">
          <button @click="cancelarRemocao" class="btn-cancel flex-1">Cancelar</button>
          <button @click="executarRemocao" class="btn-primary btn-danger flex-1">Sim, Excluir</button>
        </div>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { UserPlus, UserCheck, Users, Mail, Trash2, Inbox, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const userRole = ref(localStorage.getItem('userRole') || 'aluno');

const usuarios = ref([]);
const form = ref({ nome: '', email: '', password: '', role: 'aluno', turma: '' });

const filtros = ref({
  busca: '',
  dataInicio: '',
  dataFim: ''
});

// Estado para o Modal de Exclusão
const mostrarModalExclusao = ref(false);
const userParaExcluir = ref(null);

// Sistema de Notificações
const mensagemFeedback = ref('');
const tipoFeedback = ref('');
const mostrarMensagem = (msg, tipo = 'success') => {
  mensagemFeedback.value = msg;
  tipoFeedback.value = tipo;
  setTimeout(() => { mensagemFeedback.value = ''; }, 4000);
};

const carregarUsuarios = async () => {
  try {
    const res = await api.get('/admin/usuarios', { params: filtros.value });
    usuarios.value = res.data;
  } catch (error) {
    console.error('Erro ao carregar usuários');
  }
};

const salvarUsuario = async () => {
  try {
    await api.post('/auth/register', form.value);
    form.value = { nome: '', email: '', password: '', role: 'aluno', turma: '' };
    mostrarMensagem('Usuário cadastrado com sucesso!');
    carregarUsuarios();
  } catch (error) {
    mostrarMensagem('Erro ao cadastrar: ' + (error.response?.data?.msg || 'Verifique os dados'), 'error');
  }
};

// ==========================================
// LÓGICA DO NOVO MODAL DE EXCLUSÃO
// ==========================================
const confirmarRemocao = (user) => {
  userParaExcluir.value = user;
  mostrarModalExclusao.value = true;
};

const cancelarRemocao = () => {
  mostrarModalExclusao.value = false;
  userParaExcluir.value = null;
};

const executarRemocao = async () => {
  if (!userParaExcluir.value) return;
  try {
    await api.delete(`/usuarios/${userParaExcluir.value._id}`);
    carregarUsuarios();
    mostrarMensagem("Usuário excluído com sucesso.");
  } catch (error) {
    mostrarMensagem("Erro ao excluir usuário.", "error");
  } finally {
    cancelarRemocao();
  }
};
// ==========================================

const formatarData = (dataIso) => {
  if (!dataIso) return 'Data não disponível';
  return new Date(dataIso).toLocaleDateString('pt-BR');
};

onMounted(carregarUsuarios);
</script>

<style scoped>
.layout-split { display: grid; grid-template-columns: 380px 1fr; gap: 30px; align-items: start; }
.list-section { display: flex; flex-direction: column; gap: 20px; }
.glass-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0, 74, 173, 0.05); }
.search-bar { padding: 20px 25px; }

/* FEEDBACK TOAST */
.feedback-toast { display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-radius: 12px; margin-bottom: 20px; font-weight: 700; font-size: 0.9rem; animation: slideDown 0.3s ease-out; }
.feedback-toast.success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.feedback-toast.error { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

.text-brand { color: #004aad; }
.mt-4 { margin-top: 1rem; }
.mt-1 { margin-top: 0.25rem; }
.flex-2 { flex: 2; }
.block { display: block; }
.text-gray-400 { color: #94a3b8; }
.text-gray-500 { color: #64748b; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 5px; display: block;}

.form-title { margin-bottom: 25px; color: #1e293b; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }

.modern-form label { display: block; font-size: 0.8rem; font-weight: 700; color: #64748b; margin: 15px 0 5px; text-transform: uppercase; }
.modern-form input, .modern-form select, .search-bar input { 
  width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; 
  background: #f8fafc; font-size: 0.95rem; color: #1e293b; transition: 0.2s; box-sizing: border-box;
}
.modern-form input:focus, .modern-form select:focus, .search-bar input:focus { outline: none; border-color: #004aad; box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1); background: white; }

.form-row { display: flex; gap: 15px; width: 100%; align-items: flex-end; margin-bottom: 15px; }
.form-group-col { flex: 1; display: flex; flex-direction: column; }

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
.turma-badge { background: #f8fafc; color: #475569; font-size: 0.7rem; font-weight: 700; padding: 6px 10px; border-radius: 8px; border: 1px solid #e2e8f0; }

.btn-del-mini { background: transparent; border: none; padding: 10px; border-radius: 10px; cursor: pointer; color: #94a3b8; transition: 0.2s; }
.btn-del-mini:hover { color: #ef4444; background: #fef2f2; }

.empty-msg { text-align: center; padding: 40px; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 10px; }

/* MODAL DE EXCLUSÃO */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
.modal-content { max-width: 400px; width: 90%; padding: 30px; }
.delete-modal { text-align: center; }
.delete-icon-wrapper { display: flex; justify-content: center; color: #ef4444; margin-bottom: 15px; }
.delete-modal h3 { font-size: 1.4rem; color: #1e293b; font-weight: 800; margin-bottom: 10px; }
.delete-modal p { color: #64748b; font-size: 0.95rem; margin-bottom: 25px; line-height: 1.5; }
.modal-actions-row { display: flex; gap: 15px; }
.flex-1 { flex: 1; }
.btn-cancel { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; padding: 14px; border-radius: 14px; font-weight: 700; cursor: pointer; text-align: center; }
.btn-cancel:hover { background: #e2e8f0; }
.btn-danger { background-color: #ef4444 !important; border: none; margin-top: 0; }
.btn-danger:hover { background-color: #dc2626 !important; }

@media (max-width: 992px) {
  .layout-split { grid-template-columns: 1fr; gap: 20px; }
  .form-row { flex-direction: column; gap: 15px; }
  .glass-card { padding: 20px; }
  .header-row, .servico-header, .card-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .item-actions-wrapper, .item-actions { align-items: flex-start; margin-top: 15px; width: 100%; }
}
</style>