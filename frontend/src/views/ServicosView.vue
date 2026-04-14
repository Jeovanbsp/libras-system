<template>
  <MainLayout pageTitle="Serviços Confirmados" pageDescription="Gerencie eventos, aloque intérpretes e controle o fluxo financeiro de cada serviço.">
    <div class="layout-split">
      
      <div class="glass-card side-form">
        <h3 class="form-title">
          <CalendarPlus :size="20" class="text-brand" /> Lançar Serviço
        </h3>
        
        <form @submit.prevent="cadastrar" class="modern-form scrollable-form">
          <div class="form-row">
            <div class="form-group-col" style="flex: 2;">
              <label>Cliente (B2B)</label>
              <select v-model="form.cliente" required class="modern-select">
                <option value="" disabled>Selecione um cliente...</option>
                <option v-for="cliente in clientes" :key="cliente._id" :value="cliente._id">
                  {{ cliente.razaoSocial }} ({{ cliente.cnpj }})
                </option>
              </select>
            </div>
            <div class="form-group-col" style="flex: 1;">
              <label>Solicitante</label>
              <input v-model="form.solicitante" placeholder="Ex: Joyce" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>Data Início</label>
              <input v-model="form.dataEvento" type="date" required />
            </div>
            <div class="form-group-col">
              <label>Data Fim <span class="text-xs font-normal text-gray-400">- Opcional</span></label>
              <input v-model="form.dataFim" type="date" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>Hora Início</label>
              <input v-model="form.horaInicio" type="time" />
            </div>
            <div class="form-group-col">
              <label>Hora Término</label>
              <input v-model="form.horaTermino" type="time" />
            </div>
            <div class="form-group-col">
              <label>Qtd Horas</label>
              <input v-model.number="form.quantidadeHoras" type="number" step="0.5" placeholder="Ex: 4" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>Tipo de Evento</label>
              <select v-model="form.tipoEvento" required class="modern-select">
                <option value="Conferência">Conferência / Palestra</option>
                <option value="Social">Social</option>
                <option value="Artístico e Cultural">Artístico e Cultural</option>
                <option value="Contextos Empresariais">Empresarial (Integração/Treinamento)</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div class="form-group-col">
              <label>Modalidade</label>
              <select v-model="form.modalidade" required class="modern-select">
                <option value="Presencial">Presencial</option>
                <option value="Virtual">Virtual</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Intérpretes Alocados</label>
            <div class="interpretes-box">
              <label v-for="pro in profissionais" :key="pro._id" class="interprete-label">
                <input type="checkbox" :value="pro._id" v-model="form.interpretes" />
                <span>{{ pro.nome }}</span>
              </label>
            </div>
          </div>

          <div class="financeiro-module" v-if="userRole !== 'admin_restrito'">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h4><DollarSign :size="16" /> Resumo Financeiro</h4>
              
              <select v-model="form.statusPagamento" class="status-select" :class="form.statusPagamento === 'Pago' ? 'text-green-600' : 'text-orange-600'">
                <option value="Pendente">⏳ Pendente</option>
                <option value="Pago">✅ Recebido (Pago)</option>
              </select>
            </div>
            
            <div class="form-row mt-2">
              <div class="form-group-col">
                <label>Preço Total (R$)</label>
                <input v-model.number="form.precoTotal" @input="calcularCaixa" type="number" step="0.01" required />
              </div>
              <div class="form-group-col">
                <label>Pagar Intérpretes (R$)</label>
                <input v-model.number="form.valorInterpretes" @input="calcularCaixa" type="number" step="0.01" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group-col">
                <label>Logística (R$)</label>
                <input v-model.number="form.valorLogistica" @input="calcularCaixa" type="number" step="0.01" />
              </div>
              <div class="form-group-col">
                <label>Impostos (R$)</label>
                <input v-model.number="form.impostos" @input="calcularCaixa" type="number" step="0.01" />
              </div>
            </div>

            <div class="caixa-empresa-box">
              <span>Caixa da Empresa:</span>
              <strong>R$ {{ form.caixaEmpresa.toFixed(2) }}</strong>
            </div>
          </div>

          <div class="financeiro-module" v-if="userRole === 'admin_restrito'">
            <h4><Info :size="16" /> Resumo Financeiro Oculto</h4>
            <p class="text-xs text-gray-500 mb-0 mt-2">Você não tem permissão para visualizar ou editar os valores financeiros deste serviço.</p>
          </div>

          <div class="form-group mt-4">
            <label>Observações</label>
            <textarea v-model="form.observacoes" placeholder="Plataforma, detalhes do evento..." rows="2"></textarea>
          </div>

          <button type="submit" class="btn-primary">
            <Save :size="18" /> Lançar Serviço
          </button>
        </form>
      </div>

      <div class="list-section">
        
        <div class="mini-dashboard" v-if="userRole !== 'admin_restrito'">
          <div class="dash-card">
            <span class="dash-title">Total Faturado</span>
            <span class="dash-value">R$ {{ totalFaturado.toFixed(2) }}</span>
          </div>
          <div class="dash-card success">
            <span class="dash-title">Lucro da Empresa</span>
            <span class="dash-value">R$ {{ totalCaixa.toFixed(2) }}</span>
          </div>
          <div class="dash-card warning">
            <span class="dash-title">A Receber (Pendente)</span>
            <span class="dash-value">R$ {{ totalPendente.toFixed(2) }}</span>
          </div>
        </div>

        <div class="glass-card search-bar mt-2">
          <div class="form-row" style="margin-bottom: 0; align-items: flex-end;">
            <div class="form-group-col">
              <label class="text-xs font-bold text-gray-500">De:</label>
              <input v-model="filtros.dataInicio" type="date" @change="carregarServicos" />
            </div>
            <div class="form-group-col">
              <label class="text-xs font-bold text-gray-500">Até:</label>
              <input v-model="filtros.dataFim" type="date" @change="carregarServicos" />
            </div>
            <div class="form-group-col">
              <label class="text-xs font-bold text-gray-500">Cliente:</label>
              <select v-model="filtros.clienteId" @change="carregarServicos" class="modern-select" style="height: 48px;">
                <option value="">Todos</option>
                <option v-for="c in clientes" :key="c._id" :value="c._id">{{ c.razaoSocial }}</option>
              </select>
            </div>
            <div class="form-group-col" style="flex: 0.5;" v-if="userRole !== 'admin_restrito'">
              <button @click="gerarRelatorioPDF" class="btn-secondary" style="height: 48px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <FileText :size="18" /> PDF
              </button>
            </div>
          </div>
        </div>

        <div class="glass-card list-box mt-4">
          <h3 class="form-title">
            <Briefcase :size="20" class="text-brand" /> Histórico de Serviços ({{ servicos.length }})
          </h3>
          
          <div class="servicos-list">
            <div v-for="servico in servicos" :key="servico._id" class="servico-card">
              <div class="servico-header">
                <div class="client-info">
                  <strong>{{ servico.cliente?.razaoSocial || 'Cliente Removido' }}</strong>
                  <span class="badge type-badge">{{ servico.tipoEvento }}</span>
                  <span class="badge mode-badge">{{ servico.modalidade }}</span>
                  <span :class="['badge', servico.statusPagamento === 'Pago' ? 'status-pago' : 'status-pendente']">
                    {{ servico.statusPagamento }}
                  </span>
                </div>
                <div class="date-info">
                  <Calendar :size="14" /> {{ formatarData(servico.dataEvento) }}
                  <span v-if="servico.dataFim && servico.dataFim !== servico.dataEvento"> a {{ formatarData(servico.dataFim) }}</span>
                </div>
              </div>

              <div class="servico-body">
                <div class="interpretes-tags">
                  <Users :size="14" class="text-gray-400" />
                  <span v-for="pro in servico.interpretes" :key="pro._id" class="pro-tag">{{ pro.nome }}</span>
                  <span v-if="!servico.interpretes.length" class="text-xs text-gray-400">Nenhum intérprete</span>
                </div>
                <div class="duration-info">
                  <Clock :size="14" /> 
                  <span v-if="servico.horaInicio">{{ servico.horaInicio }} às {{ servico.horaTermino }}</span>
                  <span v-else>{{ servico.quantidadeHoras }} horas</span>
                </div>
              </div>

              <div class="servico-footer">
                <div class="financial-summary" v-if="userRole !== 'admin_restrito'">
                  <div class="fin-item"><span>Total:</span> <strong>R$ {{ (servico.precoTotal || 0).toFixed(2) }}</strong></div>
                  <div class="fin-item"><span>Caixa Empresa:</span> <strong class="text-green-600">R$ {{ (servico.caixaEmpresa || 0).toFixed(2) }}</strong></div>
                </div>
                <button @click="remover(servico._id)" class="btn-del-mini" title="Excluir">
                  <Trash2 :size="18" />
                </button>
              </div>
            </div>
            
            <div v-if="servicos.length === 0" class="empty-msg">
              <Inbox :size="40" class="opacity-20" />
              <p>Nenhum serviço encontrado.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { CalendarPlus, Calendar, Briefcase, Users, DollarSign, Clock, Trash2, Inbox, Save, FileText, Info } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const userRole = ref(localStorage.getItem('userRole') || 'aluno');

