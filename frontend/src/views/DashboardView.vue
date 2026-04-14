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

    <div class="orcamento-section mt-4">
      <div class="glass-card">
        <h3 class="section-title">
          <FileText :size="22" class="text-brand" /> Ferramenta Rápida: Gerar Orçamento B2B
        </h3>
        <p class="section-desc">Preencha os dados abaixo para gerar um PDF padronizado da Libras Salvador.</p>

        <form @submit.prevent="gerarOrcamentoPDF" class="modern-form mt-4">
          <div class="form-row">
            <div class="form-group-col" style="flex: 2;">
              <label>Nome da Empresa / Solicitante</label>
              <input v-model="orcamento.nomeEmpresa" placeholder="Ex: Petrobras S.A." required />
            </div>
            <div class="form-group-col" style="flex: 2;">
              <label>Nome do Evento</label>
              <input v-model="orcamento.nomeEvento" placeholder="Ex: Simpósio de Tecnologia" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>Período do Evento</label>
              <input v-model="orcamento.periodo" placeholder="Ex: 12 a 15 de Outubro de 2024" required />
            </div>
            <div class="form-group-col">
              <label>Carga Horária Estimada</label>
              <input v-model="orcamento.cargaHoraria" placeholder="Ex: 16 horas" required />
            </div>
          </div>

          <div class="form-group mt-2">
            <label>Endereço / Local</label>
            <input v-model="orcamento.endereco" placeholder="Ex: Centro de Convenções, Salvador - BA" required />
          </div>
          
          <div class="form-group mt-2">
            <label>Valor Total (R$) <span class="text-xs text-gray-400 font-normal">- Opcional</span></label>
            <input v-model.number="orcamento.valor" type="number" step="0.01" placeholder="Ex: 2500.00" />
          </div>

          <button type="submit" class="btn-primary mt-4">
            <Download :size="18" /> Gerar PDF do Orçamento
          </button>
        </form>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight, FileText, Download } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const router = useRouter();
const stats = ref({ alunos: 0, cursos: 0, vendas: '0.00' });

// Estado para o formulário de orçamento
const orcamento = ref({
  nomeEmpresa: '',
  nomeEvento: '',
  periodo: '',
  cargaHoraria: '',
  endereco: '',
  valor: null
});

onMounted(async () => {
  try {
    const res = await api.get('/stats');
    stats.value = res.data;
  } catch (err) { 
    console.error("Erro ao carregar estatísticas:", err); 
  }
});

