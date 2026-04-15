<template>
  <MainLayout pageTitle="Painel de Controle" pageDescription="Visão geral e métricas estratégicas do sistema LibrasSystem.">
    
    <!-- BANNER DE BOAS-VINDAS -->
    <div class="welcome-banner">
      <div class="banner-text">
        <h2>Resumo da Operação</h2>
        <p>Acompanhe o crescimento dos seus alunos, cursos e contratos corporativos em tempo real.</p>
      </div>
      <div class="banner-icon-wrapper">
        <Activity :size="100" />
      </div>
    </div>

    <!-- GRID DE CARDS PRINCIPAIS -->
    <div class="stats-grid">
      
      <div class="glass-card clickable" @click="router.push('/admin/usuarios')">
        <div class="card-header">
          <span class="tag">B2C</span>
          <h3>Alunos Ativos</h3>
        </div>
        <div class="card-value">{{ stats.alunos }}</div>
        <div class="card-footer">
          <span>Gerenciar alunos</span>
          <ArrowRight :size="18" class="arrow" />
        </div>
      </div>

      <div class="glass-card clickable" @click="router.push('/admin/cursos')">
        <div class="card-header">
          <span class="tag success">CATÁLOGO</span>
          <h3>Cursos de Libras</h3>
        </div>
        <div class="card-value">{{ stats.cursos }}</div>
        <div class="card-footer">
          <span>Ver catálogo</span>
          <ArrowRight :size="18" class="arrow" />
        </div>
      </div>

      <div class="glass-card clickable" @click="router.push('/admin/b2b')">
        <div class="card-header">
          <span class="tag purple">CORPORATIVO</span>
          <h3>Parceiros Corporativos</h3>
        </div>
        <div class="card-value">{{ stats.clientesB2B || 0 }}</div>
        <div class="card-footer">
          <span>Ver contratos</span>
          <ArrowRight :size="18" class="arrow" />
        </div>
      </div>

      <div v-if="userRole === 'admin'" class="glass-card clickable" @click="router.push('/admin/financeiro')">
        <div class="card-header">
          <span class="tag gold">FINANCEIRO</span>
          <h3>Receita Mensal</h3>
        </div>
        <div class="card-value text-brand">R$ {{ formatarValor(financeiro.precoTotal) }}</div>
        <div class="card-footer">
          <span>Acessar fluxo</span>
          <ArrowRight :size="18" class="arrow" />
        </div>
      </div>

    </div>

    <!-- 🆕 SEÇÃO DE RESUMO FINANCEIRO DETALHADO -->
    <div v-if="userRole === 'admin'" class="financial-overview glass-card">
      <div class="overview-header">
        <div class="header-left">
          <h3>📊 Resumo Financeiro - {{ mesAtualExibicao }}</h3>
          <p class="header-subtitle">Acompanhamento de eventos e receitas</p>
        </div>
        <button @click="router.push('/admin/financeiro')" class="btn-ver-tudo">
          ➜ Ver Gestão Completa
        </button>
      </div>

      <!-- CARDS DE ESTATÍSTICAS FINANCEIRAS -->
      <div class="financial-stats-grid">
        <div class="financial-stat">
          <span class="stat-icon">💰</span>
          <div class="stat-content">
            <span class="stat-label">Preço Total</span>
            <span class="stat-value">R$ {{ formatarValor(financeiro.precoTotal) }}</span>
          </div>
        </div>

        <div class="financial-stat">
          <span class="stat-icon">⏱️</span>
          <div class="stat-content">
            <span class="stat-label">Total de Horas</span>
            <span class="stat-value">{{ financeiro.totalHoras }}h</span>
          </div>
        </div>

        <div class="financial-stat">
          <span class="stat-icon">🚗</span>
          <div class="stat-content">
            <span class="stat-label">Transporte</span>
            <span class="stat-value">R$ {{ formatarValor(financeiro.transporte) }}</span>
          </div>
        </div>

        <div class="financial-stat">
          <span class="stat-icon">📈</span>
          <div class="stat-content">
            <span class="stat-label">Impostos</span>
            <span class="stat-value">R$ {{ formatarValor(financeiro.impostos) }}</span>
          </div>
        </div>

        <div class="financial-stat">
          <span class="stat-icon">👥</span>
          <div class="stat-content">
            <span class="stat-label">Pago Intérpretes</span>
            <span class="stat-value">R$ {{ formatarValor(financeiro.interpretes) }}</span>
          </div>
        </div>

        <div class="financial-stat highlight">
          <span class="stat-icon">💼</span>
          <div class="stat-content">
            <span class="stat-label">Caixa Empresa</span>
            <span class="stat-value">R$ {{ formatarValor(financeiro.caixa) }}</span>
          </div>
        </div>
      </div>

      <!-- TABELA COM ÚLTIMOS EVENTOS -->
      <div class="recent-events-section">
        <div class="recent-header">
          <h4>📋 Últimos Eventos Registrados</h4>
          <button @click="abrirModalNovoEvento" class="btn-novo-evento">
            ➕ Novo Evento
          </button>
        </div>

        <div v-if="ultimosEventos.length > 0" class="events-table-wrapper">
          <table class="events-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Evento</th>
                <th>Solicitante</th>
                <th>Data</th>
                <th>Horas</th>
                <th>Intérpretes</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(evento, idx) in ultimosEventos.slice(0, 5)" :key="idx" class="event-row">
                <td>
                  <span class="badge-empresa" :style="{ background: evento.empresa === 'SINDAUTO' ? '#fbbf24' : '#60a5fa' }">
                    {{ evento.empresa }}
                  </span>
                </td>
                <td class="evento-col">{{ evento.evento }}</td>
                <td>{{ evento.solicitante }}</td>
                <td class="data-col">{{ formatarData(evento.dataInicial) }}</td>
                <td class="horas-col">{{ evento.quantidadeHoras }}h</td>
                <td class="interpretes-col">{{ evento.interpretes }}</td>
                <td class="valor-col">R$ {{ formatarValor(evento.precoTotal) }}</td>
                <td class="acoes-col">
                  <button @click="editarEvento(idx)" class="btn-acao edit" title="Editar">✏️</button>
                  <button @click="deletarEvento(idx)" class="btn-acao delete" title="Deletar">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="no-events">
          <p>📭 Nenhum evento registrado para este mês.</p>
          <button @click="abrirModalNovoEvento" class="btn-criar-primeiro">
            Criar Primeiro Evento
          </button>
        </div>
      </div>

      <!-- RESUMO FINANCEIRO RÁPIDO -->
      <div class="financial-summary-box">
        <h4>Resumo Total do Período</h4>
        <div class="summary-columns">
          <div class="summary-col">
            <span class="summary-label">Receita Bruta</span>
            <span class="summary-value">R$ {{ formatarValor(financeiro.precoTotal) }}</span>
          </div>
          <div class="summary-col">
            <span class="summary-label">Custos (Transporte + Impostos)</span>
            <span class="summary-value">R$ {{ formatarValor(financeiro.transporte + financeiro.impostos) }}</span>
          </div>
          <div class="summary-col">
            <span class="summary-label">Pagamentos (Intérpretes)</span>
            <span class="summary-value">R$ {{ formatarValor(financeiro.interpretes) }}</span>
          </div>
          <div class="summary-col total">
            <span class="summary-label">Lucro Líquido</span>
            <span class="summary-value">R$ {{ formatarValor(financeiro.caixa) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- AÇÕES RÁPIDAS -->
    <div class="quick-actions">
      <h3 class="section-title">⚡ Ações Rápidas</h3>
      <div class="actions-grid">
        <button @click="router.push('/admin/usuarios')" class="action-btn">
          <div class="icon-box icon-users"><Users :size="24" /></div>
          <span>Gerenciar Alunos</span>
        </button>
        <button @click="router.push('/admin/cursos')" class="action-btn">
          <div class="icon-box icon-courses"><BookOpen :size="24" /></div>
          <span>Gerenciar Cursos</span>
        </button>
        <button @click="router.push('/admin/b2b')" class="action-btn">
          <div class="icon-box icon-corporate"><Building2 :size="24" /></div>
          <span>Parceiros B2B</span>
        </button>
        <button @click="router.push('/admin/calculadora')" class="action-btn">
          <div class="icon-box icon-calculator"><Calculator :size="24" /></div>
          <span>Gerar Orçamento</span>
        </button>
        <button @click="router.push('/admin/profissionais')" class="action-btn">
          <div class="icon-box icon-professionals"><Users2 :size="24" /></div>
          <span>Alocar Intérprete</span>
        </button>
        <button @click="router.push('/admin/materiais')" class="action-btn">
          <div class="icon-box icon-materials"><UploadCloud :size="24" /></div>
          <span>Upload de Conteúdo</span>
        </button>
        <button v-if="userRole === 'admin'" @click="router.push('/admin/financeiro')" class="action-btn">
          <div class="icon-box icon-financial"><DollarSign :size="24" /></div>
          <span>Gestão Financeira</span>
        </button>
        <button @click="router.push('/admin/forum')" class="action-btn">
          <div class="icon-box icon-forum"><MessageSquare :size="24" /></div>
          <span>Fórum Admin</span>
        </button>
      </div>
    </div>

    <!-- MODAL DE NOVO/EDITAR EVENTO -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content glass-card">
        <div class="modal-header">
          <h3>{{ modoEdicao ? '✏️ Editar Evento' : '➕ Novo Evento' }}</h3>
          <button @click="fecharModal" class="btn-close">❌</button>
        </div>

        <form @submit.prevent="salvarEvento" class="modal-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Empresa Solicitante*</label>
              <select v-model="formulario.empresa" required>
                <option value="">Selecione...</option>
                <option value="SINDAUTO">SINDAUTO</option>
                <option value="BOTICÁRIO">BOTICÁRIO</option>
              </select>
            </div>
            <div class="form-group">
              <label>Pessoa Solicitante*</label>
              <input v-model="formulario.solicitante" type="text" required />
            </div>
            <div class="form-group">
              <label>Temática*</label>
              <input v-model="formulario.tematica" type="text" required />
            </div>
            <div class="form-group">
              <label>Evento*</label>
              <input v-model="formulario.evento" type="text" required />
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Dia Inicial*</label>
              <input v-model="formulario.dataInicial" type="date" required />
            </div>
            <div class="form-group">
              <label>Quantidade de Horas*</label>
              <input v-model.number="formulario.quantidadeHoras" type="number" step="0.5" required />
            </div>
            <div class="form-group">
              <label>Intérpretes*</label>
              <input v-model="formulario.interpretes" type="text" placeholder="Nome 1 / Nome 2" required />
            </div>
            <div class="form-group">
              <label>Preço Total*</label>
              <input v-model.number="formulario.precoTotal" type="number" step="0.01" required />
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Transporte e/ou Alimentação</label>
              <input v-model.number="formulario.transporte" type="number" step="0.01" />
            </div>
            <div class="form-group">
              <label>Impostos</label>
              <input v-model.number="formulario.impostos" type="number" step="0.01" />
            </div>
            <div class="form-group">
              <label>Pago aos Intérpretes</label>
              <input v-model.number="formulario.pagosInterpretes" type="number" step="0.01" />
            </div>
            <div class="form-group">
              <label>Caixa Empresa</label>
              <input v-model.number="formulario.caixaEmpresa" type="number" step="0.01" />
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

  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Activity, 
  ArrowRight, 
  Building2, 
  Calculator, 
  Users2,
  UploadCloud,
  DollarSign,
  MessageSquare,
  Users,
  BookOpen
} from 'lucide-vue-next'; 
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const router = useRouter();
const stats = ref({ alunos: 0, cursos: 0, clientesB2B: 0, vendas: '0.00' });

// Estado do usuário
const userRole = ref(localStorage.getItem('userRole') || 'aluno');

// Estado do Modal
const mostrarModal = ref(false);
const modoEdicao = ref(false);
const indiceEdicao = ref(null);

// Estado Financeiro
const financeiro = ref({
  precoTotal: 0,
  totalHoras: 0,
  transporte: 0,
  impostos: 0,
  interpretes: 0,
  caixa: 0
});

// Lista de Eventos
const eventos = ref([]);

// Formulário Modal
const formulario = ref({
  empresa: '',
  solicitante: '',
  email: '',
  contato: '',
  tematica: '',
  evento: '',
  tipoEvento: '',
  dataInicial: '',
  dataFinal: '',
  horaInicio: '',
  horaTermino: '',
  quantidadeHoras: 0,
  interpretes: '',
  plataforma: '',
  precoTotal: 0,
  transporte: 0,
  impostos: 0,
  pagosInterpretes: 0,
  caixaEmpresa: 0,
  mes: 'janeiro',
  ano: 2026,
  observacao: '',
  previsaoPagamento: '',
  pagoEm: '',
  outros: ''
});

// Computed Properties
const ultimosEventos = computed(() => {
  return eventos.value.sort((a, b) => {
    const dataA = new Date(a.dataInicial);
    const dataB = new Date(b.dataInicial);
    return dataB - dataA;
  });
});

const mesAtualExibicao = computed(() => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const agora = new Date();
  return `${meses[agora.getMonth()]} ${agora.getFullYear()}`;
});

