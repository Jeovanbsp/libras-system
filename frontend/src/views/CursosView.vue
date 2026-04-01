<template>
  <MainLayout pageTitle="Gestão de Cursos" pageDescription="Configure conteúdo, preços, materiais e libere acessos para alunos.">
    <div class="layout-split">
      
      <div class="glass-card side-form">
        <h3 class="form-title">
          <component :is="editandoId ? FileEdit : PlusCircle" :size="20" class="text-brand-color" /> 
          {{ editandoId ? 'Editar Conteúdo' : 'Novo Curso' }}
        </h3>
        
        <form @submit.prevent="salvarCurso" class="modern-form scrollable-content">
          <div class="form-group">
            <label>Título do Curso</label>
            <input v-model="curso.titulo" placeholder="Ex: Libras Avançado" required />
          </div>
          
          <div class="form-group">
            <label>Descrição</label>
            <textarea v-model="curso.descricao" rows="3" placeholder="Detalhes do curso..."></textarea>
          </div>
          
          <div class="form-row">
            <div>
              <label>Carga Horária</label>
              <input v-model.number="curso.cargaHoraria" type="number" placeholder="Horas" required />
            </div>
            <div>
              <label>Nível</label>
              <select v-model="curso.nivel" class="custom-select">
                <option value="curso">Curso</option>
                <option value="palestra">Palestra</option>
                <option value="oficina">Oficina</option>
              </select>
            </div>
          </div>

          <div class="form-row mt-4">
            <div>
              <label>Tipo de Acesso</label>
              <select v-model="curso.gratuito" class="custom-select">
                <option :value="true">Gratuito</option>
                <option :value="false">Pago</option>
              </select>
            </div>
            <div v-if="!curso.gratuito">
              <label>Valor (R$)</label>
              <input v-model.number="curso.valor" type="number" step="0.01" placeholder="0,00" />
            </div>
          </div>

          <div class="section-divider"></div>

          <div class="modules-section">
            <div class="section-header">
              <h4 class="flex items-center gap-2">
                <Library :size="16" /> Módulos e Aulas
              </h4>
              <button type="button" @click="adicionarModulo" class="btn-add-small">
                <Plus :size="14" /> Módulo
              </button>
            </div>

            <div v-for="(mod, mIdx) in curso.modulos" :key="mIdx" class="module-item">
              <div class="module-input-row">
                <input v-model="mod.titulo" placeholder="Título do Módulo" class="mod-title-input" />
                <button type="button" @click="removerModulo(mIdx)" class="btn-icon-del" title="Remover Módulo">
                  <Trash2 :size="14" />
                </button>
              </div>

              <div class="lessons-container">
                <div v-for="(aula, aIdx) in mod.aulas" :key="aIdx" class="lesson-admin-card">
                  <div class="lesson-input-row">
                    <input v-model="aula.titulo" placeholder="Nome da Aula" />
                    <input v-model="aula.videoUrl" placeholder="URL do Vídeo" />
                    <button type="button" @click="removerAula(mIdx, aIdx)" class="btn-icon-del-mini" title="Remover Aula">
                      <X :size="14" />
                    </button>
                  </div>
                  
                  <div class="upload-field mt-2">
                    <label class="file-label">
                      <FileUp :size="14" /> 
                      {{ aula.material ? 'Trocar Material' : 'Anexar PDF/Material' }}
                      <input type="file" @change="uploadMaterial($event, mIdx, aIdx)" hidden accept=".pdf,.zip,.docx" />
                    </label>
                    <span v-if="aula.material" class="file-status">✓ {{ aula.material.substring(0, 15) }}...</span>
                  </div>
                </div>
                <button type="button" @click="adicionarAula(mIdx)" class="btn-add-lesson">
                    + Adicionar Aula
                </button>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary">
              <Save :size="18" /> {{ editandoId ? 'Salvar Alterações' : 'Cadastrar Curso' }}
            </button>
            <button v-if="editandoId" @click="cancelarEdicao" type="button" class="btn-cancel">
               Cancelar Edição
            </button>
          </div>
        </form>
      </div>

      <div class="cursos-grid">
        <div v-for="c in cursos" :key="c._id" class="glass-card curso-card">
          <div class="curso-badge">{{ c.nivel.charAt(0).toUpperCase() + c.nivel.slice(1) }}</div>
          <div :class="['price-badge', c.gratuito ? 'free' : 'paid']">
            {{ c.gratuito ? 'Grátis' : 'R$ ' + (c.valor || 0).toFixed(2).replace('.', ',') }}
          </div>
          <h4>{{ c.titulo }}</h4>
          <p class="line-clamp-2">{{ c.descricao }}</p>
          
          <div class="course-stats-row">
             <span class="stat-tag"><Library :size="14" /> {{ c.modulos?.length || 0 }} Módulos</span>
             <span class="stat-tag"><Clock :size="14" /> {{ c.cargaHoraria }}h</span>
          </div>
          
          <div class="curso-footer">
            <button @click="prepararEdicao(c)" class="btn-action-outline edit" title="Editar">
              <Pencil :size="16" />
            </button>
            
            <button @click="abrirModalLiberacao(c)" class="btn-action-outline lib" title="Liberar para Aluno">
              <UserPlus :size="16" />
            </button>

            <button @click="removerCurso(c._id)" class="btn-action-outline del" title="Excluir">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="mostrarModal" class="modal-overlay" @click.self="fecharModal">
      <div class="glass-card modal-content">
        <div class="modal-header">
          <h3>Liberar Curso</h3>
          <button @click="fecharModal" class="btn-icon-close"><X :size="20" /></button>
        </div>
        <div class="modal-body">
          <p class="mb-4">Liberando acesso ao curso: <br><strong>{{ cursoParaLiberar?.titulo }}</strong></p>
          
          <div class="form-group">
            <label class="modal-label">Selecione o Aluno</label>
            <select v-model="alunoSelecionadoId" class="modal-select">
              <option value="" disabled>Escolha um aluno...</option>
              <option v-for="a in alunos" :key="a._id" :value="a._id">
                {{ a.nome }} ({{ a.email }})
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="confirmarLiberacao" class="btn-primary">Confirmar Liberação</button>
        </div>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { 
  PlusCircle, Plus, Trash2, X, Library, Clock, Pencil, Save, FileEdit, FileUp, UserPlus 
} from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const cursos = ref([]);
const alunos = ref([]);
const editandoId = ref(null);
const mostrarModal = ref(false);
const cursoParaLiberar = ref(null);
const alunoSelecionadoId = ref('');