const servicos = ref([]);
const clientes = ref([]);
const profissionais = ref([]);

const filtros = ref({
  dataInicio: '',
  dataFim: '',
  clienteId: ''
});

const form = ref({
  cliente: '', solicitante: '', interpretes: [], dataEvento: '', dataFim: '', horaInicio: '', horaTermino: '',
  quantidadeHoras: null, tipoEvento: 'Conferência', modalidade: 'Presencial', statusPagamento: 'Pendente',
  precoTotal: 0, valorLogistica: 0, impostos: 0, valorInterpretes: 0, caixaEmpresa: 0, observacoes: ''
});

// LÓGICA DO DASHBOARD
const totalFaturado = computed(() => servicos.value.reduce((acc, curr) => acc + (curr.precoTotal || 0), 0));
const totalCaixa = computed(() => servicos.value.reduce((acc, curr) => acc + (curr.caixaEmpresa || 0), 0));
const totalPendente = computed(() => servicos.value.filter(s => s.statusPagamento === 'Pendente').reduce((acc, curr) => acc + (curr.precoTotal || 0), 0));

const calcularCaixa = () => {
  const total = form.value.precoTotal || 0;
  const logistica = form.value.valorLogistica || 0;
  const impostos = form.value.impostos || 0;
  const interpretes = form.value.valorInterpretes || 0;
  form.value.caixaEmpresa = total - logistica - impostos - interpretes;
};

