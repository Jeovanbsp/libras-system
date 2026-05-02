<template>
  <MainLayout pageTitle="Meus Cursos" pageDescription="Gerencie as aulas dos seus cursos">
    <div class="layout-split">
      
      <!-- Lista de Cursos do Professor -->
      <div class="glass-card main-content">
        <h3 class="form-title">
          <BookOpen :size="20" class="text-brand" /> Meus Cursos
        </h3>
        
        <div v-if="cursos.length === 0" class="empty-state">
          <BookOpen :size="40" class="opacity-30" />
          <p>Você não tem cursos atribuídos.</p>
        </div>
        
        <div class="curso-grid">
          <div v-for="curso in cursos" :key="curso._id" class="card-item" @click="selecionarCurso(curso)">
            <div class="card-header">
              <h4>{{ curso.titulo }}</h4>
              <span class="badge badge-ativo">{{ curso.nivel }}</span>
            </div>
            <p class="text-sm text-muted">{{ curso.descricao?.substring(0, 80) }}...</p>
            <div class="card-info">
              <span><Clock :size="14" /> {{ curso.cargaHoraria }}h</span>
              <span><FolderOpen :size="14" /> {{ curso.modulos?.length || 0 }} módulos</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Detalhes do Curso selecionado -->
      <div v-if="cursoSelecionado" class="glass-card side-form">
        <div class=" curso-details">
          <h3>{{ cursoSelecionado.titulo }}</h3>
          <p class="text-muted">{{ cursoSelecionado.descricao }}</p>
          
          <div class="modulos-section">
            <h4>Módulos</h4>
            
            <div v-for="(modulo, idxMod) in cursoSelecionado.modulos" :key="idxMod" class="modulo-item">
              <div class="modulo-header">
                <h5>{{ idxMod + 1 }}. {{ modulo.titulo }}</h5>
                <button @click="adicionarAula(idxMod)" class="btn-sm">
                  <Plus :size="14" /> Aula
                </button>
              </div>
              
              <div class="aula-list">
                <div v-for="(aula, idxAula) in modulo.aulas" :key="idxAula" class="aula-item">
                  <div class="aula-info">
                    <span class="aula-titulo">{{ aula.titulo }}</span>
                    <span class="aula-duracao" v-if="aula.duracao">{{ aula.duracao }}min</span>
                  </div>
                  <div class="aula-actions">
                    <button @click="editarAula(idxMod, idxAula, aula)" class="btn-icon" title="Editar">
                      <Edit2 :size="14" />
                    </button>
                    <button @click="removerAula(idxMod, idxAula)" class="btn-icon-del" title="Remover">
                      <Trash2 :size="14" />
                    </button>
                  </div>
                </div>
                <div v-if="modulo.aulas?.length === 0" class="text-xs text-muted">
                  Nenhuma aula neste módulo.
                </div>
              </div>
            </div>
            
            <button @click="adicionarModulo" class="btn-secondary">
              <Plus :size="16" /> Novo Módulo
            </button>
          </div>
          
          <button @click="salvarCurso" class="btn-primary" :disabled="saving">
            <Save :size="18" /> {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </div>
      
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { BookOpen, Clock, FolderOpen, Plus, Edit2, Trash2, Save } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const cursos = ref([]);
const cursoSelecionado = ref(null);
const saving = ref(false);

// Buscar ID do instrutor logado (do localStorage)
const instrutorId = localStorage.getItem('instrutorId');

const carregarCursos = async () => {
  if (!instrutorId) {
    console.log('Não logado como instrutor');
    return;
  }
  try {
    const res = await api.get(`/instrutores/${instrutorId}`);
    cursos.value = res.data.cursos || [];
  } catch (e) {
    console.error(e);
  }
};

const selecionarCurso = (curso) => {
  cursoSelecionado.value = JSON.parse(JSON.stringify(curso));
};

const adicionarModulo = () => {
  if (!cursoSelecionado.value.modulos) {
    cursoSelecionado.value.modulos = [];
  }
  const titulo = prompt('Título do módulo:');
  if (titulo) {
    cursoSelecionado.value.modulos.push({ titulo, aulas: [] });
  }
};

const adicionarAula = (idxMod) => {
  const titulo = prompt('Título da aula:');
  if (titulo) {
    if (!cursoSelecionado.value.modulos[idxMod].aulas) {
      cursoSelecionado.value.modulos[idxMod].aulas = [];
    }
    cursoSelecionado.value.modulos[idxMod].aulas.push({
      titulo,
      descricao: '',
      duracao: 30,
      materiais: []
    });
  }
};

const editarAula = (idxMod, idxAula, aula) => {
  const nova_desc = prompt('Descrição da aula:', aula.descricao);
  const nova_dur = prompt('Duração (min):', aula.duracao);
  if (nova_desc !== null) aula.descricao = nova_desc;
  if (nova_dur !== null) aula.duracao = parseInt(nova_dur);
};

const removerAula = (idxMod, idxAula) => {
  if (confirm('Remover esta aula?')) {
    cursoSelecionado.value.modulos[idxMod].aulas.splice(idxAula, 1);
  }
};

const salvarCurso = async () => {
  saving.value = true;
  try {
    await api.put(`/cursos/${cursoSelecionado.value._id}`, {
      modulos: cursoSelecionado.value.modulos
    });
    alert('Curso salvo!');
    carregarCursos();
    cursoSelecionado.value = null;
  } catch (e) {
    alert('Erro ao salvar.');
  }
  saving.value = false;
};

onMounted(() => { carregarCursos(); });
</script>

<style scoped>
.layout-split { display: flex; gap: 20px; }
.main-content { flex: 1; }
.side-form { flex: 1; }

.curso-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; margin-top: 16px; }
.card-item { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; cursor: pointer; transition: 0.2s; }
.card-item:hover { border-color: #004aad; box-shadow: 0 4px 12px rgba(0,74,173,0.15); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.card-header h4 { margin: 0; font-size: 1rem; color: #1e293b; }
.card-info { display: flex; gap: 16px; margin-top: 12px; color: #64748b; font-size: 0.85rem; }
.card-info span { display: flex; align-items: center; gap: 4px; }

.modulos-section { margin-top: 20px; }
.modulo-item { background: #f8fafc; border-radius: 10px; padding: 14px; margin-bottom: 12px; }
.modulo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.modulo-header h5 { margin: 0; color: #1e293b; }

.aula-list { margin-top: 10px; padding-left: 10px; border-left: 3px solid #e2e8f0; }
.aula-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; background: white; border-radius: 8px; margin-bottom: 6px; }
.aula-info { display: flex; gap: 10px; align-items: center; }
.aula-titulo { font-size: 0.9rem; color: #334155; }
.aula-duracao { font-size: 0.75rem; color: #94a3b8; background: #f1f5f9; padding: 2px 8px; border-radius: 10px; }
.aula-actions { display: flex; gap: 6px; }

.btn-sm { display: flex; align-items: center; gap: 4px; padding: 6px 10px; background: #004aad; color: white; border: none; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
.btn-icon { background: white; border: 1px solid #e2e8f0; padding: 6px; border-radius: 6px; cursor: pointer; color: #64748b; }
.btn-icon:hover { background: #dbeafe; color: #0284c7; }
.btn-icon-del { background: white; border: 1px solid #e2e8f0; padding: 6px; border-radius: 6px; cursor: pointer; color: #64748b; }
.btn-icon-del:hover { background: #fee2e2; color: #ef4444; }
.btn-secondary { display: flex; align-items: center; gap: 6px; padding: 10px 16px; background: white; border: 1px solid #004aad; color: #004aad; border-radius: 8px; cursor: pointer; font-weight: 500; }
.btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: #004aad; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; justify-content: center; margin-top: 20px; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.empty-state { text-align: center; padding: 40px; color: #94a3b8; }
.form-title { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.text-brand { color: #004aad; }
.text-sm { font-size: 0.9rem; }
.text-muted { color: #94a3b8; }
.text-xs { font-size: 0.75rem; }
</style>