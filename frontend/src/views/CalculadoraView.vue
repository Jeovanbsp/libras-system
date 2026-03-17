<template>
  <div class="dashboard-container">
    <div class="calc-wrapper">
      <header class="calc-header">
        <h2>🧮 Calculadora de Precificação</h2>
        <p>Defina valores justos para suas aulas ou interpretações</p>
      </header>

      <div class="calc-content">
        <div class="input-card">
          <div class="field">
            <label>Custos Fixos Mensais (R$)</label>
            <input v-model.number="form.custoFixo" type="number" />
          </div>
          <div class="field">
            <label>Horas de Trabalho por Mês</label>
            <input v-model.number="form.horasMes" type="number" />
          </div>
          <div class="field">
            <label>Duração do Serviço (Horas)</label>
            <input v-model.number="form.tempoServico" type="number" />
          </div>
          <div class="field">
            <label>Margem de Lucro (%)</label>
            <input v-model.number="form.lucro" type="number" />
          </div>
        </div>

        <div class="result-card">
          <div class="price-badge">
            <span>Preço Sugerido</span>
            <h1>R$ {{ precoSugerido.toFixed(2) }}</h1>
          </div>
          <div class="details">
            <p>Sua hora técnica: <strong>R$ {{ valorHora.toFixed(2) }}</strong></p>
            <p>Custo operacional: <strong>R$ {{ custoBase.toFixed(2) }}</strong></p>
          </div>
          <button @click="copyToClipboard" class="btn-copy">Copiar Orçamento</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const form = ref({
  custoFixo: 1200,
  horasMes: 160,
  tempoServico: 1,
  lucro: 30
});

const valorHora = computed(() => form.value.custoFixo / (form.value.horasMes || 1));
const custoBase = computed(() => valorHora.value * form.value.tempoServico);
const precoSugerido = computed(() => custoBase.value * (1 + (form.value.lucro / 100)));

const copyToClipboard = () => {
  const msg = `Orçamento: R$ ${precoSugerido.value.toFixed(2)} por ${form.value.tempoServico}h de serviço.`;
  navigator.clipboard.writeText(msg);
  alert("Copiado!");
};
</script>

<style scoped>
.dashboard-container { padding: 40px; background: #f0f2f5; min-height: 100vh; }
.calc-wrapper { max-width: 900px; margin: 0 auto; }
.calc-header { margin-bottom: 30px; text-align: left; }
.calc-content { display: grid; grid-template-columns: 1fr 350px; gap: 20px; }
.input-card, .result-card { background: white; padding: 25px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.field { margin-bottom: 20px; display: flex; flex-direction: column; text-align: left; }
.field label { font-size: 0.9rem; font-weight: bold; margin-bottom: 8px; color: #444; }
.field input { padding: 12px; border: 1px solid #ddd; border-radius: 10px; }
.price-badge { background: #6c5ce7; color: white; padding: 20px; border-radius: 15px; margin-bottom: 20px; }
.btn-copy { width: 100%; padding: 15px; background: #00b894; color: white; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; }
@media (max-width: 768px) { .calc-content { grid-template-columns: 1fr; } }
</style>