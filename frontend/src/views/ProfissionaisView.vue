<template>
  <MainLayout pageTitle="Gestão de Profissionais" pageDescription="Gerencie intérpretes e professores cadastrados no sistema.">
    <div class="layout-split">
      
      <div class="glass-card side-form">
        <h3 class="form-title">
          <span class="icon-badge">🤟</span> Novo Profissional
        </h3>
        <form @submit.prevent="cadastrar" class="modern-form">
          <div class="form-group">
            <label>Nome Completo</label>
            <input v-model="form.nome" placeholder="Ex: João da Silva" required />
          </div>

          <div class="form-group">
            <label>E-mail de Contato</label>
            <input v-model="form.email" type="email" placeholder="joao@email.com" required />
          </div>

          <div class="form-group">
            <label>Valor da Hora (R$)</label>
            <input v-model.number="form.valorHora" type="number" step="0.01" placeholder="0.00" required />
          </div>

          <div class="form-group">
            <label>Especialidades de Atuação</label>
            <div class="checkbox-grid">
              <label v-for="esp in listaEspecialidades" :key="esp" class="checkbox-label">
                <input type="checkbox" :value="esp" v-model="form.especialidades" />
                {{ esp }}
              </label>
            </div>
          </div>

          <button type="submit" class="btn-primary">Cadastrar Especialista</button>
        </form>
      </div>

      <div class="glass-card list-box">
        <h3 class="form-title">
          <span class="icon-badge">📋</span> Especialistas Cadastrados
        </h3>
        <div class="pro-list">
          <div v-for="pro in profissionais" :key="pro._id" class="pro-item">
            <div class="item-main">
              <strong>{{ pro.nome }}</strong>
              <span class="item-email">{{ pro.email }}</span>
              <div class="tags-container">
                <span v-for="esp in pro.especialidades" :key="esp" class="tag-badge">
                  {{ esp }}
                </span>
              </div>
            </div>
            <div class="item-actions">
              <span class="price-tag">R$ {{ pro.valorHora.toFixed(2) }}/h</span>
              <button @click="remover(pro._id)" class="btn-del-mini" title="Excluir">🗑️</button>
            </div>
          </div>
          
          <div v-if="profissionais.length === 0" class="empty-msg">
            Nenhum profissional cadastrado.
          </div>
        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const profissionais = ref([]);
const listaEspecialidades = ['Jurídico', 'Saúde', 'Eventos', 'Educação', 'Corporativo', 'Audiovisual'];
const form = ref({
  nome: '',
  email: '',
  valorHora: null,
  especialidades: []
});

const carregar = async () => {
  try {
    const res = await api.get('/profissionais');
    profissionais.value = res.data;
  } catch (error) {
    console.error("Erro ao carregar profissionais:", error);
  }
};

const cadastrar = async () => {
  try {
    await api.post('/profissionais', form.value);
    form.value = { nome: '', email: '', valorHora: null, especialidades: [] };
    carregar();
  } catch (error) {
    alert('Erro ao cadastrar: ' + (error.response?.data?.message || 'Verifique os dados.'));
  }
};

const remover = async (id) => {
  if (confirm("Deseja realmente apagar este profissional permanentemente?")) {
    try {
      await api.delete(`/profissionais/${id}`);
      carregar();
    } catch (error) {
      alert("Erro ao excluir. Verifique se existe a rota DELETE no backend.");
    }
  }
};

onMounted(carregar);
</script>

<style scoped>
/* ESTRUTURA ORIGINAL COM CORES AZUIS E DESIGN MODERNO */
.layout-split { display: grid; grid-template-columns: 350px 1fr; gap: 30px; align-items: start; }

.glass-card { 
  background: white; 
  padding: 30px; 
  border-radius: 24px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05); 
}

.form-title { 
  margin-bottom: 25px; 
  color: #1e293b; 
  font-size: 1.2rem; 
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-badge {
  background: #eff6ff; 
  padding: 8px;
  border-radius: 10px;
  font-size: 1rem;
}

/* FORMULÁRIO */
.modern-form label { display: block; font-size: 0.8rem; font-weight: 700; color: #64748b; margin: 15px 0 5px; text-transform: uppercase; letter-spacing: 0.5px; }

.modern-form input { 
  width: 100%; 
  padding: 14px; 
  border: 1px solid #e2e8f0; 
  border-radius: 12px; 
  background: #f8fafc; 
  font-size: 0.95rem;
  color: #1e293b;
  font-weight: 500;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.modern-form input:focus {
  outline: none;
  border-color: #1e40af;
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.15);
  background: white;
}

/* CHECKBOXES PERSONALIZADOS */
.checkbox-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem !important;
  color: #1e293b !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
  margin: 0 !important;
  cursor: pointer;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  accent-color: #1e40af;
  cursor: pointer;
  padding: 0;
}

/* BOTÃO PRINCIPAL */
.btn-primary { 
  width: 100%; 
  background: #1e40af; 
  color: white; 
  border: none; 
  padding: 16px; 
  border-radius: 14px; 
  margin-top: 25px; 
  font-weight: bold; 
  font-size: 1rem;
  cursor: pointer; 
  transition: all 0.3s; 
}
.btn-primary:hover { 
  background: #1e3a8a; 
  transform: translateY(-2px); 
  box-shadow: 0 8px 20px rgba(30, 64, 175, 0.25);
}

/* LISTA DE PROFISSIONAIS */
.pro-list { display: flex; flex-direction: column; }
.pro-item { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; border-bottom: 1px solid #f1f5f9; transition: background 0.2s; }
.pro-item:hover { background: #f8fafc; border-radius: 12px; padding: 20px 10px; margin: 0 -10px; }

.item-main strong { display: block; color: #1e293b; font-size: 1.05rem; margin-bottom: 4px; }
.item-email { font-size: 0.85rem; color: #64748b; font-weight: 500; display: block; margin-bottom: 8px; }

.tags-container { display: flex; flex-wrap: wrap; gap: 6px; }
.tag-badge { background: #f1f5f9; color: #475569; font-size: 0.65rem; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; }

.item-actions { display: flex; align-items: center; gap: 15px; }
.price-tag { font-weight: 800; font-size: 0.95rem; color: #1e40af; background: #eff6ff; padding: 8px 12px; border-radius: 8px; }

.btn-del-mini { background: transparent; border: none; padding: 8px; border-radius: 10px; cursor: pointer; transition: 0.2s; opacity: 0.5; filter: grayscale(1); }
.pro-item:hover .btn-del-mini { opacity: 1; filter: grayscale(0); }
.btn-del-mini:hover { background: #fee2e2; }

.empty-msg { text-align: center; padding: 40px; color: #94a3b8; font-weight: 500; }
</style>