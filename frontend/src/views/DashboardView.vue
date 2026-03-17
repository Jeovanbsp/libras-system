<template>
  <MainLayout pageTitle="Configuração do Painel" pageDescription="Visão geral e métricas do sistema de Libras.">
    <div class="stats-grid">
      <div class="glass-card clickable" @click="router.push('/usuarios')">
        <div class="card-header">
          <span class="tag">ESTATÍSTICA</span>
          <h3>Total de Alunos</h3>
        </div>
        <div class="card-value">{{ stats.alunos }}</div>
        <div class="card-footer">Visualizar lista completa →</div>
      </div>

      <div class="glass-card clickable" @click="router.push('/cursos')">
        <div class="card-header">
          <span class="tag success">ATIVOS</span>
          <h3>Cursos de Libras</h3>
        </div>
        <div class="card-value">{{ stats.cursos }}</div>
        <div class="card-footer">Gerenciar catálogo →</div>
      </div>

      <div class="glass-card clickable" @click="router.push('/financeiro')">
        <div class="card-header">
          <span class="tag gold">MENSAL</span>
          <h3>Receita Total</h3>
        </div>
        <div class="card-value">R$ {{ stats.vendas }}</div>
        <div class="card-footer">Ver relatório financeiro →</div>
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
const stats = ref({ alunos: 0, cursos: 0, vendas: '0.00' });

onMounted(async () => {
  try {
    const res = await api.get('/stats');
    stats.value = res.data;
  } catch (err) { console.error(err); }
});
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; }
.glass-card {
  background: white; padding: 30px; border-radius: 24px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.03); border: 1px solid #edf2f7;
  transition: 0.3s; position: relative;
}
.glass-card.clickable:hover { transform: translateY(-5px); box-shadow: 0 15px 35px rgba(142, 68, 173, 0.1); border-color: #d6bcfa; cursor: pointer; }
.tag { font-size: 0.7rem; font-weight: 800; color: #a0aec0; letter-spacing: 1px; margin-bottom: 10px; display: block; }
.tag.success { color: #48bb78; }
.tag.gold { color: #ecc94b; }
.card-header h3 { font-size: 1rem; color: #4a5568; }
.card-value { font-size: 2.5rem; font-weight: 800; color: #2d3748; margin: 15px 0; }
.card-footer { font-size: 0.85rem; color: #8e44ad; font-weight: 600; border-top: 1px solid #f7fafc; padding-top: 15px; }
</style>