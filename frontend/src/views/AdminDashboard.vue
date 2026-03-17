<template>
  <MainLayout pageTitle="Painel de Controle" pageDescription="Visão geral e métricas do sistema LibrasSystem.">
    
    <div class="welcome-banner">
      <div class="banner-text">
        <h2>Resumo da Operação 🚀</h2>
        <p>Acompanhe o crescimento dos seus alunos, cursos e contratos corporativos em tempo real.</p>
      </div>
      <div class="banner-icon">📊</div>
    </div>

    <div class="stats-grid">
      
      <div class="glass-card clickable" @click="router.push('/admin/usuarios')">
        <div class="card-header">
          <span class="tag">B2C</span>
          <h3>Alunos Ativos</h3>
        </div>
        <div class="card-value">{{ stats.alunos }}</div>
        <div class="card-footer">
          Gerenciar alunos <span class="arrow">&rarr;</span>
        </div>
      </div>

      <div class="glass-card clickable" @click="router.push('/admin/cursos')">
        <div class="card-header">
          <span class="tag success">CATÁLOGO</span>
          <h3>Cursos de Libras</h3>
        </div>
        <div class="card-value">{{ stats.cursos }}</div>
        <div class="card-footer">
          Ver catálogo <span class="arrow">&rarr;</span>
        </div>
      </div>

      <div class="glass-card clickable" @click="router.push('/admin/b2b')">
        <div class="card-header">
          <span class="tag purple">CORPORATIVO</span>
          <h3>Clientes B2B</h3>
        </div>
        <div class="card-value">{{ stats.clientesB2B || 0 }}</div>
        <div class="card-footer">
          Ver contratos <span class="arrow">&rarr;</span>
        </div>
      </div>

      <div class="glass-card clickable" @click="router.push('/admin/financeiro')">
        <div class="card-header">
          <span class="tag gold">FINANCEIRO</span>
          <h3>Receita Total</h3>
        </div>
        <div class="card-value text-blue">R$ {{ stats.vendas }}</div>
        <div class="card-footer">
          Acessar fluxo <span class="arrow">&rarr;</span>
        </div>
      </div>

    </div>

    <div class="quick-actions">
      <h3 class="section-title">Ações Rápidas</h3>
      <div class="actions-grid">
        <button @click="router.push('/admin/b2b')" class="action-btn">
          <div class="icon-box">🏢</div>
          <span>Novo Contrato B2B</span>
        </button>
        <button @click="router.push('/admin/calculadora')" class="action-btn">
          <div class="icon-box">🧮</div>
          <span>Gerar Orçamento</span>
        </button>
        <button @click="router.push('/admin/profissionais')" class="action-btn">
          <div class="icon-box">🤟</div>
          <span>Alocar Intérprete</span>
        </button>
        <button @click="router.push('/admin/materiais')" class="action-btn">
          <div class="icon-box">📂</div>
          <span>Upload de PDF</span>
        </button>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
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
/* BANNER DE DESTAQUE */
.welcome-banner {
  background: #1e293b; /* Cinza bem escuro para contrastar e dar tom "Admin" */
  border-radius: 24px;
  padding: 35px 40px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
  overflow: hidden;
}

.banner-text h2 {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.banner-text p {
  font-size: 1rem;
  opacity: 0.8;
  max-width: 500px;
  line-height: 1.5;
}

.banner-icon {
  font-size: 5rem;
  opacity: 0.15;
  transform: rotate(10deg);
  user-select: none;
}

/* ESTRUTURA GRID */
.stats-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
  gap: 25px; 
  margin-bottom: 40px;
}

/* CARTÕES PADRÃO (NOVA IDENTIDADE) */
.glass-card {
  background: white; 
  padding: 30px 25px; 
  border-radius: 20px;
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
  font-size: 0.7rem; 
  font-weight: 800; 
  color: #64748b; 
  letter-spacing: 1px; 
  margin-bottom: 15px; 
  display: inline-block;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 8px;
}
.tag.success { color: #059669; background: #ecfdf5; }
.tag.gold { color: #d97706; background: #fffbeb; }
.tag.purple { color: #7c3aed; background: #f5f3ff; }

/* TEXTOS E VALORES */
.card-header h3 { 
  font-size: 1rem; 
  color: #64748b; 
  font-weight: 700; 
  margin: 0; 
}

.card-value { 
  font-size: 2.5rem; 
  font-weight: 900; 
  color: #0f172a; 
  margin: 10px 0; 
  letter-spacing: -1px; 
}
.text-blue { color: #1e40af; } /* Destaque para a receita */

/* RODAPÉ DO CARD E ANIMAÇÃO DA SETA */
.card-footer { 
  font-size: 0.85rem; 
  color: #1e40af; 
  font-weight: 700; 
  border-top: 1px solid #f1f5f9; 
  padding-top: 15px; 
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

/* AÇÕES RÁPIDAS */
.section-title {
  font-size: 1.2rem;
  color: #1e293b;
  font-weight: 800;
  margin-bottom: 20px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.action-btn {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #475569;
  font-weight: 700;
  font-size: 0.95rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.02);
}

.action-btn:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(30, 64, 175, 0.1);
}

.icon-box {
  font-size: 1.8rem;
  background: #f8fafc;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.action-btn:hover .icon-box {
  background: white;
  color: #1e40af;
}

@media (max-width: 768px) {
  .welcome-banner { flex-direction: column; text-align: center; }
  .banner-icon { display: none; }
}
</style>