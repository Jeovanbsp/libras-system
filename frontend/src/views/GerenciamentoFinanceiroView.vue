<template>
  <MainLayout pageTitle="Gestão Financeira de Serviços" pageDescription="Controle completo de eventos, intérpretes e caixa da empresa.">
    
    <!-- AVISO DE RESTRIÇÃO -->
    <div v-if="userRole !== 'admin'" class="restricted-banner">
      <AlertCircle :size="24" />
      <span>Você não tem permissão para acessar esta seção.</span>
    </div>

    <div v-else class="financeiro-container">
      
      <!-- FILTROS -->
      <div class="filters-section glass-card mb-6">
        <h3 class="filters-title">
          <Filter :size="20" /> Filtros
        </h3>
        <div class="filters-grid">
          <div class="filter-group">
            <label>Mês</label>
            <select v-model="filtroMes" @change="carregarEventos">
              <option value="">Todos os meses</option>
              <option value="janeiro">Janeiro</option>
              <option value="fevereiro">Fevereiro</option>
              <option value="março">Março</option>
              <option value="abril">Abril</option>
              <option value="maio">Maio</option>
              <option value="junho">Junho</option>
              <option value="julho">Julho</option>
              <option value="agosto">Agosto</option>
              <option value="setembro">Setembro</option>
              <option value="outubro">Outubro</option>
              <option value="novembro">Novembro</option>
              <option value="dezembro">Dezembro</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Ano</label>
            <input v-model.number="filtroAno" type="number" placeholder="Todos" @change="carregarEventos" />
          </div>
          
          <div class="filter-group">
            <label>Empresa</label>
            <select v-model="filtroEmpresa" @change="carregarEventos">
              <option value="">Todas as empresas</option>
              <option v-for="empresa in empresasDisponiveis" :key="empresa._id" :value="empresa.nome">
                {{ empresa.nome }}
              </option>
            </select>
          </div>

          <div class="filter-actions">
            <button @click="resetarFiltros" class="btn-reset">
              <RotateCcw :size="18" /> Limpar
            </button>
            <button @click="abrirModalNovoEvento" class="btn-add">
              <Plus :size="18" /> Novo Evento
            </button>
          </div>
        </div>
      </div>

      <!-- CARDS DE RESUMO -->
      <div class="summary-cards-grid">
        <div class="summary-card card-blue" @click="abrirModalDetalhado" style="cursor: pointer;">
          <DollarSign :size="28" />
          <span class="card-label">Preço Total</span>
          <span class="card-value">R$ {{ formatarValor(somaPrecoTotal) }}</span>
        </div>

        <div class="summary-card card-green" @click="abrirModalValoresAlunos" style="cursor: pointer;">
          <CheckCircle :size="28" />
          <span class="card-label">Valores/Alunos</span>
          <span class="card-value">R$ {{ formatarValor(somaValoresAlunos) }}</span>
        </div>

        <div class="summary-card card-slate">
          <Clock :size="28" />
          <span class="card-label">Horas Total</span>
          <span class="card-value">{{ somaHoras }}h</span>
        </div>

        <div class="summary-card card-blue-light">
          <Truck :size="28" />
          <span class="card-label">Transporte</span>
          <span class="card-value">R$ {{ formatarValor(somaTransporte) }}</span>
        </div>

        <div class="summary-card card-amber">
          <AlertCircle :size="28" />
          <span class="card-label">Impostos</span>
          <span class="card-value">R$ {{ formatarValor(somaImpostos) }}</span>
        </div>

        <div class="summary-card card-slate">
          <Users :size="28" />
          <span class="card-label">Pago Intérpretes</span>
          <span class="card-value">R$ {{ formatarValor(somaInterpretes) }}</span>
        </div>

        <div class="summary-card card-green">
          <Briefcase :size="28" />
          <span class="card-label">Caixa Empresa</span>
          <span class="card-value">R$ {{ formatarValor(somaCaixa) }}</span>
        </div>
      </div>

      <!-- TABELA PRINCIPAL -->
      <div class="table-section glass-card mt-6">
        <h3 class="table-title">
          <FileText :size="20" /> Eventos e Serviços
        </h3>
        
        <div class="table-responsive">
          <table class="main-table">
            <thead>
              <tr class="header-row">
                <th>#</th>
                <th>Empresa</th>
                <th>Solicitante</th>
                <th>E-mail</th>
                <th>Temática</th>
                <th>Evento</th>
                <th>Qtd Horas</th>
                <th>Intérpretes</th>
                <th>Preço</th>
                <th>Transporte</th>
                <th>Impostos</th>
                <th>Pago Intérp.</th>
                <th>Caixa</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(evento, idx) in eventosFiltrados" :key="idx" class="data-row">
                <td class="numero">{{ idx + 1 }}</td>
                <td class="empresa">
                  <span class="badge" :style="{ background: evento.empresa === 'SINDAUTO' ? '#fbbf24' : '#60a5fa' }">
                    {{ evento.empresa }}
                  </span>
                </td>
                <td>{{ evento.solicitante }}</td>
                <td class="email">{{ evento.email || '-' }}</td>
                <td>{{ evento.tematica }}</td>
                <td class="evento">{{ evento.evento }}</td>
                <td class="numero">{{ evento.quantidadeHoras }}</td>
                <td class="interpretes">{{ evento.interpretes }}</td>
                <td class="valor">R$ {{ formatarValor(evento.precoTotal) }}</td>
                <td class="valor">R$ {{ formatarValor(evento.transporte) }}</td>
                <td class="valor">R$ {{ formatarValor(evento.impostos) }}</td>
                <td class="valor">R$ {{ formatarValor(evento.pagosInterpretes) }}</td>
                <td class="valor caixa">R$ {{ formatarValor(evento.caixaEmpresa) }}</td>
                <td class="data">{{ formatarData(evento.dataInicial) }}</td>
                <td class="status">
                  <span :class="'badge-status ' + (evento.status || 'pendente')" @click="alternarStatus(evento._id, evento.status || 'pendente')">
                    {{ evento.status === 'pago' ? '✓ Pago' : evento.status === 'cancelado' ? '✕ Cancelado' : 'Pendente' }}
                  </span>
                </td>
                <td class="acoes">
                  <button @click="gerarOrcamento(evento)" class="btn-orcamento" title="Gerar Orçamento">
                    <FileText :size="16" />
                  </button>
                  <button @click="editarEvento(evento._id)" class="btn-edit" title="Editar">
                    <Edit2 :size="16" />
                  </button>
                  <button @click="deletarEvento(evento._id)" class="btn-delete" title="Deletar">
                    <Trash2 :size="16" />
                  </button>
                </td>
              </tr>
              <tr v-if="eventosFiltrados.length === 0" class="no-data">
                <td colspan="16" style="text-align: center; padding: 40px; color: #94a3b8;">
                  Nenhum evento encontrado para os filtros selecionados
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- MODAL DE NOVO/EDITAR EVENTO -->
    <div v-if="mostrarModal && userRole === 'admin'" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content glass-card">
        <div class="modal-header">
          <h3>{{ modoEdicao ? 'Editar Evento' : 'Novo Evento' }}</h3>
          <button @click="fecharModal" class="btn-close">
            <X :size="24" />
          </button>
        </div>

        <form @submit.prevent="salvarEvento" class="modal-form">
          
          <div class="form-section">
            <h4 class="section-title">Informações da Empresa Solicitante</h4>
            <div class="form-grid">
              <div class="form-group full">
                <label>Empresa solicitante*
                  <router-link to="/admin/empresas" class="link-gerenciar" title="Gerenciar empresas">
                    (gerenciar)
                  </router-link>
                </label>
                <select v-model="formulario.empresa" required>
                  <option value="">Selecione uma empresa...</option>
                  <option v-for="empresa in empresasDisponiveis" :key="empresa._id" :value="empresa.nome">
                    {{ empresa.nome }} {{ empresa.sigla ? `(${empresa.sigla})` : '' }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Pessoa solicitante*</label>
                <input v-model="formulario.solicitante" type="text" required />
              </div>
              <div class="form-group">
                <label>E-mail</label>
                <input v-model="formulario.email" type="email" />
              </div>
              <div class="form-group">
                <label>Contato</label>
                <input v-model="formulario.contato" type="text" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4 class="section-title">Informações do Evento</h4>
            <div class="form-grid">
              <div class="form-group">
                <label>Temática*</label>
                <input v-model="formulario.tematica" type="text" required />
              </div>
              <div class="form-group">
                <label>Evento*</label>
                <input v-model="formulario.evento" type="text" required />
              </div>
              <div class="form-group">
                <label>Quantidade de horas*</label>
                <input v-model.number="formulario.quantidadeHoras" type="number" step="0.5" required />
              </div>
              <div class="form-group">
                <label>Intérpretes*</label>
                <input v-model="formulario.interpretes" type="text" placeholder="Nome 1 / Nome 2" required />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4 class="section-title">Data e Hora</h4>
            <div class="form-grid">
              <div class="form-group">
                <label>Dia Inicial*</label>
                <input v-model="formulario.dataInicial" type="date" required />
              </div>
              <div class="form-group">
                <label>Dia Final</label>
                <input v-model="formulario.dataFinal" type="date" />
              </div>
              <div class="form-group">
                <label>Hora de início</label>
                <input v-model="formulario.horaInicio" type="time" />
              </div>
              <div class="form-group">
                <label>Hora de término</label>
                <input v-model="formulario.horaTermino" type="time" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4 class="section-title">Valores Financeiros</h4>
            <div class="form-grid">
              <div class="form-group">
                <label>Preço total*</label>
                <input v-model.number="formulario.precoTotal" type="number" step="0.01" required />
              </div>
              <div class="form-group">
                <label>Transporte e ou Alimentação</label>
                <input v-model.number="formulario.transporte" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label>Impostos</label>
                <input v-model.number="formulario.impostos" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label>Pago aos intérpretes</label>
                <input v-model.number="formulario.pagosInterpretes" type="number" step="0.01" />
              </div>
              <div class="form-group">
                <label>Caixa empresa</label>
                <input v-model.number="formulario.caixaEmpresa" type="number" step="0.01" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4 class="section-title">Informações Complementares</h4>
            <div class="form-grid">
              <div class="form-group">
                <label>Tipo de evento</label>
                <select v-model="formulario.tipoEvento">
                  <option value="">Selecione...</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Virtual">Virtual</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
              </div>
              <div class="form-group">
                <label>Plataforma</label>
                <input v-model="formulario.plataforma" type="text" />
              </div>
              <div class="form-group">
                <label>Previsão de pagamento</label>
                <input v-model="formulario.previsaoPagamento" type="date" />
              </div>
              <div class="form-group">
                <label>Pago em</label>
                <input v-model="formulario.pagoEm" type="date" />
              </div>
              <div class="form-group">
                <label>Status do Pagamento</label>
                <select v-model="formulario.status">
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div class="form-group">
                <label>Mês</label>
                <select v-model="formulario.mes">
                  <option value="janeiro">Janeiro</option>
                  <option value="fevereiro">Fevereiro</option>
                  <option value="março">Março</option>
                  <option value="abril">Abril</option>
                  <option value="maio">Maio</option>
                  <option value="junho">Junho</option>
                  <option value="julho">Julho</option>
                  <option value="agosto">Agosto</option>
                  <option value="setembro">Setembro</option>
                  <option value="outubro">Outubro</option>
                  <option value="novembro">Novembro</option>
                  <option value="dezembro">Dezembro</option>
                </select>
              </div>
              <div class="form-group">
                <label>Ano</label>
                <input v-model.number="formulario.ano" type="number" />
              </div>
            </div>
            <div class="form-group full">
              <label>Observação</label>
              <textarea v-model="formulario.observacao" rows="3"></textarea>
            </div>
            <div class="form-group full">
              <label>Outros</label>
              <input v-model="formulario.outros" type="text" />
            </div>
            
            <!-- Novos campos para Orçamento -->
            <div class="form-section">
              <h4 class="section-title">Dados para Orçamento</h4>
              <div class="form-grid">
                <div class="form-group">
                  <label>CNPJ Cliente</label>
                  <input v-model="formulario.cnpj" type="text" placeholder="00.000.000/0001-00" />
                </div>
                <div class="form-group">
                  <label>Prazo de Entrega/Execução</label>
                  <input v-model="formulario.prazoEntrega" type="text" placeholder="Ex: Imediato, 5 dias..." />
                </div>
                <div class="form-group">
                  <label>Política de Cancelamento</label>
                  <input v-model="formulario.politicaCancelamento" type="text" placeholder="Ex: Cancelamento em até 48h..." />
                </div>
                <div class="form-group">
                  <label>Requisitos</label>
                  <input v-model="formulario.requisitos" type="text" placeholder="Ex: Acesso à sala, material..." />
                </div>
                <div class="form-group">
                  <label>Dados Bancários</label>
                  <input v-model="formulario.dadosBancarios" type="text" placeholder="Banco: ... Agência: ... Conta: ..." />
                </div>
                <div class="form-group">
                  <label>Forma de Pagamento</label>
                  <input v-model="formulario.formaPagamento" type="text" placeholder="Pix, Boleto, Transferência..." />
                </div>
                <div class="form-group">
                  <label>Parcelamento</label>
                  <input v-model="formulario.parcelamento" type="text" placeholder="Ex: 2x, 3x..." />
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="fecharModal" class="btn-cancel">Cancelar</button>
            <button type="submit" class="btn-save">
              {{ modoEdicao ? 'Atualizar Evento' : 'Adicionar Evento' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL VALORES PAGOS POR ALUNOS -->
    <div v-if="totalPagoModal" class="modal-overlay" @click.self="totalPagoModal = false">
      <div class="modal-content glass-card">
        <div class="modal-header">
          <h2>Valores Pago por Alunos</h2>
          <button class="close-btn" @click="totalPagoModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <table class="data-table" v-if="alunosValores.length">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Modalidade</th>
                <th>Valor Total</th>
                <th>Valor Pago</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="aluno in alunosValores" :key="aluno._id">
                <td>{{ aluno.nome }}</td>
                <td>{{ aluno.modalidade || '-' }}</td>
                <td>R$ {{ formatarValor(aluno.valorTotalCurso || 0) }}</td>
                <td class="valor-destaque">R$ {{ formatarValor(aluno.valorPago) }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="no-data">Nenhum valor pago encontrado.</p>
        </div>
      </div>
    </div>

    <!-- MODAL DETALHADO POR MÊS -->
    <div v-if="mostrarModalDetalhado" class="modal-overlay" @click.self="mostrarModalDetalhado = false">
      <div class="modal-content glass-card modal-detalhado">
        <div class="modal-header header-detalhado">
          <div>
            <h2>📊 Detalhamento Financeiro</h2>
            <p class="subtitle">Resumo por mês de todos os eventos</p>
          </div>
          <button class="close-btn" @click="mostrarModalDetalhado = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="resumo-cards" v-if="breakdownPorMes.length > 0">
            <div class="resumo-card">
              <span class="label">Total Recebido</span>
              <span class="value green">R$ {{ formatarValor(breakdownPorMes.reduce((s, i) => s + i.precoTotal, 0)) }}</span>
            </div>
            <div class="resumo-card">
              <span class="label">Eventos</span>
              <span class="value">{{ breakdownPorMes.reduce((s, i) => s + i.quantidadeEventos, 0) }}</span>
            </div>
            <div class="resumo-card">
              <span class="label">Horas</span>
              <span class="value">{{ breakdownPorMes.reduce((s, i) => s + i.horas, 0) }}h</span>
            </div>
            <div class="resumo-card">
              <span class="label">Caixa Empresa</span>
              <span class="value blue">R$ {{ formatarValor(breakdownPorMes.reduce((s, i) => s + i.caixaEmpresa, 0)) }}</span>
            </div>
          </div>
          
          <table class="data-table detalhada">
            <thead>
              <tr>
                <th class="th-mes">Mês/Ano</th>
                <th>Eventos</th>
                <th>Horas</th>
                <th class="th-money">Valor Total</th>
                <th class="th-money">Transporte</th>
                <th class="th-money">Impostos</th>
                <th class="th-money">Intérpretes</th>
                <th class="th-money">Caixa Emp.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in breakdownPorMes" :key="item.mes + '-' + item.ano">
                <td class="mes-cell">
                  <span class="mes-nome">{{ item.mes.charAt(0).toUpperCase() + item.mes.slice(1) }}</span>
                  <span class="mes-ano">{{ item.ano }}</span>
                </td>
                <td class="center"><span class="badge-eventos">{{ item.quantidadeEventos }}</span></td>
                <td class="center">{{ item.horas }}h</td>
                <td class="money green">R$ {{ formatarValor(item.precoTotal) }}</td>
                <td class="money">R$ {{ formatarValor(item.transporte) }}</td>
                <td class="money">R$ {{ formatarValor(item.impostos) }}</td>
                <td class="money">R$ {{ formatarValor(item.pagosInterpretes) }}</td>
                <td class="money blue">R$ {{ formatarValor(item.caixaEmpresa) }}</td>
              </tr>
              <tr class="total-row">
                <td colspan="2"><strong>TOTAL GERAL</strong></td>
                <td class="center"><strong>{{ breakdownPorMes.reduce((s, i) => s + i.horas, 0) }}h</strong></td>
                <td class="money green"><strong>R$ {{ formatarValor(breakdownPorMes.reduce((s, i) => s + i.precoTotal, 0)) }}</strong></td>
                <td class="money"><strong>R$ {{ formatarValor(breakdownPorMes.reduce((s, i) => s + i.transporte, 0)) }}</strong></td>
                <td class="money"><strong>R$ {{ formatarValor(breakdownPorMes.reduce((s, i) => s + i.impostos, 0)) }}</strong></td>
                <td class="money"><strong>R$ {{ formatarValor(breakdownPorMes.reduce((s, i) => s + i.pagosInterpretes, 0)) }}</strong></td>
                <td class="money blue"><strong>R$ {{ formatarValor(breakdownPorMes.reduce((s, i) => s + i.caixaEmpresa, 0)) }}</strong></td>
              </tr>
            </tbody>
          </table>
          
          <p v-if="breakdownPorMes.length === 0" class="no-data">
            Nenhum evento encontrado.
          </p>
        </div>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import MainLayout from '../components/MainLayout.vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import jsPDF from 'jspdf';
import {
  Filter, Plus, RotateCcw, DollarSign, Clock, Truck, AlertCircle, Users,
  Briefcase, FileText, Edit2, Trash2, X, BarChart3, CreditCard, CheckCircle
} from 'lucide-vue-next';

const router = useRouter();
const userRole = ref(localStorage.getItem('userRole') || 'aluno');
const totalPago = ref(0);
const somaValoresAlunos = ref(0);
const totalPagoModal = ref(false);
const alunosValores = ref([]);

const carregarTotalPago = async () => {
  try {
    const res = await api.get('/usuarios?role=aluno');
    const alunos = res.data.filter(a => a.valorTotalCurso && a.valorTotalCurso > 0);
    somaValoresAlunos.value = alunos.reduce((s, a) => s + (a.valorTotalCurso || 0), 0);
    totalPago.value = alunos.reduce((s, a) => s + (a.valorPago || 0), 0);
  } catch { totalPago.value = 0; somaValoresAlunos.value = 0; }
};

const abrirModalValoresAlunos = async () => {
  try {
    const res = await api.get('/usuarios?role=aluno');
    // Mostrar todos os alunos com dados de investimento
    alunosValores.value = res.data.filter(a => a.modalidade || a.valorTotalCurso || a.valorPago || a.statusPagamento);
  } catch {}
  totalPagoModal.value = true;
};

if (userRole.value === 'admin_restrito') {
  router.push('/admin/dashboard');
}

const eventos = ref([]);
const empresasDisponiveis = ref([]);
const filtroMes = ref('');
const filtroAno = ref('');
const filtroEmpresa = ref('');
const mostrarModal = ref(false);
const modoEdicao = ref(false);
const idEdicao = ref(null);
const mostrarModalDetalhado = ref(false);

const formulario = ref({
  empresa: '', cnpj: '', solicitante: '', email: '', contato: '', tematica: '', evento: '',
  tipoEvento: '', dataInicial: '', dataFinal: '', horaInicio: '', horaTermino: '',
  quantidadeHoras: 0, interpretes: '', plataforma: '', precoTotal: 0, transporte: 0,
  impostos: 0, pagosInterpretes: 0, caixaEmpresa: 0, mes: 'janeiro',
  ano: new Date().getFullYear(), observacao: '', previsaoPagamento: '', pagoEm: '', outros: '',
  // Novos campos para orçamento
  prazoEntrega: '', politicaCancelamento: '', requisitos: '', dadosBancarios: '', formaPagamento: '', parcelamento: '',
  // Status do pagamento
  status: 'pendente'
});

const eventosFiltrados = computed(() => {
  return eventos.value.filter(evento => {
    const meshMatch = filtroMes.value === '' || evento.mes === filtroMes.value;
    const anoMatch = filtroAno.value === '' || evento.ano == filtroAno.value;
    const empresaMatch = filtroEmpresa.value === '' || evento.empresa === filtroEmpresa.value;
    return meshMatch && anoMatch && empresaMatch;
  });
});

const somaPrecoTotal = computed(() => eventosFiltrados.value.reduce((s, e) => s + (e.precoTotal || 0), 0));
const somaHoras = computed(() => eventosFiltrados.value.reduce((s, e) => s + (e.quantidadeHoras || 0), 0));
const somaTransporte = computed(() => eventosFiltrados.value.reduce((s, e) => s + (e.transporte || 0), 0));
const somaImpostos = computed(() => eventosFiltrados.value.reduce((s, e) => s + (e.impostos || 0), 0));
const somaInterpretes = computed(() => eventosFiltrados.value.reduce((s, e) => s + (e.pagosInterpretes || 0), 0));
const somaCaixa = computed(() => eventosFiltrados.value.reduce((s, e) => s + (e.caixaEmpresa || 0), 0));

// Breakdown por mês
const breakdownPorMes = computed(() => {
  const resultados = {};
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  
  eventos.value.forEach(evento => {
    if (!evento.mes || !evento.ano) return; // Skip events without mes/ano
    
    const mesEvento = evento.mes;
    const anoEvento = evento.ano;
    const key = `${mesEvento}-${anoEvento}`;
    
    if (!resultados[key]) {
      resultados[key] = {
        mes: mesEvento,
        ano: anoEvento,
        precoTotal: 0,
        transporte: 0,
        impostos: 0,
        pagosInterpretes: 0,
        caixaEmpresa: 0,
        horas: 0,
        quantidadeEventos: 0
      };
    }
    
    resultados[key].precoTotal += evento.precoTotal || 0;
    resultados[key].transporte += evento.transporte || 0;
    resultados[key].impostos += evento.impostos || 0;
    resultados[key].pagosInterpretes += evento.pagosInterpretes || 0;
    resultados[key].caixaEmpresa += evento.caixaEmpresa || 0;
    resultados[key].horas += evento.quantidadeHoras || 0;
    resultados[key].quantidadeEventos += 1;
  });
  
  return Object.values(resultados).sort((a, b) => {
    const mesesA = meses.indexOf(a.mes);
    const mesesB = meses.indexOf(b.mes);
    if (mesesA !== mesesB) return mesesA - mesesB;
    return b.ano - a.ano;
  });
});

const abrirModalDetalhado = () => {
  mostrarModalDetalhado.value = true;
};

const mesAnoSelecionado = computed(() => {
  const meses = {
    'janeiro': 'Janeiro', 'fevereiro': 'Fevereiro', 'março': 'Março', 'abril': 'Abril',
    'maio': 'Maio', 'junho': 'Junho', 'julho': 'Julho', 'agosto': 'Agosto',
    'setembro': 'Setembro', 'outubro': 'Outubro', 'novembro': 'Novembro', 'dezembro': 'Dezembro'
  };
  const mesTexto = filtroMes.value ? meses[filtroMes.value] : 'Todos os meses';
  const anoTexto = filtroAno.value || 'Todos os anos';
  return `${mesTexto} ${anoTexto}`;
});

const formatarValor = (valor) => parseFloat(valor || 0).toFixed(2).replace('.', ',');
const formatarData = (data) => {
  if (!data) return '-';
  const d = new Date(data);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const aplicarFiltros = () => {};
const resetarFiltros = () => {
  filtroMes.value = '';
  filtroAno.value = '';
  filtroEmpresa.value = '';
  carregarEventos();
};

// Gerar Orçamento PDF do evento
const gerarOrcamento = (evento) => {
  try {
    const doc = new jsPDF();
    const pageWidth = 210;
    const margin = 20;
    let y = margin;
    
    // ========== CABEÇALHO ==========
    doc.setFillColor(0, 74, 173);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('LIBRAS SALVADOR', margin, 18);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Orçamento de Serviços', margin, 28);
    
    // Data à direita
    doc.setFontSize(9);
    doc.text('Data: ' + new Date().toLocaleDateString('pt-BR'), pageWidth - margin, 18, { align: 'right' });
    doc.text('Validade: 10 dias', pageWidth - margin, 25, { align: 'right' });
    
    y = 45;
    doc.setTextColor(30, 41, 59);
    
    // ========== 1. IDENTIFICAÇÃO ==========
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. IDENTIFICAÇÃO', margin, y);
    y += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Dados do Prestador:', margin, y);
    y += 5;
    doc.setFontSize(8);
    doc.text('LIBRAS SALVADOR LTDA', margin, y);
    doc.text('CNPJ: 34.989.801/0001-43', 100, y);
    y += 5;
    doc.text('Rua Alceu Amoroso Lima, 786, Edf. Tancredo Neves Trade Center, Sala 312', margin, y);
    doc.text('Caminho das Árvores, Salvador/BA', 100, y);
    y += 5;
    doc.text('CEP: 41.820-770', margin, y);
    doc.text('Contato: (71) 98836-1371', 100, y);
    y += 5;
    doc.text('E-mail: contato@librasalvador.com', margin, y);
    
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Dados do Cliente:', margin, y);
    y += 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Empresa: ${evento.empresa || '-'}`, margin, y);
    y += 5;
    doc.text(`CNPJ: ${evento.cnpj || '________________'}`, margin, y);
    doc.text(`Responsável: ${evento.solicitante || '________________'}`, 100, y);
    y += 5;
    doc.text(`Setor: ${evento.tematica || '________________'}`, margin, y);
    doc.text(`Contato: ${evento.contato || '________________'}`, 100, y);
    
    y += 10;
    
    // ========== 2. DESCRIÇÃO DOS SERVIÇOS ==========
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. DESCRIÇÃO DETALHADA DOS SERVIÇOS', margin, y);
    y += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('De forma livre:', margin, y);
    y += 5;
    doc.setFontSize(8);
    const descricao = evento.evento || 'Serviço de interpretação em Libras';
    const descricaoLinha = doc.splitTextToSize(descricao + (evento.tipoEvento ? ' - ' + evento.tipoEvento : ''), pageWidth - 2 * margin);
    doc.text(descricaoLinha, margin, y);
    y += descricaoLinha.length * 4 + 5;
    
    doc.text('O preço da hora / interpretação leva em conta a lista de referência da FEBRAPILS para esse tipo de atividade.', margin, y);
    y += 5;
    doc.text('Para atividades com até uma hora de duração, será necessária a atuação de um intérprete de Libras.', margin, y);
    
    y += 10;
    
    // ========== 3. DETALHAMENTO ==========
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. DETALHAMENTO', margin, y);
    y += 8;
    
    // Quebra de página se necessário
    if (y > 200) {
      doc.addPage();
      y = margin;
    }
    
    // Tabela de valores
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Descrição', margin, y);
    doc.text('Valor', 140, y);
    y += 1;
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
    
    doc.setFont('helvetica', 'normal');
    const hora = evento.quantidadeHoras || 2;
    const valorHora = evento.precoTotal && hora ? evento.precoTotal / hora : 100;
    const subTotalHoras = hora * valorHora;
    
    doc.text(`Duração do Orçamento`, margin, y);
    doc.text(`${hora} hora(s)`, 140, y);
    y += 5;
    doc.text(`Valor da Hora`, margin, y);
    doc.text(`R$ ${formatarValor(valorHora)}`, 140, y);
    y += 5;
    doc.text(`Subtotal (Horas X Valor)`, margin, y);
    doc.text(`R$ ${formatarValor(subTotalHoras)}`, 140, y);
    y += 5;
    
    const logistica = evento.transporte || 0;
    doc.text(`Custos de Logística`, margin, y);
    doc.text(`R$ ${formatarValor(logistica)}`, 140, y);
    y += 5;
    
    const subTotalBruto = subTotalHoras + logistica;
    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotal Bruto`, margin, y);
    doc.text(`R$ ${formatarValor(subTotalBruto)}`, 140, y);
    
    y += 8;
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
    
    // ========== IMPOSTO E MARGEM ==========
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('IMPOSTO E MARGEM', margin, y);
    y += 6;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const imposto = 0.19 * subTotalBruto;
    doc.text(`Reserva para imposto (19%)`, margin, y);
    doc.text(`R$ ${formatarValor(imposto)}`, 140, y);
    y += 5;
    doc.setTextColor(220, 38, 38);
    doc.text(`Margem`, margin, y);
    doc.text(`R$ 0,00`, 140, y);
    doc.setTextColor(30, 41, 59);
    
    // ========== NOVA PÁGINA SE NECESSÁRIO ==========
    if (y > 230) {
      doc.addPage();
      y = margin;
    }
    
    y += 10;
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
    
    const total = subTotalBruto + imposto;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL', margin, y);
    doc.text(`R$ ${formatarValor(total)}`, 140, y);
    
    y += 12;
    
    // ========== 4. CONDIÇÕES FINANCEIRAS ==========
    // Quebra de página se necessário
    if (y > 200) {
      doc.addPage();
      y = margin;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('4. CONDIÇÕES FINANCEIRAS', margin, y);
    y += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Prazo de pagamento: ${evento.prazoPagamento || 'em ______'}`, margin, y);
    y += 5;
    doc.text(`Forma de Pagamento: ${evento.formaPagamento || 'Pix, boleto, transferência ou cartão.'}`, margin, y);
    y += 5;
    doc.text(`Dados Bancários: ${evento.dadosBancarios || '________________________'}`, margin, y);
    y += 5;
    doc.text(`Parcelamento: ${evento.parcelamento || '( ) à vista ( ) ____x'}`, margin, y);
    
    y += 10;
    
    // ========== 5. PRAZOS E VALIDADE ==========
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('5. PRAZOS E VALIDADE', margin, y);
    y += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Prazo de Entrega/Execução: ${evento.prazoEntrega || '________________________'}`, margin, y);
    y += 5;
    doc.text('Validade da Proposta: Este orçamento é válido por 10 dias.', margin, y);
    
    y += 10;
    
    // ========== 6. TERMOS E CONDIÇÕES ==========
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('6. TERMOS E CONDIÇÕES (OBSERVAÇÕES)', margin, y);
    y += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Política de Cancelamento: ${evento.politicaCancelamento || '________________________'}`, margin, y);
    y += 5;
    doc.text(`Requisitos: ${evento.requisitos || 'O que você precisa que o cliente forneça para o trabalho'}`, margin, y);
    y += 5;
    doc.text('começar (documentos, acesso ao local, material de apoio): ________________', margin, y);
    
    y += 10;
    
    // ========== DIFERENCIAL ==========
    // Quebra de página se necessário
    if (y > 210) {
      doc.addPage();
      y = margin;
    }
    doc.setFillColor(240, 253, 244);
    doc.rect(margin - 2, y - 3, pageWidth - 2 * margin + 4, 45, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 74, 173);
    doc.text('POR QUE CONTRATAR A LIBRAS SALVADOR?', margin + 2, y + 4);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    y += 10;
    doc.text('• A Libras Salvador é uma empresa especializada em tradução e interpretação em Libras', margin + 2, y);
    y += 4;
    doc.text('  e foi criada pela união de duas paixões: a Libras e a história da cidade de Salvador!', margin + 2, y);
    y += 5;
    doc.text('• Temos o compromisso com a qualidade e ética no atendimento ao público Surdo.', margin + 2, y);
    y += 4;
    doc.text('• Possuímos uma equipe de intérpretes qualificados para atendimento em', margin + 2, y);
    y += 4;
    doc.text('  vários estados do Brasil!', margin + 2, y);
    y += 5;
    doc.text('• Somos mais de 300 avaliações 5 estrelas no Google.', margin + 2, y);
    y += 4;
    doc.text('• Emitimos Nota Fiscal como Tradução e Interpretação, diferentemente do que ocorre no', margin + 2, y);
    y += 4;
    doc.text('  mercado onde algumas empresas emitem como MEI.', margin + 2, y);
    
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Ficamos no aguardo de retorno da proposta e agradecemos pela oportunidade de apresentá-la.', margin, y);
    
    // ========== RODAPÉ ==========
    y = 285;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Gerado em: ' + new Date().toLocaleDateString('pt-BR'), margin, y);
    doc.text('Libras Salvador - www.librasalvador.com', pageWidth - margin, y, { align: 'right' });
    
    // Salvar
    const nomeArquivo = `Orcamento_${evento.empresa}_${evento.evento}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(nomeArquivo);
  } catch (error) {
    console.error('Erro ao gerar orçamento:', error);
    alert('Erro ao gerar orçamento. Tente novamente.');
  }
};

const abrirModalNovoEvento = () => {
  modoEdicao.value = false;
  formulario.value = {
    empresa: '', cnpj: '', solicitante: '', email: '', contato: '', tematica: '', evento: '',
    tipoEvento: '', dataInicial: '', dataFinal: '', horaInicio: '', horaTermino: '',
    quantidadeHoras: 0, interpretes: '', plataforma: '', precoTotal: 0, transporte: 0,
    impostos: 0, pagosInterpretes: 0, caixaEmpresa: 0, mes: 'janeiro',
    ano: new Date().getFullYear(), observacao: '', previsaoPagamento: '', pagoEm: '', outros: '',
    // Dados para orçamento
    prazoEntrega: '', politicaCancelamento: '', requisitos: '', dadosBancarios: '', formaPagamento: '', parcelamento: '',
    // Status
    status: 'pendente'
  };
  mostrarModal.value = true;
};

const editarEvento = async (id) => {
  try {
    const res = await api.get(`/financeiro/${id}`);
    modoEdicao.value = true;
    idEdicao.value = id;
    formulario.value = res.data;
    mostrarModal.value = true;
  } catch (error) {
    console.error('Erro ao carregar evento:', error);
    alert('Erro ao carregar evento');
  }
};

const deletarEvento = async (id) => {
  if (confirm('Tem certeza que deseja deletar este evento?')) {
    try {
      await api.delete(`/financeiro/${id}`);
      await carregarEventos();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar evento');
    }
  }
};

// Alternar status do pagamento
const alternarStatus = async (id, statusAtual) => {
  // Ciclo: pendente -> pago -> cancelado -> pendente
  const status = statusAtual || 'pendente';
  let novoStatus = 'pendente';
  if (status === 'pendente') novoStatus = 'pago';
  else if (status === 'pago') novoStatus = 'cancelado';
  
  if (confirm(`Alterar status para "${novoStatus === 'pago' ? 'Pago' : novoStatus === 'cancelado' ? 'Cancelado' : 'Pendente'}"?`)) {
    try {
      await api.put(`/financeiro/${id}`, { status: novoStatus });
      await carregarEventos();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status');
    }
  }
};

const fecharModal = () => {
  mostrarModal.value = false;
  modoEdicao.value = false;
  idEdicao.value = null;
};

const salvarEvento = async () => {
  try {
    if (modoEdicao.value && idEdicao.value) {
      await api.put(`/financeiro/${idEdicao.value}`, formulario.value);
    } else {
      await api.post('/financeiro', formulario.value);
    }
    await carregarEventos();
    fecharModal();
  } catch (error) {
    console.error('Erro ao salvar:', error);
    const campos = error.response?.data?.campos;
    const erroTipo = error.response?.data?.error;
    if (campos && campos.length > 0) {
      alert('Erro ao salvar: Campos obrigatórios faltando: ' + campos.join(', '));
    } else {
      alert('Erro ao salvar evento: ' + erroTipo || error.message);
    }
  }
};

const carregarEmpresas = async () => {
  try {
    const res = await api.get('/empresas-solicitantes?ativo=true');
    empresasDisponiveis.value = res.data;
  } catch (error) {
    console.error('Erro ao carregar empresas:', error);
  }
};

const carregarEventos = async () => {
  try {
    const res = await api.get('/financeiro', {
      params: {
        mes: filtroMes.value || '',
        ano: filtroAno.value || '',
        empresa: filtroEmpresa.value || ''
      }
    });
    eventos.value = res.data;
  } catch (error) {
    console.error('Erro ao carregar eventos:', error);
  }
};

onMounted(async () => {
  await carregarEmpresas();
  await carregarEventos();
  await carregarTotalPago();
});
</script>

<style scoped>
* { box-sizing: border-box; }

.restricted-banner {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  color: #dc2626;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  font-weight: 700;
}

.financeiro-container { max-width: 1600px; margin: 0 auto; padding: 0; }
.mb-6 { margin-bottom: 24px; }
.mt-6 { margin-top: 24px; }
.glass-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); padding: 24px; }

.filters-section { margin-bottom: 24px; }
.filters-title { margin: 0 0 20px 0; font-size: 1.1rem; color: #0f172a; font-weight: 800; display: flex; align-items: center; gap: 8px; }
.filters-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; }
.filter-group { display: flex; flex-direction: column; gap: 6px; }
.filter-group label { font-weight: 700; color: #475569; font-size: 0.85rem; }
.filter-group select, .filter-group input { padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; }
.filter-group select:focus, .filter-group input:focus { border-color: #004aad; outline: none; box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1); }

.filter-actions { display: flex; gap: 10px; flex-direction: column; justify-content: flex-end; }
.btn-reset, .btn-add { padding: 10px 16px; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
.btn-reset { background: #f1f5f9; color: #475569; }
.btn-reset:hover { background: #e2e8f0; }
.btn-add { background: #059669; color: white; }
.btn-add:hover { background: #047857; }

.summary-cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; }
.summary-card { padding: 20px; border-radius: 12px; display: flex; flex-direction: column; gap: 8px; align-items: center; border: 1px solid #e2e8f0; }
.card-blue { background: #004aad; color: white; }
.card-blue-light { background: #0369a1; color: white; }
.card-slate { background: #1e293b; color: white; }
.card-amber { background: #d97706; color: white; }
.card-green { background: #059669; color: white; }
.card-label { font-size: 0.8rem; opacity: 0.9; font-weight: 600; }
.card-value { font-size: 1.4rem; font-weight: 800; }

.table-section { margin-top: 24px; }
.table-title { margin: 0 0 20px 0; font-size: 1.2rem; color: #0f172a; font-weight: 800; display: flex; align-items: center; gap: 8px; }
.table-responsive { overflow-x: auto; }
.main-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.header-row { background: #004aad; }
.header-row th { padding: 12px; text-align: left; color: white; font-weight: 700; }
.data-row { border-bottom: 1px solid #e2e8f0; }
.data-row:hover { background: #f8fafc; }
.data-row td { padding: 12px; }
.numero { text-align: center; }
.email { font-size: 0.75rem; color: #64748b; }
.evento { font-weight: 600; }
.valor { text-align: right; font-weight: 600; }
.caixa { color: #059669; font-weight: 800; }
.badge { display: inline-block; padding: 4px 10px; border-radius: 6px; color: white; font-weight: 700; font-size: 0.75rem; }

.acoes { text-align: center; }
.btn-edit, .btn-delete, .btn-orcamento { 
  background: #f1f5f9; border: none; cursor: pointer; padding: 8px; border-radius: 8px; transition: 0.2s; 
  display: inline-flex; align-items: center; justify-content: center; color: #475569; margin: 2px;
}
.btn-orcamento:hover { background: #bfdbfe; color: #004aad; }
.btn-edit:hover { background: #bfdbfe; color: #0284c7; }
.btn-delete:hover { background: #fecaca; color: #dc2626; }

.status { text-align: center; }
.badge-status { 
  display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: 0.2s;
}
.badge-status.pendente { background: #fef3c7; color: #b45309; }
.badge-status.pago { background: #d1fae5; color: #047857; }
.badge-status.cancelado { background: #fee2e2; color: #b91c1c; }

.financial-summary { margin-top: 24px; }
.summary-title { margin: 0 0 20px 0; font-size: 1.2rem; color: #0f172a; font-weight: 800; display: flex; align-items: center; gap: 8px; }
.summary-details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
.detail-item { padding: 15px; background: #f8fafc; border-radius: 8px; display: flex; justify-content: space-between; border-left: 4px solid #004aad; }
.detail-item.highlight { background: #ecfdf5; border-left-color: #10b981; }
.detail-label { font-weight: 700; color: #475569; }
.detail-value { color: #0f172a; font-weight: 800; }

.payment-section { margin-top: 24px; }
.payment-title { margin: 0 0 20px 0; font-size: 1.2rem; color: #0f172a; font-weight: 800; display: flex; align-items: center; gap: 8px; }
.payment-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
.payment-item { padding: 15px; background: #f8fafc; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
.payment-item.total { background: #e0f2fe; border-left: 4px solid #0369a1; font-weight: 800; }
.value { color: #0f172a; font-weight: 800; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal-content { width: 100%; max-width: 850px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 2px solid #e2e8f0; }
.modal-header h3 { margin: 0; font-size: 1.3rem; }
.btn-close { background: none; border: none; cursor: pointer; color: #64748b; padding: 0; }
.btn-close:hover { color: #1e293b; }

.modal-form { padding: 20px; }
.form-section { margin-bottom: 25px; }
.section-title { margin: 0 0 15px 0; font-size: 0.95rem; font-weight: 800; color: #004aad; text-transform: uppercase; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { font-weight: 700; font-size: 0.85rem; color: #475569; }
.link-gerenciar { color: #004aad; text-decoration: none; font-weight: 700; font-size: 0.75rem; margin-left: 8px; transition: 0.2s; }
.link-gerenciar:hover { text-decoration: underline; color: #003a8c; }
.form-group input, .form-group select, .form-group textarea { padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; font-family: inherit; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #004aad; outline: none; box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1); }

.form-actions { display: flex; gap: 10px; margin-top: 25px; border-top: 2px solid #e2e8f0; padding-top: 20px; }
.btn-cancel, .btn-save { flex: 1; padding: 12px; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn-cancel { background: #f1f5f9; color: #475569; }
.btn-cancel:hover { background: #e2e8f0; }
.btn-save { background: #004aad; color: white; }
.btn-save:hover { background: #003a8c; }

.no-data td { padding: 40px 12px; }

@media (max-width: 1024px) {
  .financeiro-container { padding: 0 10px; }
  .main-table { font-size: 0.75rem; }
  .main-table th, .main-table td { padding: 8px; }
  .summary-cards-grid { grid-template-columns: repeat(2, 1fr); }
  .summary-details-grid, .payment-grid { grid-template-columns: 1fr; }
  .modal-content { max-width: 90%; }
}

@media (max-width: 768px) {
  .glass-card { padding: 16px; }
  .filters-grid { grid-template-columns: 1fr; }
  .filter-actions { flex-direction: row; gap: 10px; }
  .btn-reset, .btn-add { flex: 1; }
  .summary-cards-grid { grid-template-columns: 1fr; }
  .main-table { font-size: 0.7rem; }
  .main-table th, .main-table td { padding: 6px; }
  .modal-content { max-width: 95%; max-height: 95vh; }
  .form-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .financeiro-container { padding: 0 5px; }
  .glass-card { padding: 12px; border-radius: 12px; }
  .filters-title, .table-title, .summary-title, .payment-title { font-size: 1rem; }
  .summary-cards-grid { grid-template-columns: 1fr; gap: 10px; }
  .summary-card { padding: 15px; }
  .card-value { font-size: 1.2rem; }
  .main-table { font-size: 0.65rem; min-width: 600px; }
  .main-table th, .main-table td { padding: 4px; }
  .modal-content { max-width: 98%; max-height: 98vh; }
}

.modal-body { padding: 20px; max-height: 60vh; overflow-y: auto; }
.valor-destaque { color: #059669; font-weight: bold; }
.valor-caixa { color: #004aad; font-weight: bold; }
.mes-cell { text-transform: capitalize; font-weight: 600; }
.total-row { background: #f1f5f9; font-weight: bold; }
.total-row td { border-top: 2px solid #94a3b8; }
.no-data { text-align: center; padding: 30px; color: #64748b; }

/* Modal Detalhado */
.modal-detalhado { max-width: 1000px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; }
.header-detalhado { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
.header-detalhado h2 { margin: 0; color: #0f172a; font-size: 1.5rem; }
.header-detalhado .subtitle { margin: 4px 0 0; color: #64748b; font-size: 0.9rem; }

.resumo-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.resumo-card { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 16px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0; }
.resumo-card .label { display: block; font-size: 0.8rem; color: #64748b; margin-bottom: 4px; }
.resumo-card .value { font-size: 1.2rem; font-weight: 700; color: #0f172a; }
.resumo-card .value.green { color: #059669; }
.resumo-card .value.blue { color: #004aad; }

.data-table.detalhada { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table.detalhada th { background: #f8fafc; padding: 12px 8px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; }
.data-table.detalhada th.th-mes { width: 120px; }
.data-table.detalhada th.th-money { text-align: right; }
.data-table.detalhada td { padding: 12px 8px; border-bottom: 1px solid #f1f5f9; }
.data-table.detalhada td.center { text-align: center; }
.data-table.detalhada td.money { text-align: right; font-family: 'Courier New', monospace; }
.data-table.detalhada td.money.green { color: #059669; font-weight: 600; }
.data-table.detalhada td.money.blue { color: #004aad; font-weight: 600; }

.mes-cell { display: flex; flex-direction: column; }
.mes-nome { font-weight: 600; color: #0f172a; }
.mes-ano { font-size: 0.75rem; color: #94a3b8; }

.badge-eventos { background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }

.total-row { background: #f1f5f9; }
.total-row td { padding: 14px 8px; border-top: 2px solid #94a3b8; }

@media (max-width: 768px) {
  .resumo-cards { grid-template-columns: repeat(2, 1fr); }
  .modal-detalhado { font-size: 0.8rem; }
}
</style>    