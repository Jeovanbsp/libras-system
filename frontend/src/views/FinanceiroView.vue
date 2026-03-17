<template>
  <MainLayout pageTitle="Fluxo Financeiro" pageDescription="Acompanhe as vendas e despesas do seu sistema de Libras.">
    
    <div class="stats-grid mb-8">
      <div class="glass-card stat-item">
        <span class="tag success">Receitas</span>
        <div class="value">R$ {{ totalEntradas.toFixed(2) }}</div>
        <div class="trend positive">↑ Entradas acumuladas</div>
      </div>
      
      <div class="glass-card stat-item">
        <span class="tag danger">Despesas</span>
        <div class="value">R$ {{ totalSaidas.toFixed(2) }}</div>
        <div class="trend">↓ Custos operacionais</div>
      </div>

      <div class="glass-card stat-item">
        <span class="tag gold">Saldo Geral</span>
        <div class="value" :class="{ 'text-red': saldo < 0 }">
          R$ {{ saldo.toFixed(2) }}
        </div>
        <div class="trend">Balanço em caixa</div>
      </div>
    </div>

    <div class="layout-split">
      <div class="glass-card side-form">
        <h3 class="form-title">
          <span class="icon-badge">💰</span> Novo Registro
        </h3>
        <form @submit.prevent="salvar" class="modern-form">
          <div class="form-group">
            <label>Descrição do Lançamento</label>
            <input v-model="nova.descricao" placeholder="Ex: Venda Curso Iniciante" required />
          </div>

          <div class="form-group">
            <label>Valor (R$)</label>
            <input v-model.number="nova.valor" type="number" step="0.01" placeholder="0.00" required />
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
        <h3 class="form-title">
          <span class="icon-badge">📊</span> Histórico de Transações
        </h3>
        <div class="history-list">
          <div v-for="item in transacoes" :key="item._id" class="history-item">
            <div class="item-main">
              <strong>{{ item.descricao }}</strong>
              <span class="item-date">{{ new Date(item.data || Date.now()).toLocaleDateString('pt-BR') }}</span>
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
import { ref, computed, onMounted } from 'vue';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const transacoes = ref([]);
const nova = ref({ descricao: '', valor: null, tipo: 'Entrada' });

// CÁLCULOS AUTOMÁTICOS
const totalEntradas = computed(() => 
  transacoes.value.filter(t => t.tipo === 'Entrada').reduce((acc, t) => acc + t.valor, 0)
);

const totalSaidas = computed(() => 
  transacoes.value.filter(t => t.tipo === 'Saída').reduce((acc, t) => acc + t.valor, 0)
);

const saldo = computed(() => totalEntradas.value - totalSaidas.value);

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
/* ESTRUTURA E DASHBOARD */
.mb-8 { margin-bottom: 32px; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

.stat-item { padding: 25px; text-align: left; }
.stat-item .value { font-size: 1.8rem; font-weight: 900; color: #1e293b; margin: 10px 0; letter-spacing: -1px; }
.stat-item .trend { font-size: 0.75rem; font-weight: 600; color: #94a3b8; }

/* BADGES DE STATUS NO TOPO */
.tag { font-size: 0.65rem; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
.tag.success { background: #ecfdf5; color: #059669; }
.tag.danger { background: #fef2f2; color: #dc2626; }
.tag.gold { background: #fffbeb; color: #d97706; }

/* LAYOUT SPLIT ORIGINAL */
.layout-split { display: grid; grid-template-columns: 350px 1fr; gap: 30px; align-items: start; }

.glass-card { 
  background: white; 
  padding: 30px; 
  border-radius: 24px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05); 
}

.form-title { 
  margin-bottom: 25px; 
  color: #1e293b; 
  font-size: 1.2rem; 
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-badge {
  background: #eff6ff; 
  padding: 8px;
  border-radius: 10px;
  font-size: 1rem;
}

.modern-form label { display: block; font-size: 0.8rem; font-weight: 700; color: #64748b; margin: 15px 0 5px; text-transform: uppercase; letter-spacing: 0.5px; }

.modern-form input, .modern-form select { 
  width: 100%; 
  padding: 14px; 
  border: 1px solid #e2e8f0; 
  border-radius: 12px; 
  background: #f8fafc; 
  font-size: 0.95rem;
  color: #1e293b;
  font-weight: 500;
  transition: all 0.2s ease;
}

.modern-form input:focus, .modern-form select:focus {
  outline: none;
  border-color: #1e40af;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.15);
  background: white;
}

.btn-primary { 
  width: 100%; 
  background: #1e40af; 
  color: white; 
  border: none; 
  padding: 16px; 
  border-radius: 14px; 
  margin-top: 25px; 
  font-weight: bold; 
  font-size: 1rem;
  cursor: pointer; 
  transition: all 0.3s; 
}
.btn-primary:hover { 
  background: #1e3a8a; 
  transform: translateY(-2px); 
  box-shadow: 0 8px 20px rgba(30, 64, 175, 0.25);
}

.history-list { display: flex; flex-direction: column; }
.history-item { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; border-bottom: 1px solid #f1f5f9; transition: background 0.2s; }
.history-item:hover { background: #f8fafc; border-radius: 12px; padding: 20px 10px; margin: 0 -10px; }

.item-main strong { display: block; color: #1e293b; font-size: 1.05rem; margin-bottom: 4px; }
.item-date { font-size: 0.8rem; color: #94a3b8; font-weight: 500; }

.item-actions { display: flex; align-items: center; gap: 15px; }

.item-value { font-weight: 800; font-size: 0.95rem; padding: 6px 12px; border-radius: 8px; }
.positive { color: #059669; background: #ecfdf5; }
.negative { color: #dc2626; background: #fef2f2; }

.btn-del-mini { background: transparent; border: none; padding: 8px; border-radius: 10px; cursor: pointer; transition: 0.2s; opacity: 0.5; filter: grayscale(1); }
.history-item:hover .btn-del-mini { opacity: 1; filter: grayscale(0); }
.btn-del-mini:hover { background: #fee2e2; }

.text-red { color: #dc2626 !important; }
.empty-msg { text-align: center; padding: 40px; color: #94a3b8; font-weight: 500; }
</style>