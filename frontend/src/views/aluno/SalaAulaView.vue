<template>
  <StudentLayout 
    :pageTitle="curso ? curso.titulo : 'Carregando...'" 
    :pageDescription="curso ? `Nível: ${curso.nivel} | Carga Horária: ${curso.cargaHoraria}h` : ''"
  >
    
    <div class="classroom-layout" v-if="curso">
      
      <div class="player-section">
        <div class="progress-card glass-card mb-6">
          <div class="progress-header">
            <span class="progress-label">Progresso do Curso: {{ porcentagemProgresso }}%</span>
            <span class="progress-count">{{ textoContadorAulas }}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: porcentagemProgresso + '%' }"></div>
          </div>
        </div>

        <div class="video-container glass-card">
          <div id="youtube-player"></div>
          <div v-if="!aulaAtual.videoUrl" class="video-placeholder">
            <VideoOff :size="48" class="placeholder-icon" />
            <p>Nenhum vídeo disponível para esta aula.</p>
          </div>
        </div>

        <div class="lesson-info glass-card mt-6">
          <div class="lesson-header">
            <h2>{{ aulaAtual.titulo || 'Selecione uma aula' }}</h2>
            
            <button 
              class="btn-complete" 
              @click="marcarConcluida(aulaAtual._id)"
              :disabled="estaConcluida(aulaAtual._id) || !videoAssistido"
              :title="!videoAssistido ? 'Assista ao vídeo completo para liberar' : ''"
            >
              <CheckCircle2 :size="18" class="btn-icon" /> 
              <span v-if="estaConcluida(aulaAtual._id)">Aula Concluída</span>
              <span v-else-if="!videoAssistido">Assista para Concluir</span>
              <span v-else>Marcar como Concluída</span>
            </button>
          </div>

          <div v-if="aulaAtual.material" class="material-download-box">
            <div class="material-info">
              <FileText :size="24" class="text-brand-color" />
              <div>
                <span class="material-title">Material Complementar</span>
                <span class="material-sub">PDF/Apostila disponível para download</span>
              </div>
            </div>
            <a :href="`http://localhost:3000/uploads/materiais/${aulaAtual.material}`" 
               target="_blank" 
               class="btn-dl-material"
               download>
              <Download :size="18" /> Baixar PDF
            </a>
          </div>

          <p class="lesson-desc">{{ curso.descricao }}</p>

          <div v-if="porcentagemProgresso === 100" class="certificate-banner">
            <div class="cert-content">
              <Trophy :size="48" class="trophy-icon" />
              <h3>Parabéns! Você concluiu todas as aulas.</h3>
              <p>Clique no botão abaixo para solicitar seu certificado oficial via WhatsApp.</p>
              <a :href="urlWhatsappCertificado" target="_blank" class="btn-whatsapp">
                <MessageCircle :size="22" /> Solicitar Certificado agora
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="playlist-section glass-card">
        <div class="playlist-header">
          <ListVideo :size="20" class="header-icon" />
          <h3 class="playlist-title">Conteúdo do Curso</h3>
        </div>
        
        <div class="modules-list">
          <div v-for="(modulo, mIdx) in curso.modulos" :key="mIdx" class="module-group">
            <div class="module-header">{{ modulo.titulo }}</div>
            
            <div 
              v-for="(aula, aIdx) in modulo.aulas" 
              :key="aIdx"
              @click="selecionarAula(aula)"
              :class="['lesson-item', { 'active': aulaAtual._id === aula._id }]"
            >
              <div class="lesson-status">
                <CheckCircle2 v-if="estaConcluida(aula._id)" :size="18" class="status-done" />
                <Circle v-else :size="18" class="status-pending" />
              </div>
              <div class="lesson-details">
                <span class="lesson-name">{{ aula.titulo }}</span>
                <div class="lesson-meta" v-if="aula.duracao">
                  <Clock :size="12" />
                  <span>{{ aula.duracao }} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div v-else class="loading-state">
      <div class="spinner"></div>
      <p>Carregando o seu ambiente de estudos...</p>
    </div>

  </StudentLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  VideoOff, CheckCircle2, Circle, Clock, ListVideo, 
  MessageCircle, FileText, Download, Trophy 
} from 'lucide-vue-next';
import StudentLayout from '../../components/StudentLayout.vue';
import api from '../../services/api';