const cursoInicial = { 
  titulo: '', descricao: '', cargaHoraria: 0, nivel: 'curso', gratuito: true, valor: 0,
  modulos: [{ titulo: '', aulas: [{ titulo: '', videoUrl: '', material: '' }] }]
};

const curso = ref({ ...cursoInicial });

// BUSCAS
const buscarAlunos = async () => {
  try {
    const res = await api.get('/admin/alunos');
    alunos.value = res.data;
  } catch (err) { console.error("Erro ao carregar alunos"); }
};

const buscarCursos = async () => { 
  try { 
    const res = await api.get('/cursos'); 
    cursos.value = res.data; 
  } catch (err) { console.error("Erro ao carregar cursos"); } 
};

// LÓGICA DO MODAL
const abrirModalLiberacao = (c) => {
  cursoParaLiberar.value = c;
  mostrarModal.value = true;
};

const fecharModal = () => {
  mostrarModal.value = false;
  cursoParaLiberar.value = null;
  alunoSelecionadoId.value = '';
};

const confirmarLiberacao = async () => {
  if(!alunoSelecionadoId.value) return alert("Por favor, selecione um aluno!");
  try {
    await api.post('/admin/liberar-curso', {
      alunoId: alunoSelecionadoId.value,
      cursoId: cursoParaLiberar.value._id
    });
    alert("Curso liberado com sucesso!");
    fecharModal();
  } catch (err) {
    alert(err.response?.data?.message || "Erro ao liberar curso.");
  }
};

// GESTÃO DE CURSOS
const uploadMaterial = async (event, mIdx, aIdx) => {
  const file = event.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await api.post('/admin/upload-material', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    curso.value.modulos[mIdx].aulas[aIdx].material = res.data.fileName;
    alert("Material enviado!");
  } catch (err) { alert("Erro no upload."); }
};

