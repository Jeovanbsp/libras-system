<template>
  <MainLayout pageTitle="Painel de Controle" pageDescription="Visão geral e métricas estratégicas do sistema LibrasSystem.">
    
    <!-- BANNER DE BOAS-VINDAS -->
    <div class="welcome-banner">
      <div class="banner-text">
        <h2>Resumo da Operação</h2>
        <p>Acompanhe o crescimento dos seus alunos, cursos e contratos corporativos em tempo real.</p>
      </div>
      <div class="banner-icon-wrapper">
        <Activity :size="100" />
      </div>
    </div>

    <!-- GRID DE CARDS PRINCIPAIS -->
    <div class="stats-grid">
      
      <div class="glass-card clickable" @click="router.push('/admin/usuarios')">
        <div class="card-header">
          <span class="tag">B2C</span>
          <h3>Alunos Ativos</h3>
        </div>
        <div class="card-value">{{ stats.alunos }}</div>
        <div class="card-footer">
          <span>Gerenciar alunos</span>
          <ArrowRight :size="18" class="arrow" />
        </div>
      </div>

      <div class="glass-card clickable" @click="router.push('/admin/cursos')">
        <div class="card-header">
          <span class="tag success">CATÁLOGO</span>
          <h3>Cursos de Libras</h3>
        </div>
        <div class="card-value">{{ stats.cursos }}</div>
        <div class="card-footer">
          <span>Ver catálogo</span>
          <ArrowRight :size="18" class="arrow" />
        </div>
      </div>

      <div class="glass-card clickable" @click="router.push('/admin/b2b')">
        <div class="card-header">
          <span class="tag purple">CORPORATIVO</span>
          <h3>Parceiros Corporativos</h3>
        </div>
        <div class="card-value">{{ stats.clientesB2B || 0 }}</div>
        <div class="card-footer">
          <span>Ver contratos</span>
          <ArrowRight :size="18" class="arrow" />
        </div>
      </div>

      <div v-if="userRole === 'admin'" class="glass-card clickable" @click="router.push('/admin/financeiro')">
        <div class="card-header">
          <span class="tag gold">FINANCEIRO</span>
          <h3>Gestão Financeira</h3>
        </div>
        <div class="card-value">
          <BadgeDollarSign :size="32" />
        </div>
        <div class="card-footer">
          <span>Acessar planejador</span>
          <ArrowRight :size="18" class="arrow" />
        </div>
      </div>

    </div>

    <!-- AÇÕES RÁPIDAS -->
    <div class="quick-actions">
      <h3 class="section-title">
        <Zap :size="24" /> Ações Rápidas
      </h3>
      <div class="actions-grid">
        <button @click="router.push('/admin/usuarios')" class="action-btn">
          <div class="icon-box icon-users"><Users :size="24" /></div>
          <span>Gerenciar Alunos</span>
        </button>
        <button @click="router.push('/admin/cursos')" class="action-btn">
          <div class="icon-box icon-courses"><BookOpen :size="24" /></div>
          <span>Gerenciar Cursos</span>
        </button>
        <button @click="router.push('/admin/b2b')" class="action-btn">
          <div class="icon-box icon-corporate"><Building2 :size="24" /></div>
          <span>Parceiros B2B</span>
        </button>
        <button @click="router.push('/admin/calculadora')" class="action-btn">
          <div class="icon-box icon-calculator"><Calculator :size="24" /></div>
          <span>Gerar Orçamento</span>
        </button>
        <button @click="router.push('/admin/profissionais')" class="action-btn">
          <div class="icon-box icon-professionals"><Users2 :size="24" /></div>
          <span>Alocar Intérprete</span>
        </button>
        <button @click="router.push('/admin/materiais')" class="action-btn">
          <div class="icon-box icon-materials"><UploadCloud :size="24" /></div>
          <span>Upload de Conteúdo</span>
        </button>
        <button v-if="userRole === 'admin'" @click="router.push('/admin/empresas')" class="action-btn">
          <div class="icon-box icon-companies"><Building2 :size="24" /></div>
          <span>Gerenciar Empresas</span>
        </button>
        <button v-if="userRole === 'admin'" @click="router.push('/admin/financeiro')" class="action-btn">
          <div class="icon-box icon-financial"><BadgeDollarSign :size="24" /></div>
          <span>Gestão Financeira</span>
        </button>
        <button @click="router.push('/admin/forum')" class="action-btn">
          <div class="icon-box icon-forum"><MessageSquare :size="24" /></div>
          <span>Fórum Admin</span>
        </button>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Activity, 
  ArrowRight, 
  Building2, 
  Calculator, 
  Users2,
  UploadCloud,
  BadgeDollarSign,
  MessageSquare,
  Users,
  BookOpen,
  Zap
} from 'lucide-vue-next'; 
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const router = useRouter();
const stats = ref({ alunos: 0, cursos: 0, clientesB2B: 0, vendas: '0.00' });
const userRole = ref(localStorage.getItem('userRole') || 'aluno');

