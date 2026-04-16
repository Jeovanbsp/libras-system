<template>
  <MainLayout pageTitle="Calculadora de Orçamentos" pageDescription="Inteligência Financeira: Gere orçamentos protegendo a sua margem de lucro e impostos.">
    <div class="layout-split">
      
      <div class="glass-card side-form">
        <h3 class="form-title">
          <Calculator :size="20" class="text-blue-700" /> Parâmetros do Serviço
        </h3>
        
        <form @submit.prevent class="modern-form">
          <div class="form-group">
            <label>Nome do Cliente / Evento</label>
            <input v-model="form.nomeCliente" type="text" placeholder="Ex: Empresa ABC - Conferência" />
          </div>

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

          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="form.observacoes" rows="2" placeholder="Informações adicionais..."></textarea>
          </div>
        </form>
      </div>

      <div class="glass-card result-box">
        <h3 class="form-title">
          <FileText :size="20" class="text-blue-700" /> Resumo do Orçamento
        </h3>

        <div class="price-badge">
          <span class="badge-label">Valor Final Sugerido</span>
          <h1>R$ {{ valorFinal.toFixed(2) }}</h1>
        </div>

        <div class="details-list">
          <div class="detail-item">
            <div class="flex items-center gap-2">
              <PieChart :size="16" class="text-slate-400" />
              <span>Subtotal Bruto</span>
            </div>
            <strong>R$ {{ subtotalBruto.toFixed(2) }}</strong>
          </div>
          <div class="detail-item">
            <div class="flex items-center gap-2">
              <ShieldAlert :size="16" class="text-red-400" />
              <span>Reserva para Impostos ({{ form.imposto || 0 }}%)</span>
            </div>
            <strong class="text-negative">R$ {{ valorImposto.toFixed(2) }}</strong>
          </div>
          <div class="detail-item highlight">
            <div class="flex items-center gap-2">
              <TrendingUp :size="16" class="text-green-500" />
              <span>Lucro Líquido ({{ form.lucro || 0 }}%)</span>
            </div>
            <strong class="text-positive">R$ {{ valorLucro.toFixed(2) }}</strong>
          </div>
          <div class="detail-item">
            <div class="flex items-center gap-2">
              <Clock :size="16" class="text-slate-400" />
              <span>{{ form.tempoServico }}h × R$ {{ form.valorHora }}/h</span>
            </div>
            <strong>R$ {{ (form.tempoServico * form.valorHora).toFixed(2) }}</strong>
          </div>
        </div>

        <div class="btn-group">
          <button @click="copyToClipboard" class="btn-secondary-full">
            <ClipboardCopy :size="18" /> Copiar Orçamento
          </button>
          <button @click="gerarPDF" class="btn-primary-full">
            <Download :size="18" /> Exportar PDF
          </button>
        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  Calculator, 
  FileText, 
  PieChart, 
  ShieldAlert, 
  TrendingUp, 
  ClipboardCopy,
  Clock,
  Download
} from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import jsPDF from 'jspdf';

const form = ref({
  nomeCliente: '',
  tempoServico: 2,
  valorHora: 150,
  logistica: 50,
  imposto: 6,
  lucro: 20,
  observacoes: ''
});

const subtotalBruto = computed(() => {
  return (form.value.tempoServico * form.value.valorHora) + (form.value.logistica || 0);
});

const valorFinal = computed(() => {
  const txImposto = (form.value.imposto || 0) / 100;
  const txLucro = (form.value.lucro || 0) / 100;
  const taxasSum = txImposto + txLucro;
  if (taxasSum >= 1) return 0;
  return subtotalBruto.value / (1 - taxasSum);
});

const valorImposto = computed(() => valorFinal.value * ((form.value.imposto || 0) / 100));
const valorLucro = computed(() => valorFinal.value * ((form.value.lucro || 0) / 100));

const copyToClipboard = () => {
  const msg = `Orçamento - Serviços de Acessibilidade em Libras
--------------------------------------
${form.value.nomeCliente ? 'Cliente: ' + form.value.nomeCliente + '\n' : ''}Duração Estimada: ${form.value.tempoServico} horas
Valor da Hora: R$ ${form.value.valorHora}
Taxa de Logística: R$ ${(form.value.logistica || 0).toFixed(2)}
Impostos (${form.value.imposto || 0}%): R$ ${valorImposto.value.toFixed(2)}
Lucro Líquido (${form.value.lucro || 0}%): R$ ${valorLucro.value.toFixed(2)}
--------------------------------------
Valor Final Sugerido: R$ ${valorFinal.value.toFixed(2)}
--------------------------------------
${form.value.observacoes ? 'Obs: ' + form.value.observacoes + '\n' : ''}*Valores sujeitos a alteração.`;
  navigator.clipboard.writeText(msg);
  alert("Orçamento copiado para a área de transferência!");
};

