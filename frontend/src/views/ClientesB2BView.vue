<template>
  <MainLayout pageTitle="Clientes B2B" pageDescription="Gerencie empresas, contratos de tradução audiovisual e eventos corporativos.">
    <div class="layout-split">
      
      <div class="glass-card side-form">
        <h3 class="form-title">
          <span class="icon-badge">🏢</span> Nova Empresa
        </h3>
        <form @submit.prevent="cadastrar" class="modern-form">
          <div class="form-group">
            <label>Razão Social / Nome da Empresa</label>
            <input v-model="form.razaoSocial" placeholder="Ex: Tech Solutions LTDA" required />
          </div>

          <div class="form-row">
            <div>
              <label>CNPJ</label>
              <input v-model="form.cnpj" placeholder="00.000.000/0000-00" required />
            </div>
            <div>
              <label>Status</label>
              <select v-model="form.status">
                <option value="Prospeto">Prospeto (Negociando)</option>
                <option value="Ativo">Cliente Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Pessoa de Contato & E-mail</label>
            <div class="input-stacked">
              <input v-model="form.nomeContato" placeholder="Nome do responsável (Ex: Carlos)" required style="margin-bottom: 8px;" />
              <input v-model="form.email" type="email" placeholder="E-mail corporativo" required />
            </div>
          </div>

          <div class="form-group">
            <label>Serviços de Interesse</label>
            <div class="checkbox-grid">
              <label v-for="servico in listaServicos" :key="servico" class="checkbox-label">
                <input type="checkbox" :value="servico" v-model="form.servicosInteresse" />
                {{ servico }}
              </label>
            </div>
          </div>

          <button type="submit" class="btn-primary">Cadastrar Empresa</button>
        </form>
      </div>

      <div class="glass-card list-box">
        <h3 class="form-title">
          <span class="icon-badge">📋</span> Carteira de Clientes
        </h3>
        <div class="b2b-list">
          <div v-for="cliente in clientes" :key="cliente._id" class="b2b-item">
            <div class="item-main">
              <div class="header-row">
                <strong>{{ cliente.razaoSocial }}</strong>
                <span :class="['status-badge', statusClass(cliente.status)]">{{ cliente.status }}</span>
              </div>
              
              <div class="contact-info">
                <span>👤 {{ cliente.nomeContato }}</span>
                <span>✉️ {{ cliente.email }}</span>
                <span>📄 {{ cliente.cnpj }}</span>
              </div>
              
              <div class="tags-container">
                <span v-for="servico in cliente.servicosInteresse" :key="servico" class="tag-badge">
                  {{ servico }}
                </span>
              </div>
            </div>
            <div class="item-actions">
              <button @click="remover(cliente._id)" class="btn-del-mini" title="Excluir Empresa">🗑️</button>
            </div>
          </div>
          
          <div v-if="clientes.length === 0" class="empty-msg">
            Nenhum cliente corporativo cadastrado ainda.
          </div>
        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const clientes = ref([]);
const listaServicos = ['Eventos Presenciais', 'Eventos Virtuais', 'Tradução Audiovisual', 'Legendagem', 'Consultoria'];

const form = ref({
  razaoSocial: '',
  cnpj: '',
  nomeContato: '',
  email: '',
  status: 'Prospeto',
  servicosInteresse: []
});

const carregar = async () => {
  try {
    const res = await api.get('/b2b');
    clientes.value = res.data;
  } catch (error) {
    console.error("Erro ao carregar clientes B2B:", error);
  }
};

const cadastrar = async () => {
  try {
    await api.post('/b2b', form.value);
    // Limpar formulário após sucesso
    form.value = { razaoSocial: '', cnpj: '', nomeContato: '', email: '', status: 'Prospeto', servicosInteresse: [] };
    carregar();
  } catch (error) {
    alert('Erro ao cadastrar: ' + (error.response?.data?.message || 'Verifique os dados. O CNPJ deve ser único.'));
  }
};

