<template>
  <MainLayout pageTitle="Meus Cursos" pageDescription="Adicione aulas aos módulos dos cursos">
    <div class="cursos-container">
      
      <div v-if="cursos.length === 0" class="empty-state">
        <BookOpen :size="48" class="opacity-30" />
        <p>Nenhum curso disponível.</p>
      </div>

      <div v-for="curso in cursos" :key="curso._id" class="curso-card">
        <div class="curso-header" @click="toggleExpanded(curso._id)">
          <div class="curso-info">
            <BookOpen :size="20" class="text-brand-color" />
            <div>
              <h3>{{ curso.titulo }}</h3>
              <p class="text-sm text-muted">{{ curso.descricao?.substring(0, 80) }}...</p>
            </div>
          </div>
          <ChevronDown :size="20" :class="['chevron', expanded === curso._id ? 'rotated' : '']" />
        </div>
        
        <div v-if="expanded === curso._id" class="modulos-list">
          <div v-for="(modulo, idxMod) in curso.modulos" :key="idxMod" class="modulo-card">
            <div class="modulo-header">
              <h4>Módulo {{ idxMod + 1 }}: {{ modulo.titulo }}</h4>
              <div class="modulo-actions">
                <button @click="adicionarAula(curso._id, idxMod)" class="btn-sm">
                  <Plus :size="14" /> Aula
                </button>
              </div>
            </div>
            
            <div class="aula-list">
              <div v-for="(aula, idxAula) in modulo.aulas" :key="idxAula" class="aula-item">
                <div class="aula-info">
                  <FileText :size="16" />
                  <span>{{ aula.titulo }}</span>
                  <span v-if="aula.duracao" class="duracao">{{ aula.duracao }}min</span>
                </div>
                <div class="aula-actions">
                  <button @click="editarAula(curso._id, idxMod, idxAula, aula)" class="btn-icon" title="Editar">
                    <Edit2 :size="16" />
                  </button>
                  <button @click="removerAula(curso._id, idxMod, idxAula)" class="btn-icon-del" title="Remover">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </div>
              <div v-if="!modulo.aulas?.length" class="text-sm text-muted">
                Nenhuma aula neste módulo.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="salvando" class="loading-overlay">
        <Loader :size="24" class="spin" /> Salvando...
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { BookOpen, ChevronDown, Plus, FileText, Edit2, Trash2, Loader } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const cursos = ref([]);
const expanded = ref(null);
const salvando = ref(false);

const loadCursos = async () => {
  try {
    const res = await api.get('/cursos');
    cursos.value = res.data;
  } catch (e) {
    console.error(e);
  }
};

const toggleExpanded = (id) => {
  expanded.value = expanded.value === id ? null : id;
};

const adicionarAula = async (cursoId, idxMod) => {
  const titulo = prompt('Título da aula:');
  if (!titulo) return;
  
  const curso = cursos.value.find(c => c._id === cursoId);
  if (!curso.modulos[idxMod].aulas) curso.modulos[idxMod].aulas = [];
  
  curso.modulos[idxMod].aulas.push({
    titulo,
    descricao: '',
    duracao: 30,
    materiais: []
  });
  
  await salvarMudancas(curso);
};

const editarAula = async (cursoId, idxMod, idxAula, aula) => {
  const novoTitulo = prompt('Título:', aula.titulo);
  if (novoTitulo !== null && novoTitulo !== '') {
    aula.titulo = novoTitulo;
  }
  const desc = prompt('Descrição:', aula.descricao);
  if (desc !== null) aula.descricao = desc || '';
  const duracao = prompt('Duração (min):', aula.duracao);
  if (duracao !== null) aula.duracao = parseInt(duracao) || 30;
  
  const curso = cursos.value.find(c => c._id === cursoId);
  await salvarMudancas(curso);
};

const removerAula = async (cursoId, idxMod, idxAula) => {
  if (!confirm('Remover esta aula?')) return;
  const curso = cursos.value.find(c => c._id === cursoId);
  curso.modulos[idxMod].aulas.splice(idxAula, 1);
  await salvarMudancas(curso);
};

const salvarMudancas = async (curso) => {
  salvando.value = true;
  try {
    await api.put(`/cursos/${curso._id}`, { modulos: curso.modulos });
    alert('Salvo!');
  } catch (e) {
    alert('Erro ao salvar.');
  }
  salvando.value = false;
};

onMounted(() => { loadCursos(); });
</script>

<style scoped>
.cursos-container { display: flex; flex-direction: column; gap: 16px; padding-bottom: 40px; }
.curso-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
.curso-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; cursor: pointer; }
.curso-header:hover { background: #f8fafc; }
.curso-info { display: flex; gap: 12px; align-items: center; }
.curso-info h3 { margin: 0; font-size: 1.1rem; }
.chevron { transition: 0.2s; }
.chevron.rotated { transform: rotate(180deg); }

.modulos-list { border-top: 1px solid #e2e8f0; padding: 16px; background: #f8fafc; }
.modulo-card { margin-bottom: 16px; }
.modulo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.modulo-header h4 { margin: 0; color: #334155; }

.aula-list { padding-left: 12px; border-left: 3px solid #e2e8f0; }
.aula-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 8px; margin-bottom: 6px; }
.aula-info { display: flex; align-items: center; gap: 8px; }
.duracao { font-size: 0.75rem; color: #94a3b8; background: #f1f5f9; padding: 2px 8px; border-radius: 10px; }
.aula-actions { display: flex; gap: 6px; }

.btn-sm { display: flex; align-items: center; gap: 4px; padding: 6px 10px; background: #004aad; color: white; border: none; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
.btn-icon { background: white; border: 1px solid #e2e8f0; padding: 6px; border-radius: 6px; cursor: pointer; }
.btn-icon:hover { background: #dbeafe; }
.btn-icon-del { background: white; border: 1px solid #e2e8f0; padding: 6px; border-radius: 6px; cursor: pointer; }
.btn-icon-del:hover { background: #fee2e2; }

.empty-state { text-align: center; padding: 60px; color: #94a3b8; }
.loading-overlay { position: fixed; bottom: 20px; right: 20px; background: white; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 8px; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>