<template>
  <MainLayout pageTitle="Fluxo Financeiro" pageDescription="Acompanhe as vendas e despesas do seu sistema de Libras.">
    <div class="layout-split">
      <div class="glass-card side-form">
        <h3 class="form-title">💰 Novo Registro</h3>
        <form @submit.prevent="salvar" class="modern-form">
          <div class="form-group">
            <label>Descrição do Lançamento</label>
            <input v-model="nova.descricao" placeholder="Ex: Venda Curso Iniciante" required />
          </div>

          <div class="form-group">
            <label>Valor (R$)</label>
            <input v-model.number="nova.valor" type="number" step="0.01" placeholder="0,00" required />
          </div>

          <div class="form-group">
            <label>Tipo de Movimentação</label>
            <select v-model="nova.tipo">
              <option value="Entrada">Entrada (Receita)</option>
              <option value="Saída">Saída (Despesa)</option>
            </select>
          </div>

          <button type="submit" class="btn-primary">Registrar Lançamento</button>
        </form>
      </div>

      <div class="glass-card history-box">
        <h3 class="form-title">📊 Histórico de Transações</h3>
        <div class="history-list">
          <div v-for="item in transacoes" :key="item._id" class="history-item">
            <div class="item-main">
              <strong>{{ item.descricao }}</strong>
              <span class="item-date">{{ new Date(item.data).toLocaleDateString() }}</span>
            </div>
            <div class="item-actions">
              <span :class="['item-value', item.tipo === 'Entrada' ? 'positive' : 'negative']">
                {{ item.tipo === 'Entrada' ? '+' : '-' }} R$ {{ item.valor.toFixed(2) }}
              </span>
              <button @click="excluir(item._id)" class="btn-del-mini" title="Excluir">🗑️</button>
            </div>
          </div>
          <div v-if="transacoes.length === 0" class="empty-msg">Nenhum lançamento registrado.</div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const transacoes = ref([]);
const nova = ref({ descricao: '', valor: null, tipo: 'Entrada' });

const carregar = async () => {
  try {
    const res = await api.get('/financeiro');
    transacoes.value = res.data;
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
  }
};

const salvar = async () => {
  try {
    await api.post('/financeiro', nova.value);
    nova.value = { descricao: '', valor: null, tipo: 'Entrada' };
    carregar();
  } catch (err) {
    alert("Erro ao salvar lançamento.");
  }
};

const excluir = async (id) => {
  if (confirm("Deseja realmente apagar este registro financeiro?")) {
    try {
      await api.delete(`/financeiro/${id}`);
      carregar();
    } catch (err) {
      alert("Erro ao excluir.");
    }
  }
};

onMounted(carregar);
</script>

<style scoped>
.layout-split { display: grid; grid-template-columns: 350px 1fr; gap: 30px; }
.glass-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #edf2f7; box-shadow: 0 10px 25px rgba(0,0,0,0.03); }
.form-title { margin-bottom: 25px; color: #2d3748; font-size: 1.1rem; }

.modern-form label { display: block; font-size: 0.8rem; font-weight: 600; color: #718096; margin: 15px 0 5px; }
.modern-form input, .modern-form select { 
  width: 100%; padding: 12px; border: 1px solid #edf2f7; border-radius: 12px; background: #f8f9fd; font-size: 0.9rem;
}
.btn-primary { width: 100%; background: #8e44ad; color: white; border: none; padding: 15px; border-radius: 12px; margin-top: 25px; font-weight: bold; cursor: pointer; transition: 0.3s; }
.btn-primary:hover { background: #732d91; transform: translateY(-2px); }

.history-list { display: flex; flex-direction: column; }
.history-item { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; border-bottom: 1px solid #f7fafc; }
.item-main strong { display: block; color: #2d3748; font-size: 1rem; }
.item-date { font-size: 0.8rem; color: #a0aec0; }

.item-actions { display: flex; align-items: center; gap: 15px; }
.item-value { font-weight: 700; font-size: 1rem; }
.positive { color: #48bb78; }
.negative { color: #e53e3e; }

.btn-del-mini { background: #fff5f5; border: none; padding: 8px; border-radius: 10px; cursor: pointer; transition: 0.2s; }
.btn-del-mini:hover { background: #fed7d7; }
.empty-msg { text-align: center; padding: 40px; color: #a0aec0; }
</style>