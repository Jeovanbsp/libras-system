<template>
  <MainLayout pageTitle="Gestão de Cursos" pageDescription="Configure o conteúdo, módulos e links de vídeo das aulas.">
    <div class="layout-split">
      
      <div class="glass-card side-form">
        <h3 class="form-title">
          <span class="icon-badge">{{ editandoId ? '📝' : '✨' }}</span> 
          {{ editandoId ? 'Editar Conteúdo' : 'Novo Curso' }}
        </h3>
        
        <form @submit.prevent="salvarCurso" class="modern-form scrollable-content">
          <label>Título do Curso</label>
          <input v-model="curso.titulo" placeholder="Ex: Libras Avançado" required />
          
          <label>Descrição</label>
          <textarea v-model="curso.descricao" rows="3" placeholder="Detalhes do curso..."></textarea>
          
          <div class="form-row">
            <div>
              <label>Carga Horária</label>
              <input v-model.number="curso.cargaHoraria" type="number" placeholder="Horas" required />
            </div>
            <div>
              <label>Nível</label>
              <select v-model="curso.nivel">
                <option value="Básico">Básico</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
              </select>
            </div>
          </div>

          <div class="section-divider"></div>

          <div class="modules-section">
            <div class="section-header">
              <h4>Módulos e Aulas</h4>
              <button type="button" @click="adicionarModulo" class="btn-add-small">+ Módulo</button>
            </div>

            <div v-for="(mod, mIdx) in curso.modulos" :key="mIdx" class="module-item">
              <div class="module-input-row">
                <input v-model="mod.titulo" placeholder="Título do Módulo" class="mod-title-input" />
                <button type="button" @click="removerModulo(mIdx)" class="btn-icon-del">🗑️</button>
              </div>

              <div class="lessons-container">
                <div v-for="(aula, aIdx) in mod.aulas" :key="aIdx" class="lesson-input-row">
                  <input v-model="aula.titulo" placeholder="Nome da Aula" />
                  <input v-model="aula.videoUrl" placeholder="URL do Vídeo (YouTube/Vimeo)" />
                  <button type="button" @click="removerAula(mIdx, aIdx)" class="btn-icon-del">×</button>
                </div>
                <button type="button" @click="adicionarAula(mIdx)" class="btn-add-lesson">+ Adicionar Aula</button>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary">{{ editandoId ? 'Salvar Alterações' : 'Cadastrar Curso' }}</button>
            <button v-if="editandoId" @click="cancelarEdicao" type="button" class="btn-cancel">Cancelar Edição</button>
          </div>
        </form>
      </div>

      <div class="cursos-grid">
        <div v-for="c in cursos" :key="c._id" class="glass-card curso-card">
          <div class="curso-badge">{{ c.nivel }}</div>
          <h4>{{ c.titulo }}</h4>
          <p>{{ c.descricao }}</p>
          <div class="course-stats">
             <span>📁 {{ c.modulos?.length || 0 }} Módulos</span>
          </div>
          <div class="curso-footer">
            <span>🕒 {{ c.cargaHoraria }}h</span>
            <div class="actions">
              <button @click="prepararEdicao(c)" class="btn-edit" title="Editar">✏️</button>
              <button @click="removerCurso(c._id)" class="btn-del" title="Excluir">🗑️</button>
            </div>
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

const cursos = ref([]);
const editandoId = ref(null);

// Estrutura inicial reativa com suporte a módulos
const cursoInicial = { 
  titulo: '', 
  descricao: '', 
  cargaHoraria: 0, 
  nivel: 'Básico',
  modulos: [{ titulo: '', aulas: [{ titulo: '', videoUrl: '' }] }]
};

const curso = ref({ ...cursoInicial });

const buscarCursos = async () => { 
  const res = await api.get('/cursos'); 
  cursos.value = res.data; 
};

const salvarCurso = async () => {
  try {
    if (editandoId.value) await api.put(`/cursos/${editandoId.value}`, curso.value);
    else await api.post('/cursos', curso.value);
    cancelarEdicao(); 
    buscarCursos();
  } catch (err) {
    alert("Erro ao salvar curso.");
  }
};

const prepararEdicao = (c) => { 
  editandoId.value = c._id; 
  // Profunda cópia para evitar edição reativa na lista
  curso.value = JSON.parse(JSON.stringify(c)); 
};

const cancelarEdicao = () => { 
  editandoId.value = null; 
  curso.value = JSON.parse(JSON.stringify(cursoInicial)); 
};

