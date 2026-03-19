<template>
  <MainLayout pageTitle="Painel de Controle" pageDescription="Visão geral e métricas estratégicas do sistema LibrasSystem.">
    
    <div class="welcome-banner">
      <div class="banner-text">
        <h2>Resumo da Operação</h2>
        <p>Acompanhe o crescimento dos seus alunos, cursos e contratos corporativos em tempo real.</p>
      </div>
      <div class="banner-icon-wrapper">
        <Activity :size="100" />
      </div>
    </div>

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

      <div class="glass-card clickable" @click="router.push('/admin/financeiro')">
        <div class="card-header">
          <span class="tag gold">FINANCEIRO</span>
          <h3>Receita Total</h3>
        </div>
        <div class="card-value text-brand">R$ {{ stats.vendas }}</div>
        <div class="card-footer">
          <span>Acessar fluxo</span>
          <ArrowRight :size="18" class="arrow" />
        </div>
      </div>

    </div>

    <div class="quick-actions">
      <h3 class="section-title">Ações Rápidas</h3>
      <div class="actions-grid">
        <button @click="router.push('/admin/b2b')" class="action-btn">
          <div class="icon-box"><Building2 :size="24" /></div>
          <span>Novo Parceiro B2B</span>
        </button>
        <button @click="router.push('/admin/calculadora')" class="action-btn">
          <div class="icon-box"><Calculator :size="24" /></div>
          <span>Gerar Orçamento</span>
        </button>
        <button @click="router.push('/admin/profissionais')" class="action-btn">
          <div class="icon-box"><HandMetal :size="24" /></div>
          <span>Alocar Intérprete</span>
        </button>
        <button @click="router.push('/admin/materiais')" class="action-btn">
          <div class="icon-box"><UploadCloud :size="24" /></div>
          <span>Upload de PDF</span>
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
  HandMetal, 
  UploadCloud 
} from 'lucide-vue-next'; // Ícones profissionais
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const router = useRouter();
const stats = ref({ alunos: 0, cursos: 0, clientesB2B: 0, vendas: '0.00' });

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
.welcome-banner {
  background: #0f172a; /* Azul Navy profundo */
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
.banner-text p { font-size: 1rem; opacity: 0.7; max-width: 500px; line-height: 1.5; }

.banner-icon-wrapper {
  opacity: 0.1;
  position: absolute;
  right: 30px;
  transform: rotate(-10deg);
}

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 25px; margin-bottom: 40px; }

.glass-card { background: white; padding: 30px 25px; border-radius: 20px; border: 1px solid #e2e8f0; transition: all 0.3s ease; display: flex; flex-direction: column; }
.glass-card.clickable:hover { transform: translateY(-5px); border-color: #004aad; box-shadow: 0 15px 30px rgba(0, 74, 173, 0.1); cursor: pointer; }

.tag { font-size: 0.7rem; font-weight: 800; color: #64748b; letter-spacing: 1px; margin-bottom: 15px; display: inline-block; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; }
.tag.success { color: #059669; background: #ecfdf5; }
.tag.gold { color: #d97706; background: #fffbeb; }
.tag.purple { color: #7c3aed; background: #f5f3ff; }

.card-header h3 { font-size: 0.95rem; color: #64748b; font-weight: 700; margin: 0; }
.card-value { font-size: 2.5rem; font-weight: 900; color: #0f172a; margin: 10px 0; letter-spacing: -1px; }
.text-brand { color: #004aad; }

.card-footer { font-size: 0.85rem; color: #004aad; font-weight: 700; border-top: 1px solid #f1f5f9; padding-top: 15px; display: flex; align-items: center; justify-content: space-between; margin-top: auto; }

.arrow { transition: transform 0.3s ease; }
.glass-card.clickable:hover .arrow { transform: translateX(5px); }

.section-title { font-size: 1.1rem; color: #1e293b; font-weight: 800; margin-bottom: 20px; }

.actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }

.action-btn { 
  background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 25px 20px; 
  display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: pointer; 
  transition: all 0.2s; color: #475569; font-weight: 700;
}

.action-btn:hover { background: #f8fafc; border-color: #004aad; color: #004aad; transform: translateY(-2px); }

.icon-box { 
  background: #f1f5f9; color: #64748b; width: 48px; height: 48px; 
  display: flex; align-items: center; justify-content: center; border-radius: 12px; transition: 0.2s;
}

.action-btn:hover .icon-box { background: #eff6ff; color: #004aad; }

@media (max-width: 768px) {
  .welcome-banner { flex-direction: column; text-align: center; }
  .banner-icon-wrapper { display: none; }
}
</style>