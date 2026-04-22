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

    <!-- SUPORTE / AJUDA -->
    <div class="help-section mt-4">
      <div class="glass-card">
        <div class="help-header" @click="mostrarAjuda = !mostrarAjuda">
          <h3 class="section-title">
            <HelpCircle :size="22" class="text-brand" /> Central de Suporte
          </h3>
          <button class="btn-toggle-help">
            <ChevronDown :size="20" :class="{ 'rotated': mostrarAjuda }" />
          </button>
        </div>
        <p class="section-desc">Aprenda a utilizar cada funcionalidade do sistema.</p>

        <div v-if="mostrarAjuda" class="help-topics">
          <div v-for="(topic, idx) in helpTopicsAdmin" :key="idx" class="help-topic" @click="topic.open = !topic.open">
            <div class="help-topic-header">
              <component :is="topic.icon" :size="20" class="help-topic-icon" />
              <span class="help-topic-title">{{ topic.title }}</span>
              <ChevronDown :size="16" :class="['chevron', { rotated: topic.open }]" />
            </div>
            <div v-if="topic.open" class="help-topic-body">
              <p>{{ topic.description }}</p>
              <ul>
                <li v-for="(step, i) in topic.steps" :key="i">{{ step }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="orcamento-section mt-4">
      <div class="glass-card">
        <h3 class="section-title">
          <FileText :size="22" class="text-brand" /> Ferramenta Rápida: Gerar Orçamento B2B
        </h3>
        <p class="section-desc">Preencha os dados abaixo ou selecione um serviço já cadastrado para gerar um PDF padronizado da Libras Salvador.</p>

        <!-- Seletor de serviço existente -->
        <div v-if="servicos.length > 0" class="selector-box mb-4">
          <label class="selector-label">Selecionar Serviço Cadastrado:</label>
          <select v-model="servicoSelecionado" @change="preencherDoServico" class="modern-select">
            <option value="">Selecione um serviço...</option>
            <option v-for="s in servicos" :key="s._id" :value="s._id">
              {{ s.cliente?.razaoSocial || 'Empresa' }} - {{ s.tipoEvento }} ({{ formatarData(s.dataEvento) }})
            </option>
          </select>
        </div>

        <form @submit.prevent="gerarOrcamentoPDF" class="modern-form mt-4">
          <!-- Dados do Cliente -->
          <h4 class="form-subtitle">Dados do Cliente</h4>
          <div class="form-row">
            <div class="form-group-col" style="flex: 2;">
              <label>Nome da Empresa / Solicitante</label>
              <input v-model="orcamento.nomeEmpresa" placeholder="Ex: Petrobras S.A." required />
            </div>
            <div class="form-group-col">
              <label>CNPJ</label>
              <input v-model="orcamento.cnpj" placeholder="Ex: 12.345.678/0001-90" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>Nome do Responsável</label>
              <input v-model="orcamento.nomeResponsavel" placeholder="Ex: João Silva" />
            </div>
            <div class="form-group-col">
              <label>Setor</label>
              <input v-model="orcamento.setorResponsavel" placeholder="Ex: Recursos Humanos" />
            </div>
          </div>

          <!-- Dados do Evento -->
          <h4 class="form-subtitle mt-4">Dados do Evento</h4>
          <div class="form-row">
            <div class="form-group-col" style="flex: 2;">
              <label>Nome do Evento</label>
              <input v-model="orcamento.nomeEvento" placeholder="Ex: Simpósio de Tecnologia" required />
            </div>
            <div class="form-group-col">
              <label>Período do Evento</label>
              <input v-model="orcamento.periodo" placeholder="Ex: 12 a 15 de Outubro de 2024" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>Carga Horária Estimada</label>
              <input v-model="orcamento.cargaHoraria" placeholder="Ex: 16 horas" required />
            </div>
            <div class="form-group-col">
              <label>Endereço / Local</label>
              <input v-model="orcamento.endereco" placeholder="Ex: Centro de Convenções, Salvador - BA" required />
            </div>
          </div>

          <!-- Descrição dos Serviços -->
          <div class="form-group mt-2">
            <label>Descrição Detalhada dos Serviços</label>
            <textarea v-model="orcamento.descricaoServicos" rows="3" placeholder="Descreva os serviços que serão prestados..."></textarea>
          </div>

          <!-- Condições Financeiras -->
          <h4 class="form-subtitle mt-4">Condições Financeiras</h4>
          <div class="form-row">
            <div class="form-group-col">
              <label>Prazo de Pagamento</label>
              <input v-model="orcamento.prazoPagamento" placeholder="Ex: 30 dias após execução" />
            </div>
            <div class="form-group-col">
              <label>Forma de Pagamento</label>
              <input v-model="orcamento.formaPagamento" placeholder="Ex: Pix, boleto, transferência" />
            </div>
          </div>

          <div class="form-group mt-2">
            <label>Dados Bancários</label>
            <input v-model="orcamento.dadosBancarios" placeholder="Banco: ... | Agência: ... | Conta: ..." />
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>Prazo de Entrega/Execução</label>
              <input v-model="orcamento.prazoEntrega" placeholder="Ex: Conforme cronograma do evento" />
            </div>
            <div class="form-group-col">
              <label>Validade da Proposta (dias)</label>
              <input v-model="orcamento.validadeProposta" type="number" placeholder="Ex: 10" />
            </div>
          </div>

          <!-- Termos e Condições -->
          <h4 class="form-subtitle mt-4">Termos e Condições</h4>
          <div class="form-group mt-2">
            <label>Política de Cancelamento</label>
            <textarea v-model="orcamento.politicaCancelamento" rows="2" placeholder="Descreva a política de cancelamento..."></textarea>
          </div>

          <div class="form-group mt-2">
            <label>Requisitos / O que o cliente precisa fornecer</label>
            <textarea v-model="orcamento.requisitos" rows="2" placeholder="Ex: Lista de presença, material de apoio, acesso ao local..."></textarea>
          </div>

          <!-- Valor -->
          <div class="form-group mt-4">
            <label>Valor Total (R$)</label>
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
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowRight, FileText, Download, HelpCircle, ChevronDown, LayoutDashboard, BookOpen, Users, CalendarPlus, Building2, BadgeDollarSign, Package, MessageSquare, HandMetal } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const router = useRouter();
const stats = ref({ alunos: 0, cursos: 0, vendas: '0.00' });
const mostrarAjuda = ref(false);