const route = useRoute();
const router = useRouter();

const curso = ref(null);
const aulaAtual = ref({ _id: '', titulo: '', videoUrl: '', material: '', descricao: '' });
const aulasConcluidas = ref([]);
const player = ref(null);
const videoAssistido = ref(false);

const carregarDadosDoCurso = async () => {
  try {
    const cursoId = route.params.id;
    const [cursoRes, progressoRes] = await Promise.all([
      api.get(`/cursos/${cursoId}`),
      api.get('/cursos/progresso/aluno') 
    ]);

    curso.value = cursoRes.data;
    aulasConcluidas.value = progressoRes.data || [];

    if (curso.value.modulos?.length > 0 && curso.value.modulos[0].aulas?.length > 0) {
      selecionarAula(curso.value.modulos[0].aulas[0]);
    }
  } catch (error) {
    console.error("Erro ao carregar curso:", error);
    if (!curso.value) router.push('/aluno/cursos');
  }
};

// LÓGICA DE PROGRESSO ISOLADO POR CURSO
const aulasConcluidasDesteCurso = computed(() => {
  if (!curso.value || !curso.value.modulos) return [];
  const idsDesteCurso = curso.value.modulos.flatMap(m => m.aulas.map(a => a._id.toString()));
  return aulasConcluidas.value.filter(id => idsDesteCurso.includes(id.toString()));
});

const totalAulas = computed(() => {
  if (!curso.value || !curso.value.modulos) return 0;
  return curso.value.modulos.reduce((acc, mod) => acc + (mod.aulas ? mod.aulas.length : 0), 0);
});

const porcentagemProgresso = computed(() => {
  if (totalAulas.value === 0) return 0;
  return Math.round((aulasConcluidasDesteCurso.value.length / totalAulas.value) * 100);
});

const textoContadorAulas = computed(() => {
  return `${aulasConcluidasDesteCurso.value.length} de ${totalAulas.value} aulas`;
});

// YOUTUBE PLAYER API
const inicializarPlayer = () => {
  const videoId = extrairVideoID(aulaAtual.value.videoUrl);
  if (!videoId) return;

  if (player.value && typeof player.value.destroy === 'function') {
    player.value.destroy();
  }

  player.value = new window.YT.Player('youtube-player', {
    height: '100%',
    width: '100%',
    videoId: videoId,
    playerVars: { 'rel': 0, 'modestbranding': 1 },
    events: {
      'onStateChange': (event) => {
        if (event.data === window.YT.PlayerState.ENDED) {
          videoAssistido.value = true;
        }
      }
    }
  });
};

const extrairVideoID = (url) => {
  if (!url) return null;
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n]+)/);
  return match ? match[1] : null;
};

const carregarScriptYoutube = () => {
  if (!window.YT) {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => inicializarPlayer();
  } else {
    inicializarPlayer();
  }
};

