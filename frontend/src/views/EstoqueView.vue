<template>
  <MainLayout pageTitle="Controlo de Stock" pageDescription="Faça a gestão de materiais, vendas e histórico de receitas.">
    <div class="layout-split">
      
      <div class="glass-card side-form">
        <h3 class="form-title">
          <PackagePlus v-if="!editandoId" :size="20" class="text-brand" />
          <Edit2 v-else :size="20" class="text-brand" />
          {{ editandoId ? 'Editar Artigo' : 'Novo Artigo' }}
        </h3>
        
        <form @submit.prevent="salvar" class="modern-form scrollable-form">
          <div class="form-group">
            <label>Nome do Artigo</label>
            <input v-model="form.nome" placeholder="Ex: Apostila Libras Básico" required />
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>Categoria</label>
              <select v-model="form.tipo" class="modern-select" required>
                <option value="Material Didático">Material Didático</option>
                <option value="Camisa">Camisa</option>
                <option value="Acessório">Acessório</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div class="form-group-col">
              <label>Tamanho (Opccional)</label>
              <input v-model="form.tamanho" placeholder="Ex: M, G, Único" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>Qtd. Inicial (Stock)</label>
              <input v-model.number="form.quantidade" type="number" min="0" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>Preço de Custo (R$)</label>
              <input v-model.number="form.precoCusto" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div class="form-group-col">
              <label>Preço de Venda (R$)</label>
              <input v-model.number="form.precoVenda" type="number" step="0.01" placeholder="0.00" />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary">
              <Save :size="18" /> {{ editandoId ? 'Atualizar Artigo' : 'Adicionar ao Stock' }}
            </button>
            <button v-if="editandoId" @click="cancelarEdicao" type="button" class="btn-cancel">
              <X :size="18" /> Cancelar
            </button>
          </div>
        </form>
      </div>

      <div class="list-section">
        
        <div class="revenue-card glass-card">
          <div class="revenue-info">
            <span class="revenue-label">Receita de Vendas (No período filtrado)</span>
            <strong class="revenue-value">R$ {{ receitaTotal.toFixed(2).replace('.', ',') }}</strong>
          </div>
          <div class="revenue-icon">
            <BadgeDollarSign :size="36" />
          </div>
        </div>

        <div class="glass-card search-bar mt-4">
          <div class="form-row" style="margin-bottom: 0;">
            <div class="form-group-col flex-2">
              <label class="filter-label">Buscar Produto:</label>
              <input v-model="filtros.busca" placeholder="Pesquisar..." @input="carregar" />
            </div>
            <div class="form-group-col">
              <label class="filter-label">Data Início:</label>
              <input v-model="filtros.dataInicio" type="date" @change="carregar" />
            </div>
            <div class="form-group-col">
              <label class="filter-label">Data Fim:</label>
              <input v-model="filtros.dataFim" type="date" @change="carregar" />
            </div>
          </div>
        </div>

        <div class="glass-card list-box mt-4">
          <h3 class="form-title">
            <Archive :size="20" class="text-brand" /> Inventário Atual
          </h3>
          
          <div class="inventory-grid">
            <div v-for="item in itens" :key="item._id" class="inventory-card">
              <div class="card-header">
                <span class="type-badge">{{ item.tipo }}</span>
                <span v-if="item.tamanho" class="size-badge">Tam: {{ item.tamanho }}</span>
              </div>
              
              <div class="card-body">
                <h4>{{ item.nome }}</h4>
                <div class="financials">
                  <span class="cost">Custo: R$ {{ (item.precoCusto || 0).toFixed(2) }}</span>
                  <span class="sale">Venda: R$ {{ (item.precoVenda || 0).toFixed(2) }}</span>
                </div>
                <div class="sales-stats" v-if="item.qtdVendidaNoPeriodo > 0">
                   Vendido: <strong>{{ item.qtdVendidaNoPeriodo }} un</strong> | 
                   Receita: <strong>R$ {{ item.receitaNoPeriodo.toFixed(2) }}</strong>
                </div>
              </div>

              <div class="card-footer">
                <div class="stock-info">
                  <span class="stock-label">Stock:</span>
                  <strong :class="{'low-stock': item.quantidade < 5}">{{ item.quantidade }} un</strong>
                </div>
                
                <div class="action-buttons">
                  <button @click="abrirModalVenda(item)" class="btn-sell" title="Registar Venda">
                    <ShoppingCart :size="16" /> Vender
                  </button>
                  <button @click="prepararEdicao(item)" class="btn-edit-mini" title="Editar Artigo">
                    <Edit2 :size="16" />
                  </button>
                  <button @click="remover(item._id)" class="btn-del-mini" title="Excluir Artigo">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </div>
            </div>

            <div v-if="itens.length === 0" class="empty-msg" style="grid-column: 1 / -1;">
              <Inbox :size="40" class="opacity-20" />
              <p>Nenhum material encontrado.</p>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div v-if="mostrarModalVenda" class="modal-overlay" @click.self="fecharModalVenda">
      <div class="glass-card modal-content">
        <div class="modal-header">
          <h3>Registar Venda</h3>
          <button @click="fecharModalVenda" class="btn-icon-close"><X :size="20" /></button>
        </div>
        <div class="modal-body">
          <p class="mb-4">Produto: <strong>{{ itemParaVender?.nome }}</strong></p>
          <p class="mb-4 text-sm text-gray-500">Stock atual: {{ itemParaVender?.quantidade }} unidades</p>
          
          <div class="form-group">
            <label class="modal-label">Quantidade a Vender</label>
            <input v-model.number="quantidadeVenda" type="number" min="1" :max="itemParaVender?.quantidade" class="modal-input" required />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="confirmarVenda" class="btn-primary" :disabled="quantidadeVenda < 1 || quantidadeVenda > itemParaVender?.quantidade">
            Confirmar Venda
          </button>
        </div>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { PackagePlus, Archive, Save, Edit2, Trash2, Inbox, Info, X, ShoppingCart, BadgeDollarSign } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const itens = ref([]);
