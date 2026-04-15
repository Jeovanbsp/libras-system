<template>
  <MainLayout pageTitle="Gestão Financeira de Serviços" pageDescription="Controle completo de eventos, intérpretes e caixa da empresa.">
    
    <div class="financeiro-container">
      
      <!-- 🔍 SEÇÃO DE FILTROS -->
      <div class="filters-section glass-card mb-6">
        <h3 class="filters-title">🔍 Filtros</h3>
        <div class="filters-grid">
          <div class="filter-group">
            <label>📅 Mês</label>
            <select v-model="filtroMes" @change="aplicarFiltros">
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
            <label>📆 Ano</label>
            <input v-model.number="filtroAno" type="number" placeholder="2026" @change="aplicarFiltros" />
          </div>
          
          <div class="filter-group">
            <label>🏢 Empresa</label>
            <select v-model="filtroEmpresa" @change="aplicarFiltros">
              <option value="">Todas as empresas</option>
              <option value="SINDAUTO">SINDAUTO</option>
              <option value="BOTICÁRIO">BOTICÁRIO</option>
            </select>
          </div>

          <div class="filter-actions">
            <button @click="resetarFiltros" class="btn-reset">
              🔄 Limpar
            </button>
            <button @click="abrirModalNovoEvento" class="btn-add">
              ��� Novo Evento
            </button>
          </div>
        </div>
      </div>

      <!-- 📊 CARDS DE RESUMO -->
      <div class="summary-cards-grid">
        <div class="summary-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <span class="card-icon">💰</span>
          <span class="card-label">Preço Total</span>
          <span class="card-value">R$ {{ formatarValor(somaPrecoTotal) }}</span>
        </div>

        <div class="summary-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <span class="card-icon">⏱️</span>
          <span class="card-label">Horas Total</span>
          <span class="card-value">{{ somaHoras }}h</span>
        </div>

        <div class="summary-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <span class="card-icon">🚗</span>
          <span class="card-label">Transporte/Alimentação</span>
          <span class="card-value">R$ {{ formatarValor(somaTransporte) }}</span>
        </div>

        <div class="summary-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
          <span class="card-icon">📊</span>
          <span class="card-label">Impostos</span>
          <span class="card-value">R$ {{ formatarValor(somaImpostos) }}</span>
        </div>

        <div class="summary-card" style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);">
          <span class="card-icon">👥</span>
          <span class="card-label">Pago aos Intérpretes</span>
          <span class="card-value">R$ {{ formatarValor(somaInterpretes) }}</span>
        </div>

        <div class="summary-card" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
          <span class="card-icon">💼</span>
          <span class="card-label">Caixa Empresa</span>
          <span class="card-value">R$ {{ formatarValor(somaCaixa) }}</span>
        </div>
      </div>

      <!-- 📋 TABELA PRINCIPAL DE EVENTOS -->
      <div class="table-section glass-card mt-6">
        <h3 class="table-title">📋 Eventos e Serviços</h3>
        
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
                <td class="acoes">
                  <button @click="editarEvento(evento._id)" class="btn-edit" title="Editar">✏️</button>
                  <button @click="deletarEvento(evento._id)" class="btn-delete" title="Deletar">🗑️</button>
                </td>
              </tr>
              <tr v-if="eventosFiltrados.length === 0" class="no-data">
                <td colspan="15" style="text-align: center; padding: 40px; color: #94a3b8;">
                  📭 Nenhum evento encontrado para os filtros selecionados
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 💰 RESUMO FINANCEIRO DETALHADO -->
      <div class="financial-summary glass-card mt-6">
        <h3 class="summary-title">💰 Resumo Financeiro - {{ mesAnoSelecionado }}</h3>
        
        <div class="summary-details-grid">
          <div class="detail-item">
            <span class="detail-label">Preço total:</span>
            <span class="detail-value">R$ {{ formatarValor(somaPrecoTotal) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Total de Horas:</span>
            <span class="detail-value">{{ somaHoras }}h</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Transporte total:</span>
            <span class="detail-value">R$ {{ formatarValor(somaTransporte) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Impostos:</span>
            <span class="detail-value">R$ {{ formatarValor(somaImpostos) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Pago aos Intérpretes:</span>
            <span class="detail-value">R$ {{ formatarValor(somaInterpretes) }}</span>
          </div>
          <div class="detail-item highlight">
            <span class="detail-label">Caixa empresa:</span>
            <span class="detail-value">R$ {{ formatarValor(somaCaixa) }}</span>
          </div>
        </div>
      </div>

      <!-- 💳 SEÇÃO DE PAGAMENTO -->
      <div class="payment-section glass-card mt-6">
        <h3 class="payment-title">💳 PAGAMENTO - {{ mesAnoSelecionado.toUpperCase() }}</h3>
        <div class="payment-grid">
          <div class="payment-item">
            <span>Preço total:</span>
            <span class="value">R$ {{ formatarValor(somaPrecoTotal) }}</span>
          </div>
          <div class="payment-item">
            <span>Horas Total:</span>
            <span class="value">{{ somaHoras }}h</span>
          </div>
          <div class="payment-item">
            <span>Transporte total:</span>
            <span class="value">R$ {{ formatarValor(somaTransporte) }}</span>
          </div>
          <div class="payment-item">
            <span>Impostos:</span>
            <span class="value">R$ {{ formatarValor(somaImpostos) }}</span>
          </div>
          <div class="payment-item">
            <span>Intérpretes:</span>
            <span class="value">R$ {{ formatarValor(somaInterpretes) }}</span>
          </div>
          <div class="payment-item total">
            <span>Caixa empresa:</span>
            <span class="value">R$ {{ formatarValor(somaCaixa) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ➕ MODAL DE NOVO/EDITAR EVENTO -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content glass-card">
        <div class="modal-header">
          <h3>{{ modoEdicao ? '✏️ Editar Evento' : '➕ Novo Evento' }}</h3>
          <button @click="fecharModal" class="btn-close">❌</button>
        </div>

        <form @submit.prevent="salvarEvento" class="modal-form">
          
          <!-- Seção 1: Informações da Empresa -->
          <div class="form-section">
            <h4 class="section-title">Informações da Empresa Solicitante</h4>
            <div class="form-grid">
              <div class="form-group">
                <label>Empresa solicitante*</label>
                <select v-model="formulario.empresa" required>
                  <option value="">Selecione...</option>
                  <option value="SINDAUTO">SINDAUTO</option>
                  <option value="BOTICÁRIO">BOTICÁRIO</option>
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

          <!-- Seção 2: Informações do Evento -->
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

          <!-- Seção 3: Datas e Horas -->
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

          <!-- Seção 4: Valores Financeiros -->
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

          <!-- Seção 5: Complementos -->
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
          </div>

          <!-- Botões de Ação -->
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
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

// ==========================================
// ESTADO DOS DADOS
// ==========================================
const eventos = ref([]);

const filtroMes = ref('');
const filtroAno = ref(new Date().getFullYear());
const filtroEmpresa = ref('');

const mostrarModal = ref(false);
const modoEdicao = ref(false);
const idEdicao = ref(null);

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
  ano: new Date().getFullYear(),
  observacao: '',
  previsaoPagamento: '',
  pagoEm: '',
  outros: ''
});

// ==========================================
// COMPUTED PROPERTIES
// ==========================================
const eventosFiltrados = computed(() => {
  return eventos.value.filter(evento => {
    const meshMatch = filtroMes.value === '' || evento.mes === filtroMes.value;
    const anoMatch = filtroAno.value === '' || evento.ano == filtroAno.value;
    const empresaMatch = filtroEmpresa.value === '' || evento.empresa === filtroEmpresa.value;
    return meshMatch && anoMatch && empresaMatch;
  });
});

const somaPrecoTotal = computed(() => {
  return eventosFiltrados.value.reduce((sum, e) => sum + (e.precoTotal || 0), 0);
});

const somaHoras = computed(() => {
  return eventosFiltrados.value.reduce((sum, e) => sum + (e.quantidadeHoras || 0), 0);
});

const somaTransporte = computed(() => {
  return eventosFiltrados.value.reduce((sum, e) => sum + (e.transporte || 0), 0);
});

const somaImpostos = computed(() => {
  return eventosFiltrados.value.reduce((sum, e) => sum + (e.impostos || 0), 0);
});

const somaInterpretes = computed(() => {
  return eventosFiltrados.value.reduce((sum, e) => sum + (e.pagosInterpretes || 0), 0);
});

const somaCaixa = computed(() => {
  return eventosFiltrados.value.reduce((sum, e) => sum + (e.caixaEmpresa || 0), 0);
});

const mesAnoSelecionado = computed(() => {
  const meses = {
    'janeiro': 'Janeiro',
    'fevereiro': 'Fevereiro',
    'março': 'Março',
    'abril': 'Abril',
    'maio': 'Maio',
    'junho': 'Junho',
    'julho': 'Julho',
    'agosto': 'Agosto',
    'setembro': 'Setembro',
    'outubro': 'Outubro',
    'novembro': 'Novembro',
    'dezembro': 'Dezembro'
  };
  const mesTexto = filtroMes.value ? meses[filtroMes.value] : 'Todos os meses';
  const anoTexto = filtroAno.value || 'Todos os anos';
  return `${mesTexto} ${anoTexto}`;
});

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================
const formatarValor = (valor) => {
  return parseFloat(valor || 0).toFixed(2).replace('.', ',');
};

const formatarData = (data) => {
  if (!data) return '-';
  const d = new Date(data);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const aplicarFiltros = () => {
  // Função para aplicar filtros (já feito no computed)
};

const resetarFiltros = () => {
  filtroMes.value = '';
  filtroAno.value = new Date().getFullYear();
  filtroEmpresa.value = '';
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
    ano: new Date().getFullYear(),
    observacao: '',
    previsaoPagamento: '',
    pagoEm: '',
    outros: ''
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
    alert('Erro ao salvar evento: ' + error.response?.data?.error || error.message);
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
    alert('Erro ao carregar eventos');
  }
};

onMounted(async () => {
  await carregarEventos();
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.financeiro-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0;
}

.mb-6 {
  margin-bottom: 24px;
}

.mt-6 {
  margin-top: 24px;
}

.glass-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

/* ==========================================
   FILTROS
   ========================================== */
.filters-section {
  margin-bottom: 24px;
}

.filters-title {
  margin: 0 0 20px 0;
  font-size: 1.1rem;
  color: #0f172a;
  font-weight: 800;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-weight: 700;
  color: #475569;
  font-size: 0.85rem;
}

.filter-group select,
.filter-group input {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
}

.filter-group select:focus,
.filter-group input:focus {
  border-color: #004aad;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1);
}

.filter-actions {
  display: flex;
  gap: 10px;
  flex-direction: column;
  justify-content: flex-end;
}

.btn-reset,
.btn-add {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  transition: 0.2s;
}

.btn-reset {
  background: #f1f5f9;
  color: #475569;
}

.btn-reset:hover {
  background: #e2e8f0;
}

.btn-add {
  background: #059669;
  color: white;
}

.btn-add:hover {
  background: #047857;
}

/* ==========================================
   SUMMARY CARDS
   ========================================== */
.summary-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
}

.summary-card {
  padding: 20px;
  border-radius: 12px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-icon {
  font-size: 2rem;
}

.card-label {
  font-size: 0.8rem;
  opacity: 0.9;
  font-weight: 600;
}

.card-value {
  font-size: 1.4rem;
  font-weight: 800;
}

/* ==========================================
   TABELA
   ========================================== */
.table-section {
  margin-top: 24px;
}

.table-title {
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  color: #0f172a;
  font-weight: 800;
}

.table-responsive {
  overflow-x: auto;
}

.main-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.header-row {
  background: linear-gradient(90deg, #1e3a8a 0%, #1e40af 100%);
}

.header-row th {
  padding: 12px;
  text-align: left;
  color: white;
  font-weight: 700;
}

.data-row {
  border-bottom: 1px solid #e2e8f0;
}

.data-row:hover {
  background: #f8fafc;
}

.data-row td {
  padding: 12px;
}

.numero {
  text-align: center;
}

.email {
  font-size: 0.75rem;
  color: #64748b;
}

.evento {
  font-weight: 600;
}

.interpretes {
  font-size: 0.85rem;
}

.valor {
  text-align: right;
  font-weight: 600;
}

.caixa {
  color: #059669;
  font-weight: 800;
}

.data {
  font-size: 0.85rem;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  color: white;
  font-weight: 700;
  font-size: 0.75rem;
}

.no-data td {
  padding: 40px 12px;
}

.acoes {
  text-align: center;
}

.btn-edit,
.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 6px;
  border-radius: 6px;
  transition: 0.2s;
}

.btn-edit:hover {
  background: #dbeafe;
}

.btn-delete:hover {
  background: #fee2e2;
}

/* ==========================================
   RESUMO FINANCEIRO
   ========================================== */
.financial-summary {
  margin-top: 24px;
}

.summary-title {
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  color: #0f172a;
  font-weight: 800;
}

.summary-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.detail-item {
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  border-left: 4px solid #004aad;
}

.detail-item.highlight {
  background: #ecfdf5;
  border-left-color: #10b981;
}

.detail-label {
  font-weight: 700;
  color: #475569;
}

.detail-value {
  color: #0f172a;
  font-weight: 800;
}

/* ==========================================
   PAGAMENTO
   ========================================== */
.payment-section {
  margin-top: 24px;
}

.payment-title {
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  color: #0f172a;
  font-weight: 800;
}

.payment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.payment-item {
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payment-item.total {
  background: #e0f2fe;
  border-left: 4px solid #0369a1;
  font-weight: 800;
}

.value {
  color: #0f172a;
  font-weight: 800;
}

/* ==========================================
   MODAL
   ========================================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 850px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
}

.modal-form {
  padding: 20px;
}

.form-section {
  margin-bottom: 25px;
}

.section-title {
  margin: 0 0 15px 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: #004aad;
  text-transform: uppercase;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 700;
  font-size: 0.85rem;
  color: #475569;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #004aad;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1);
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 25px;
  border-top: 2px solid #e2e8f0;
  padding-top: 20px;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-save {
  background: #004aad;
  color: white;
}

.btn-save:hover {
  background: #003a8c;
}

/* ==========================================
   RESPONSIVO - TABLET
   ========================================== */
@media (max-width: 1024px) {
  .financeiro-container {
    padding: 0 10px;
  }

  .main-table {
    font-size: 0.75rem;
  }

  .main-table th,
  .main-table td {
    padding: 8px;
  }

  .summary-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-details-grid,
  .payment-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    max-width: 90%;
  }
}

/* ==========================================
   RESPONSIVO - MOBILE
   ========================================== */
@media (max-width: 768px) {
  .glass-card {
    padding: 16px;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    flex-direction: row;
    gap: 10px;
  }

  .btn-reset,
  .btn-add {
    flex: 1;
  }

  .summary-cards-grid {
    grid-template-columns: 1fr;
  }

  .main-table {
    font-size: 0.7rem;
  }

  .main-table th,
  .main-table td {
    padding: 6px;
  }

  .summary-details-grid,
  .payment-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    max-width: 95%;
    max-height: 95vh;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* ==========================================
   RESPONSIVO - MOBILE PEQUENO
   ========================================== */
@media (max-width: 480px) {
  .financeiro-container {
    padding: 0 5px;
  }

  .glass-card {
    padding: 12px;
    border-radius: 12px;
  }

  .filters-title,
  .table-title,
  .summary-title,
  .payment-title {
    font-size: 1rem;
  }

  .summary-cards-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .summary-card {
    padding: 15px;
  }

  .card-value {
    font-size: 1.2rem;
  }

  .table-responsive {
    overflow-x: scroll;
  }

  .main-table {
    font-size: 0.65rem;
    min-width: 600px;
  }

  .main-table th,
  .main-table td {
    padding: 4px;
  }

  .modal-content {
    max-width: 98%;
    max-height: 98vh;
  }

  .modal-header h3 {
    font-size: 1.1rem;
  }

  .form-section {
    margin-bottom: 15px;
  }

  .section-title {
    font-size: 0.85rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .form-group {
    gap: 4px;
  }

  .form-group label {
    font-size: 0.75rem;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 8px;
    font-size: 0.85rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 8px;
    margin-top: 15px;
    padding-top: 15px;
  }

  .btn-cancel,
  .btn-save {
    padding: 10px;
    font-size: 0.9rem;
  }
}
</style>