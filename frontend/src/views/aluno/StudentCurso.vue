<template>
  <StudentLayout>
    <div class="courses-grid">
      <div v-for="c in cursos" :key="c._id" class="glass-card course-card">
        <div class="badge">{{ c.nivel }}</div>
        <div class="course-icon">🤟</div>
        <h3>{{ c.titulo }}</h3>
        <p>{{ c.descricao }}</p>
        <div class="course-footer">
          <span>🕒 {{ c.cargaHoraria }}h de carga</span>
          <button class="btn-access">Aceder Aula</button>
        </div>
      </div>
    </div>
  </StudentLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import StudentLayout from '../../components/StudentLayout.vue';
import api from '../../services/api';

const cursos = ref([]);

const buscarCursos = async () => {
  try {
    const res = await api.get('/cursos');
    cursos.value = res.data;
  } catch (err) {
    console.error("Erro ao carregar cursos");
  }
};

onMounted(buscarCursos);
</script>

<style scoped>
.courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; }
.course-card { background: white; padding: 25px; border-radius: 24px; border: 1px solid #e2e8f0; position: relative; transition: 0.3s; }
.course-card:hover { transform: translateY(-5px); border-color: #10b981; }
.badge { position: absolute; top: 15px; right: 15px; background: #ecfdf5; color: #10b981; padding: 5px 12px; border-radius: 10px; font-size: 0.75rem; font-weight: bold; }
.course-icon { font-size: 2.5rem; margin-bottom: 15px; }
.course-card h3 { color: #1e293b; margin-bottom: 10px; }
.course-card p { color: #64748b; font-size: 0.9rem; margin-bottom: 20px; min-height: 60px; }
.course-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 15px; }
.course-footer span { font-size: 0.8rem; color: #94a3b8; }
.btn-access { background: #10b981; color: white; border: none; padding: 8px 15px; border-radius: 10px; cursor: pointer; font-weight: 600; }
</style>