const receitaTotal = ref(0); // Guarda a receita total do período
const editandoId = ref(null);

// Estados do Modal de Venda
const mostrarModalVenda = ref(false);
const itemParaVender = ref(null);
const quantidadeVenda = ref(1);

const formPadrao = {
  nome: '', tipo: 'Material Didático', quantidade: 0, 
  precoCusto: null, precoVenda: null, tamanho: '', observacoes: ''
};
const form = ref({ ...formPadrao });
const filtros = ref({ busca: '', tipo: '', dataInicio: '', dataFim: '' });

const carregar = async () => {
  try {
    const res = await api.get('/estoque', { params: filtros.value });
    itens.value = res.data.itens;
    receitaTotal.value = res.data.receitaTotal;
  } catch (error) {
    console.error("Erro ao carregar o stock:", error);
  }
};

const salvar = async () => {
  try {
    if (editandoId.value) {
      await api.put(`/estoque/${editandoId.value}`, form.value);
    } else {
      await api.post('/estoque', form.value);
    }
    cancelarEdicao();
    carregar();
  } catch (error) {
    alert("Erro ao salvar artigo no stock.");
  }
};

const prepararEdicao = (item) => {
  editandoId.value = item._id;
  form.value = { ...item };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelarEdicao = () => {
  editandoId.value = null;
  form.value = { ...formPadrao };
};

const remover = async (id) => {
  if (confirm("Deseja realmente remover este artigo do stock?")) {
    try {
      await api.delete(`/estoque/${id}`);
      carregar();
    } catch (error) {
      alert("Erro ao excluir artigo.");
    }
  }
};

// LÓGICA DE VENDA
const abrirModalVenda = (item) => {
  itemParaVender.value = item;
  quantidadeVenda.value = 1;
  mostrarModalVenda.value = true;
};

const fecharModalVenda = () => {
  mostrarModalVenda.value = false;
  itemParaVender.value = null;
};

const confirmarVenda = async () => {
  if (quantidadeVenda.value < 1 || quantidadeVenda.value > itemParaVender.value.quantidade) {
    return alert("Quantidade inválida.");
  }
  
  try {
    await api.post(`/estoque/${itemParaVender.value._id}/vender`, {
      quantidade: quantidadeVenda.value
    });
    alert("Venda registada com sucesso!");
    fecharModalVenda();
    carregar(); // Recarrega para atualizar o stock e a receita
  } catch (error) {
    alert(error.response?.data?.message || "Erro ao registar venda.");
  }
};

onMounted(carregar);
</script>

<style scoped>
.layout-split { display: grid; grid-template-columns: 380px 1fr; gap: 30px; align-items: start; }
.list-section { display: flex; flex-direction: column; gap: 15px; }
.glass-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05); }
.search-bar { padding: 20px 25px; }