const removerCurso = async (id) => { 
  if(confirm("Deseja remover este curso?")) { 
    await api.delete(`/cursos/${id}`); 
    buscarCursos(); 
  } 
};

// Funções para gerenciar Módulos e Aulas
const adicionarModulo = () => {
  curso.value.modulos.push({ titulo: '', aulas: [{ titulo: '', videoUrl: '' }] });
};
const removerModulo = (idx) => { curso.value.modulos.splice(idx, 1); };
const adicionarAula = (mIdx) => {
  curso.value.modulos[mIdx].aulas.push({ titulo: '', videoUrl: '' });
};
const removerAula = (mIdx, aIdx) => { curso.value.modulos[mIdx].aulas.splice(aIdx, 1); };

onMounted(buscarCursos);
</script>

<style scoped>
.layout-split { display: grid; grid-template-columns: 420px 1fr; gap: 30px; align-items: start; }
.glass-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05); }

/* Scroll interno para o formulário não esticar a tela */
.scrollable-content { max-height: 75vh; overflow-y: auto; padding-right: 10px; }
.scrollable-content::-webkit-scrollbar { width: 5px; }
.scrollable-content::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

.form-title { margin-bottom: 25px; color: #1e293b; font-size: 1.2rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
.icon-badge { background: #eff6ff; padding: 8px; border-radius: 10px; font-size: 1rem; }

.modern-form label { display: block; font-size: 0.8rem; font-weight: 700; color: #64748b; margin: 15px 0 5px; text-transform: uppercase; letter-spacing: 0.5px; }
.modern-form input, .modern-form textarea, .modern-form select { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; font-size: 0.95rem; color: #1e293b; font-weight: 500; transition: all 0.2s ease; font-family: inherit; }
.modern-form input:focus, .modern-form textarea:focus, .modern-form select:focus { outline: none; border-color: #1e40af; box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.15); background: white; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.section-divider { border-top: 1px solid #f1f5f9; margin: 25px 0; }

/* Estilo Módulos e Aulas */
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.section-header h4 { font-size: 0.9rem; color: #1e293b; font-weight: 800; }
.module-item { background: #f8fafc; padding: 15px; border-radius: 16px; margin-bottom: 15px; border: 1px solid #f1f5f9; }
.module-input-row { display: flex; gap: 10px; margin-bottom: 12px; }
.mod-title-input { font-weight: 700 !important; border-color: #cbd5e1 !important; }

.lessons-container { padding-left: 12px; border-left: 2px solid #e2e8f0; display: flex; flex-direction: column; gap: 8px; }
.lesson-input-row { display: flex; gap: 5px; }
.lesson-input-row input { padding: 8px !important; font-size: 0.8rem !important; }

.btn-add-small { background: #eff6ff; color: #1e40af; border: none; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; cursor: pointer; }
.btn-add-lesson { background: transparent; border: 1px dashed #cbd5e1; color: #64748b; padding: 6px; border-radius: 8px; font-size: 0.7rem; cursor: pointer; margin-top: 5px; }
.btn-icon-del { background: #fee2e2; color: #ef4444; border: none; padding: 5px 8px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; }

/* Listagem */
.btn-primary { width: 100%; background: #1e40af; color: white; border: none; padding: 16px; border-radius: 14px; margin-top: 25px; font-weight: bold; font-size: 1rem; cursor: pointer; transition: 0.3s; }
.btn-cancel { width: 100%; background: #f1f5f9; color: #64748b; border: none; padding: 16px; border-radius: 14px; margin-top: 10px; font-weight: bold; cursor: pointer; }

.course-stats { margin-top: 15px; font-size: 0.8rem; font-weight: 700; color: #1e40af; background: #eff6ff; display: inline-block; padding: 4px 10px; border-radius: 6px; }

.cursos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.curso-card { position: relative; display: flex; flex-direction: column; padding: 25px; transition: transform 0.2s; }
.curso-card:hover { transform: translateY(-4px); }
.curso-badge { position: absolute; top: 20px; right: 20px; background: #eff6ff; color: #1e40af; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
.curso-card h4 { margin-bottom: 10px; color: #1e293b; font-size: 1.1rem; padding-right: 80px; font-weight: 800; }
.curso-card p { font-size: 0.9rem; color: #64748b; flex: 1; line-height: 1.5; }

.curso-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #f1f5f9; }
.actions button { background: #f8fafc; border: none; padding: 8px; border-radius: 8px; cursor: pointer; transition: 0.2s; margin-left: 5px; }
</style>