<template>
  <MainLayout pageTitle="Serviços Confirmados" pageDescription="Gerencie eventos, aloque intérpretes e controle o fluxo financeiro de cada serviço.">
    <div class="layout-split">
      
      <div class="glass-card side-form">
        <h3 class="form-title">
          <CalendarPlus :size="20" class="text-brand" /> Novo Serviço
        </h3>
        
        <form @submit.prevent="cadastrar" class="modern-form scrollable-form">
          <div class="form-group">
            <label>Cliente (B2B)</label>
            <select v-model="form.cliente" required class="modern-select">
              <option value="" disabled>Selecione um cliente...</option>
              <option v-for="cliente in clientes" :key="cliente._id" :value="cliente._id">
                {{ cliente.razaoSocial }} ({{ cliente.cnpj }})
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>Data do Evento</label>
              <input v-model="form.dataEvento" type="date" required />
            </div>
            <div class="form-group-col">
              <label>Qtd de Horas</label>
              <input v-model.number="form.quantidadeHoras" type="number" step="0.5" placeholder="Ex: 4" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>Tipo de Evento</label>
              <select v-model="form.tipoEvento" required class="modern-select">
                <option value="Conferência">Conferência</option>
                <option value="Social">Social</option>
                <option value="Artístico e Cultural">Artístico e Cultural</option>
                <option value="Contextos Empresariais">Contextos Empresariais</option>
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

          <div class="financeiro-module">
            <h4><DollarSign :size="16" /> Resumo Financeiro</h4>
            
            <div class="form-row">
              <div class="form-group-col">
                <label>Preço Total Cobrado (R$)</label>
                <input v-model.number="form.precoTotal" @input="calcularCaixa" type="number" step="0.01" required />
              </div>
              <div class="form-group-col">
                <label>Pago aos Intérpretes (R$)</label>
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

          <div class="form-group mt-4">
            <label>Observações</label>
            <textarea v-model="form.observacoes" placeholder="Detalhes do evento..." rows="2"></textarea>
          </div>

          <button type="submit" class="btn-primary">
            <Save :size="18" /> Lançar Serviço
          </button>
        </form>
      </div>

      <div class="list-section">
        
        <div class="glass-card search-bar">
          <div class="form-row" style="margin-bottom: 0;">
            <div class="form-group-col">
              <label class="text-xs font-bold text-gray-500">De:</label>
              <input v-model="filtros.dataInicio" type="date" @change="carregarServicos" />
            </div>
            <div class="form-group-col">
              <label class="text-xs font-bold text-gray-500">Até:</label>
              <input v-model="filtros.dataFim" type="date" @change="carregarServicos" />
            </div>
            <div class="form-group-col">
              <label class="text-xs font-bold text-gray-500">Filtrar Cliente:</label>
              <select v-model="filtros.clienteId" @change="carregarServicos" class="modern-select">
                <option value="">Todos</option>
                <option v-for="c in clientes" :key="c._id" :value="c._id">{{ c.razaoSocial }}</option>
              </select>
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
                </div>
                <div class="date-info">
                  <Calendar :size="14" /> {{ formatarData(servico.dataEvento) }}
                </div>
              </div>

              <div class="servico-body">
                <div class="interpretes-tags">
                  <Users :size="14" class="text-gray-400" />
                  <span v-for="pro in servico.interpretes" :key="pro._id" class="pro-tag">{{ pro.nome }}</span>
                  <span v-if="!servico.interpretes.length" class="text-xs text-gray-400">Nenhum intérprete vinculado</span>
                </div>
                <div class="duration-info">
                  <Clock :size="14" /> {{ servico.quantidadeHoras }} horas
                </div>
              </div>

              <div class="servico-footer">
                <div class="financial-summary">
                  <div class="fin-item"><span>Total:</span> <strong>R$ {{ servico.precoTotal.toFixed(2) }}</strong></div>
                  <div class="fin-item"><span>Intérpretes:</span> <strong class="text-orange-600">R$ {{ servico.valorInterpretes.toFixed(2) }}</strong></div>
                  <div class="fin-item"><span>Caixa Empresa:</span> <strong class="text-green-600">R$ {{ servico.caixaEmpresa.toFixed(2) }}</strong></div>
                </div>
                <button @click="remover(servico._id)" class="btn-del-mini" title="Excluir Lançamento">
                  <Trash2 :size="18" />
                </button>
              </div>
            </div>
            
            <div v-if="servicos.length === 0" class="empty-msg">
              <Inbox :size="40" class="opacity-20" />
              <p>Nenhum serviço encontrado no período.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { CalendarPlus, Calendar, Briefcase, Users, DollarSign, Clock, Trash2, Inbox, Save } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const servicos = ref([]);
const clientes = ref([]);
const profissionais = ref([]);

const filtros = ref({
  dataInicio: '',
  dataFim: '',
  clienteId: ''
});

const form = ref({
  cliente: '',
  interpretes: [],
  dataEvento: '',
  quantidadeHoras: null,
  tipoEvento: 'Conferência',
  modalidade: 'Presencial',
  precoTotal: null,
  valorLogistica: 0,
  impostos: 0,
  valorInterpretes: 0,
  caixaEmpresa: 0,
  observacoes: ''
});

// Calcula automaticamente o caixa da empresa ao digitar os valores
const calcularCaixa = () => {
  const total = form.value.precoTotal || 0;
  const logistica = form.value.valorLogistica || 0;
  const impostos = form.value.impostos || 0;
  const interpretes = form.value.valorInterpretes || 0;
  
  form.value.caixaEmpresa = total - logistica - impostos - interpretes;
};

