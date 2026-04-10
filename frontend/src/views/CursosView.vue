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
            <textarea v-model="curso.descricao" rows="3" placeholder="Detalhes do curso..." required></textarea>
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
                  <Trash2 :size="18" />
                </button>
              </div>

              <div class="lessons-container">
                <div v-for="(aula, aIdx) in mod.aulas" :key="aIdx" class="lesson-admin-card">
                  <div class="lesson-input-row">
                    <input v-model="aula.titulo" placeholder="Nome da Aula" style="font-weight: 700;" />
                    <button type="button" @click="removerAula(mIdx, aIdx)" class="btn-icon-del-mini" title="Remover Aula">
                      <X :size="16" />
                    </button>
                  </div>
                  
                  <div class="lesson-input-row mt-2" style="gap: 5px;">
                    <input v-model.number="aula.duracao" type="number" placeholder="Duração (min)" style="flex: 0.3;" />
                    <input v-model="aula.descricao" placeholder="Descrição curta (opcional)" style="flex: 1;" />
                  </div>

                  <div class="materials-box mt-3">
                    <label class="text-xs text-brand-color font-bold mb-2 block border-b pb-1">Atividades / Materiais desta Aula:</label>
                    
                    <div v-for="(mat, matIdx) in aula.materiais" :key="matIdx" class="material-row mb-2">
                      <select v-model="mat.tipo" class="material-select">
                        <option value="video">Vídeo (YouTube)</option>
                        <option value="link">Link Externo</option>
                        <option value="pdf">Arquivo PDF</option>
                        <option value="texto">Texto de Apoio</option>
                      </select>
                      <input v-model="mat.titulo" placeholder="Título da Atividade" class="material-input" />
                      
                      <div v-if="mat.tipo === 'pdf'" class="upload-mini">
                         <label class="btn-upload-mini">
                            <FileUp :size="14" /> {{ mat.url ? 'Troc..' : 'Subir' }}
                            <input type="file" @change="uploadMaterialMultiplo($event, mIdx, aIdx, matIdx)" hidden accept=".pdf,.zip,.docx" />
                         </label>
                         <span v-if="mat.url" class="text-xs text-green-600 block w-full truncate ml-1">✓ OK</span>
                      </div>
                      <input v-else v-model="mat.url" :placeholder="mat.tipo === 'texto' ? 'Escreva o texto aqui...' : 'URL / Link'" class="material-input" style="flex: 1.5;" />
                      
                      <button type="button" @click="removerMaterial(mIdx, aIdx, matIdx)" class="btn-icon-del-micro" title="Remover Material">
                        <Trash2 :size="14" />
                      </button>
                    </div>

                    <button type="button" @click="adicionarMaterial(mIdx, aIdx)" class="btn-add-micro mt-2">
                      + Adicionar Atividade/Material
                    </button>
                  </div>
                </div>
                <button type="button" @click="adicionarAula(mIdx)" class="btn-add-lesson">
                    + Adicionar Aula neste Módulo
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
          <div class="curso-badge">{{ c.nivel ? c.nivel.charAt(0).toUpperCase() + c.nivel.slice(1) : 'Curso' }}</div>
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

// ESTRUTURA INICIAL ATUALIZADA
const cursoInicial = { 
  titulo: '', descricao: '', cargaHoraria: 0, nivel: 'curso', gratuito: true, valor: 0,
  modulos: [{ 
    titulo: '', 
    aulas: [{ 
      titulo: '', duracao: null, descricao: '',
      materiais: [{ titulo: 'Vídeo da Aula', tipo: 'video', url: '' }] 
    }] 
  }]
};

const curso = ref(JSON.parse(JSON.stringify(cursoInicial)));

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

const uploadMaterialMultiplo = async (event, mIdx, aIdx, matIdx) => {
  const file = event.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await api.post('/admin/upload-material', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    // Salva o nome do arquivo gerado no campo URL do material específico
    curso.value.modulos[mIdx].aulas[aIdx].materiais[matIdx].url = res.data.fileName;
  } catch (err) { alert("Erro no upload do arquivo."); }
};

