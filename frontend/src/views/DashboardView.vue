<template>
  <MainLayout pageTitle="Painel de Controle" pageDescription="Visão geral e métricas estratégicas do sistema LibrasSystem.">
    <div class="stats-grid">
      
      <div class="glass-card clickable" @click="router.push('/admin/usuarios')">
        <div class="card-header">
          <span class="tag">ESTATÍSTICA</span>
          <h3>Total de Alunos</h3>
        </div>
        <div class="card-value">{{ stats.alunos }}</div>
        <div class="card-footer">
          <span>Visualizar lista completa</span>
          <ArrowRight :size="18" class="arrow" />
        </div>
      </div>

      <div class="glass-card clickable" @click="router.push('/admin/cursos')">
        <div class="card-header">
          <span class="tag success">ATIVOS</span>
          <h3>Cursos de Libras</h3>
        </div>
        <div class="card-value">{{ stats.cursos }}</div>
        <div class="card-footer">
          <span>Gerenciar catálogo</span>
          <ArrowRight :size="18" class="arrow" />
        </div>
      </div>

      <div class="glass-card clickable" @click="router.push('/admin/financeiro')">
        <div class="card-header">
          <span class="tag gold">MENSAL</span>
          <h3>Receita Total</h3>
        </div>
        <div class="card-value">R$ {{ stats.vendas }}</div>
        <div class="card-footer">
          <span>Ver relatório financeiro</span>
          <ArrowRight :size="18" class="arrow" />
        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight } from 'lucide-vue-next'; // Ícone profissional
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const router = useRouter();
const stats = ref({ alunos: 0, cursos: 0, vendas: '0.00' });

onMounted(async () => {
  try {
    const res = await api.get('/stats');
    stats.value = res.data;
  } catch (err) { 
    console.error("Erro ao carregar estatísticas:", err); 
  }
});
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }

.glass-card {
  background: white; 
  padding: 35px 30px; 
  border-radius: 24px;
  box-shadow: 0 10px 25px rgba(0, 74, 173, 0.05); 
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

.card-header h3 { font-size: 1.1rem; color: #1e293b; font-weight: 700; margin: 0; }
.card-value { font-size: 3rem; font-weight: 900; color: #0f172a; margin: 20px 0; letter-spacing: -1px; }

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

.arrow { transition: transform 0.3s ease; }
.glass-card.clickable:hover .arrow { transform: translateX(6px); color: #003a8c; }
</style>