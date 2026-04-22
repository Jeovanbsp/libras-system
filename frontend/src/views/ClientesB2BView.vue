<template>
  <MainLayout pageTitle="Parceiros Corporativos" pageDescription="Gerencie empresas, contratos de tradução audiovisual e eventos corporativos.">
    <div class="layout-split">
      
      <div class="glass-card side-form">
        <h3 class="form-title">
          <Building2 v-if="!editandoId" :size="20" class="text-brand-color" />
          <Edit2 v-else :size="20" class="text-brand-color" />
          {{ editandoId ? 'Editar Empresa' : 'Nova Empresa' }}
        </h3>
        <form @submit.prevent="salvar" class="modern-form scrollable-form">
          <div class="form-group">
            <label>Razão Social / Nome da Empresa</label>
            <input v-model="form.razaoSocial" placeholder="Ex: Tech Solutions LTDA" required />
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>CNPJ</label>
              <input v-model="form.cnpj" placeholder="00.000.000/0000-00" required />
            </div>
            <div class="form-group-col">
              <label>Status</label>
              <select v-model="form.status">
                <option value="Prospeto">Prospeto (Negociando)</option>
                <option value="Ativo">Parceiro Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Pessoa de Contato</label>
            <input v-model="form.nomeContato" placeholder="Nome do responsável (Ex: Carlos)" required />
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>E-mail Corporativo</label>
              <input v-model="form.email" type="email" placeholder="empresa@email.com" required />
            </div>
            <div class="form-group-col">
              <label>WhatsApp (Opcional)</label>
              <input v-model="form.whatsapp" placeholder="(71) 90000-0000" />
            </div>
          </div>

          <!-- Preço por Hora - Apenas para admin completo -->
          <div v-if="userRole === 'admin'" class="form-group">
            <label>Preço por Hora Praticado (R$)</label>
            <input v-model.number="form.precoHora" type="number" step="0.01" placeholder="0.00" />
          </div>

          <div class="form-group">
            <label>Serviços de Interesse</label>
            <div class="checkbox-grid">
              <label v-for="servico in listaServicos" :key="servico" class="checkbox-label-card">
                <input type="checkbox" :value="servico" v-model="form.servicosInteresse" class="custom-checkbox" />
                <span class="checkbox-text">{{ servico }}</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Observações do Contrato (Opcional)</label>
            <textarea v-model="form.observacoes" placeholder="Ex: Faturamento mensal, exige nota fiscal eletrônica..." rows="3"></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary">
              <Save :size="18" /> {{ editandoId ? 'Salvar Alterações' : 'Cadastrar Parceiro' }}
            </button>
            <button v-if="editandoId" @click="cancelarEdicao" type="button" class="btn-cancel">
               <X :size="18" /> Cancelar
            </button>
          </div>
        </form>
      </div>

      <div class="list-section">
        <div class="glass-card search-bar">
          <div class="form-group" style="margin: 0;">
            <input v-model="filtros.busca" placeholder="Pesquisar cliente por nome ou CNPJ..." @input="carregar" class="w-full" />
          </div>
        </div>

        <div class="glass-card list-box mt-4">
          <h3 class="form-title">
            <Briefcase :size="20" class="text-brand-color" /> Carteira de Parceiros ({{ clientes.length }})
          </h3>
          <div class="b2b-list">
            <div v-for="cliente in clientes" :key="cliente._id" class="b2b-item">
              <div class="item-main">
                <div class="header-row">
                  <strong>{{ cliente.razaoSocial }}</strong>
                  <span :class="['status-badge', statusClass(cliente.status)]">{{ cliente.status }}</span>
                </div>
                
                <div class="contact-info">
                  <span class="info-tag"><User :size="14" /> {{ cliente.nomeContato }}</span>
                  <span class="info-tag"><Mail :size="14" /> {{ cliente.email }}</span>
                  <a v-if="cliente.whatsapp" :href="`https://wa.me/55${cliente.whatsapp.replace(/\D/g,'')}`" target="_blank" class="info-tag whatsapp-link">
                      <MessageCircle :size="14" /> WhatsApp
                  </a>
                  <span class="info-tag"><FileSpreadsheet :size="14" /> {{ cliente.cnpj }}</span>
                  <!-- Preço por Hora - Apenas para admin completo -->
                  <span v-if="userRole === 'admin' && cliente.precoHora" class="info-tag font-bold text-brand-color ml-2">
                    R$ {{ cliente.precoHora.toFixed(2) }}/h
                  </span>
                </div>
                
                <div class="tags-container">
                  <span v-for="servico in cliente.servicosInteresse" :key="servico" class="tag-badge">
                    {{ servico }}
                  </span>
                </div>

                <div v-if="cliente.observacoes" class="obs-box">
                  <Info :size="12" /> <span>{{ cliente.observacoes }}</span>
                </div>
              </div>
              <div class="item-actions-wrapper">
                <div class="action-buttons">
                  <button @click="prepararEdicao(cliente)" class="btn-edit-mini" title="Editar Empresa">
                    <Edit2 :size="18" />
                  </button>
                  <button @click="remover(cliente._id)" class="btn-del-mini" title="Excluir Empresa">
                    <Trash2 :size="18" />
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="clientes.length === 0" class="empty-msg">
              <Inbox :size="40" class="opacity-20" />
              <p>Nenhum parceiro corporativo encontrado.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  Building2, Briefcase, User, Mail, FileSpreadsheet, 
  Trash2, Inbox, MessageCircle, Info, Save, Edit2, X
} from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const userRole = ref(localStorage.getItem('userRole') || 'aluno');
const clientes = ref([]);
const listaServicos = ['Eventos Presenciais', 'Eventos Virtuais', 'Tradução Audiovisual', 'Legendagem', 'Consultoria'];