const selecionarAula = (aula) => {
  aulaAtual.value = aula;
  videoAssistido.value = false;
  if (window.YT) inicializarPlayer();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const marcarConcluida = async (aulaId) => {
  try {
    const res = await api.post('/cursos/concluir-aula', { aulaId });
    aulasConcluidas.value = res.data.aulasConcluidas;
  } catch (err) { console.error("Erro ao salvar progresso", err); }
};

const estaConcluida = (id) => aulasConcluidas.value.includes(id);

const urlWhatsappCertificado = computed(() => {
  const fone = "5571988361371";
  const texto = encodeURIComponent(`Olá! Concluí 100% das aulas do curso "${curso.value?.titulo}" e gostaria de solicitar meu certificado.`);
  return `https://wa.me/${fone}?text=${texto}`;
});

onMounted(() => {
  carregarDadosDoCurso();
  carregarScriptYoutube();
});
</script>

<style scoped>
.classroom-layout { display: grid; grid-template-columns: 1fr 380px; gap: 30px; align-items: start; }
.mb-6 { margin-bottom: 24px; }
.mt-6 { margin-top: 24px; }

/* Barra de Progresso */
.progress-card { padding: 20px; background: white; border-radius: 20px; }
.progress-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: 800; font-size: 0.85rem; color: #1e293b; }
.progress-track { height: 10px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
.progress-fill { height: 100%; background: #059669; transition: width 0.5s ease; }

/* Video Player */
.video-container { aspect-ratio: 16 / 9; background: #0f172a; border-radius: 20px; overflow: hidden; border: 1px solid #1e293b; }
#youtube-player { width: 100%; height: 100%; }

/* Material de Apoio */
.material-download-box { display: flex; justify-content: space-between; align-items: center; background: #f0f7ff; padding: 20px; border-radius: 15px; border: 1px solid #cfe2ff; margin: 20px 0; }
.material-info { display: flex; align-items: center; gap: 12px; }
.material-title { display: block; font-weight: 800; font-size: 0.95rem; color: #004aad; }
.material-sub { display: block; font-size: 0.75rem; color: #64748b; }
.btn-dl-material { background: #004aad; color: white; text-decoration: none; padding: 12px 20px; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px; font-size: 0.85rem; transition: 0.2s; }
.btn-dl-material:hover { background: #003580; }

/* Lesson Header & Buttons */
.lesson-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; gap: 15px; flex-wrap: wrap; }
.lesson-header h2 { font-size: 1.5rem; color: #0f172a; font-weight: 800; }
.btn-complete { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
.btn-complete:disabled { background: #f1f5f9; color: #94a3b8; border-color: #e2e8f0; cursor: not-allowed; }

/* Banner de Certificado Finalizado */
.certificate-banner { margin-top: 30px; padding: 40px; background: #ecfdf5; border: 2px dashed #10b981; border-radius: 24px; text-align: center; animation: fadeIn 0.5s ease-out; }
.trophy-icon { color: #f59e0b; margin-bottom: 15px; }
.cert-content h3 { color: #065f46; font-size: 1.4rem; font-weight: 800; margin-bottom: 10px; }
.cert-content p { color: #047857; font-size: 0.95rem; margin-bottom: 25px; }
.btn-whatsapp { display: inline-flex; align-items: center; gap: 10px; background: #25d366; color: white; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: 800; transition: 0.3s; box-shadow: 0 10px 20px rgba(37, 211, 102, 0.2); }
.btn-whatsapp:hover { background: #128c7e; transform: translateY(-3px); }

/* Playlist Lateral */
.playlist-section { max-height: 85vh; display: flex; flex-direction: column; padding: 0; overflow: hidden; background: white; border-radius: 20px; }
.modules-list { overflow-y: auto; flex: 1; }
.module-header { padding: 14px 20px; background: #f1f5f9; color: #475569; font-weight: 800; font-size: 0.7rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
.lesson-item { display: flex; align-items: flex-start; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #f8fafc; cursor: pointer; transition: 0.2s; }
.lesson-item:hover { background: #f8fafc; }
.lesson-item.active { background: #eff6ff; border-left: 4px solid #004aad; }
.status-done { color: #059669; }
.status-pending { color: #cbd5e1; }

.loading-state { text-align: center; padding: 100px; color: #64748b; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #004aad; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }

@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 1024px) {
  .classroom-layout { grid-template-columns: 1fr; }
  .playlist-section { max-height: none; }
}
</style>