<template>
  <StudentLayout pageTitle="Meus Cursos" pageDescription="Acesse as aulas e conteúdos dos seus cursos de Libras.">
    <div class="courses-grid">
      <div v-for="c in cursos" :key="c._id" class="glass-card course-card">
        <div class="badge">{{ c.nivel }}</div>
        
        <div class="course-icon">🤟</div>
        
        <h3>{{ c.titulo }}</h3>
        <p>{{ c.descricao }}</p>
        
        <div class="course-footer">
          <span>🕒 {{ c.cargaHoraria }}h de carga</span>
          <button @click="acessarCurso(c._id)" class="btn-access">Acessar Aula</button>
        </div>
      </div>

      <div v-if="cursos.length === 0" class="empty-msg">
        <span class="empty-icon">📭</span>
        <p>Você ainda não possui cursos matriculados.</p>
      </div>
    </div>
  </StudentLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import StudentLayout from '../../components/StudentLayout.vue';
import api from '../../services/api';

const router = useRouter();
const cursos = ref([]);

const buscarCursos = async () => {
  try {
    const res = await api.get('/cursos');
    cursos.value = res.data;
  } catch (err) {
    console.error("Erro ao carregar cursos");
  }
};

const acessarCurso = (id) => {
  // Rota de exemplo para onde o aluno vai ao clicar no curso
  router.push(`/aluno/curso/${id}`);
};

onMounted(buscarCursos);
</script>

<style scoped>
/* ESTRUTURA ORIGINAL COM NOVA IDENTIDADE AZUL ROYAL */
.courses-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
  gap: 30px; 
}

.glass-card { 
  background: white; 
  padding: 30px; 
  border-radius: 24px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05); 
}

.course-card { 
  position: relative; 
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease; 
}

.course-card:hover { 
  transform: translateY(-6px); 
  border-color: #bfdbfe; 
  box-shadow: 0 15px 35px rgba(30, 64, 175, 0.1);
}

.badge { 
  position: absolute; 
  top: 25px; 
  right: 25px; 
  background: #eff6ff; 
  color: #1e40af; 
  padding: 6px 14px; 
  border-radius: 10px; 
  font-size: 0.75rem; 
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.course-icon { 
  font-size: 2.5rem; 
  margin-bottom: 20px; 
  background: #f8fafc;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  border: 1px solid #f1f5f9;
}

.course-card h3 { 
  color: #1e293b; 
  margin-bottom: 12px; 
  font-size: 1.25rem;
  font-weight: 800;
  padding-right: 80px; /* Evita que o texto sobreponha a badge */
}

.course-card p { 
  color: #64748b; 
  font-size: 0.95rem; 
  margin-bottom: 25px; 
  flex-grow: 1;
  line-height: 1.5;
}

.course-footer { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  border-top: 1px solid #f1f5f9; 
  padding-top: 20px; 
}

.course-footer span { 
  font-size: 0.85rem; 
  color: #64748b; 
  font-weight: 600;
}

/* BOTÃO AZUL ROYAL */
.btn-access { 
  background: #1e40af; 
  color: white; 
  border: none; 
  padding: 10px 20px; 
  border-radius: 12px; 
  cursor: pointer; 
  font-weight: 700; 
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-access:hover {
  background: #1e3a8a;
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2);
}

.empty-msg {
  grid-column: 1 / -1;
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
</style>