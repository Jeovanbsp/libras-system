<template>
  <MainLayout pageTitle="Parceiros Corporativos" pageDescription="Gerencie empresas, contratos de tradução audiovisual e eventos corporativos.">
    <div class="layout-split">
      
      <div class="glass-card side-form">
        <h3 class="form-title">
          <Building2 :size="20" class="text-brand-color" /> Nova Empresa
        </h3>
        <form @submit.prevent="cadastrar" class="modern-form scrollable-form">
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

          <button type="submit" class="btn-primary">
            <Save :size="18" /> Cadastrar Parceiro
          </button>
        </form>
      </div>

      <div class="glass-card list-box">
        <h3 class="form-title">
          <Briefcase :size="20" class="text-brand-color" /> Carteira de Parceiros
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
            <div class="item-actions">
              <button @click="remover(cliente._id)" class="btn-del-mini" title="Excluir Empresa">
                <Trash2 :size="18" />
              </button>
            </div>
          </div>
          
          <div v-if="clientes.length === 0" class="empty-msg">
            <Inbox :size="40" class="opacity-20" />
            <p>Nenhum parceiro corporativo cadastrado ainda.</p>
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
  Trash2, Inbox, MessageCircle, Info, Save 
} from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const clientes = ref([]);
const listaServicos = ['Eventos Presenciais', 'Eventos Virtuais', 'Tradução Audiovisual', 'Legendagem', 'Consultoria'];

const form = ref({
  razaoSocial: '',
  cnpj: '',
  nomeContato: '',
  email: '',
  whatsapp: '',
  status: 'Prospeto',
  servicosInteresse: [],
  observacoes: ''
});

const carregar = async () => {
  try {
    const res = await api.get('/b2b');
    clientes.value = res.data;
  } catch (error) {
    console.error("Erro ao carregar parceiros B2B:", error);
  }
};

const cadastrar = async () => {
  try {
    await api.post('/b2b', form.value);
    form.value = { 
      razaoSocial: '', cnpj: '', nomeContato: '', email: '', 
      whatsapp: '', status: 'Prospeto', servicosInteresse: [], observacoes: '' 
    };
    carregar();
  } catch (error) {
    alert('Erro ao cadastrar: ' + (error.response?.data?.message || 'Verifique os dados.'));
  }
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
.glass-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05); }
.form-title { margin-bottom: 25px; color: #1e293b; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
.text-brand-color { color: #004aad; }

.modern-form label { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; margin: 15px 0 8px; text-transform: uppercase; }
.modern-form input, .modern-form select, .modern-form textarea { 
  width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; 
  background: #f8fafc; font-size: 0.95rem; color: #1e293b; box-sizing: border-box; font-family: inherit;
}
.modern-form input:focus { outline: none; border-color: #004aad; box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1); background: white; }

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

.btn-primary { 
  width: 100%; background: #004aad; color: white; border: none; padding: 16px; border-radius: 14px; 
  margin-top: 25px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
}
.btn-primary:hover { background: #003a8c; transform: translateY(-2px); }

.b2b-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 22px 0; border-bottom: 1px solid #f1f5f9; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; width: 100%; }
.contact-info { display: flex; flex-wrap: wrap; gap: 15px; font-size: 0.85rem; color: #64748b; margin-bottom: 12px; }
.info-tag { display: flex; align-items: center; gap: 5px; }
.whatsapp-link { color: #059669; text-decoration: none; font-weight: 600; }
.whatsapp-link:hover { text-decoration: underline; }

.tag-badge { background: #eff6ff; color: #004aad; font-size: 0.65rem; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; }
.status-badge { font-size: 0.7rem; font-weight: 800; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; }
.status-ativo { background: #ecfdf5; color: #059669; }
.status-prospeto { background: #fffbeb; color: #d97706; }
.status-inativo { background: #fef2f2; color: #dc2626; }

.obs-box { margin-top: 12px; background: #f8fafc; border-left: 3px solid #004aad; padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; color: #475569; display: flex; align-items: flex-start; gap: 6px; }

.btn-del-mini { background: transparent; border: none; padding: 8px; border-radius: 10px; cursor: pointer; color: #94a3b8; transition: 0.2s; }
.btn-del-mini:hover { background: #fee2e2; color: #ef4444; }

.empty-msg { text-align: center; padding: 40px; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.scrollable-form { max-height: 80vh; overflow-y: auto; padding-right: 10px; }
.scrollable-form::-webkit-scrollbar { width: 5px; }
.scrollable-form::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>