const helpTopicsAdmin = reactive([
  {
    icon: LayoutDashboard,
    title: 'Dashboard (Painel de Controle)',
    description: 'Tela inicial com visão geral do sistema. Mostra estatísticas rápidas e acesso ao gerador de orçamentos.',
    steps: [
      'Visualize o total de alunos, cursos e receita.',
      'Clique em qualquer card para ir à página correspondente.',
      'Use o gerador de orçamento para criar PDFs profissionais.'
    ],
    open: false
  },
  {
    icon: BookOpen,
    title: 'Cursos',
    description: 'Gerencie os cursos de Libras disponíveis na plataforma.',
    steps: [
      'Clique em "Novo Curso" para criar um curso.',
      'Adicione materiais (vídeos, PDFs) dentro de cada curso.',
      'Os alunos poderão se matricular e acessar o conteúdo.'
    ],
    open: false
  },
  {
    icon: MessageSquare,
    title: 'Fórum dos Alunos',
    description: 'Espaço para comunicação com os alunos em cada curso.',
    steps: [
      'Selecione um curso na barra lateral do fórum.',
      'Envie mensagens de texto ou anexe arquivos/imagens.',
      'Você pode editar ou excluir qualquer mensagem como admin.'
    ],
    open: false
  },
  {
    icon: Users,
    title: 'Alunos (Usuários)',
    description: 'Cadastre e gerencie alunos e administradores do sistema.',
    steps: [
      'Cadastre novos usuários com nome, e-mail e senha.',
      'Defina o nível de acesso: Aluno, Admin Restrito ou Admin.',
      'Use o botão de editar para alterar nome e e-mail.',
      'Exclua usuários que não fazem mais parte do sistema.'
    ],
    open: false
  },
  {
    icon: HandMetal,
    title: 'Profissionais',
    description: 'Cadastro de intérpretes e profissionais de Libras.',
    steps: [
      'Adicione profissionais com nome, especialidade e contato.',
      'Vincule profissionais aos serviços/eventos.',
      'Mantenha o cadastro atualizado para facilitar a gestão.'
    ],
    open: false
  },
  {
    icon: CalendarPlus,
    title: 'Serviços / Eventos',
    description: 'Lance e acompanhe serviços confirmados de interpretação.',
    steps: [
      'Clique em "Novo Serviço" para lançar um evento.',
      'Preencha cliente, data, horário e intérpretes.',
      'Acompanhe todos os serviços na lista.'
    ],
    open: false
  },
  {
    icon: Building2,
    title: 'Empresas Solicitantes',
    description: 'Cadastre as empresas que solicitam serviços de Libras.',
    steps: [
      'Clique em "Nova Empresa" para cadastrar.',
      'Preencha CNPJ, nome, contato e endereço.',
      'As empresas ficam disponíveis para seleção nos serviços financeiros.'
    ],
    open: false
  },
  {
    icon: BadgeDollarSign,
    title: 'Gestão Financeira',
    description: 'Controle financeiro completo dos serviços prestados.',
    steps: [
      'Cadastre eventos com valores, impostos e pagamentos.',
      'Filtre por mês, ano ou empresa.',
      'Acompanhe o caixa da empresa nos cards de resumo.',
      'Exporte relatórios e controle pagamentos de intérpretes.'
    ],
    open: false
  },
  {
    icon: Package,
    title: 'Controle de Estoque',
    description: 'Gerencie materiais e itens do estoque da empresa.',
    steps: [
      'Adicione itens ao estoque com nome, quantidade e descrição.',
      'Atualize quantidades conforme entrada e saída.',
      'Mantenha o controle de materiais organizados.'
    ],
    open: false
  }
]);