const salvarCurso = async () => {
  try {
    if (curso.value.gratuito) curso.value.valor = 0;
    if (editandoId.value) await api.put(`/cursos/${editandoId.value}`, curso.value);
    else await api.post('/cursos', curso.value);
    cancelarEdicao(); buscarCursos(); alert("Salvo com sucesso!");
  } catch (err) { alert("Erro ao salvar curso."); }
};

const prepararEdicao = (c) => { 
  editandoId.value = c._id; 
  curso.value = JSON.parse(JSON.stringify(c)); 
  window.scrollTo({ top: 0, behavior: 'smooth' }); 
};

const cancelarEdicao = () => { editandoId.value = null; curso.value = JSON.parse(JSON.stringify(cursoInicial)); };

const removerCurso = async (id) => { 
  if(confirm("Deseja remover este curso permanentemente?")) { 
    try { await api.delete(`/cursos/${id}`); buscarCursos(); } catch (err) { alert("Erro ao excluir."); } 
  } 
};

// AUXILIARES DE FORMULÁRIO
const adicionarModulo = () => { curso.value.modulos.push({ titulo: '', aulas: [{ titulo: '', videoUrl: '', material: '' }] }); };
const removerModulo = (idx) => { curso.value.modulos.splice(idx, 1); };
const adicionarAula = (mIdx) => { curso.value.modulos[mIdx].aulas.push({ titulo: '', videoUrl: '', material: '' }); };
const removerAula = (mIdx, aIdx) => { curso.value.modulos[mIdx].aulas.splice(aIdx, 1); };

onMounted(() => {
  buscarCursos();
  buscarAlunos();
});
</script>

<style scoped>
/* =========================================
   BASE E ESTRUTURA
   ========================================= */
.layout-split { display: grid; grid-template-columns: 420px 1fr; gap: 30px; align-items: start; }
.glass-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05); }

/* BARRA DE ROLAGEM */
.scrollable-content { max-height: 75vh; overflow-y: auto; padding-right: 12px; }
.scrollable-content::-webkit-scrollbar { width: 6px; }
.scrollable-content::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
.scrollable-content::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

/* =========================================
   FORMULÁRIO PRINCIPAL
   ========================================= */