const filtros = ref({ busca: '' });
const editandoId = ref(null);

const formPadrao = {
  razaoSocial: '',
  cnpj: '',
  nomeContato: '',
  email: '',
  whatsapp: '',
  precoHora: null,
  status: 'Prospeto',
  servicosInteresse: [],
  observacoes: ''
};

const form = ref({ ...formPadrao });

const carregar = async () => {
  try {
    const res = await api.get('/b2b', { params: filtros.value });
    clientes.value = res.data;
  } catch (error) {
    console.error("Erro ao carregar parceiros B2B:", error);
  }
};

const salvar = async () => {
  try {
    if (editandoId.value) {
      await api.put(`/b2b/${editandoId.value}`, form.value);
      alert('Parceiro atualizado com sucesso!');
    } else {
      await api.post('/b2b', form.value);
      alert('Parceiro cadastrado com sucesso!');
    }
    cancelarEdicao();
    carregar();
  } catch (error) {
    alert('Erro ao salvar: ' + (error.response?.data?.message || 'Verifique os dados.'));
  }
};

const prepararEdicao = (cliente) => {
  editandoId.value = cliente._id;
  form.value = { ...cliente };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelarEdicao = () => {
  editandoId.value = null;
  form.value = { ...formPadrao };
};

const remover = async (id) => {
  if (confirm("Deseja realmente remover esta empresa do sistema?")) {
    try {
      await api.delete(`/b2b/${id}`);
      carregar();
    } catch (error) {
      alert("Erro ao excluir parceiro.");
    }
  }
};

const statusClass = (status) => {
  if (status === 'Ativo') return 'status-ativo';
  if (status === 'Prospeto') return 'status-prospeto';
  return 'status-inativo';
};

onMounted(carregar);
</script>

<style scoped>
.layout-split { display: grid; grid-template-columns: 380px 1fr; gap: 30px; align-items: start; }
.list-section { display: flex; flex-direction: column; gap: 20px; }
.glass-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05); }
.search-bar { padding: 20px 25px; }

.form-title { margin-bottom: 25px; color: #1e293b; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
.text-brand-color { color: #004aad; }
.font-bold { font-weight: bold; }
.ml-2 { margin-left: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.w-full { width: 100%; }

.modern-form label { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; margin: 15px 0 8px; text-transform: uppercase; }
.modern-form input, .modern-form select, .modern-form textarea, .search-bar input { 
  width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; 
  background: #f8fafc; font-size: 0.95rem; color: #1e293b; box-sizing: border-box; font-family: inherit;
}
.modern-form input:focus, .search-bar input:focus { outline: none; border-color: #004aad; box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1); background: white; }

.form-row { display: flex; gap: 15px; width: 100%; align-items: flex-end; margin-bottom: 15px; }
.form-group-col { flex: 1; display: flex; flex-direction: column; }

.checkbox-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
.checkbox-label-card {
  display: flex !important; flex-direction: row !important; align-items: center !important; gap: 10px !important;
  cursor: pointer; padding: 12px 15px; background: #f8fafc; border-radius: 12px; transition: 0.2s ease; border: 1px solid transparent; margin: 0 !important;
}
.checkbox-label-card:hover { background: #f1f5f9; border-color: #e2e8f0; }
.checkbox-text { font-size: 0.9rem !important; color: #1e293b !important; font-weight: 600 !important; text-transform: none !important; }
.custom-checkbox { width: 18px !important; height: 18px !important; accent-color: #004aad; cursor: pointer; flex-shrink: 0; }

.form-actions { display: flex; gap: 10px; margin-top: 25px; }
.btn-primary { 
  flex: 2; background: #004aad; color: white; border: none; padding: 16px; border-radius: 14px; 
  font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s;
}
.btn-primary:hover { background: #003a8c; transform: translateY(-2px); }
.btn-cancel { 
  flex: 1; background: #f1f5f9; color: #64748b; border: none; padding: 16px; border-radius: 14px; 
  font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; 
}
.btn-cancel:hover { background: #e2e8f0; color: #0f172a; }

.b2b-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 22px 0; border-bottom: 1px solid #f1f5f9; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; width: 100%; }
.contact-info { display: flex; flex-wrap: wrap; gap: 15px; font-size: 0.85rem; color: #64748b; margin-bottom: 12px; }
.info-tag { display: flex; align-items: center; gap: 5px; }
.whatsapp-link { color: #059669; text-decoration: none; font-weight: 600; }
.whatsapp-link:hover { text-decoration: underline; }

.tag-badge { background: #eff6ff; color: #004aad; font-size: 0.65rem; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; margin-right: 5px;}
.status-badge { font-size: 0.7rem; font-weight: 800; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; }
.status-ativo { background: #ecfdf5; color: #059669; }
.status-prospeto { background: #fffbeb; color: #d97706; }
.status-inativo { background: #fef2f2; color: #dc2626; }

.obs-box { margin-top: 12px; background: #f8fafc; border-left: 3px solid #004aad; padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; color: #475569; display: flex; align-items: flex-start; gap: 6px; }

.item-actions-wrapper { display: flex; flex-direction: column; align-items: flex-end; gap: 15px; }
.action-buttons { display: flex; gap: 8px; }

.btn-del-mini, .btn-edit-mini { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 10px; cursor: pointer; transition: 0.2s; }
.btn-del-mini { color: #94a3b8; }
.btn-del-mini:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }
.btn-edit-mini { color: #004aad; }
.btn-edit-mini:hover { background: #eff6ff; border-color: #bfdbfe; }

.empty-msg { text-align: center; padding: 40px; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.scrollable-form { max-height: 80vh; overflow-y: auto; padding-right: 10px; }
.scrollable-form::-webkit-scrollbar { width: 5px; }
.scrollable-form::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

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