const remover = async (id) => {
  if (confirm("Deseja realmente remover esta empresa do sistema?")) {
    try {
      await api.delete(`/b2b/${id}`);
      carregar();
    } catch (error) {
      alert("Erro ao excluir cliente.");
    }
  }
};

// Função para dar cor à badge de status
const statusClass = (status) => {
  if (status === 'Ativo') return 'status-ativo';
  if (status === 'Prospeto') return 'status-prospeto';
  return 'status-inativo';
};

onMounted(carregar);
</script>

<style scoped>
/* ESTRUTURA ORIGINAL COM CORES AZUIS E DESIGN MODERNO */
.layout-split { display: grid; grid-template-columns: 380px 1fr; gap: 30px; align-items: start; }

.glass-card { 
  background: white; 
  padding: 30px; 
  border-radius: 24px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05); 
}

.form-title { 
  margin-bottom: 25px; 
  color: #1e293b; 
  font-size: 1.2rem; 
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-badge {
  background: #eff6ff; 
  padding: 8px;
  border-radius: 10px;
  font-size: 1rem;
}

/* FORMULÁRIO */
.modern-form label { display: block; font-size: 0.8rem; font-weight: 700; color: #64748b; margin: 15px 0 5px; text-transform: uppercase; letter-spacing: 0.5px; }

.modern-form input, .modern-form select { 
  width: 100%; 
  padding: 14px; 
  border: 1px solid #e2e8f0; 
  border-radius: 12px; 
  background: #f8fafc; 
  font-size: 0.95rem;
  color: #1e293b;
  font-weight: 500;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.modern-form input:focus, .modern-form select:focus {
  outline: none;
  border-color: #1e40af;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.15);
  background: white;
}

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

/* CHECKBOXES */
.checkbox-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem !important;
  color: #1e293b !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
  margin: 0 !important;
  cursor: pointer;
}

.checkbox-label input { width: 18px; height: 18px; accent-color: #1e40af; cursor: pointer; }

/* BOTÃO PRINCIPAL */
.btn-primary { 
  width: 100%; 
  background: #1e40af; 
  color: white; 
  border: none; 
  padding: 16px; 
  border-radius: 14px; 
  margin-top: 25px; 
  font-weight: bold; 
  font-size: 1rem;
  cursor: pointer; 
  transition: all 0.3s; 
}
.btn-primary:hover { 
  background: #1e3a8a; 
  transform: translateY(-2px); 
  box-shadow: 0 8px 20px rgba(30, 64, 175, 0.25);
}

/* LISTA DE CLIENTES B2B */
.b2b-list { display: flex; flex-direction: column; }
.b2b-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 0; border-bottom: 1px solid #f1f5f9; transition: background 0.2s; }
.b2b-item:hover { background: #f8fafc; border-radius: 12px; padding: 20px 10px; margin: 0 -10px; }

.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; width: 100%; gap: 15px;}
.header-row strong { color: #1e293b; font-size: 1.1rem; }

.contact-info { display: flex; flex-wrap: wrap; gap: 15px; font-size: 0.85rem; color: #64748b; margin-bottom: 12px; font-weight: 500;}

.tags-container { display: flex; flex-wrap: wrap; gap: 6px; }
.tag-badge { background: #eff6ff; color: #1e40af; font-size: 0.65rem; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; }

/* BADGES DE STATUS */
.status-badge { font-size: 0.7rem; font-weight: 800; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
.status-ativo { background: #ecfdf5; color: #059669; }
.status-prospeto { background: #fffbeb; color: #d97706; }
.status-inativo { background: #fef2f2; color: #dc2626; }

.item-actions { margin-left: 15px; }
.btn-del-mini { background: transparent; border: none; padding: 8px; border-radius: 10px; cursor: pointer; transition: 0.2s; opacity: 0.5; filter: grayscale(1); }
.b2b-item:hover .btn-del-mini { opacity: 1; filter: grayscale(0); }
.btn-del-mini:hover { background: #fee2e2; }

.empty-msg { text-align: center; padding: 40px; color: #94a3b8; font-weight: 500; }
</style>