// -----------------------------------------------------
// FUNÇÃO: GERAR PDF DO ORÇAMENTO
// -----------------------------------------------------
const gerarOrcamentoPDF = () => {
  const doc = new jsPDF();
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  const brandColor = [0, 74, 173]; // Azul padrão Libras Salvador

  // 1. Cabeçalho Principal
  doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
  doc.rect(0, 0, 210, 40, 'F'); 

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text('LIBRAS SALVADOR', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text('Soluções em Acessibilidade e Inclusão', 105, 28, { align: 'center' });

  // 2. Título do Documento
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text('PROPOSTA COMERCIAL DE PRESTAÇÃO DE SERVIÇOS', 105, 55, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Data de emissão: ${dataHoje}`, 195, 65, { align: 'right' });

  // 3. Dados do Solicitante
  doc.setFillColor(245, 245, 245);
  doc.rect(14, 70, 182, 45, 'F');
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text('DADOS DO CLIENTE / EVENTO', 18, 78);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Empresa Solicitante: ${orcamento.value.nomeEmpresa || 'Não informado'}`, 18, 86);
  doc.text(`Nome do Evento: ${orcamento.value.nomeEvento || 'Não informado'}`, 18, 93);
  doc.text(`Período de Realização: ${orcamento.value.periodo || 'Não informado'}`, 18, 100);
  doc.text(`Carga Horária Estimada: ${orcamento.value.cargaHoraria || 'Não informado'}`, 18, 107);
  doc.text(`Local / Endereço: ${orcamento.value.endereco || 'Não informado'}`, 18, 114);

  // 4. Descrição dos Serviços (Tabela de Escopo)
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text('ESCOPO DOS SERVIÇOS', 14, 130);

  const escopoRows = [
    ["Serviço de Tradução e Interpretação", "Atuação de intérpretes profissionais de Libras garantindo a acessibilidade comunicacional durante todo o evento descrito."],
    ["Logística e Gerenciamento", "Gestão de escala, revezamento e coordenação da equipe de intérpretes pela Libras Salvador."],
    ["Equipamentos (Se aplicável)", "Utilização de equipamentos próprios ou adaptação ao sistema de transmissão do local."]
  ];

  doc.autoTable({
    startY: 135,
    head: [['Item', 'Descrição']],
    body: escopoRows,
    theme: 'grid',
    headStyles: { fillColor: brandColor, textColor: 255 },
    styles: { fontSize: 9, cellPadding: 5 }
  });

  let finalY = doc.lastAutoTable.finalY || 135;

  // 5. Bloco de Valor (Se preenchido)
  if (orcamento.value.valor) {
    // Formata o número para o padrão de moeda brasileiro (R$)
    const valorFormatado = new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(orcamento.value.valor);

    doc.setFillColor(239, 246, 255); 
    doc.rect(14, finalY + 10, 182, 20, 'F');
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text('INVESTIMENTO TOTAL:', 20, finalY + 23);
    
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFontSize(14);
    doc.text(valorFormatado, 190, finalY + 23, { align: 'right' });
    doc.setTextColor(0, 0, 0); 

    finalY += 30;
  }

  // 6. Rodapé e Assinaturas
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text('Condições de pagamento e validade desta proposta a serem acordadas mediante aprovação.', 14, finalY + 20);

  doc.line(65, finalY + 50, 145, finalY + 50); // Linha de assinatura
  doc.setFont("helvetica", "bold");
  doc.text('Libras Salvador', 105, finalY + 55, { align: 'center' });
  doc.setFont("helvetica", "normal");
  doc.text('CNPJ: XX.XXX.XXX/0001-XX | contato@librassalvador.com.br', 105, finalY + 60, { align: 'center' });

  // 7. Sanitização e Download
  // Substitui espaços e caracteres especiais do nome da empresa para usar no nome do arquivo
  const safeName = (orcamento.value.nomeEmpresa || 'Avulso').replace(/[^a-z0-9]/gi, '_');
  doc.save(`Orcamento_${safeName}.pdf`);
};
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

/* ESTILOS PARA A SEÇÃO DO ORÇAMENTO */
.orcamento-section { max-width: 800px; margin: 0 auto; }
.section-title { font-size: 1.2rem; color: #1e293b; font-weight: 800; display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
.text-brand { color: #004aad; }
.section-desc { font-size: 0.9rem; color: #64748b; margin-bottom: 20px; }

.modern-form label { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; margin: 15px 0 8px; text-transform: uppercase; }
.modern-form input { 
  width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; 
  background: #f8fafc; font-size: 0.95rem; color: #1e293b; box-sizing: border-box; font-family: inherit;
}
.modern-form input:focus { outline: none; border-color: #004aad; box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1); background: white; }

.form-row { display: flex; gap: 15px; width: 100%; align-items: flex-end; margin-bottom: 5px; }
.form-group-col { flex: 1; display: flex; flex-direction: column; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1.5rem; }

.btn-primary { width: 100%; background: #004aad; color: white; border: none; padding: 16px; border-radius: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; }
.btn-primary:hover { background: #003a8c; transform: translateY(-2px); }

@media (max-width: 992px) {
  .stats-grid { grid-template-columns: 1fr; }
  .form-row { flex-direction: column; gap: 5px; }
  .glass-card { padding: 20px; }
}
</style>