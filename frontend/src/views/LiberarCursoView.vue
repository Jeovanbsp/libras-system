<template>
  <MainLayout pageTitle="Liberação de Acessos" pageDescription="Libere manualmente cursos pagos para alunos após a confirmação do pagamento.">
    <div class="admin-release-container">
      
      <div class="glass-card release-form">
        <h3 class="form-title">
          <Key :size="20" class="text-brand-color" /> Liberar Novo Curso
        </h3>

        <form @submit.prevent="liberarAcesso" class="modern-form">
          <div class="form-group">
            <label>Selecione o Aluno</label>
            <div class="select-wrapper">
              <User :size="18" class="select-icon" />
              <select v-model="form.alunoId" required>
                <option value="" disabled>Escolha um aluno na lista...</option>
                <option v-for="aluno in alunos" :key="aluno._id" :value="aluno._id">
                  {{ aluno.nome }} ({{ aluno.email }})
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Selecione o Curso</label>
            <div class="select-wrapper">
              <BookOpen :size="18" class="select-icon" />
              <select v-model="form.cursoId" required>
                <option value="" disabled>Escolha o curso para liberar...</option>
                <option v-for="curso in cursos" :key="curso._id" :value="curso._id">
                  {{ curso.titulo }} - {{ curso.gratuito ? 'Gratuito' : 'R$ ' + curso.valor }}
                </option>
              </select>
            </div>
          </div>

          <div class="info-alert">
            <Info :size="16" />
            <span>Ao clicar em liberar, o curso aparecerá instantaneamente na área "Meus Cursos" do aluno.</span>
          </div>

          <button type="submit" class="btn-primary" :disabled="loading">
            <CheckCircle2 v-if="!loading" :size="18" />
            <span v-else class="spinner-mini"></span>
            {{ loading ? 'Processando...' : 'Confirmar Liberação' }}
          </button>
        </form>
      </div>

      <div class="helper-text">
        <ShieldCheck :size="16" />
        <span>Apenas administradores podem realizar esta operação.</span>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Key, User, BookOpen, Info, CheckCircle2, ShieldCheck } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const alunos = ref([]);
const cursos = ref([]);
const loading = ref(false);

const form = ref({
  alunoId: '',
  cursoId: ''
});

const carregarDados = async () => {
  try {
    // Busca alunos e cursos simultaneamente
    const [resAlunos, resCursos] = await Promise.all([
      api.get('/admin/alunos'),
      api.get('/cursos')
    ]);
    alunos.value = resAlunos.data;
    cursos.value = resCursos.data;
  } catch (error) {
    console.error("Erro ao carregar dados para liberação:", error);
  }
};

const liberarAcesso = async () => {
  if (!form.value.alunoId || !form.value.cursoId) return;
  
  loading.value = true;
  try {
    const res = await api.post('/admin/liberar-curso', form.value);
    alert(res.data.message || "Curso liberado com sucesso!");
    
    // Limpa o formulário após sucesso
    form.value.alunoId = '';
    form.value.cursoId = '';
  } catch (error) {
    alert(error.response?.data?.message || "Erro ao liberar curso. Verifique se o aluno já possui o curso.");
  } finally {
    loading.value = false;
  }
};

onMounted(carregarDados);
</script>

<style scoped>
.admin-release-container { max-width: 600px; margin: 0 auto; padding-top: 20px; }
.glass-card { background: white; padding: 40px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05); }

.form-title { margin-bottom: 30px; color: #1e293b; font-size: 1.2rem; font-weight: 800; display: flex; align-items: center; gap: 12px; }
.text-brand-color { color: #004aad; }

.modern-form label { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }

.select-wrapper { position: relative; display: flex; align-items: center; margin-bottom: 25px; }
.select-icon { position: absolute; left: 15px; color: #94a3b8; pointer-events: none; }

.modern-form select { 
  width: 100%; padding: 14px 14px 14px 45px; border: 1px solid #e2e8f0; border-radius: 12px; 
  background: #f8fafc; font-size: 0.95rem; color: #1e293b; appearance: none; cursor: pointer;
}
.modern-form select:focus { outline: none; border-color: #004aad; box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1); background: white; }

.info-alert { display: flex; align-items: flex-start; gap: 10px; background: #eff6ff; color: #1e40af; padding: 15px; border-radius: 12px; font-size: 0.85rem; line-height: 1.4; margin-bottom: 30px; }

.btn-primary { 
  width: 100%; background: #004aad; color: white; border: none; padding: 16px; border-radius: 14px; 
  font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s;
}
.btn-primary:hover:not(:disabled) { background: #003a8c; transform: translateY(-2px); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

.helper-text { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 25px; color: #94a3b8; font-size: 0.8rem; font-weight: 600; }

.spinner-mini { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
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