// Estado para o formulário de orçamento
const orcamento = ref({
  nomeEmpresa: '',
  cnpj: '',
  nomeResponsavel: '',
  setorResponsavel: '',
  nomeEvento: '',
  periodo: '',
  cargaHoraria: '',
  endereco: '',
  valor: null,
  descricaoServicos: '',
  prazoPagamento: '',
  formaPagamento: '',
  dadosBancarios: '',
  prazoEntrega: '',
  validadeProposta: '',
  politicaCancelamento: '',
  requisitos: ''
});

onMounted(async () => {
  try {
    const res = await api.get('/stats');
    stats.value = res.data;
  } catch (err) { 
    console.error("Erro ao carregar estatísticas:", err); 
  }
  // Carregar serviços para o orçamento
  carregarServicos();
});

// -----------------------------------------------------
// FUNÇÃO: GERAR PDF DO ORÇAMENTO (Novo Modelo)
// -----------------------------------------------------
const gerarOrcamentoPDF = () => {
  const doc = new jsPDF();
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  const brandColor = [0, 74, 173];

  let y = 10;

  // 1. Cabeçalho com Dados da Libras Salvador
  doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
  doc.rect(0, 0, 210, 45, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text('LIBRAS SALVADOR LTDA', 105, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text('CNPJ: 34.989.801/0001-43', 105, 23, { align: 'center' });
  doc.text('Rua Alceu Amoroso Lima, 786, Edf. Tancredo Neves Trade Center, Sala 312', 105, 30, { align: 'center' });
  doc.text('Caminho das Árvores, Salvador/BA – CEP: 41.820-770', 105, 36, { align: 'center' });
  doc.text('Contato: (71) 98836-1371 | E-mail: contato@librasalvador.com', 105, 42, { align: 'center' });

  y = 55;

  // 2. Título
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text('PROPOSTA COMERCIAL', 105, y, { align: 'center' });

  y += 15;

  // 3. Dados do Cliente
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text('1. IDENTIFICAÇÃO', 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Dados do Prestador
  doc.setFillColor(245, 245, 245);
  doc.rect(14, y, 182, 25, 'F');
  doc.setFont("helvetica", "bold");
  doc.text('DADOS DO PRESTADOR:', 18, y + 7);
  doc.setFont("helvetica", "normal");
  doc.text('LIBRAS SALVADOR LTDA', 18, y + 14);
  doc.text(`CNPJ: 34.989.801/0001-43 | Contato: (71) 98836-1371`, 18, y + 20);

  y += 30;

  // Dados do Cliente
  doc.setFillColor(245, 245, 245);
  doc.rect(14, y, 182, 30, 'F');
  doc.setFont("helvetica", "bold");
  doc.text('DADOS DO CLIENTE:', 18, y + 7);
  doc.setFont("helvetica", "normal");
  doc.text(`Empresa: ${orcamento.value.nomeEmpresa || 'Não informado'}`, 18, y + 14);
  doc.text(`CNPJ: ${orcamento.value.cnpj || 'Não informado'}`, 18, y + 20);
  doc.text(`Responsável: ${orcamento.value.nomeResponsavel || 'Não informado'} | Setor: ${orcamento.value.setorResponsavel || 'Não informado'}`, 18, y + 26);

  y += 40;

  // 4. Descrição dos Serviços
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text('2. DESCRIÇÃO DETALHADA DOS SERVIÇOS', 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setFillColor(255, 255, 255);
  doc.rect(14, y, 182, 35, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(14, y, 182, 35, 'S');

  const descricaoServicos = orcamento.value.descricaoServicos || 'Serviço de Tradução e Interpretação em Libras para o evento descrito, com atuação de intérpretes profissionais garantindo a acessibilidade comunicacional.';
  const descricaoLines = doc.splitTextToSize(descricaoServicos, 175);
  doc.text(descricaoLines, 18, y + 8);

  doc.text('O preço da hora/interpretação leva em conta a lista de referência da FEBRAPILS.', 18, y + 28);
  doc.text('Para atividades com até uma hora de duração, será necessária a atuação de um intérprete de Libras.', 18, y + 33);

  y += 45;

  // 5. Detalhamento do Evento
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text('3. DETALHAMENTO', 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const detalhes = [
    ['Nome do Evento', orcamento.value.nomeEvento || 'Não informado'],
    ['Período de Realização', orcamento.value.periodo || 'Não informado'],
    ['Carga Horária Estimada', orcamento.value.cargaHoraria || 'Não informado'],
    ['Local / Endereço', orcamento.value.endereco || 'Não informado']
  ];

  doc.autoTable({
    startY: y,
    head: [['Item', 'Descrição']],
    body: detalhes,
    theme: 'grid',
    headStyles: { fillColor: brandColor, textColor: 255 },
    styles: { fontSize: 9, cellPadding: 4 }
  });

  y = doc.lastAutoTable.finalY + 10;

  // 6. Condições Financeiras
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text('4. CONDIÇÕES FINANCEIRAS', 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text(`Prazo de Pagamento: ${orcamento.value.prazoPagamento || 'A combinar'}`, 14, y);
  y += 6;
  doc.text(`Forma de Pagamento: ${orcamento.value.formaPagamento || 'Pix, boleto, transferência ou cartão'}`, 14, y);
  y += 6;
  doc.text(`Dados Bancários: ${orcamento.value.dadosBancarios || 'A fornecer mediante aprovação'}`, 14, y);
  y += 15;

  // Valor
  if (orcamento.value.valor) {
    const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.value.valor);
    doc.setFillColor(239, 246, 255);
    doc.rect(14, y, 182, 15, 'F');
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text('INVESTIMENTO TOTAL:', 20, y + 10);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.text(valorFormatado, 190, y + 10, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    y += 25;
  }

  // 7. Prazos e Validade
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text('5. PRAZOS E VALIDADE', 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Prazo de Entrega/Execução: ${orcamento.value.prazoEntrega || 'Conforme cronograma do evento'}`, 14, y);
  y += 6;
  const validade = orcamento.value.validadeProposta ? `${orcamento.value.validadeProposta} dias` : '10 dias';
  doc.text(`Validade da Proposta: Este orçamento é válido por ${validade}.`, 14, y);
  y += 15;

  // 8. Termos e Condições
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text('6. TERMOS E CONDIÇÕES', 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text(`Política de Cancelamento: ${orcamento.value.politicaCancelamento || 'A combinar entre as partes.'}`, 14, y);
  y += 6;
  doc.text(`Requisitos: ${orcamento.value.requisitos || 'O cliente deve fornecer lista de presença, material de apoio e acesso ao local.'}`, 14, y);
  y += 20;

  // 9. Diferencial
  doc.setFillColor(245, 247, 250);
  doc.rect(14, y, 182, 40, 'F');
  doc.setFont("helvetica", "bold");
  doc.text('POR QUE CONTRATAR A LIBRAS SALVADOR?', 18, y + 8);
  doc.setFont("helvetica", "normal");
  doc.text('• Empresa especializada em tradução e interpretação em Libras.', 18, y + 15);
  doc.text('• Equipe de intérpretes qualificados para atendimento em vários estados.', 18, y + 21);
  doc.text('• Mais de 300 avaliações 5 estrelas no Google.', 18, y + 27);
  doc.text('• Emitimos Nota Fiscal como Tradução e Interpretação (não como MEI).', 18, y + 33);

  y += 50;

  // 10. Assinaturas
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text('Ficamos no aguardo de retorno da proposta e agradecemos pela oportunidade de apresentá-la.', 105, y, { align: 'center' });

  y += 15;
  doc.line(40, y, 100, y);
  doc.text('Libras Salvador', 70, y + 5, { align: 'center' });

  doc.line(110, y, 170, y);
  doc.text(orcamento.value.nomeResponsavel || 'Cliente', 140, y + 5, { align: 'center' });

  // Salvar PDF
  const safeName = (orcamento.value.nomeEmpresa || 'Avulso').replace(/[^a-z0-9]/gi, '_');
  doc.save(`Orcamento_${safeName}.pdf`);
};
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
.form-subtitle { color: #004aad; font-size: 0.95rem; font-weight: 700; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }

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

/* ESTILOS DA CENTRAL DE SUPORTE */
.help-section { max-width: 800px; margin: 0 auto; }
.help-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
.btn-toggle-help { background: transparent; border: none; cursor: pointer; color: #64748b; padding: 8px; border-radius: 8px; transition: 0.2s; }
.btn-toggle-help:hover { background: #f1f5f9; }
.chevron, .btn-toggle-help svg { transition: transform 0.3s ease; }
.rotated { transform: rotate(180deg); }

.help-topics { margin-top: 15px; display: flex; flex-direction: column; gap: 8px; }
.help-topic { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 0; overflow: hidden; cursor: pointer; transition: 0.2s; }
.help-topic:hover { border-color: #bfdbfe; }
.help-topic-header { display: flex; align-items: center; gap: 12px; padding: 16px 20px; }
.help-topic-icon { color: #004aad; flex-shrink: 0; }
.help-topic-title { flex: 1; font-weight: 700; font-size: 0.95rem; color: #1e293b; }
.help-topic-body { padding: 0 20px 16px; border-top: 1px solid #e2e8f0; margin-top: 0; }
.help-topic-body p { font-size: 0.9rem; color: #475569; margin: 12px 0 8px; line-height: 1.5; }
.help-topic-body ul { margin: 0; padding-left: 18px; }
.help-topic-body li { font-size: 0.85rem; color: #64748b; margin-bottom: 4px; line-height: 1.5; }

@media (max-width: 992px) {
  .stats-grid { grid-template-columns: 1fr; }
  .form-row { flex-direction: column; gap: 5px; }
  .glass-card { padding: 20px; }
}

/* ESTILOS DO SELETOR DE SERVIÇO */
.selector-box { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; }
.selector-label { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 8px; text-transform: uppercase; }
.mb-4 { margin-bottom: 1rem; }
.modern-select { width: 100%; padding: 13px; border: 1px solid #e2e8f0; border-radius: 12px; background: white; font-size: 0.95rem; color: #1e293b; box-sizing: border-box; font-family: inherit; }
</style>