.modern-form label { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; margin: 15px 0 6px; text-transform: uppercase; }
.modern-form input, .modern-form textarea, .modern-form select { 
  width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; 
  background: #f8fafc; font-size: 0.95rem; color: #1e293b; 
}
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.section-divider { border-top: 1px solid #f1f5f9; margin: 25px 0; }

.form-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 25px; }
.btn-primary { 
  width: 100%; background: #004aad; color: white; border: none; padding: 16px; 
  border-radius: 14px; font-weight: 800; cursor: pointer; transition: 0.2s;
  display: flex; justify-content: center; align-items: center; gap: 8px;
}
.btn-primary:hover { background: #003a8c; transform: translateY(-2px); }
.btn-cancel { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; padding: 14px; border-radius: 14px; font-weight: 700; cursor: pointer; }

/* =========================================
   BOTÕES E SEÇÃO DE MÓDULOS E AULAS
   ========================================= */
.module-item { background: #f8fafc; padding: 15px; border-radius: 16px; margin-bottom: 15px; border: 1px solid #f1f5f9; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.section-header h4 { margin: 0; font-size: 1rem; color: #1e293b; font-weight: 800; }

.btn-add-small {
  background: #eff6ff; color: #004aad; border: 1px solid #bfdbfe; padding: 6px 12px;
  border-radius: 8px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center;
  gap: 6px; cursor: pointer; transition: all 0.2s ease;
}
.btn-add-small:hover { background: #004aad; color: white; border-color: #004aad; transform: translateY(-1px); }

.module-input-row { display: flex; gap: 10px; align-items: center; margin-bottom: 15px; }
.mod-title-input { flex: 1; font-weight: 700 !important; color: #004aad !important; border-color: #bfdbfe !important; background: white !important; }

.btn-icon-del {
  background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; border-radius: 10px; width: 42px; height: 42px;
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; flex-shrink: 0;
}
.btn-icon-del:hover { background: #ef4444; color: white; transform: scale(1.05); }

.lesson-admin-card { background: white; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 12px; margin-bottom: 10px; }
.lesson-input-row { display: flex; gap: 8px; align-items: center; }
.lesson-input-row input { margin: 0 !important; padding: 10px !important; font-size: 0.85rem !important; }

.btn-icon-del-mini {
  background: #f1f5f9; color: #64748b; border: none; border-radius: 8px; width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; flex-shrink: 0;
}
.btn-icon-del-mini:hover { background: #fee2e2; color: #ef4444; }

.btn-add-lesson {
  width: 100%; background: transparent; color: #64748b; border: 1px dashed #cbd5e1; padding: 10px;
  border-radius: 10px; font-size: 0.8rem; font-weight: 700; cursor: pointer; margin-top: 5px; transition: all 0.2s;
}
.btn-add-lesson:hover { background: #f8fafc; color: #004aad; border-color: #94a3b8; }

.upload-field { margin-top: 10px; }
.file-label { display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; padding: 5px 10px; border-radius: 6px; font-size: 0.7rem; cursor: pointer; font-weight: 700; }
.file-status { font-size: 0.75rem; color: #10b981; font-weight: bold; margin-left: 8px; }

/* =========================================
   CARDS DOS CURSOS (AJUSTE VISUAL NOVO)
   ========================================= */
.cursos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }

.curso-card { 
  position: relative; padding: 25px; padding-top: 65px; border: 1px solid #e2e8f0; 
  transition: all 0.3s ease; display: flex; flex-direction: column;
}
.curso-card:hover { transform: translateY(-4px); box-shadow: 0 15px 30px rgba(0, 74, 173, 0.08); border-color: #bfdbfe; }

.curso-card h4 { font-size: 1.15rem; color: #1e293b; font-weight: 800; margin: 0 0 10px 0; }
.curso-card p { color: #64748b; font-size: 0.85rem; line-height: 1.5; margin: 0 0 20px 0; min-height: 40px; }

.price-badge { position: absolute; top: 20px; left: 20px; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; }
.price-badge.free { background: #dcfce7; color: #166534; }
.price-badge.paid { background: #fee2e2; color: #991b1b; }

.curso-badge { position: absolute; top: 20px; right: 20px; background: #f1f5f9; color: #475569; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 800; }

.course-stats-row { display: flex; gap: 10px; align-items: center; margin-top: auto; flex-wrap: wrap; }
.stat-tag { display: inline-flex; align-items: center; gap: 6px; background: #f8fafc; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; color: #475569; font-weight: 700; border: 1px solid #e2e8f0; }
.stat-tag svg { color: #004aad; } 

.curso-footer { display: flex; gap: 8px; margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
.btn-action-outline { flex: 1; display: flex; align-items: center; justify-content: center; padding: 10px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; cursor: pointer; color: #64748b; transition: 0.2s; }
.btn-action-outline.edit:hover { color: #004aad; border-color: #bfdbfe; background: #eff6ff; }
.btn-action-outline.lib:hover { color: #10b981; border-color: #a7f3d0; background: #ecfdf5; } 
.btn-action-outline.del:hover { color: #ef4444; border-color: #fecaca; background: #fee2e2; }

.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-clamp: 2; }

/* =========================================
   MODAL (ESTILIZAÇÃO)
   ========================================= */
.modal-overlay { 
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
  background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; 
  z-index: 2000; backdrop-filter: blur(4px); 
}
.modal-content { max-width: 480px; width: 90%; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 8px; }
.modal-select {
  width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;
  color: #1e293b; font-size: 0.95rem; cursor: pointer; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 15px center; background-size: 18px; transition: all 0.2s;
}
.modal-select:focus { outline: none; border-color: #004aad; box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1); background-color: white; }
.modal-footer { margin-top: 30px; }
.btn-icon-close { background: none; border: none; cursor: pointer; color: #64748b; transition: 0.2s; }
.btn-icon-close:hover { color: #ef4444; transform: scale(1.1); }

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