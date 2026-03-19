<template>
  <MainLayout pageTitle="Fluxo Financeiro" pageDescription="Acompanhe as vendas e despesas do seu sistema de Libras com precisão.">
    
    <div class="stats-grid mb-8">
      <div class="glass-card stat-item">
        <div class="stat-header">
          <TrendingUp :size="18" class="text-green-600" />
          <span class="tag success">Receitas</span>
        </div>
        <div class="value">R$ {{ totalEntradas.toFixed(2) }}</div>
        <div class="trend positive">Entradas acumuladas</div>
      </div>
      
      <div class="glass-card stat-item">
        <div class="stat-header">
          <TrendingDown :size="18" class="text-red-600" />
          <span class="tag danger">Despesas</span>
        </div>
        <div class="value">R$ {{ totalSaidas.toFixed(2) }}</div>
        <div class="trend">Custos operacionais</div>
      </div>

      <div class="glass-card stat-item">
        <div class="stat-header">
          <Wallet :size="18" class="text-amber-600" />
          <span class="tag gold">Saldo Geral</span>
        </div>
        <div class="value" :class="{ 'text-red': saldo < 0 }">
          R$ {{ saldo.toFixed(2) }}
        </div>
        <div class="trend">Balanço em caixa</div>
      </div>
    </div>

    <div class="layout-split">
      <div class="glass-card side-form">
        <h3 class="form-title">
          <CircleDollarSign :size="20" class="text-brand" /> Novo Registro
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

          <button type="submit" class="btn-primary">
            <Plus :size="18" /> Registrar Lançamento
          </button>
        </form>
      </div>

      <div class="glass-card history-box">
        <h3 class="form-title">
          <History :size="20" class="text-brand" /> Histórico de Transações
        </h3>
        <div class="history-list">
          <div v-for="item in transacoes" :key="item._id" class="history-item">
            <div class="item-main">
              <strong>{{ item.descricao }}</strong>
              <span class="item-date">
                <Calendar :size="12" /> {{ new Date(item.data || Date.now()).toLocaleDateString('pt-BR') }}
              </span>
            </div>
            <div class="item-actions">
              <span :class="['item-value', item.tipo === 'Entrada' ? 'positive' : 'negative']">
                {{ item.tipo === 'Entrada' ? '+' : '-' }} R$ {{ item.valor.toFixed(2) }}
              </span>
              <button @click="excluir(item._id)" class="btn-del-mini" title="Excluir">
                <Trash2 :size="18" />
              </button>
            </div>
          </div>
          <div v-if="transacoes.length === 0" class="empty-msg">
            <Inbox :size="32" class="opacity-20" />
            <p>Nenhum lançamento registrado.</p>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CircleDollarSign, 
  History, 
  Plus, 
  Calendar, 
  Trash2,
  Inbox
} from 'lucide-vue-next'; // Ícones profissionais
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const transacoes = ref([]);
const nova = ref({ descricao: '', valor: null, tipo: 'Entrada' });

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
    console.error("Erro ao carregar dados financeiros:", err);
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
.mb-8 { margin-bottom: 32px; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

.stat-item { padding: 25px; border-radius: 20px; }
.stat-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; }
.stat-item .value { font-size: 1.8rem; font-weight: 900; color: #0f172a; margin: 5px 0; letter-spacing: -1px; }
.stat-item .trend { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }

.tag { font-size: 0.65rem; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; }
.tag.success { background: #ecfdf5; color: #059669; }
.tag.danger { background: #fef2f2; color: #dc2626; }
.tag.gold { background: #fffbeb; color: #d97706; }

.layout-split { display: grid; grid-template-columns: 350px 1fr; gap: 30px; align-items: start; }
.text-brand { color: #004aad; }

.glass-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0, 74, 173, 0.05); }
.form-title { margin-bottom: 25px; color: #1e293b; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }

.modern-form label { display: block; font-size: 0.8rem; font-weight: 700; color: #64748b; margin: 15px 0 5px; text-transform: uppercase; }
.modern-form input, .modern-form select { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; font-size: 0.95rem; box-sizing: border-box; }
.modern-form input:focus { outline: none; border-color: #004aad; box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1); background: white; }

.btn-primary { 
  width: 100%; background: #004aad; color: white; border: none; padding: 16px; border-radius: 14px; 
  margin-top: 25px; font-weight: 800; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-primary:hover { background: #003a8c; transform: translateY(-2px); }

.history-item { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; border-bottom: 1px solid #f1f5f9; }
.item-main strong { display: block; color: #1e293b; font-size: 1rem; margin-bottom: 4px; }
.item-date { font-size: 0.8rem; color: #94a3b8; display: flex; align-items: center; gap: 5px; }

.item-value { font-weight: 800; font-size: 0.9rem; padding: 6px 12px; border-radius: 8px; }
.positive { color: #059669; background: #ecfdf5; }
.negative { color: #dc2626; background: #fef2f2; }

.btn-del-mini { background: transparent; border: none; padding: 8px; border-radius: 8px; cursor: pointer; color: #94a3b8; transition: 0.2s; }
.btn-del-mini:hover { background: #fee2e2; color: #ef4444; }

.text-red { color: #dc2626 !important; }
.empty-msg { text-align: center; padding: 40px; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 10px; }

@media (max-width: 900px) {
  .stats-grid { grid-template-columns: 1fr; }
  .layout-split { grid-template-columns: 1fr; }
}
</style>