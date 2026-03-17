<template>
  <MainLayout pageTitle="Calculadora de Orçamentos" pageDescription="Inteligência Financeira: Gere orçamentos protegendo a sua margem de lucro e impostos.">
    <div class="layout-split">
      
      <div class="glass-card side-form">
        <h3 class="form-title">
          <span class="icon-badge">🧮</span> Parâmetros do Serviço
        </h3>
        
        <form @submit.prevent class="modern-form">
          <div class="form-row">
            <div>
              <label>Duração (Horas)</label>
              <input v-model.number="form.tempoServico" type="number" min="1" required />
            </div>
            <div>
              <label>Valor da Hora (R$)</label>
              <input v-model.number="form.valorHora" type="number" step="0.01" required />
            </div>
          </div>

          <div class="form-group">
            <label>Custos Extras / Logística (R$)</label>
            <input v-model.number="form.logistica" type="number" step="0.01" placeholder="Ex: Transporte, Alimentação" />
          </div>

          <div class="form-row">
            <div>
              <label>Impostos (%)</label>
              <input v-model.number="form.imposto" type="number" step="0.1" placeholder="Ex: 6.0" />
            </div>
            <div>
              <label>Margem de Lucro (%)</label>
              <input v-model.number="form.lucro" type="number" step="0.1" placeholder="Ex: 20.0" />
            </div>
          </div>
        </form>
      </div>

      <div class="glass-card result-box">
        <h3 class="form-title">
          <span class="icon-badge">📄</span> Resumo do Orçamento
        </h3>

        <div class="price-badge">
          <span class="badge-label">Valor Final Sugerido</span>
          <h1>R$ {{ valorFinal.toFixed(2) }}</h1>
        </div>

        <div class="details-list">
          <div class="detail-item">
            <span>Subtotal Bruto (Horas + Logística)</span>
            <strong>R$ {{ subtotalBruto.toFixed(2) }}</strong>
          </div>
          <div class="detail-item">
            <span>Reserva para Impostos ({{ form.imposto || 0 }}%)</span>
            <strong class="text-negative">R$ {{ valorImposto.toFixed(2) }}</strong>
          </div>
          <div class="detail-item highlight">
            <span>Lucro Líquido ({{ form.lucro || 0 }}%)</span>
            <strong class="text-positive">R$ {{ valorLucro.toFixed(2) }}</strong>
          </div>
        </div>

        <button @click="copyToClipboard" class="btn-primary">Copiar Orçamento</button>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import MainLayout from '../components/MainLayout.vue';

const form = ref({
  tempoServico: 2,
  valorHora: 150,
  logistica: 50,
  imposto: 6,  // 6% Simples Nacional
  lucro: 20    // 20% Margem
});

// Cálculo base
const subtotalBruto = computed(() => {
  return (form.value.tempoServico * form.value.valorHora) + (form.value.logistica || 0);
});

// Cálculo "Por Dentro" (Baseado no seu Escopo: G2 / (1 - E2 - F2))
const valorFinal = computed(() => {
  const txImposto = (form.value.imposto || 0) / 100;
  const txLucro = (form.value.lucro || 0) / 100;
  const taxasSum = txImposto + txLucro;

  // Proteção matemática: Se impostos + lucro passarem de 100%, a fórmula quebra
  if (taxasSum >= 1) return 0;

  return subtotalBruto.value / (1 - taxasSum);
});

const valorImposto = computed(() => valorFinal.value * ((form.value.imposto || 0) / 100));
const valorLucro = computed(() => valorFinal.value * ((form.value.lucro || 0) / 100));

const copyToClipboard = () => {
  const msg = `Orçamento - Serviços de Acessibilidade em Libras
--------------------------------------
Duração Estimada: ${form.value.tempoServico} horas
Taxa de Logística: R$ ${(form.value.logistica || 0).toFixed(2)}
Valor Final Sugerido: R$ ${valorFinal.value.toFixed(2)}
--------------------------------------
*Valores sujeitos a alteração de acordo com as necessidades do evento.`;

  navigator.clipboard.writeText(msg);
  alert("Orçamento formatado copiado para a área de transferência!");
};
</script>

<style scoped>
/* ESTRUTURA ORIGINAL COM CORES AZUIS E DESIGN MODERNO */
.layout-split { display: grid; grid-template-columns: 380px 1fr; gap: 30px; align-items: start; }

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

/* FORMULÁRIO */
.modern-form label { display: block; font-size: 0.8rem; font-weight: 700; color: #64748b; margin: 15px 0 5px; text-transform: uppercase; letter-spacing: 0.5px; }

.modern-form input { 
  width: 100%; 
  padding: 14px; 
  border: 1px solid #e2e8f0; 
  border-radius: 12px; 
  background: #f8fafc; 
  font-size: 0.95rem;
  color: #1e293b;
  font-weight: 500;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.modern-form input:focus {
  outline: none;
  border-color: #1e40af;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.15);
  background: white;
}

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

/* ÁREA DE RESULTADOS (PRICE BADGE AZUL) */
.price-badge { 
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  color: white; 
  padding: 30px; 
  border-radius: 20px; 
  margin-bottom: 30px; 
  text-align: center;
  box-shadow: 0 10px 20px rgba(30, 64, 175, 0.2);
}

.badge-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
  opacity: 0.9;
}

.price-badge h1 {
  font-size: 3rem;
  margin: 10px 0 0 0;
  font-weight: 900;
  letter-spacing: -1px;
}

/* LISTA DE DETALHES FINANCEIROS */
.details-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8fafc;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #475569;
}

.detail-item.highlight {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
}

.detail-item span { font-weight: 500; }
.detail-item strong { font-weight: 800; font-size: 1.05rem; }

.text-negative { color: #dc2626; }
.text-positive { color: #059669; }

/* BOTÃO PRINCIPAL */
.btn-primary { 
  width: 100%; 
  background: #1e293b; /* Cinza muito escuro para contrastar com o banner azul */
  color: white; 
  border: none; 
  padding: 18px; 
  border-radius: 14px; 
  font-weight: 800; 
  font-size: 1.05rem;
  cursor: pointer; 
  transition: all 0.3s; 
}
.btn-primary:hover { 
  background: #0f172a; 
  transform: translateY(-2px); 
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.25);
}

@media (max-width: 900px) {
  .layout-split { grid-template-columns: 1fr; }
}
</style>