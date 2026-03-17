<template>
  <StudentLayout pageTitle="Apostilas e Materiais" pageDescription="Faça o download dos PDFs e materiais de apoio para os seus estudos.">
    <div class="materials-list">
      
      <div v-for="m in materiais" :key="m._id" class="glass-card material-item">
        <div class="file-info">
          <div class="icon-box">📄</div>
          <div class="text">
            <h4>{{ m.titulo }}</h4>
            <p>{{ m.descricao }}</p>
          </div>
        </div>
        <a :href="`http://localhost:3000/${m.caminho}`" target="_blank" class="btn-download">
          Baixar PDF
        </a>
      </div>

      <div v-if="materiais.length === 0" class="empty-msg">
        <span class="empty-icon">📭</span>
        <p>Ainda não há materiais disponíveis para download.</p>
      </div>

    </div>
  </StudentLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
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

onMounted(buscarMateriais);
</script>

<style scoped>
/* ESTRUTURA PRINCIPAL */
.materials-list { 
  display: flex; 
  flex-direction: column; 
  gap: 20px; 
}

/* CARTÕES COM IDENTIDADE AZUL ROYAL */
.glass-card { 
  background: white; 
  padding: 25px 30px; 
  border-radius: 24px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05); 
}

.material-item { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  transition: all 0.3s ease; 
}

.material-item:hover { 
  transform: translateY(-4px); 
  border-color: #bfdbfe; 
  box-shadow: 0 15px 35px rgba(30, 64, 175, 0.1);
}

/* INFORMAÇÕES DO ARQUIVO */
.file-info { 
  display: flex; 
  align-items: center; 
  gap: 20px; 
}

.icon-box { 
  font-size: 2rem; 
  background: #eff6ff; 
  color: #1e40af; 
  width: 65px; 
  height: 65px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  border-radius: 16px; 
  border: 1px solid #dbeafe;
}

.text h4 { 
  margin: 0 0 6px 0; 
  color: #1e293b; 
  font-size: 1.15rem; 
  font-weight: 800; 
}

.text p { 
  margin: 0; 
  color: #64748b; 
  font-size: 0.95rem; 
  line-height: 1.4; 
}

/* BOTÃO AZUL ROYAL */
.btn-download { 
  text-decoration: none; 
  background: #1e40af; 
  color: white; 
  padding: 14px 28px; 
  border-radius: 14px; 
  font-weight: 800; 
  font-size: 0.95rem; 
  transition: all 0.2s ease; 
  white-space: nowrap;
}

.btn-download:hover { 
  background: #1e3a8a; 
  transform: scale(1.03); 
  box-shadow: 0 6px 15px rgba(30, 64, 175, 0.25);
}

/* ESTADO VAZIO */
.empty-msg {
  text-align: center;
  padding: 60px;
  color: #94a3b8;
  font-weight: 500;
  background: white;
  border-radius: 24px;
  border: 2px dashed #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

/* RESPONSIVIDADE PARA MOBILE */
@media (max-width: 600px) {
  .material-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  .btn-download { 
    width: 100%; 
    text-align: center; 
    box-sizing: border-box; 
  }
}
</style>