<template>
  <MainLayout pageTitle="Apostilas e Materiais" pageDescription="Gerencie os arquivos de apoio para as aulas de Libras.">
    <div class="layout-split">
      
      <div class="glass-card side-form">
        <h3 class="form-title">
          <UploadCloud :size="20" class="text-brand" /> Upload de Material
        </h3>
        
        <form @submit.prevent="fazerUpload" class="modern-form">
          <div class="form-group">
            <label>Título da Apostila</label>
            <input v-model="form.titulo" placeholder="Ex: Alfabeto em Libras" required />
          </div>

          <div class="form-group">
            <label>Descrição Curta</label>
            <textarea v-model="form.descricao" placeholder="O que contém este arquivo?" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Selecione o Arquivo (PDF)</label>
            <input type="file" @change="selecionarArquivo" class="file-input" accept=".pdf" required />
          </div>

          <button type="submit" class="btn-primary" :disabled="enviando">
            <component :is="enviando ? Loader2 : FilePlus" :size="18" :class="{ 'spin': enviando }" />
            {{ enviando ? 'Enviando arquivo...' : 'Fazer Upload agora' }}
          </button>
        </form>
      </div>

      <div class="materiais-list">
        <div v-for="m in materiais" :key="m._id" class="glass-card material-card">
          <div class="file-info">
            <div class="file-icon-box">
              <FileText :size="28" />
            </div>
            <div class="file-texts">
              <h4>{{ m.titulo }}</h4>
              <p>{{ m.descricao }}</p>
            </div>
          </div>
          <div class="file-actions">
            <a :href="`http://localhost:3000/${m.caminho}`" target="_blank" class="btn-view">
              <Eye :size="16" /> Ver PDF
            </a>
            <button @click="remover(m._id)" class="btn-del-red">
              <Trash2 :size="18" />
            </button>
          </div>
        </div>
        
        <div v-if="materiais.length === 0" class="glass-card empty-card">
          <Inbox :size="48" class="opacity-20" />
          <p>Nenhuma apostila cadastrada ainda.</p>
        </div>
      </div>
      
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  UploadCloud, FileText, FilePlus, Loader2, Eye, Trash2, Inbox 
} from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const materiais = ref([]);
const form = ref({ titulo: '', descricao: '' });
const arquivoSelecionado = ref(null);
const enviando = ref(false);

const buscarMateriais = async () => {
  try {
    const res = await api.get('/materiais');
    materiais.value = res.data;
  } catch (err) {
    console.error("Erro ao carregar materiais:", err);
  }
};

const selecionarArquivo = (e) => {
  arquivoSelecionado.value = e.target.files[0];
};

const fazerUpload = async () => {
  if (!arquivoSelecionado.value) return;
  enviando.value = true;
  const formData = new FormData();
  formData.append('titulo', form.value.titulo);
  formData.append('descricao', form.value.descricao);
  formData.append('arquivo', arquivoSelecionado.value);

  try {
    await api.post('/materiais', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    form.value = { titulo: '', descricao: '' };
    arquivoSelecionado.value = null;
    document.querySelector('.file-input').value = '';
    buscarMateriais();
    alert("Upload concluído com sucesso!");
  } catch (err) {
    alert("Erro ao enviar o arquivo.");
  } finally {
    enviando.value = false;
  }
};

const remover = async (id) => {
  if (confirm("Tem certeza que deseja apagar este material permanentemente?")) {
    try {
      await api.delete(`/materiais/${id}`);
      buscarMateriais();
    } catch (err) {
      alert("Erro ao remover.");
    }
  }
};

onMounted(buscarMateriais);
</script>

<style scoped>
.layout-split { display: grid; grid-template-columns: 350px 1fr; gap: 30px; align-items: start; }
.glass-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0, 74, 173, 0.05); }
.text-brand { color: #004aad; }

.form-title { margin-bottom: 25px; color: #1e293b; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }

.modern-form label { display: block; font-size: 0.8rem; font-weight: 700; color: #64748b; margin: 15px 0 5px; text-transform: uppercase; }
.modern-form input, .modern-form textarea { 
  width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; 
  background: #f8fafc; font-size: 0.95rem; color: #1e293b; transition: 0.2s; box-sizing: border-box; font-family: inherit;
}
.modern-form input:focus { outline: none; border-color: #004aad; box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1); background: white; }

.file-input { padding: 10px !important; background: white !important; cursor: pointer; }

.btn-primary { 
  width: 100%; background: #004aad; color: white; border: none; padding: 16px; 
  border-radius: 14px; margin-top: 25px; font-weight: 800; cursor: pointer; transition: 0.3s;
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.btn-primary:hover:not(:disabled) { background: #003a8c; transform: translateY(-2px); }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.materiais-list { display: flex; flex-direction: column; gap: 20px; }
.material-card { display: flex; justify-content: space-between; align-items: center; transition: 0.2s; padding: 20px 25px; border: 1px solid #e2e8f0; }
.material-card:hover { border-color: #004aad; transform: translateY(-2px); box-shadow: 0 15px 30px rgba(0, 74, 173, 0.1); }

.file-icon-box { background: #eff6ff; color: #004aad; padding: 15px; border-radius: 18px; }
.file-texts h4 { color: #1e293b; margin-bottom: 4px; font-size: 1.1rem; font-weight: 700; }
.file-texts p { color: #64748b; font-size: 0.85rem; font-weight: 500; }

.btn-view { text-decoration: none; color: #004aad; font-weight: 800; font-size: 0.85rem; background: #eff6ff; padding: 10px 18px; border-radius: 12px; display: flex; align-items: center; gap: 8px; }
.btn-view:hover { background: #dbeafe; }

.btn-del-red { border: none; background: transparent; color: #94a3b8; padding: 10px; border-radius: 10px; cursor: pointer; transition: 0.2s; }
.btn-del-red:hover { color: #ef4444; background: #fef2f2; }

.empty-card { text-align: center; color: #94a3b8; font-weight: 600; padding: 50px; display: flex; flex-direction: column; align-items: center; gap: 15px; }
</style>