const carregarDadosBase = async () => {
  try {
    const [resClientes, resProfissionais] = await Promise.all([api.get('/b2b'), api.get('/profissionais')]);
    clientes.value = resClientes.data;
    profissionais.value = resProfissionais.data;
  } catch (error) { console.error(error); }
};

const carregarServicos = async () => {
  try {
    const res = await api.get('/servicos', { params: filtros.value });
    servicos.value = res.data;
  } catch (error) { console.error(error); }
};

const cadastrar = async () => {
  try {
    if (userRole.value === 'admin_restrito') {
       form.value.precoTotal = 0; form.value.valorLogistica = 0;
       form.value.impostos = 0; form.value.valorInterpretes = 0; form.value.caixaEmpresa = 0;
    }
    await api.post('/servicos', form.value);
    alert('Serviço lançado com sucesso!');
    
    // Reseta o formulário
    form.value = {
      cliente: '', solicitante: '', interpretes: [], dataEvento: '', dataFim: '', horaInicio: '', horaTermino: '',
      quantidadeHoras: null, tipoEvento: 'Conferência', modalidade: 'Presencial', statusPagamento: 'Pendente',
      precoTotal: 0, valorLogistica: 0, impostos: 0, valorInterpretes: 0, caixaEmpresa: 0, observacoes: ''
    };
    carregarServicos();
  } catch (error) { alert('Erro ao lançar.'); }
};

const remover = async (id) => {
  if (confirm("Deseja apagar este lançamento?")) {
    try {
      await api.delete(`/servicos/${id}`);
      carregarServicos();
    } catch (error) { alert("Erro ao excluir."); }
  }
};

const formatarData = (dataIso) => {
  if (!dataIso) return '';
  const data = new Date(dataIso);
  data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
  return data.toLocaleDateString('pt-BR');
};

const gerarRelatorioPDF = () => {
  if (userRole.value === 'admin_restrito') return alert("Acesso negado.");
  if (servicos.value.length === 0) return alert("Nenhum serviço para exportar neste período.");

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Relatório de Serviços Prestados - Libras Salvador', 14, 20);
  
  doc.setFontSize(10);
  const periodoTxt = `Período: ${filtros.value.dataInicio ? formatarData(filtros.value.dataInicio) : 'Início'} até ${filtros.value.dataFim ? formatarData(filtros.value.dataFim) : 'Hoje'}`;
  doc.text(periodoTxt, 14, 28);

  const tableColumn = ["Data", "Cliente", "Evento", "Intérpretes", "Status", "Valor Total"];
  const tableRows = [];

  let totalGeral = 0;
  let totalCaixaEmpresa = 0;

  servicos.value.forEach(servico => {
    const data = formatarData(servico.dataEvento);
    const cliente = servico.cliente?.razaoSocial || 'N/A';
    const evento = servico.tipoEvento;
    const status = servico.statusPagamento || 'Pendente';
    const nomeInterpretes = servico.interpretes.map(i => i.nome).join(', ') || '-';
    const valor = `R$ ${(servico.precoTotal || 0).toFixed(2)}`;
    
    totalGeral += (servico.precoTotal || 0);
    totalCaixaEmpresa += (servico.caixaEmpresa || 0);

    tableRows.push([data, cliente, evento, nomeInterpretes, status, valor]);
  });

  tableRows.push(["", "", "", "", "TOTAL FATURADO:", `R$ ${totalGeral.toFixed(2)}`]);
  tableRows.push(["", "", "", "", "CAIXA DA EMPRESA:", `R$ ${totalCaixaEmpresa.toFixed(2)}`]);

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    theme: 'grid',
    headStyles: { fillColor: [0, 74, 173] },
    willDrawCell: function(data) {
      if (data.row.index >= tableRows.length - 2) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
      }
    }
  });

  doc.save(`Relatorio_Servicos_${new Date().getTime()}.pdf`);
};