const salvarCurso = async () => {
  try {
    let payload = JSON.parse(JSON.stringify(curso.value));
    
    if (payload.gratuito) payload.valor = 0;

    if (payload.modulos && payload.modulos.length > 0) {
      payload.modulos = payload.modulos
        .filter(mod => mod.titulo && mod.titulo.trim() !== '')
        .map(mod => {
          if (mod.aulas && mod.aulas.length > 0) {
             mod.aulas = mod.aulas.filter(aula => aula.titulo && aula.titulo.trim() !== '');
             // Limpar materiais vazios antes de salvar
             mod.aulas.forEach(aula => {
                if(aula.materiais) {
                   aula.materiais = aula.materiais.filter(mat => mat.titulo && mat.url);
                }
             });
          }
          return mod;
        });
    }

    if (editandoId.value) {
      await api.put(`/cursos/${editandoId.value}`, payload);
    } else {
      await api.post('/cursos', payload);
    }
    
    cancelarEdicao(); 
    buscarCursos(); 
    alert("Salvo com sucesso!");
  } catch (err) { 
    console.error("Erro completo:", err.response?.data);
    alert("Erro ao salvar. Verifique se os títulos e URLs estão preenchidos."); 
  }
};

const prepararEdicao = (c) => { 
  editandoId.value = c._id; 
  curso.value = JSON.parse(JSON.stringify(c)); 
  // Garante que cursos antigos sem array de materiais não quebrem a tela
  curso.value.modulos.forEach(m => {
     m.aulas.forEach(a => {
        if (!a.materiais) a.materiais = [];
     });
  });
  window.scrollTo({ top: 0, behavior: 'smooth' }); 
};

const cancelarEdicao = () => { editandoId.value = null; curso.value = JSON.parse(JSON.stringify(cursoInicial)); };

const removerCurso = async (id) => { 
  if(confirm("Deseja remover este curso permanentemente?")) { 
    try { await api.delete(`/cursos/${id}`); buscarCursos(); } catch (err) { alert("Erro ao excluir."); } 
  } 
};

const adicionarModulo = () => { 
  curso.value.modulos.push({ 
    titulo: '', 
    aulas: [{ titulo: '', duracao: null, descricao: '', materiais: [{ titulo: 'Vídeo da Aula', tipo: 'video', url: '' }] }] 
  }); 
};
const removerModulo = (idx) => { curso.value.modulos.splice(idx, 1); };

const adicionarAula = (mIdx) => { 
  curso.value.modulos[mIdx].aulas.push({ 
    titulo: '', duracao: null, descricao: '', materiais: [{ titulo: 'Atividade 1', tipo: 'video', url: '' }] 
  }); 
};
const removerAula = (mIdx, aIdx) => { curso.value.modulos[mIdx].aulas.splice(aIdx, 1); };

const adicionarMaterial = (mIdx, aIdx) => {
  curso.value.modulos[mIdx].aulas[aIdx].materiais.push({ titulo: '', tipo: 'video', url: '' });
};
const removerMaterial = (mIdx, aIdx, matIdx) => {
  curso.value.modulos[mIdx].aulas[aIdx].materiais.splice(matIdx, 1);
};

onMounted(() => {
  buscarCursos();
  buscarAlunos();
});
</script>

<style scoped>
/* =========================================
   BASE E ESTRUTURA
   ========================================= */
.layout-split { display: grid; grid-template-columns: 480px 1fr; gap: 30px; align-items: start; } /* Aumentei a coluna esq */
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
   MÓDULOS E AULAS
   ========================================= */