onMounted(async () => {
  try {
    const res = await api.get('/stats');
    stats.value = res.data;
  } catch (err) { 
    console.error("Erro ao carregar o dashboard:", err); 
  }
});
</script>

<style scoped>
* { box-sizing: border-box; }

.welcome-banner {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 24px;
  padding: 35px 45px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
}

.banner-text h2 { font-size: 1.8rem; font-weight: 800; margin-bottom: 8px; }
.banner-text p { font-size: 1rem; opacity: 0.8; max-width: 500px; line-height: 1.5; }

.banner-icon-wrapper {
  opacity: 0.08;
  position: absolute;
  right: 30px;
  transform: rotate(-10deg);
}

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 25px; margin-bottom: 40px; }

.glass-card { background: white; padding: 30px 25px; border-radius: 20px; border: 1px solid #e2e8f0; transition: all 0.3s ease; display: flex; flex-direction: column; }
.glass-card.clickable:hover { transform: translateY(-5px); border-color: #004aad; box-shadow: 0 15px 30px rgba(0, 74, 173, 0.15); cursor: pointer; }

.tag { font-size: 0.7rem; font-weight: 800; color: #64748b; letter-spacing: 1px; margin-bottom: 15px; display: inline-block; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; }
.tag.success { color: #059669; background: #ecfdf5; }
.tag.gold { color: #d97706; background: #fffbeb; }
.tag.purple { color: #7c3aed; background: #f5f3ff; }

.card-header h3 { font-size: 0.95rem; color: #64748b; font-weight: 700; margin: 0; }
.card-value { font-size: 2.5rem; font-weight: 900; color: #0f172a; margin: 10px 0; letter-spacing: -1px; display: flex; align-items: center; justify-content: center; }
.card-value svg { color: #004aad; }

.card-footer { font-size: 0.85rem; color: #004aad; font-weight: 700; border-top: 1px solid #f1f5f9; padding-top: 15px; display: flex; align-items: center; justify-content: space-between; }
.arrow { transition: transform 0.3s ease; }
.glass-card.clickable:hover .arrow { transform: translateX(5px); }

.section-title { font-size: 1.2rem; color: #1e293b; font-weight: 800; margin: 40px 0 20px 0; display: flex; align-items: center; gap: 10px; }

.actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px; }

.action-btn { 
  background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px 15px; 
  display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; 
  transition: all 0.2s; color: #475569; font-weight: 700; font-size: 0.9rem;
}

.action-btn:hover { background: #f8fafc; border-color: #004aad; color: #004aad; transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0, 74, 173, 0.1); }

.icon-box { 
  background: #f1f5f9; color: #64748b; width: 45px; height: 45px; 
  display: flex; align-items: center; justify-content: center; border-radius: 12px; transition: 0.2s;
}

.action-btn:hover .icon-box { background: #eff6ff; color: #004aad; }

.icon-users { color: #0284c7; }
.icon-courses { color: #059669; }
.icon-corporate { color: #7c3aed; }
.icon-calculator { color: #d97706; }
.icon-professionals { color: #ec4899; }
.icon-materials { color: #8b5cf6; }
.icon-companies { color: #f97316; }
.icon-financial { color: #f59e0b; }
.icon-forum { color: #14b8a6; }

@media (max-width: 768px) {
  .welcome-banner { flex-direction: column; text-align: center; padding: 25px; }
  .banner-icon-wrapper { display: none; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .actions-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr; }
  .actions-grid { grid-template-columns: 1fr; }
  .welcome-banner { padding: 20px; }
  .banner-text h2 { font-size: 1.5rem; }
  .banner-text p { font-size: 0.9rem; }
}
</style>