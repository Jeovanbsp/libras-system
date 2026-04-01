<template>
  <MainLayout pageTitle="Gestão de Profissionais" pageDescription="Gerencie intérpretes e professores cadastrados no sistema.">
    <div class="layout-split">
      
      <div class="glass-card side-form">
        <h3 class="form-title">
          <UserPlus v-if="!editandoId" :size="20" class="text-brand" /> 
          <Edit2 v-else :size="20" class="text-brand" /> 
          {{ editandoId ? 'Editar Profissional' : 'Novo Profissional' }}
        </h3>
        
        <form @submit.prevent="salvar" class="modern-form scrollable-form">
          <div class="form-group">
            <label>Nome Completo</label>
            <input v-model="form.nome" placeholder="Ex: João da Silva" required />
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>CPF</label>
              <input v-model="form.cpf" placeholder="000.000.000-00" />
            </div>
            <div class="form-group-col">
              <label>RG</label>
              <input v-model="form.rg" placeholder="00.000.000-00" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>E-mail de Contato</label>
              <input v-model="form.email" type="email" placeholder="joao@email.com" required />
            </div>
            <div class="form-group-col">
              <label>WhatsApp (Opcional)</label>
              <input v-model="form.whatsapp" placeholder="(71) 90000-0000" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>Chave PIX</label>
              <input v-model="form.pix" placeholder="CPF, E-mail, Celular..." />
            </div>
            <div class="form-group-col">
              <label>Valor da Hora (R$)</label>
              <input v-model.number="form.valorHora" type="number" step="0.01" placeholder="0.00" required />
            </div>
          </div>

          <div class="form-group">
            <label>Disponibilidade</label>
            <select v-model="form.disponibilidade" required class="modern-select">
              <option value="Manhãs">Manhãs</option>
              <option value="Tardes">Tardes</option>
              <option value="Noites">Noites</option>
              <option value="Integral">Integral</option>
            </select>
          </div>

          <div class="form-group">
            <label>Especialidades de Atuação</label>
            <div class="checkbox-grid">
              <label v-for="esp in listaEspecialidades" :key="esp" class="checkbox-label-card">
                <input type="checkbox" :value="esp" v-model="form.especialidades" class="custom-checkbox" />
                <span class="checkbox-text">{{ esp }}</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Observações Adicionais (Opcional)</label>
            <textarea v-model="form.observacoes" placeholder="Ex: Possui certificação Prolibras..." rows="3"></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary">
              <Save :size="18" /> {{ editandoId ? 'Atualizar Dados' : 'Cadastrar Especialista' }}
            </button>
            <button v-if="editandoId" type="button" @click="cancelarEdicao" class="btn-secondary">
              <X :size="18" /> Cancelar
            </button>
          </div>
        </form>
      </div>

      <div class="list-section">
        
        <div class="glass-card search-bar">
          <div class="form-row" style="margin-bottom: 0;">
            <div class="form-group-col">
              <input v-model="filtros.nome" placeholder="Buscar por nome..." @input="carregar" />
            </div>
            <div class="form-group-col">
              <select v-model="filtros.especialidade" @change="carregar" class="modern-select">
                <option value="">Todas Especialidades</option>
                <option v-for="esp in listaEspecialidades" :key="esp" :value="esp">{{ esp }}</option>
              </select>
            </div>
            <div class="form-group-col">
              <select v-model="filtros.disponibilidade" @change="carregar" class="modern-select">
                <option value="">Qualquer Disponibilidade</option>
                <option value="Manhãs">Manhãs</option>
                <option value="Tardes">Tardes</option>
                <option value="Noites">Noites</option>
                <option value="Integral">Integral</option>
              </select>
            </div>
          </div>
        </div>

        <div class="glass-card list-box mt-4">
          <h3 class="form-title">
            <Users :size="20" class="text-brand" /> Especialistas Encontrados ({{ profissionais.length }})
          </h3>
          
          <div class="pro-list">
            <div v-for="pro in profissionais" :key="pro._id" class="pro-item">
              <div class="item-main">
                <div class="header-name">
                  <strong>{{ pro.nome }}</strong>
                  <div class="contact-links">
                    <span class="info-tag"><Mail :size="12" /> {{ pro.email }}</span>
                    <a v-if="pro.whatsapp" :href="`https://wa.me/55${pro.whatsapp.replace(/\D/g,'')}`" target="_blank" class="info-tag whatsapp-link">
                      <MessageCircle :size="12" /> WhatsApp
                    </a>
                  </div>
                </div>
                
                <div class="docs-container" v-if="pro.cpf || pro.pix">
                  <span class="doc-badge" v-if="pro.cpf">CPF: {{ pro.cpf }}</span>
                  <span class="doc-badge" v-if="pro.pix">PIX: {{ pro.pix }}</span>
                  <span class="doc-badge disp-badge">Disp: {{ pro.disponibilidade }}</span>
                </div>

                <div class="tags-container mt-2">
                  <span v-for="esp in pro.especialidades" :key="esp" class="tag-badge">{{ esp }}</span>
                </div>
                
                <div v-if="pro.observacoes" class="obs-box">
                  <Info :size="12" /> <span>{{ pro.observacoes }}</span>
                </div>
              </div>
              
              <div class="item-actions-wrapper">
                <span class="price-tag">R$ {{ pro.valorHora.toFixed(2) }}/h</span>
                <div class="action-buttons">
                  <button @click="prepararEdicao(pro)" class="btn-edit-mini" title="Editar Profissional">
                    <Edit2 :size="18" />
                  </button>
                  <button @click="remover(pro._id)" class="btn-del-mini" title="Excluir Profissional">
                    <Trash2 :size="18" />
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="profissionais.length === 0" class="empty-msg">
              <Inbox :size="40" class="opacity-20" />
              <p>Nenhum profissional encontrado com estes filtros.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { UserPlus, Users, Mail, Save, Trash2, Inbox, MessageCircle, Info, Edit2, X } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const profissionais = ref([]);