.module-item { background: #f8fafc; padding: 18px; border-radius: 16px; margin-bottom: 18px; border: 1px solid #e2e8f0; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.section-header h4 { margin: 0; font-size: 1rem; color: #1e293b; font-weight: 800; }

.btn-add-small {
  background: #eff6ff; color: #004aad; border: 1px solid #bfdbfe; padding: 8px 14px;
  border-radius: 8px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center;
  gap: 6px; cursor: pointer; transition: all 0.2s ease;
}
.btn-add-small:hover { background: #004aad; color: white; border-color: #004aad; transform: translateY(-1px); }

.module-input-row { display: flex; gap: 12px; align-items: stretch; margin-bottom: 15px; }
.mod-title-input { 
  flex: 1; font-weight: 700 !important; color: #004aad !important; 
  border-color: #bfdbfe !important; background: white !important; 
}

.btn-icon-del {
  background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; border-radius: 12px; 
  padding: 0 15px; display: flex; align-items: center; justify-content: center; 
  cursor: pointer; transition: all 0.2s; flex-shrink: 0;
}
.btn-icon-del:hover { background: #ef4444; color: white; }

.lesson-admin-card { background: white; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 15px; margin-bottom: 12px; }
.lesson-input-row { display: flex; gap: 10px; align-items: stretch; }
.lesson-input-row input { flex: 1; margin: 0 !important; padding: 10px !important; font-size: 0.85rem !important; border-radius: 8px !important;}

.btn-icon-del-mini {
  background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; border-radius: 8px; 
  padding: 0 10px; display: flex; align-items: center; justify-content: center; 
  cursor: pointer; transition: all 0.2s; flex-shrink: 0;
}
.btn-icon-del-mini:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }

.btn-add-lesson {
  width: 100%; background: transparent; color: #64748b; border: 1px dashed #cbd5e1; padding: 12px;
  border-radius: 10px; font-size: 0.8rem; font-weight: 700; cursor: pointer; margin-top: 5px; transition: all 0.2s;
}
.btn-add-lesson:hover { background: #f8fafc; color: #004aad; border-color: #94a3b8; }

/* ESTILOS DOS MATERIAIS (NOVO) */
.materials-box { background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
.material-row { display: flex; gap: 8px; align-items: center; }
.material-select { flex: 0.8; padding: 8px !important; font-size: 0.75rem !important; border-radius: 6px !important; }
.material-input { flex: 1; padding: 8px !important; font-size: 0.75rem !important; border-radius: 6px !important; margin: 0 !important;}

.btn-icon-del-micro { background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px; }
.btn-icon-del-micro:hover { background: #fee2e2; border-radius: 4px; }
.btn-add-micro { background: none; border: none; color: #004aad; font-size: 0.75rem; font-weight: 700; cursor: pointer; padding: 4px 0; text-align: left; width: 100%;}
.btn-add-micro:hover { text-decoration: underline; }

.upload-mini { flex: 1.5; display: flex; align-items: center; }
.btn-upload-mini { background: #e2e8f0; color: #475569; font-size: 0.7rem; font-weight: bold; padding: 6px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; border: 1px solid #cbd5e1; }
.btn-upload-mini:hover { background: #cbd5e1; }

/* =========================================
   CARDS DOS CURSOS
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

/* MODAL */
.modal-overlay { 
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
  background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; 
  z-index: 2000; backdrop-filter: blur(4px); 
}
.modal-content { max-width: 480px; width: 90%; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 8px; }
.modal-select { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc; color: #1e293b; font-size: 0.95rem; cursor: pointer; }
.modal-footer { margin-top: 30px; }
.btn-icon-close { background: none; border: none; cursor: pointer; color: #64748b; transition: 0.2s; }
.btn-icon-close:hover { color: #ef4444; transform: scale(1.1); }

@media (max-width: 992px) {
  .layout-split { grid-template-columns: 1fr; gap: 20px; }
  .form-row { flex-direction: column; gap: 15px; }
  .material-row { flex-direction: column; align-items: stretch;}
  .btn-icon-del-micro { align-self: flex-end;}
}
</style>