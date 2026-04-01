<template>
  <MainLayout pageTitle="Controlo de Stock" pageDescription="Faça a gestão de materiais didáticos, camisas e acessórios da escola.">
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
            <input v-model="form.nome" placeholder="Ex: Camisa Polo Libras" required />
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>Tipo de Categoria</label>
              <select v-model="form.tipo" class="modern-select" required>
                <option value="Material Didático">Material Didático</option>
                <option value="Camisa">Camisa</option>
                <option value="Acessório">Acessório</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div class="form-group-col">
              <label>Tamanho (Opcional)</label>
              <input v-model="form.tamanho" placeholder="Ex: M, G, Único" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>Qtd. em Stock</label>
              <input v-model.number="form.quantidade" type="number" min="0" placeholder="0" required />
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

          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="form.observacoes" placeholder="Detalhes adicionais..." rows="2"></textarea>
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
        <div class="glass-card search-bar">
          <div class="form-row" style="margin-bottom: 0;">
            <div class="form-group-col flex-2">
              <input v-model="filtros.busca" placeholder="Pesquisar artigo pelo nome..." @input="carregar" />
            </div>
            <div class="form-group-col">
              <select v-model="filtros.tipo" @change="carregar" class="modern-select">
                <option value="">Todas as Categorias</option>
                <option value="Material Didático">Material Didático</option>
                <option value="Camisa">Camisa</option>
                <option value="Acessório">Acessório</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>
        </div>

        <div class="glass-card list-box mt-4">
          <h3 class="form-title">
            <Archive :size="20" class="text-brand" /> Inventário Atual ({{ itens.length }})
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
                <p v-if="item.observacoes" class="obs-text"><Info :size="12" /> {{ item.observacoes }}</p>
              </div>

              <div class="card-footer">
                <div class="stock-control">
                  <button @click="alterarQuantidade(item, -1)" class="btn-qty"><Minus :size="14" /></button>
                  <span class="qty-display" :class="{'low-stock': item.quantidade < 5}">{{ item.quantidade }} un</span>
                  <button @click="alterarQuantidade(item, 1)" class="btn-qty"><Plus :size="14" /></button>
                </div>
                
                <div class="action-buttons">
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
              <p>Nenhum material encontrado no stock.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { PackagePlus, Archive, Save, Edit2, Trash2, Inbox, Info, Plus, Minus, X } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const itens = ref([]);
const editandoId = ref(null);

const formPadrao = {
  nome: '', tipo: 'Material Didático', quantidade: 0, 
  precoCusto: null, precoVenda: null, tamanho: '', observacoes: ''
};
const form = ref({ ...formPadrao });
const filtros = ref({ busca: '', tipo: '' });

const carregar = async () => {
  try {
    const res = await api.get('/estoque', { params: filtros.value });
    itens.value = res.data;
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

const alterarQuantidade = async (item, valor) => {
  const novaQuantidade = item.quantidade + valor;
  if (novaQuantidade < 0) return;
  
  try {
    // Atualização rápida apenas da quantidade
    await api.put(`/estoque/${item._id}`, { quantidade: novaQuantidade });
    item.quantidade = novaQuantidade;
  } catch (error) {
    alert("Erro ao atualizar a quantidade.");
  }
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

onMounted(carregar);
</script>

<style scoped>
.layout-split { display: grid; grid-template-columns: 380px 1fr; gap: 30px; align-items: start; }
.list-section { display: flex; flex-direction: column; gap: 20px; }
.glass-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05); }
.search-bar { padding: 20px 25px; }

.form-title { margin-bottom: 25px; color: #1e293b; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
.text-brand { color: #004aad; }
.mt-4 { margin-top: 1rem; }
.flex-2 { flex: 2; }

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
.obs-text { font-size: 0.8rem; color: #64748b; display: flex; align-items: flex-start; gap: 6px; background: #f8fafc; padding: 8px; border-radius: 8px; margin: 0; }

.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 15px; border-top: 1px solid #f1f5f9; }
.stock-control { display: flex; align-items: center; gap: 10px; background: #f8fafc; padding: 6px; border-radius: 10px; }
.btn-qty { background: white; border: 1px solid #e2e8f0; border-radius: 6px; width: 28px; height: 28px; display: flex; justify-content: center; align-items: center; cursor: pointer; color: #64748b; }
.btn-qty:hover { color: #004aad; border-color: #bfdbfe; }
.qty-display { font-weight: 800; font-size: 0.95rem; color: #1e293b; min-width: 40px; text-align: center; }
.low-stock { color: #ea580c; }

.action-buttons { display: flex; gap: 8px; }
.btn-del-mini, .btn-edit-mini { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 10px; cursor: pointer; transition: 0.2s; }
.btn-del-mini { color: #94a3b8; }
.btn-del-mini:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }
.btn-edit-mini { color: #004aad; }
.btn-edit-mini:hover { background: #eff6ff; border-color: #bfdbfe; }

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