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
              <option value="admin">Administrador (Sistema Completo)</option>
              <option value="admin_restrito">Administrador (Sem Acesso Financeiro)</option>
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
                <button @click="removerUsuario(user._id)" class="btn-del-mini" title="Excluir Usuário">
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
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { UserPlus, UserCheck, Users, Mail, Trash2, Inbox } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const usuarios = ref([]);
const form = ref({ nome: '', email: '', password: '', role: 'aluno', turma: '' });

const filtros = ref({
  busca: '',
  dataInicio: '',
  dataFim: ''
});

const carregarUsuarios = async () => {
  try {
    const res = await api.get('/admin/alunos', { params: filtros.value });
    usuarios.value = res.data;
  } catch (error) {
    console.error('Erro ao carregar usuários');
  }
};

const salvarUsuario = async () => {
  try {
    await api.post('/auth/register', form.value);
    form.value = { nome: '', email: '', password: '', role: 'aluno', turma: '' };
    alert('Usuário cadastrado com sucesso!');
    carregarUsuarios();
  } catch (error) {
    alert('Erro ao cadastrar: ' + (error.response?.data?.msg || 'Verifique os dados'));
  }
};

const removerUsuario = async (id) => {
  if (confirm("Deseja realmente apagar este usuário? Todo o progresso de aulas dele será perdido.")) {
    try {
      await api.delete(`/usuarios/${id}`);
      carregarUsuarios();
    } catch (error) {
      alert("Erro ao excluir usuário.");
    }
  }
};

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
/* =========================================
   RESPONSIVIDADE MOBILE PARA AS TELAS
   ========================================= */
@media (max-width: 992px) {
  /* Transforma a grelha de 2 colunas numa grelha de 1 coluna */
  .layout-split { 
    grid-template-columns: 1fr; 
    gap: 20px; 
  }
  
  /* Empilha os campos de formulário que estavam lado a lado */
  .form-row { 
    flex-direction: column; 
    gap: 15px; 
  }
  
  /* Ajusta o padding dos cartões para ecrãs pequenos */
  .glass-card { 
    padding: 20px; 
  }

  /* Ajusta cabeçalhos internos */
  .header-row, .servico-header, .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  /* Faz com que os botões de ação ocupem a largura toda se necessário */
  .item-actions-wrapper, .item-actions {
    align-items: flex-start;
    margin-top: 15px;
    width: 100%;
  }
}
</style>