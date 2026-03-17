<template>
  <StudentLayout>
    <div class="materials-list">
      <div v-for="m in materiais" :key="m._id" class="glass-card material-item">
        <div class="file-info">
          <div class="icon-box">📚</div>
          <div class="text">
            <h4>{{ m.titulo }}</h4>
            <p>{{ m.descricao }}</p>
          </div>
        </div>
        <a :href="`http://localhost:3000/${m.caminho}`" target="_blank" class="btn-download">
          Baixar PDF
        </a>
      </div>
      <div v-if="materiais.length === 0" class="empty">
        Ainda não há materiais disponíveis para download.
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
  const res = await api.get('/materiais');
  materiais.value = res.data;
};

onMounted(buscarMateriais);
</script>

<style scoped>
.materials-list { display: flex; flex-direction: column; gap: 15px; }
.material-item { display: flex; justify-content: space-between; align-items: center; background: white; padding: 20px; border-radius: 20px; border: 1px solid #e2e8f0; }
.file-info { display: flex; align-items: center; gap: 20px; }
.icon-box { font-size: 1.8rem; background: #f0fdf4; padding: 12px; border-radius: 15px; }
.text h4 { margin: 0; color: #1e293b; }
.text p { margin: 5px 0 0; color: #64748b; font-size: 0.85rem; }
.btn-download { text-decoration: none; background: #1e293b; color: white; padding: 10px 20px; border-radius: 12px; font-weight: 600; font-size: 0.9rem; }
.empty { text-align: center; padding: 50px; color: #94a3b8; }
</style>