const gerarPDF = () => {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(0, 74, 173);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Orçamento - Serviços de Libras', 14, 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Libras Salvador', 14, 29);

  // Reset color
  doc.setTextColor(0, 0, 0);

  let y = 50;

  // Cliente
  if (form.value.nomeCliente) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente / Evento:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(form.value.nomeCliente, 60, y);
    y += 10;
  }

  // Data
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Data de Emissão:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('pt-BR'), 60, y);
  y += 15;

  // Separator
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, 196, y);
  y += 10;

  // Detalhamento
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhamento', 14, y);
  y += 10;

  const items = [
    [`Duração do Serviço`, `${form.value.tempoServico} horas`],
    [`Valor da Hora`, `R$ ${Number(form.value.valorHora).toFixed(2)}`],
    [`Subtotal (horas × valor)`, `R$ ${(form.value.tempoServico * form.value.valorHora).toFixed(2)}`],
    [`Custos de Logística`, `R$ ${(form.value.logistica || 0).toFixed(2)}`],
    [`Subtotal Bruto`, `R$ ${subtotalBruto.value.toFixed(2)}`],
  ];

  doc.setFontSize(10);
  items.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y - 5, 182, 9, 'F');
    doc.text(label, 16, y);
    doc.text(value, 196, y, { align: 'right' });
    y += 10;
  });

  y += 5;
  doc.line(14, y, 196, y);
  y += 10;

  // Impostos e Lucro
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Impostos e Margem', 14, y);
  y += 10;

  const taxItems = [
    [`Reserva para Impostos (${form.value.imposto || 0}%)`, `R$ ${valorImposto.value.toFixed(2)}`],
    [`Margem de Lucro (${form.value.lucro || 0}%)`, `R$ ${valorLucro.value.toFixed(2)}`],
  ];

  doc.setFontSize(10);
  taxItems.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.text(label, 16, y);
    doc.text(value, 196, y, { align: 'right' });
    y += 9;
  });

  y += 8;

  // Valor Final
  doc.setFillColor(0, 74, 173);
  doc.rect(14, y - 5, 182, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR FINAL SUGERIDO', 16, y + 3);
  doc.text(`R$ ${valorFinal.value.toFixed(2)}`, 196, y + 3, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  y += 22;

  // Observações
  if (form.value.observacoes) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', 14, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(form.value.observacoes, 182);
    doc.text(lines, 14, y);
    y += lines.length * 6 + 5;
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('* Valores sujeitos a alteração conforme negociação.', 14, 280);
  doc.text('Libras Salvador | libras_salvador@gmail.com', 196, 280, { align: 'right' });

  const nomeArquivo = form.value.nomeCliente
    ? `Orcamento_${form.value.nomeCliente.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`
    : `Orcamento_LibrasSalvador_${new Date().getTime()}.pdf`;

  doc.save(nomeArquivo);
};
</script>

<style scoped>
.layout-split { display: grid; grid-template-columns: 400px 1fr; gap: 30px; align-items: start; }
.glass-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05); }
.form-title { margin-bottom: 25px; color: #1e293b; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
.text-blue-700 { color: #004aad; }

.modern-form label { display: block; font-size: 0.72rem; font-weight: 700; color: #64748b; margin: 15px 0 6px; text-transform: uppercase; letter-spacing: 0.5px; }
.modern-form input, .modern-form textarea { width: 100%; padding: 13px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; font-size: 0.95rem; color: #1e293b; font-weight: 500; box-sizing: border-box; font-family: inherit; }
.modern-form input:focus, .modern-form textarea:focus { outline: none; border-color: #004aad; box-shadow: 0 0 0 3px rgba(0,74,173,0.1); background: white; }
.modern-form textarea { resize: vertical; line-height: 1.5; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.form-group { display: flex; flex-direction: column; }

.price-badge { background: linear-gradient(135deg, #004aad, #1e40af); color: white; padding: 30px; border-radius: 20px; margin-bottom: 30px; text-align: center; }
.badge-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; opacity: 0.8; }
.price-badge h1 { font-size: 3rem; margin: 10px 0 0 0; font-weight: 900; }

.details-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 25px; }
.detail-item { display: flex; justify-content: space-between; align-items: center; padding: 13px 14px; background: #f8fafc; border-radius: 12px; font-size: 0.9rem; color: #475569; }
.detail-item.highlight { background: #ecfdf5; border: 1px solid #a7f3d0; }
.text-negative { color: #dc2626; }
.text-positive { color: #059669; }

.flex { display: flex; }
.items-center { align-items: center; }
.gap-2 { gap: 8px; }
.text-slate-400 { color: #94a3b8; }
.text-red-400 { color: #f87171; }
.text-green-500 { color: #22c55e; }

.btn-group { display: flex; gap: 12px; }

.btn-secondary-full {
  flex: 1;
  background: white;
  color: #374151;
  border: 1px solid #e2e8f0;
  padding: 14px 18px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
}
.btn-secondary-full:hover { background: #f8fafc; border-color: #004aad; color: #004aad; }

.btn-primary-full {
  flex: 1;
  background: #004aad;
  color: white;
  border: none;
  padding: 14px 18px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
}
.btn-primary-full:hover { background: #003a8c; transform: translateY(-2px); }

@media (max-width: 992px) {
  .layout-split { grid-template-columns: 1fr; gap: 20px; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