// Funções Auxiliares
const formatarValor = (valor) => {
  if (typeof valor === 'string') return valor;
  return parseFloat(valor || 0).toFixed(2).replace('.', ',');
};

const formatarData = (data) => {
  if (!data) return '-';
  const d = new Date(data);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const abrirModalNovoEvento = () => {
  modoEdicao.value = false;
  formulario.value = {
    empresa: '',
    solicitante: '',
    email: '',
    contato: '',
    tematica: '',
    evento: '',
    tipoEvento: '',
    dataInicial: '',
    dataFinal: '',
    horaInicio: '',
    horaTermino: '',
    quantidadeHoras: 0,
    interpretes: '',
    plataforma: '',
    precoTotal: 0,
    transporte: 0,
    impostos: 0,
    pagosInterpretes: 0,
    caixaEmpresa: 0,
    mes: 'janeiro',
    ano: 2026,
    observacao: '',
    previsaoPagamento: '',
    pagoEm: '',
    outros: ''
  };
  mostrarModal.value = true;
};

const editarEvento = (idx) => {
  modoEdicao.value = true;
  indiceEdicao.value = idx;
  formulario.value = { ...ultimosEventos.value[idx] };
  mostrarModal.value = true;
};

const deletarEvento = async (idx) => {
  if (confirm('Tem certeza que deseja deletar este evento?')) {
    try {
      const eventoParaDeletar = ultimosEventos.value[idx];
      await api.delete(`/financeiro/${eventoParaDeletar._id}`);
      await carregarEventos();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar evento');
    }
  }
};

const fecharModal = () => {
  mostrarModal.value = false;
  modoEdicao.value = false;
  indiceEdicao.value = null;
};

const salvarEvento = async () => {
  try {
    if (modoEdicao.value && indiceEdicao.value !== null) {
      const eventoParaEditar = ultimosEventos.value[indiceEdicao.value];
      await api.put(`/financeiro/${eventoParaEditar._id}`, formulario.value);
    } else {
      await api.post('/financeiro', formulario.value);
    }
    
    await carregarEventos();
    fecharModal();
  } catch (error) {
    console.error('Erro ao salvar:', error);
    alert('Erro ao salvar evento');
  }
};

const carregarEventos = async () => {
  try {
    const agora = new Date();
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const mes = meses[agora.getMonth()];
    const ano = agora.getFullYear();

    const res = await api.get('/financeiro', {
      params: { mes, ano }
    });

    eventos.value = res.data;

    // Recalcular financeiro
    financeiro.value = {
      precoTotal: eventos.value.reduce((s, e) => s + (e.precoTotal || 0), 0),
      totalHoras: eventos.value.reduce((s, e) => s + (e.quantidadeHoras || 0), 0),
      transporte: eventos.value.reduce((s, e) => s + (e.transporte || 0), 0),
      impostos: eventos.value.reduce((s, e) => s + (e.impostos || 0), 0),
      interpretes: eventos.value.reduce((s, e) => s + (e.pagosInterpretes || 0), 0),
      caixa: eventos.value.reduce((s, e) => s + (e.caixaEmpresa || 0), 0)
    };
  } catch (error) {
    console.error('Erro ao carregar eventos:', error);
  }
};

onMounted(async () => {
  try {
    const res = await api.get('/stats');
    stats.value = res.data;
    
    // Carregar eventos financeiros
    if (userRole.value === 'admin') {
      await carregarEventos();
    }
  } catch (err) { 
    console.error("Erro ao carregar o dashboard:", err); 
  }
});
</script>

<style scoped>
* { box-sizing: border-box; }

.welcome-banner {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 24px;
  padding: 35px 45px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
}

.banner-text h2 { font-size: 1.8rem; font-weight: 800; margin-bottom: 8px; }
.banner-text p { font-size: 1rem; opacity: 0.8; max-width: 500px; line-height: 1.5; }

.banner-icon-wrapper {
  opacity: 0.08;
  position: absolute;
  right: 30px;
  transform: rotate(-10deg);
}

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 25px; margin-bottom: 40px; }