onMounted(() => { carregarDadosBase(); carregarServicos(); });
</script>

<style scoped>
.layout-split { display: grid; grid-template-columns: 400px 1fr; gap: 30px; align-items: start; }
.list-section { display: flex; flex-direction: column; gap: 15px; }
.glass-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05); }

/* DASHBOARD MINIATURA */
.mini-dashboard { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
.dash-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
.dash-card.success { border-left: 4px solid #10b981; }
.dash-card.warning { border-left: 4px solid #f59e0b; }
.dash-title { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
.dash-value { font-size: 1.5rem; font-weight: 900; color: #0f172a; }

.form-title { margin-bottom: 25px; color: #1e293b; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
.text-brand { color: #004aad; }

.modern-form label { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; margin: 15px 0 8px; text-transform: uppercase; }
.modern-form input, .modern-form textarea, .modern-select, .search-bar input { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; font-size: 0.95rem; color: #1e293b; box-sizing: border-box; font-family: inherit; }
.modern-form input:focus, .modern-select:focus, .search-bar input:focus { outline: none; border-color: #004aad; box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1); background: white; }

.form-row { display: flex; gap: 15px; width: 100%; align-items: flex-end; margin-bottom: 10px; }
.form-group-col { flex: 1; display: flex; flex-direction: column; }

.interpretes-box { max-height: 100px; overflow-y: auto; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; }
.interprete-label { display: flex; align-items: center; gap: 8px; padding: 6px; cursor: pointer; font-size: 0.85rem; }

.financeiro-module { background: #eff6ff; border: 1px dashed #bfdbfe; padding: 20px; border-radius: 16px; margin-top: 15px; }
.financeiro-module h4 { margin: 0; color: #1e40af; font-size: 0.95rem; display: flex; align-items: center; gap: 6px; font-weight: 800; }
.status-select { padding: 6px 12px; border-radius: 8px; border: 1px solid #bfdbfe; font-weight: 700; font-size: 0.8rem; background: white; outline: none; cursor: pointer;}
.caixa-empresa-box { margin-top: 15px; background: #dcfce7; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; color: #166534; }
.caixa-empresa-box span { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; }
.caixa-empresa-box strong { font-size: 1.2rem; }

.btn-primary { width: 100%; background: #004aad; color: white; border: none; padding: 16px; border-radius: 14px; margin-top: 25px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; }
.btn-primary:hover { background: #003a8c; transform: translateY(-2px); }

.servico-card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; transition: 0.2s; background: white; }
.servico-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #e2e8f0; }
.client-info strong { font-size: 1.1rem; color: #1e293b; display: block; margin-bottom: 5px; }
.badge { font-size: 0.65rem; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; margin-right: 5px; }
.type-badge { background: #f3e8ff; color: #6d28d9; }
.mode-badge { background: #e0f2fe; color: #1d4ed8; }
.status-pago { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;}
.status-pendente { background: #fef3c7; color: #b45309; border: 1px solid #fde68a;}
.date-info { display: flex; align-items: center; gap: 5px; font-size: 0.85rem; font-weight: 600; color: #64748b; background: #f8fafc; padding: 6px 12px; border-radius: 8px; }

.servico-body { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.interpretes-tags { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.pro-tag { font-size: 0.75rem; background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 20px; font-weight: 600; }
.duration-info { display: flex; align-items: center; gap: 5px; font-size: 0.85rem; color: #64748b; font-weight: 600; }

.servico-footer { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 15px; border-radius: 12px; }
.financial-summary { display: flex; gap: 20px; }
.fin-item { display: flex; flex-direction: column; font-size: 0.75rem; color: #64748b; }
.fin-item strong { font-size: 0.95rem; color: #0f172a; margin-top: 2px; }
.text-green-600 { color: #16a34a !important; }
.btn-del-mini { background: white; border: 1px solid #e2e8f0; padding: 8px; border-radius: 10px; cursor: pointer; color: #94a3b8; transition: 0.2s; }
.btn-del-mini:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }

.scrollable-form { max-height: 80vh; overflow-y: auto; padding-right: 10px; }
.scrollable-form::-webkit-scrollbar { width: 5px; }
.scrollable-form::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

@media (max-width: 992px) {
  .layout-split { grid-template-columns: 1fr; gap: 20px; }
  .mini-dashboard { grid-template-columns: 1fr; }
}
</style>