const listaEspecialidades = ['Jurídico', 'Saúde', 'Eventos', 'Educação', 'Corporativo', 'Audiovisual'];

// Estado para os Filtros
const filtros = ref({
  nome: '',
  especialidade: '',
  disponibilidade: ''
});

// Estado do Formulário
const formPadrao = { 
  nome: '', email: '', whatsapp: '', valorHora: null, especialidades: [], observacoes: '', 
  cpf: '', rg: '', pix: '', disponibilidade: 'Integral' 
};
const form = ref({ ...formPadrao });
const editandoId = ref(null);

const carregar = async () => {
  try {
    // Passando os filtros como Query Params para o backend
    const res = await api.get('/profissionais', { params: filtros.value });
    profissionais.value = res.data;
  } catch (error) {
    console.error("Erro ao carregar profissionais:", error);
  }
};

const salvar = async () => {
  try {
    if (editandoId.value) {
      await api.put(`/profissionais/${editandoId.value}`, form.value);
      alert('Profissional atualizado com sucesso!');
    } else {
      await api.post('/profissionais', form.value);
      alert('Profissional cadastrado com sucesso!');
    }
    cancelarEdicao();
    carregar();
  } catch (error) {
    alert('Erro ao salvar: ' + (error.response?.data?.message || 'Verifique os dados.'));
  }
};

const prepararEdicao = (pro) => {
  editandoId.value = pro._id;
  form.value = { ...pro };
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola a página para o topo
};

const cancelarEdicao = () => {
  editandoId.value = null;
  form.value = { ...formPadrao };
};

const remover = async (id) => {
  if (confirm("Deseja realmente apagar este profissional permanentemente do sistema?")) {
    try {
      await api.delete(`/profissionais/${id}`);
      carregar();
      alert("Profissional removido com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir o profissional. Verifique a conexão.");
    }
  }
};

onMounted(carregar);
</script>

<style scoped>
.layout-split { display: grid; grid-template-columns: 380px 1fr; gap: 30px; align-items: start; }
.list-section { display: flex; flex-direction: column; gap: 20px; }
.glass-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05); }
.search-bar { padding: 20px 25px; }

.text-brand { color: #004aad; }
.mt-4 { margin-top: 1rem; }
.mt-2 { margin-top: 0.5rem; }

.form-title { margin-bottom: 25px; color: #1e293b; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }

.modern-form label { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; margin: 15px 0 8px; text-transform: uppercase; }
.modern-form input, .modern-form textarea, .modern-select { 
  width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; 
  background: #f8fafc; font-size: 0.95rem; color: #1e293b; box-sizing: border-box; font-family: inherit;
}
.modern-form input:focus, .modern-form textarea:focus, .modern-select:focus { 
  outline: none; border-color: #004aad; box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1); background: white; 
}
.search-bar input, .search-bar .modern-select { padding: 12px; }

.form-row { display: flex; gap: 15px; width: 100%; align-items: flex-end; margin-bottom: 15px; }
.form-group-col { flex: 1; display: flex; flex-direction: column; }

/* ESPECIALIDADES */
.checkbox-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px; }
.checkbox-label-card { display: flex !important; flex-direction: row !important; align-items: center !important; gap: 10px !important; cursor: pointer; padding: 12px 15px; background: #f8fafc; border-radius: 12px; transition: 0.2s ease; border: 1px solid transparent; margin: 0 !important; }
.checkbox-label-card:hover { background: #f1f5f9; border-color: #e2e8f0; }
.checkbox-text { font-size: 0.9rem !important; color: #1e293b !important; font-weight: 600 !important; text-transform: none !important; letter-spacing: 0 !important; }
.custom-checkbox { width: 18px !important; height: 18px !important; accent-color: #004aad; cursor: pointer; flex-shrink: 0; margin: 0 !important; }

/* BOTÕES FORMULÁRIO */
.form-actions { display: flex; gap: 10px; margin-top: 25px; }
.btn-primary { flex: 2; background: #004aad; color: white; border: none; padding: 16px; border-radius: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; }
.btn-primary:hover { background: #003a8c; transform: translateY(-2px); }
.btn-secondary { flex: 1; background: #f1f5f9; color: #64748b; border: none; padding: 16px; border-radius: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; }
.btn-secondary:hover { background: #e2e8f0; color: #0f172a; }

/* LISTAGEM */
.pro-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 22px 0; border-bottom: 1px solid #f1f5f9; }
.header-name { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
.contact-links { display: flex; gap: 12px; }
.info-tag { display: flex; align-items: center; gap: 4px; font-size: 0.85rem; color: #64748b; font-weight: 500; }
.whatsapp-link { color: #059669; text-decoration: none; transition: 0.2s; }
.whatsapp-link:hover { color: #047857; text-decoration: underline; }

.docs-container { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 5px; }
.doc-badge { background: #f1f5f9; color: #475569; font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; }
.disp-badge { background: #ecfdf5; color: #059669; }

.tag-badge { background: #eff6ff; color: #004aad; font-size: 0.65rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; margin-right: 5px; display: inline-block; }
.obs-box { margin-top: 12px; background: #fffbeb; border-left: 3px solid #f59e0b; padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; color: #92400e; display: flex; align-items: flex-start; gap: 6px;}

.item-actions-wrapper { display: flex; flex-direction: column; align-items: flex-end; gap: 15px; }
.price-tag { font-weight: 800; font-size: 0.9rem; color: #004aad; background: #eff6ff; padding: 8px 12px; border-radius: 8px; }
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