.glass-card { background: white; padding: 30px 25px; border-radius: 20px; border: 1px solid #e2e8f0; transition: all 0.3s ease; display: flex; flex-direction: column; }
.glass-card.clickable:hover { transform: translateY(-5px); border-color: #004aad; box-shadow: 0 15px 30px rgba(0, 74, 173, 0.15); cursor: pointer; }

.tag { font-size: 0.7rem; font-weight: 800; color: #64748b; letter-spacing: 1px; margin-bottom: 15px; display: inline-block; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; }
.tag.success { color: #059669; background: #ecfdf5; }
.tag.gold { color: #d97706; background: #fffbeb; }
.tag.purple { color: #7c3aed; background: #f5f3ff; }

.card-header h3 { font-size: 0.95rem; color: #64748b; font-weight: 700; margin: 0; }
.card-value { font-size: 2.5rem; font-weight: 900; color: #0f172a; margin: 10px 0; letter-spacing: -1px; }
.text-brand { color: #004aad; }

.card-footer { font-size: 0.85rem; color: #004aad; font-weight: 700; border-top: 1px solid #f1f5f9; padding-top: 15px; display: flex; align-items: center; justify-content: space-between; }
.arrow { transition: transform 0.3s ease; }
.glass-card.clickable:hover .arrow { transform: translateX(5px); }

/* SEÇÃO FINANCEIRA */
.financial-overview { padding: 30px; margin-bottom: 40px; }

.overview-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; gap: 20px; }
.header-left h3 { margin: 0 0 4px 0; font-size: 1.3rem; color: #0f172a; font-weight: 800; }
.header-subtitle { margin: 0; font-size: 0.9rem; color: #64748b; }

.btn-ver-tudo { background: #004aad; color: white; border: none; padding: 12px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; transition: 0.2s; white-space: nowrap; }
.btn-ver-tudo:hover { background: #003a8c; transform: translateY(-2px); }

.financial-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px; margin-bottom: 30px; }

.financial-stat { padding: 18px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #004aad; display: flex; align-items: center; gap: 12px; transition: 0.2s; }
.financial-stat:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08); }
.financial-stat.highlight { background: #ecfdf5; border-left-color: #10b981; }

.stat-icon { font-size: 1.8rem; }
.stat-content { display: flex; flex-direction: column; gap: 2px; }
.stat-label { font-size: 0.75rem; color: #64748b; font-weight: 600; }
.stat-value { font-size: 1.2rem; font-weight: 800; color: #0f172a; }

/* TABELA DE EVENTOS */
.recent-events-section { margin-top: 30px; padding-top: 25px; border-top: 2px solid #f1f5f9; }

.recent-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 15px; }
.recent-header h4 { margin: 0; font-size: 1.1rem; color: #0f172a; font-weight: 800; }

.btn-novo-evento { background: #059669; color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 700; transition: 0.2s; }
.btn-novo-evento:hover { background: #047857; }

.events-table-wrapper { overflow-x: auto; }
.events-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.events-table thead { background: #f8fafc; }
.events-table th { padding: 12px; text-align: left; font-weight: 700; color: #475569; border-bottom: 2px solid #e2e8f0; }
.events-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
.event-row:hover { background: #f8fafc; }

.badge-empresa { display: inline-block; padding: 4px 10px; border-radius: 6px; color: white; font-weight: 700; font-size: 0.75rem; }
.evento-col { font-weight: 600; color: #0f172a; }
.data-col, .horas-col, .interpretes-col { color: #64748b; font-size: 0.85rem; }
.valor-col { font-weight: 800; color: #059669; }

.acoes-col { text-align: center; }
.btn-acao { background: none; border: none; cursor: pointer; font-size: 1rem; padding: 6px; border-radius: 6px; transition: 0.2s; }
.btn-acao.edit:hover { background: #dbeafe; }
.btn-acao.delete:hover { background: #fee2e2; }

.no-events { padding: 40px; text-align: center; background: #f8fafc; border-radius: 12px; }
.no-events p { margin: 0 0 15px 0; color: #94a3b8; font-size: 1.1rem; }
.btn-criar-primeiro { background: #004aad; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 700; transition: 0.2s; }
.btn-criar-primeiro:hover { background: #003a8c; }

/* RESUMO FINANCEIRO */
.financial-summary-box { padding: 20px; background: linear-gradient(135deg, #e0f2fe 0%, #ecfdf5 100%); border-radius: 12px; margin-top: 25px; }
.financial-summary-box h4 { margin: 0 0 15px 0; font-size: 1rem; color: #0f172a; }

.summary-columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
.summary-col { padding: 15px; background: white; border-radius: 8px; display: flex; flex-direction: column; gap: 6px; }
.summary-col.total { background: #004aad; color: white; }

.summary-label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
.summary-col.total .summary-label { color: #dbeafe; }

.summary-value { font-size: 1.3rem; font-weight: 800; color: #0f172a; }
.summary-col.total .summary-value { color: white; }

/* AÇÕES RÁPIDAS */
.section-title { font-size: 1.2rem; color: #1e293b; font-weight: 800; margin: 40px 0 20px 0; }

.actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px; }

.action-btn { 
  background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px 15px; 
  display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; 
  transition: all 0.2s; color: #475569; font-weight: 700; font-size: 0.9rem;
}

.action-btn:hover { background: #f8fafc; border-color: #004aad; color: #004aad; transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0, 74, 173, 0.1); }

.icon-box { 
  background: #f1f5f9; color: #64748b; width: 45px; height: 45px; 
  display: flex; align-items: center; justify-content: center; border-radius: 12px; transition: 0.2s;
}

.action-btn:hover .icon-box { background: #eff6ff; color: #004aad; }

.icon-users { color: #0284c7; }
.icon-courses { color: #059669; }
.icon-corporate { color: #7c3aed; }
.icon-calculator { color: #d97706; }
.icon-professionals { color: #ec4899; }
.icon-materials { color: #8b5cf6; }
.icon-financial { color: #f59e0b; }
.icon-forum { color: #14b8a6; }

/* MODAL */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }

.modal-content { width: 100%; max-width: 700px; max-height: 85vh; overflow-y: auto; }

.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 2px solid #e2e8f0; }
.modal-header h3 { margin: 0; font-size: 1.3rem; }
.btn-close { background: none; border: none; cursor: pointer; font-size: 1.5rem; }

.modal-form { padding: 20px; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 15px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-weight: 700; font-size: 0.85rem; color: #475569; }
.form-group input, .form-group select { padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; font-family: inherit; }
.form-group input:focus, .form-group select:focus { border-color: #004aad; outline: none; box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1); }

.form-actions { display: flex; gap: 10px; margin-top: 20px; border-top: 2px solid #e2e8f0; padding-top: 20px; }
.btn-cancel, .btn-save { flex: 1; padding: 12px; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s; }
.btn-cancel { background: #f1f5f9; color: #475569; }
.btn-cancel:hover { background: #e2e8f0; }
.btn-save { background: #004aad; color: white; }
.btn-save:hover { background: #003a8c; }

@media (max-width: 768px) {
  .welcome-banner { flex-direction: column; text-align: center; padding: 25px; }
  .banner-icon-wrapper { display: none; }
  .overview-header { flex-direction: column; }
  .btn-ver-tudo { width: 100%; }
  .financial-stats-grid { grid-template-columns: repeat(2, 1fr); }
  .events-table { font-size: 0.75rem; }
  .events-table th, .events-table td { padding: 8px; }
  .summary-columns { grid-template-columns: 1fr; }
  .actions-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .financial-stats-grid { grid-template-columns: 1fr; }
  .actions-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: 1fr; }
}
</style>