.form-title { margin-bottom: 25px; color: #1e293b; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
.text-brand { color: #004aad; }
.mt-4 { margin-top: 1rem; }
.flex-2 { flex: 2; }
.filter-label { font-size: 0.7rem; font-weight: 700; color: #64748b; margin-bottom: 5px; display: block; text-transform: uppercase; }

/* Cartão de Receita (NOVO) */
.revenue-card { display: flex; justify-content: space-between; align-items: center; padding: 25px 30px; background: #ecfdf5; border-color: #a7f3d0; }
.revenue-label { display: block; font-size: 0.85rem; font-weight: 800; color: #065f46; text-transform: uppercase; margin-bottom: 5px; }
.revenue-value { font-size: 2.2rem; font-weight: 900; color: #059669; }
.revenue-icon { background: #d1fae5; color: #059669; padding: 15px; border-radius: 16px; }

/* Formulário */
.modern-form label { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; margin: 15px 0 8px; text-transform: uppercase; }
.modern-form input, .modern-form textarea, .modern-select, .search-bar input { 
  width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; 
  background: #f8fafc; font-size: 0.95rem; color: #1e293b; box-sizing: border-box; font-family: inherit;
}
.modern-form input:focus, .modern-select:focus, .search-bar input:focus { outline: none; border-color: #004aad; box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1); background: white; }

.form-row { display: flex; gap: 15px; width: 100%; align-items: flex-end; margin-bottom: 15px; }
.form-group-col { flex: 1; display: flex; flex-direction: column; }

.form-actions { display: flex; gap: 10px; margin-top: 25px; }
.btn-primary { flex: 2; background: #004aad; color: white; border: none; padding: 16px; border-radius: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; }
.btn-primary:hover { background: #003a8c; transform: translateY(-2px); }
.btn-primary:disabled { background: #94a3b8; cursor: not-allowed; transform: none; }
.btn-cancel { flex: 1; background: #f1f5f9; color: #64748b; border: none; padding: 16px; border-radius: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; }
.btn-cancel:hover { background: #e2e8f0; color: #0f172a; }

/* Grid de Inventário */
.inventory-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.inventory-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; transition: 0.2s; }
.inventory-card:hover { border-color: #bfdbfe; box-shadow: 0 5px 15px rgba(0,74,173,0.05); transform: translateY(-3px); }

.card-header { display: flex; justify-content: space-between; margin-bottom: 15px; }
.type-badge { background: #eff6ff; color: #004aad; font-size: 0.7rem; font-weight: 800; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; }
.size-badge { background: #f1f5f9; color: #475569; font-size: 0.7rem; font-weight: 800; padding: 4px 10px; border-radius: 8px; }

.card-body h4 { margin: 0 0 10px 0; font-size: 1.1rem; color: #1e293b; }
.financials { display: flex; gap: 15px; font-size: 0.85rem; margin-bottom: 12px; }
.cost { color: #dc2626; font-weight: 600; }
.sale { color: #16a34a; font-weight: 600; }
.sales-stats { background: #f0fdf4; color: #065f46; font-size: 0.8rem; padding: 6px 10px; border-radius: 6px; margin-bottom: 10px; }

.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 15px; border-top: 1px solid #f1f5f9; }
.stock-info { display: flex; align-items: center; gap: 8px; }
.stock-label { font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase;}
.stock-info strong { font-size: 1.1rem; color: #1e293b; }
.low-stock { color: #ea580c !important; }

.action-buttons { display: flex; gap: 6px; }
.btn-sell { background: #10b981; color: white; border: none; padding: 8px 12px; border-radius: 10px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 5px; font-weight: 700; font-size: 0.8rem;}
.btn-sell:hover { background: #059669; }
.btn-del-mini, .btn-edit-mini { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 10px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
.btn-del-mini { color: #94a3b8; }
.btn-del-mini:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }
.btn-edit-mini { color: #004aad; }
.btn-edit-mini:hover { background: #eff6ff; border-color: #bfdbfe; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
.modal-content { max-width: 400px; width: 90%; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 8px; }
.modal-input { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; font-size: 1.1rem; font-weight: bold; color: #1e293b; }
.modal-footer { margin-top: 25px; }
.btn-icon-close { background: none; border: none; cursor: pointer; color: #64748b; transition: 0.2s; }
.btn-icon-close:hover { color: #ef4444; transform: scale(1.1); }
.text-sm { font-size: 0.85rem; }
.mb-4 { margin-bottom: 1rem; }

/* Responsividade */
@media (max-width: 992px) {
  .layout-split { grid-template-columns: 1fr; gap: 20px; }
  .form-row { flex-direction: column; gap: 15px; }
  .glass-card { padding: 20px; }
  .revenue-card { flex-direction: column; text-align: center; gap: 15px; }
}
</style>