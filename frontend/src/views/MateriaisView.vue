<template>
  <MainLayout pageTitle="Apostilas e Materiais" pageDescription="Gerencie os arquivos de apoio para as aulas de Libras.">
    <div class="layout-split">
      <div class="glass-card side-form">
        <h3 class="form-title">📂 Upload de Material</h3>
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
            <input type="file" @change="selecionarArquivo" class="file-input" required />
          </div>

          <button type="submit" class="btn-primary" :disabled="enviando">
            {{ enviando ? 'Enviando arquivo...' : 'Fazer Upload agora' }}
          </button>
        </form>
      </div>

      <div class="materiais-list">
        <div v-for="m in materiais" :key="m._id" class="glass-card material-card">
          <div class="file-info">
            <div class="file-icon-box">📄</div>
            <div class="file-texts">
              <h4>{{ m.titulo }}</h4>
              <p>{{ m.descricao }}</p>
            </div>
          </div>
          <div class="file-actions">
            <a :href="`http://localhost:3000/${m.caminho}`" target="_blank" class="btn-view">Ver PDF</a>
            <button @click="remover(m._id)" class="btn-del-red">Apagar</button>
          </div>
        </div>
        <div v-if="materiais.length === 0" class="glass-card empty-card">
           Nenhuma apostila cadastrada ainda.
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
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
.layout-split { display: grid; grid-template-columns: 350px 1fr; gap: 30px; }
.glass-card { background: white; padding: 25px; border-radius: 24px; border: 1px solid #edf2f7; box-shadow: 0 10px 25px rgba(0,0,0,0.03); }
.form-title { margin-bottom: 25px; color: #2d3748; }

.modern-form label { display: block; font-size: 0.8rem; font-weight: 600; color: #718096; margin: 15px 0 5px; }
.modern-form input, .modern-form textarea { 
  width: 100%; padding: 12px; border: 1px solid #edf2f7; border-radius: 12px; background: #f8f9fd; font-size: 0.9rem;
}
.file-input { padding: 8px !important; background: white !important; cursor: pointer; }
.btn-primary { width: 100%; background: #8e44ad; color: white; border: none; padding: 15px; border-radius: 12px; margin-top: 25px; font-weight: bold; cursor: pointer; transition: 0.3s; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.material-card { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; transition: 0.2s; }
.material-card:hover { border-color: #d6bcfa; }
.file-info { display: flex; align-items: center; gap: 20px; }
.file-icon-box { font-size: 1.8rem; background: #f3e8ff; padding: 15px; border-radius: 18px; line-height: 1; }
.file-texts h4 { color: #2d3748; margin-bottom: 4px; font-size: 1.1rem; }
.file-texts p { color: #a0aec0; font-size: 0.85rem; }

.file-actions { display: flex; align-items: center; gap: 15px; }
.btn-view { text-decoration: none; color: #8e44ad; font-weight: 700; font-size: 0.9rem; }
.btn-del-red { border: none; background: #fff5f5; color: #e53e3e; padding: 10px 18px; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 0.85rem; }
.btn-del-red:hover { background: #fed7d7; }
.empty-card { text-align: center; color: #a0aec0; font-style: italic; }
</style>