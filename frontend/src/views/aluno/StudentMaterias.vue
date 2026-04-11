<template>
  <StudentLayout pageTitle="Apostilas e Materiais" pageDescription="Faça o download dos PDFs e materiais de apoio para os seus estudos.">
    <div class="materials-list">
      
      <div v-for="m in materiais" :key="m._id" class="glass-card material-item">
        <div class="file-info">
          <div class="icon-box">
            <FileText :size="28" />
          </div>
          <div class="text">
            <h4>{{ m.titulo }}</h4>
            <p>{{ m.descricao }}</p>
          </div>
        </div>
        <a :href="obterUrlArquivo(m.caminho)" target="_blank" rel="noopener noreferrer" download class="btn-download">
          <Download :size="18" class="btn-icon" /> Baixar PDF
        </a>
      </div>

      <div v-if="materiais.length === 0" class="empty-msg">
        <div class="empty-icon-wrapper">
          <Inbox :size="48" />
        </div>
        <p>Ainda não há materiais disponíveis para download.</p>
      </div>

    </div>
  </StudentLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FileText, Download, Inbox } from 'lucide-vue-next';
import StudentLayout from '../../components/StudentLayout.vue';
import api from '../../services/api';

const materiais = ref([]);

const buscarMateriais = async () => {
  try {
    const res = await api.get('/materiais');
    materiais.value = res.data;
  } catch (error) {
    console.error("Erro ao buscar materiais:", error);
  }
};

// CORREÇÃO: Função para gerar o link correto do PDF
const obterUrlArquivo = (caminho) => {
  if (!caminho) return '#';
  const caminhoLimpo = caminho.replace(/\\/g, '/'); // Previne barras invertidas do Windows
  const baseUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:3000';
  return `${baseUrl}/${caminhoLimpo}`;
};

onMounted(buscarMateriais);
</script>

<style scoped>
.materials-list { display: flex; flex-direction: column; gap: 20px; }
.glass-card { background: white; padding: 25px 30px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05); }

.material-item { display: flex; justify-content: space-between; align-items: center; transition: all 0.3s ease; }
.material-item:hover { transform: translateY(-4px); border-color: #bfdbfe; box-shadow: 0 15px 35px rgba(0, 74, 173, 0.1); }

.file-info { display: flex; align-items: center; gap: 20px; }

.icon-box { 
  background: #eff6ff; 
  color: #004aad; 
  width: 60px; 
  height: 60px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  border-radius: 14px; 
  border: 1px solid #dbeafe;
}

.text h4 { margin: 0 0 6px 0; color: #1e293b; font-size: 1.1rem; font-weight: 800; }
.text p { margin: 0; color: #64748b; font-size: 0.9rem; line-height: 1.4; }

.btn-download { 
  text-decoration: none; 
  background: #004aad; 
  color: white; 
  padding: 12px 24px; 
  border-radius: 12px; 
  font-weight: 700; 
  font-size: 0.9rem; 
  transition: all 0.2s ease; 
  display: flex; 
  align-items: center; 
  gap: 8px;
}

.btn-download:hover { background: #003a8c; transform: translateY(-1px); box-shadow: 0 6px 15px rgba(0, 74, 173, 0.2); }

.empty-msg { text-align: center; padding: 60px; color: #94a3b8; font-weight: 500; background: white; border-radius: 24px; border: 2px dashed #e2e8f0; display: flex; flex-direction: column; align-items: center; gap: 15px; }
.empty-icon-wrapper { color: #cbd5e1; }

/* Responsividade unificada */
@media (max-width: 600px) {
  .material-item { flex-direction: column; align-items: flex-start; gap: 20px; }
  .btn-download { width: 100%; justify-content: center; }
}
@media (max-width: 992px) {
  .layout-split { grid-template-columns: 1fr; gap: 20px; }
  .form-row { flex-direction: column; gap: 15px; }
  .glass-card { padding: 20px; }
  .header-row, .servico-header, .card-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .item-actions-wrapper, .item-actions { align-items: flex-start; margin-top: 15px; width: 100%; }
}
</style>