const carregarDadosBase = async () => {
  try {
    const [resClientes, resProfissionais] = await Promise.all([
      api.get('/b2b'),
      api.get('/profissionais')
    ]);
    clientes.value = resClientes.data;
    profissionais.value = resProfissionais.data;
  } catch (error) {
    console.error("Erro ao carregar dados base", error);
  }
};

const carregarServicos = async () => {
  try {
    const res = await api.get('/servicos', { params: filtros.value });
    servicos.value = res.data;
  } catch (error) {
    console.error("Erro ao carregar serviços", error);
  }
};

const cadastrar = async () => {
  try {
    await api.post('/servicos', form.value);
    alert('Serviço lançado com sucesso!');
    
    // Resetar formulário
    form.value = {
      cliente: '', interpretes: [], dataEvento: '', quantidadeHoras: null,
      tipoEvento: 'Conferência', modalidade: 'Presencial', precoTotal: null,
      valorLogistica: 0, impostos: 0, valorInterpretes: 0, caixaEmpresa: 0, observacoes: ''
    };
    
    carregarServicos();
  } catch (error) {
    alert('Erro ao lançar serviço: ' + (error.response?.data?.message || 'Verifique os dados.'));
  }
};

const remover = async (id) => {
  if (confirm("Deseja apagar este lançamento? Isso não pode ser desfeito.")) {
    try {
      await api.delete(`/servicos/${id}`);
      carregarServicos();
    } catch (error) {
      alert("Erro ao excluir o serviço.");
    }
  }
};

const formatarData = (dataIso) => {
  if (!dataIso) return '';
  const data = new Date(dataIso);
  data.setMinutes(data.getMinutes() + data.getTimezoneOffset()); // Ajuste de fuso
  return data.toLocaleDateString('pt-BR');
};

onMounted(() => {
  carregarDadosBase();
  carregarServicos();
});
</script>

<style scoped>
.layout-split { display: grid; grid-template-columns: 400px 1fr; gap: 30px; align-items: start; }
.list-section { display: flex; flex-direction: column; gap: 20px; }
.glass-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05); }
.search-bar { padding: 20px 25px; }

.form-title { margin-bottom: 25px; color: #1e293b; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
.text-brand { color: #004aad; }
.mt-4 { margin-top: 1rem; }

/* Formulário */
.modern-form label { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; margin: 15px 0 8px; text-transform: uppercase; }
.modern-form input, .modern-form textarea, .modern-select, .search-bar input { 
  width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; 
  background: #f8fafc; font-size: 0.95rem; color: #1e293b; box-sizing: border-box; font-family: inherit;
}
.modern-form input:focus, .modern-select:focus, .search-bar input:focus { outline: none; border-color: #004aad; box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1); background: white; }

.form-row { display: flex; gap: 15px; width: 100%; align-items: flex-end; margin-bottom: 15px; }
.form-group-col { flex: 1; display: flex; flex-direction: column; }

.interpretes-box { max-height: 120px; overflow-y: auto; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; }
.interprete-label { display: flex; align-items: center; gap: 8px; padding: 6px; cursor: pointer; font-size: 0.85rem; }

.financeiro-module { background: #eff6ff; border: 1px dashed #bfdbfe; padding: 20px; border-radius: 16px; margin-top: 20px; }
.financeiro-module h4 { margin: 0 0 15px 0; color: #1e40af; font-size: 0.95rem; display: flex; align-items: center; gap: 6px; font-weight: 800; }
.financeiro-module input { background: white; border-color: #bfdbfe; padding: 10px; }
.caixa-empresa-box { margin-top: 15px; background: #dcfce7; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; color: #166534; }
.caixa-empresa-box span { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; }
.caixa-empresa-box strong { font-size: 1.2rem; }

.btn-primary { width: 100%; background: #004aad; color: white; border: none; padding: 16px; border-radius: 14px; margin-top: 25px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; }
.btn-primary:hover { background: #003a8c; transform: translateY(-2px); }

/* Listagem */
.servicos-list { display: flex; flex-direction: column; gap: 15px; }
.servico-card { border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; transition: 0.2s; }
.servico-card:hover { border-color: #bfdbfe; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }

.servico-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #e2e8f0; }
.client-info strong { font-size: 1.1rem; color: #1e293b; display: block; margin-bottom: 5px; }
.badge { font-size: 0.65rem; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; margin-right: 5px; }
.type-badge { background: #f3e8ff; color: #6d28d9; }
.mode-badge { background: #e0f2fe; color: #1d4ed8; }
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
.text-orange-600 { color: #ea580c !important; }

.btn-del-mini { background: white; border: 1px solid #e2e8f0; padding: 8px; border-radius: 10px; cursor: pointer; color: #94a3b8; transition: 0.2s; }
.btn-del-mini:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }
.empty-msg { text-align: center; padding: 40px; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 10px; }

.scrollable-form { max-height: 80vh; overflow-y: auto; padding-right: 10px; }
.scrollable-form::-webkit-scrollbar { width: 5px; }
.scrollable-form::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
/* =========================================
   RESPONSIVIDADE MOBILE PARA AS TELAS
   ========================================= */
@media (max-width: 992px) {
  /* Transforma a grelha de 2 colunas numa grelha de 1 coluna */
  .layout-split { 
    grid-template-columns: 1fr; 
    gap: 20px; 
  }
  
  /* Empilha os campos de formulário que estavam lado a lado */
  .form-row { 
    flex-direction: column; 
    gap: 15px; 
  }
  
  /* Ajusta o padding dos cartões para ecrãs pequenos */
  .glass-card { 
    padding: 20px; 
  }

  /* Ajusta cabeçalhos internos */
  .header-row, .servico-header, .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  /* Faz com que os botões de ação ocupem a largura toda se necessário */
  .item-actions-wrapper, .item-actions {
    align-items: flex-start;
    margin-top: 15px;
    width: 100%;
  }
}
</style>