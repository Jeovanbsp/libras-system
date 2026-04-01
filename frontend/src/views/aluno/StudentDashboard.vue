<template>
  <StudentLayout pageTitle="Meu Painel" pageDescription="Acompanhe o seu progresso e acesse os seus conteúdos de Libras.">
    
    <div class="welcome-banner">
      <div class="banner-text">
        <h2>Olá, Aluno!</h2>
        <p>Continue a sua jornada de aprendizado. Os seus materiais e salas de aula já estão disponíveis abaixo.</p>
      </div>
      <div class="banner-icon-wrapper">
        <GraduationCap :size="120" />
      </div>
    </div>

    <div class="stats-grid">
      
      <div class="glass-card clickable" @click="router.push('/aluno/cursos')">
        <div class="card-header">
          <span class="tag">ESTUDOS</span>
          <h3>Cursos Matriculados</h3>
        </div>
        <div class="card-value">{{ totalCursos }}</div>
        <div class="card-footer">
          <span>Acessar salas de aula</span>
          <ArrowRight :size="18" class="arrow-icon" />
        </div>
      </div>

      <div class="glass-card clickable" @click="router.push('/aluno/materiais')">
        <div class="card-header">
          <span class="tag success">APOIO DIGITAL</span>
          <h3>Apostilas Disponíveis</h3>
        </div>
        <div class="card-value">{{ totalMateriais }}</div>
        <div class="card-footer">
          <span>Fazer download de PDFs</span>
          <ArrowRight :size="18" class="arrow-icon" />
        </div>
      </div>

      <div class="glass-card clickable">
        <div class="card-header">
          <span class="tag gold">CONQUISTAS</span>
          <h3>Certificados Emitidos</h3>
        </div>
        <div class="card-value">0</div>
        <div class="card-footer">
          <span>Ver as minhas conquistas</span>
          <ArrowRight :size="18" class="arrow-icon" />
        </div>
      </div>

    </div>
  </StudentLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { GraduationCap, ArrowRight } from 'lucide-vue-next'; // Ícones profissionais
import StudentLayout from '../../components/StudentLayout.vue';
import api from '../../services/api';

const router = useRouter();
const totalCursos = ref(0);
const totalMateriais = ref(0);

const carregarDados = async () => {
  try {
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
.welcome-banner {
  background: linear-gradient(135deg, #004aad, #1e40af);
  border-radius: 24px;
  padding: 40px 50px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  box-shadow: 0 10px 25px rgba(0, 74, 173, 0.2);
  position: relative;
  overflow: hidden;
}

.banner-text h2 { font-size: 2.2rem; font-weight: 800; margin-bottom: 10px; }
.banner-text p { font-size: 1.05rem; opacity: 0.9; max-width: 500px; line-height: 1.5; }

.banner-icon-wrapper {
  opacity: 0.15;
  transform: rotate(15deg);
  position: absolute;
  right: 20px;
  top: 10px;
  user-select: none;
}

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }

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
  box-shadow: 0 20px 40px rgba(0, 74, 173, 0.12);
  border-color: #bfdbfe; 
  cursor: pointer; 
}

.tag { font-size: 0.75rem; font-weight: 800; color: #64748b; letter-spacing: 1px; margin-bottom: 12px; display: inline-block; background: #f1f5f9; padding: 4px 10px; border-radius: 8px; }
.tag.success { color: #059669; background: #ecfdf5; }
.tag.gold { color: #d97706; background: #fffbeb; }

.card-header h3 { font-size: 1.1rem; color: #1e293b; font-weight: 700; margin: 0; }
.card-value { font-size: 3.5rem; font-weight: 900; color: #0f172a; margin: 15px 0; letter-spacing: -2px; }

.card-footer { 
  font-size: 0.9rem; 
  color: #004aad; 
  font-weight: 700; 
  border-top: 1px solid #f1f5f9; 
  padding-top: 20px; 
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.glass-card.clickable:hover .arrow-icon {
  transform: translateX(6px);
}

@media (max-width: 768px) {
  .welcome-banner { flex-direction: column; text-align: center; padding: 30px 20px; }
  .banner-icon-wrapper { display: none; }
}
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