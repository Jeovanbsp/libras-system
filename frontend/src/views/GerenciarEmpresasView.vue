<template>
  <MainLayout pageTitle="Gerenciar Empresas Solicitantes" pageDescription="Controle as empresas que solicitam serviços.">
    
    <div class="empresas-container">
      
      <!-- BOTÃO ADICIONAR -->
      <div class="header-actions">
        <button @click="abrirModalNova" class="btn-adicionar">
          <Plus :size="20" /> Adicionar Nova Empresa
        </button>
      </div>

      <!-- TABELA DE EMPRESAS -->
      <div class="table-section glass-card">
        <h3 class="table-title">
          <Building2 :size="20" /> Empresas Solicitantes
        </h3>
        
        <div class="table-responsive">
          <table class="main-table">
            <thead>
              <tr class="header-row">
                <th>Nome</th>
                <th>Sigla</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Contato</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="empresa in empresas" :key="empresa._id" class="data-row">
                <td class="nome">{{ empresa.nome }}</td>
                <td class="sigla">{{ empresa.sigla || '-' }}</td>
                <td class="email">{{ empresa.email || '-' }}</td>
                <td>{{ empresa.telefone || '-' }}</td>
                <td>{{ empresa.contato || '-' }}</td>
                <td>
                  <span :class="['badge-status', { 'ativo': empresa.ativo, 'inativo': !empresa.ativo }]">
                    {{ empresa.ativo ? 'Ativa' : 'Inativa' }}
                  </span>
                </td>
                <td class="acoes">
                  <button @click="editarEmpresa(empresa)" class="btn-edit" title="Editar">
                    <Edit2 :size="16" />
                  </button>
                  <button @click="toggleStatus(empresa)" class="btn-toggle" :title="empresa.ativo ? 'Desativar' : 'Ativar'">
                    <Eye v-if="empresa.ativo" :size="16" />
                    <EyeOff v-else :size="16" />
                  </button>
                  <button @click="deletarEmpresa(empresa._id)" class="btn-delete" title="Deletar">
                    <Trash2 :size="16" />
                  </button>
                </td>
              </tr>
              <tr v-if="empresas.length === 0" class="no-data">
                <td colspan="7" style="text-align: center; padding: 40px; color: #94a3b8;">
                  Nenhuma empresa cadastrada
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL DE NOVO/EDITAR EMPRESA -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content glass-card">
        <div class="modal-header">
          <h3>{{ modoEdicao ? 'Editar Empresa' : 'Nova Empresa Solicitante' }}</h3>
          <button @click="fecharModal" class="btn-close">
            <X :size="24" />
          </button>
        </div>

        <form @submit.prevent="salvarEmpresa" class="modal-form">
          
          <div class="form-grid">
            <div class="form-group full">
              <label>Nome da Empresa*</label>
              <input v-model="formulario.nome" type="text" placeholder="Ex: SINDAUTO" required />
            </div>

            <div class="form-group">
              <label>Sigla</label>
              <input v-model="formulario.sigla" type="text" placeholder="Ex: SDA" maxlength="10" />
            </div>

            <div class="form-group">
              <label>E-mail</label>
              <input v-model="formulario.email" type="email" placeholder="empresa@example.com" />
            </div>

            <div class="form-group">
              <label>Telefone</label>
              <input v-model="formulario.telefone" type="tel" placeholder="(11) 9999-9999" />
            </div>

            <div class="form-group full">
              <label>Pessoa de Contato</label>
              <input v-model="formulario.contato" type="text" placeholder="Nome do responsável" />
            </div>

            <div class="form-group full">
              <label>Endereço</label>
              <input v-model="formulario.endereco" type="text" placeholder="Rua, número, cidade" />
            </div>

            <div class="form-group full">
              <label>Descrição</label>
              <textarea v-model="formulario.descricao" placeholder="Informações adicionais sobre a empresa" rows="3"></textarea>
            </div>

            <div class="form-group checkbox">
              <input v-model="formulario.ativo" type="checkbox" id="ativo" />
              <label for="ativo">Empresa Ativa</label>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="fecharModal" class="btn-cancel">Cancelar</button>
            <button type="submit" class="btn-save">
              {{ modoEdicao ? 'Atualizar Empresa' : 'Criar Empresa' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';
import { Plus, Building2, Edit2, Eye, EyeOff, Trash2, X } from 'lucide-vue-next';

const empresas = ref([]);
const mostrarModal = ref(false);
const modoEdicao = ref(false);
const idEdicao = ref(null);

const formulario = ref({
  nome: '',
  sigla: '',
  email: '',
  telefone: '',
  endereco: '',
  contato: '',
  ativo: true,
  descricao: ''
});

const abrirModalNova = () => {
  modoEdicao.value = false;
  formulario.value = {
    nome: '',
    sigla: '',
    email: '',
    telefone: '',
    endereco: '',
    contato: '',
    ativo: true,
    descricao: ''
  };
  mostrarModal.value = true;
};

const editarEmpresa = (empresa) => {
  modoEdicao.value = true;
  idEdicao.value = empresa._id;
  formulario.value = { ...empresa };
  mostrarModal.value = true;
};

const fecharModal = () => {
  mostrarModal.value = false;
  modoEdicao.value = false;
  idEdicao.value = null;
};

const salvarEmpresa = async () => {
  try {
    if (modoEdicao.value && idEdicao.value) {
      await api.put(`/empresas-solicitantes/${idEdicao.value}`, formulario.value);
      alert('Empresa atualizada com sucesso!');
    } else {
      await api.post('/empresas-solicitantes', formulario.value);
      alert('Empresa criada com sucesso!');
    }
    
    await carregarEmpresas();
    fecharModal();
  } catch (error) {
    console.error('Erro ao salvar:', error);
    alert('Erro ao salvar empresa: ' + error.response?.data?.error || error.message);
  }
};

const deletarEmpresa = async (id) => {
  if (confirm('Tem certeza que deseja deletar esta empresa?\n\nEsta ação não poderá ser desfeita!')) {
    try {
      await api.delete(`/empresas-solicitantes/${id}`);
      alert('Empresa deletada com sucesso!');
      await carregarEmpresas();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar empresa: ' + error.response?.data?.error || error.message);
    }
  }
};

const toggleStatus = async (empresa) => {
  try {
    await api.patch(`/empresas-solicitantes/${empresa._id}/status`, {
      ativo: !empresa.ativo
    });
    alert(`Empresa ${!empresa.ativo ? 'ativada' : 'desativada'} com sucesso!`);
    await carregarEmpresas();
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    alert('Erro ao atualizar status: ' + error.response?.data?.error || error.message);
  }
};

const carregarEmpresas = async () => {
  try {
    const res = await api.get('/empresas-solicitantes');
    empresas.value = res.data;
  } catch (error) {
    console.error('Erro ao carregar empresas:', error);
    alert('Erro ao carregar empresas');
  }
};

onMounted(async () => {
  await carregarEmpresas();
});
</script>

<style scoped>
* { 
  box-sizing: border-box; 
}

.empresas-container { 
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 0; 
}

.glass-card { 
  background: white; 
  border-radius: 16px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); 
  padding: 24px; 
}

.header-actions { 
  margin-bottom: 24px; 
}

.btn-adicionar {
  background: #059669;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.2s;
  font-size: 0.95rem;
}

.btn-adicionar:hover {
  background: #047857;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.table-section { 
  margin-top: 24px; 
}

.table-title {
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  color: #0f172a;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-responsive { 
  overflow-x: auto; 
}

.main-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.header-row {
  background: linear-gradient(90deg, #1e3a8a 0%, #1e40af 100%);
}

.header-row th {
  padding: 12px;
  text-align: left;
  color: white;
  font-weight: 700;
}

.data-row {
  border-bottom: 1px solid #e2e8f0;
}

.data-row:hover {
  background: #f8fafc;
}

.data-row td {
  padding: 12px;
}

.nome { 
  font-weight: 600; 
  color: #0f172a; 
}

.sigla { 
  text-align: center; 
  font-weight: 700; 
}

.email { 
  font-size: 0.85rem; 
  color: #64748b; 
}

.badge-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
}

.badge-status.ativo {
  background: #ecfdf5;
  color: #059669;
}

.badge-status.inativo {
  background: #fee2e2;
  color: #dc2626;
}

.acoes {
  text-align: center;
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-edit,
.btn-toggle,
.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.btn-edit:hover { 
  background: #dbeafe; 
  color: #0284c7; 
}

.btn-toggle:hover { 
  background: #fef3c7; 
  color: #d97706; 
}

.btn-delete:hover { 
  background: #fee2e2; 
  color: #dc2626; 
}

.no-data td { 
  padding: 40px 12px; 
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #0f172a;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #1e293b;
}

.modal-form {
  padding: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-group.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.form-group.checkbox input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin: 0;
}

.form-group.checkbox label {
  margin: 0;
  font-weight: 600;
  cursor: pointer;
}

.form-group label {
  font-weight: 700;
  font-size: 0.85rem;
  color: #475569;
  margin: 0;
}

.form-group input,
.form-group textarea {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  color: #1e293b;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #cbd5e1;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #004aad;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1);
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  border-top: 2px solid #e2e8f0;
  padding-top: 20px;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
  font-size: 0.95rem;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-save {
  background: #004aad;
  color: white;
}

.btn-save:hover {
  background: #003a8c;
}

@media (max-width: 768px) {
  .glass-card { 
    padding: 16px; 
  }
  
  .main-table { 
    font-size: 0.8rem; 
  }
  
  .main-table th, 
  .main-table td { 
    padding: 8px; 
  }
  
  .modal-content { 
    max-width: 95%; 
  }
  
  .form-grid { 
    grid-template-columns: 1fr; 
  }
  
  .acoes {
    flex-direction: row;
  }
}

@media (max-width: 480px) {
  .main-table { 
    font-size: 0.7rem; 
  }
  
  .main-table th, 
  .main-table td { 
    padding: 6px; 
  }
  
  .modal-content { 
    max-width: 98%; 
    max-height: 98vh; 
  }
  
  .form-grid { 
    grid-template-columns: 1fr; 
    gap: 10px;
  }
  
  .btn-adicionar {
    width: 100%;
    justify-content: center;
  }
}
</style>