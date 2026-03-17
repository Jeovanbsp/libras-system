<template>
  <StudentLayout pageTitle="Meu Painel" pageDescription="Acompanhe o seu progresso e acesse os seus conteúdos de Libras.">
    
    <div class="welcome-banner">
      <div class="banner-text">
        <h2>Olá, Aluno! 👋</h2>
        <p>Continue a sua jornada de aprendizado. Os seus materiais e salas de aula já estão disponíveis abaixo.</p>
      </div>
      <div class="banner-icon">🎓</div>
    </div>

    <div class="stats-grid">
      
      <div class="glass-card clickable" @click="router.push('/aluno/cursos')">
        <div class="card-header">
          <span class="tag">ESTUDOS</span>
          <h3>Cursos Matriculados</h3>
        </div>
        <div class="card-value">{{ totalCursos }}</div>
        <div class="card-footer">
          Acessar salas de aula <span class="arrow">&rarr;</span>
        </div>
      </div>

      <div class="glass-card clickable" @click="router.push('/aluno/materiais')">
        <div class="card-header">
          <span class="tag success">APOIO DIGITAL</span>
          <h3>Apostilas Disponíveis</h3>
        </div>
        <div class="card-value">{{ totalMateriais }}</div>
        <div class="card-footer">
          Fazer download de PDFs <span class="arrow">&rarr;</span>
        </div>
      </div>

      <div class="glass-card clickable">
        <div class="card-header">
          <span class="tag gold">CONQUISTAS</span>
          <h3>Certificados Emitidos</h3>
        </div>
        <div class="card-value">0</div>
        <div class="card-footer">
          Ver as minhas conquistas <span class="arrow">&rarr;</span>
        </div>
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
const totalCursos = ref(0);
const totalMateriais = ref(0);

const carregarDados = async () => {
  try {
    // Busca a quantidade de cursos e materiais para exibir nos cards
    const resCursos = await api.get('/cursos');
    totalCursos.value = resCursos.data.length;
    
    const resMateriais = await api.get('/materiais');
    totalMateriais.value = resMateriais.data.length;
  } catch (error) {
    console.error("Erro ao carregar dados do dashboard do aluno:", error);
  }
};

onMounted(carregarDados);
</script>

<style scoped>
/* BANNER DE DESTAQUE */
.welcome-banner {
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  border-radius: 24px;
  padding: 40px 50px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  box-shadow: 0 10px 25px rgba(30, 64, 175, 0.2);
  overflow: hidden;
}

.banner-text h2 {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.banner-text p {
  font-size: 1.05rem;
  opacity: 0.9;
  max-width: 500px;
  line-height: 1.5;
}

.banner-icon {
  font-size: 7rem;
  opacity: 0.15;
  transform: rotate(15deg) scale(1.2);
  user-select: none;
}

/* ESTRUTURA GRID */
.stats-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
  gap: 30px; 
}

/* CARTÕES PADRÃO (NOVA IDENTIDADE) */
.glass-card {
  background: white; 
  padding: 35px 30px; 
  border-radius: 24px;
  box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease; 
  position: relative;
  display: flex;
  flex-direction: column;
}

.glass-card.clickable:hover { 
  transform: translateY(-6px); 
  box-shadow: 0 20px 40px rgba(30, 64, 175, 0.12);
  border-color: #bfdbfe; 
  cursor: pointer; 
}

/* BADGES (TAGS) */
.tag { 
  font-size: 0.75rem; 
  font-weight: 800; 
  color: #64748b; 
  letter-spacing: 1px; 
  margin-bottom: 12px; 
  display: inline-block;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 8px;
}
.tag.success { color: #059669; background: #ecfdf5; }
.tag.gold { color: #d97706; background: #fffbeb; }

/* TEXTOS E VALORES */
.card-header h3 { 
  font-size: 1.1rem; 
  color: #1e293b; 
  font-weight: 700; 
  margin: 0; 
}

.card-value { 
  font-size: 3.5rem; 
  font-weight: 900; 
  color: #0f172a; 
  margin: 15px 0; 
  letter-spacing: -2px; 
}

/* RODAPÉ DO CARD E ANIMAÇÃO DA SETA */
.card-footer { 
  font-size: 0.9rem; 
  color: #1e40af; 
  font-weight: 700; 
  border-top: 1px solid #f1f5f9; 
  padding-top: 20px; 
  display: flex;
  align-items: center;
  margin-top: auto;
}

.arrow {
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.glass-card.clickable:hover .arrow {
  transform: translateX(6px);
  color: #1e3a8a;
}

/* RESPONSIVIDADE */
@media (max-width: 768px) {
  .welcome-banner { 
    flex-direction: column; 
    text-align: center; 
    padding: 30px 20px; 
  }
  .banner-icon { display: none; }
}
</style>