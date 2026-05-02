<template>
  <MainLayout pageTitle="Professores" pageDescription="Gerencie os professores/instrutores que ministrarão cursos">
    <div class="layout-split">
      
      <!-- Formulário de Cadastro -->
      <div class="glass-card side-form">
        <h3 class="form-title">
          <GraduationCap :size="20" class="text-brand" /> Novo Professor
        </h3>
        
        <form @submit.prevent="cadastrar" class="modern-form">
          <div class="form-row">
            <div class="form-group-col">
              <label>Nome Completo</label>
              <input v-model="form.nome" placeholder="Ex: João Santos" required />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group-col">
              <label>Email</label>
              <input v-model="form.email" type="email" placeholder="professor@email.com" required />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group-col">
              <label>Telefone</label>
              <input v-model="form.telefone" placeholder="(71) 99999-9999" />
            </div>
            <div class="form-group-col">
              <label>Especialidade</label>
              <input v-model="form.especialidade" placeholder="Ex: Libras Avançado" />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group-col">
              <label>CPF</label>
              <input v-model="form.cpf" placeholder="000.000.000-00" />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group-col">
              <label>Biografia</label>
              <textarea v-model="form.biografia" placeholder="Breve biografia..." rows="3"></textarea>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group-col" style="flex: 1;">
              <label>Status</label>
              <select v-model="form.ativo" class="modern-select">
                <option :value="true">Ativo</option>
                <option :value="false">Inativo</option>
              </select>
            </div>
          </div>
          
          <button type="submit" class="btn-primary">
            <Save :size="18" /> {{ editando ? 'Atualizar' : 'Cadastrar' }}
          </button>
        </form>
      </div>
      
      <!-- Lista de Professores -->
      <div class="glass-card main-content">
        <div class="table-header">
          <h3>Professores Cadastrados ({{ instrutores.length }})</h3>
          <input v-model="busca" placeholder="Buscar professor..." class="search-input" />
        </div>
        
        <div class="table-grid">
          <div v-for="instrutor in instrutoresFiltrados" :key="instrutor._id" class="card-item">
            <div class="card-header">
              <div>
                <h4>{{ instrutor.nome }}</h4>
                <span class="text-sm text-muted">{{ instrutor.email }}</span>
              </div>
              <span :class="['badge', instrutor.ativo ? 'badge-ativo' : 'badge-inativo']">
                {{ instrutor.ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
            
            <div class="card-body">
              <p v-if="instrutor.telefone" class="text-sm">
                <Phone :size="14" /> {{ instrutor.telefone }}
              </p>
              <p v-if="instrutor.especialidade" class="text-sm">
                <BookOpen :size="14" /> {{ instrutor.especialidade }}
              </p>
              <p v-if="instrutor.biografia" class="text-sm text-muted">
                {{ instrutor.biografia.substring(0, 80) }}{{ instrutor.biografia.length > 80 ? '...' : '' }}
              </p>
            </div>
            
            <div class="card-footer">
              <button @click="editar(instrutor)" class="btn-edit" title="Editar">
                <Edit2 :size="16" />
              </button>
              <button @click="deletar(instrutor._id)" class="btn-del" title="Excluir">
                <Trash2 :size="16" />
              </button>
            </div>
          </div>
          
          <div v-if="instrutoresFiltrados.length === 0" class="empty-state">
            <GraduationCap :size="40" class="opacity-30" />
            <p>Nenhum professor encontrado.</p>
          </div>
        </div>
      </div>
      
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { GraduationCap, Save, Edit2, Trash2, Phone, BookOpen } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const instrutores = ref([]);
const busca = ref('');
const editando = ref(false);

const form = ref({
  nome: '', email: '', telefone: '', especialidade: '',
  cpf: '', biografia: '', ativo: true, _id: null
});

const instrutoresFiltrados = computed(() => {
  if (!busca.value) return instrutores.value;
  const b = busca.value.toLowerCase();
  return instrutores.value.filter(i => 
    i.nome?.toLowerCase().includes(b) || 
    i.email?.toLowerCase().includes(b) ||
    i.especialidade?.toLowerCase().includes(b)
  );
});

const carregar = async () => {
  try {
    const res = await api.get('/instrutores');
    instrutores.value = res.data;
  } catch (e) { console.error(e); }
};

const cadastrar = async () => {
  try {
    if (editando.value) {
      await api.put(`/instrutores/${form.value._id}`, form.value);
      alert('Professor atualizado!');
    } else {
      await api.post('/instrutores', form.value);
      alert('Professor cadastrado!');
    }
    form.value = { nome: '', email: '', telefone: '', especialidade: '', cpf: '', biografia: '', ativo: true, _id: null };
    editando.value = false;
    carregar();
  } catch (e) { alert('Erro ao salvar.'); }
};

const editar = (instrutor) => {
  form.value = { ...instrutor };
  editando.value = true;
};

const deletar = async (id) => {
  if (confirm('Excluir este professor?')) {
    try {
      await api.delete(`/instrutores/${id}`);
      carregar();
    } catch (e) { alert('Erro ao excluir.'); }
  }
};

onMounted(() => { carregar(); });
</script>

<style scoped>
.layout-split { display: flex; gap: 20px; }
.side-form { flex: 0 0 350px; }
.main-content { flex: 1; }

.form-row { display: flex; gap: 12px; margin-bottom: 12px; }
.form-group-col { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.form-group-col label { font-size: 0.85rem; color: #64748b; font-weight: 500; }
.form-group-col input, .form-group-col select, .form-group-col textarea {
  padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
  font-size: 0.9rem; background: white; color: #1e293b;
}
.form-group-col input:focus, .form-group-col select:focus, .form-group-col textarea:focus {
  outline: none; border-color: #004aad; box-shadow: 0 0 0 3px rgba(0,74,173,0.1);
}

.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.search-input { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 250px; }

.table-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.card-item { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
.card-item:hover { border-color: #cbd5e1; }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.card-header h4 { font-size: 1rem; font-weight: 600; color: #1e293b; margin: 0; }
.card-body { margin-bottom: 12px; }
.card-body p { display: flex; align-items: center; gap: 6px; color: #64748b; margin: 4px 0; }
.card-footer { display: flex; gap: 8px; justify-content: flex-end; }

.btn-edit { background: white; border: 1px solid #e2e8f0; padding: 8px; border-radius: 8px; cursor: pointer; color: #64748b; }
.btn-edit:hover { background: #dbeafe; color: #0284c7; border-color: #bfdbfe; }
.btn-del { background: white; border: 1px solid #e2e8f0; padding: 8px; border-radius: 8px; cursor: pointer; color: #64748b; }
.btn-del:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }

.badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.badge-ativo { background: #dcfce7; color: #166534; }
.badge-inativo { background: #f1f5f9; color: #64748b; }

.empty-state { grid-column: 1 / -1; text-align: center; padding: 40px; color: #94a3b8; }
.btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: #004aad; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; justify-content: center; margin-top: 10px; }
.btn-primary:hover { background: #003d8f; }
.text-brand { color: #004aad; }
.text-sm { font-size: 0.85rem; }
.text-muted { color: #94a3b8; }
</style>