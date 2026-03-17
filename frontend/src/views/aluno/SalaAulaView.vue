<template>
  <StudentLayout 
    :pageTitle="curso ? curso.titulo : 'Carregando...'" 
    :pageDescription="curso ? `Nível: ${curso.nivel} | Carga Horária: ${curso.cargaHoraria}h` : ''"
  >
    
    <div class="classroom-layout" v-if="curso">
      
      <div class="player-section">
        <div class="video-container glass-card">
          <iframe 
            v-if="aulaAtual.videoUrl"
            width="100%" 
            height="100%" 
            :src="getEmbedUrl(aulaAtual.videoUrl)" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen
          ></iframe>
          
          <div v-else class="video-placeholder">
            <span class="play-icon">🚫</span>
            <p>Nenhum vídeo cadastrado para esta aula.</p>
          </div>
        </div>

        <div class="lesson-info glass-card mt-6">
          <div class="lesson-header">
            <h2>{{ aulaAtual.titulo || 'Selecione uma aula' }}</h2>
            <button class="btn-complete" @click="marcarConcluida">
              <span class="check-icon">✔️</span> Marcar como Concluída
            </button>
          </div>
          <p class="lesson-desc">{{ curso.descricao }}</p>
        </div>
      </div>

      <div class="playlist-section glass-card">
        <h3 class="playlist-title">Conteúdo do Curso</h3>
        
        <div class="modules-list">
          <div v-for="(modulo, mIdx) in curso.modulos" :key="mIdx" class="module-group">
            <div class="module-header">{{ modulo.titulo }}</div>
            
            <div 
              v-for="(aula, aIdx) in modulo.aulas" 
              :key="aIdx"
              @click="selecionarAula(aula)"
              :class="['lesson-item', { 'active': aulaAtual.titulo === aula.titulo }]"
            >
              <div class="lesson-status">
                <span v-if="aula.concluida" class="status-done">✔️</span>
                <span v-else class="status-pending">⭕</span>
              </div>
              <div class="lesson-details">
                <span class="lesson-name">{{ aula.titulo }}</span>
                <span class="lesson-time" v-if="aula.duracao">{{ aula.duracao }} min</span>
              </div>
            </div>
          </div>

          <div v-if="!curso.modulos || curso.modulos.length === 0" class="empty-playlist">
            Nenhuma aula disponível.
          </div>
        </div>
      </div>

    </div>

    <div v-else class="loading-state">
      <div class="spinner"></div>
      <p>A carregar o seu ambiente de estudos...</p>
    </div>

  </StudentLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import StudentLayout from '../../components/StudentLayout.vue';
import api from '../../services/api';

const route = useRoute();
const router = useRouter();

const curso = ref(null);
const aulaAtual = ref({ titulo: '', videoUrl: '', descricao: '' });

const carregarDadosDoCurso = async () => {
  try {
    const cursoId = route.params.id;
    // Agora chama a nova rota do backend que busca o curso completo com módulos
    const res = await api.get(`/cursos/${cursoId}`);
    curso.value = res.data;

    // Define a primeira aula do primeiro módulo como a aula inicial
    if (curso.value.modulos?.length > 0 && curso.value.modulos[0].aulas?.length > 0) {
      aulaAtual.value = curso.value.modulos[0].aulas[0];
    }
  } catch (error) {
    console.error("Erro ao carregar o curso:", error);
    alert("Não foi possível carregar as aulas deste curso.");
    router.push('/aluno/cursos');
  }
};

// Função para transformar link normal do YouTube em link de Embed
const getEmbedUrl = (url) => {
  if (!url) return '';
  let videoId = '';
  if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
  else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1];
  
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
};

const selecionarAula = (aula) => {
  aulaAtual.value = aula;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const marcarConcluida = () => {
  alert("Aula marcada como concluída! Parabéns pelo progresso.");
  // Futuramente podemos enviar isso para o banco de dados
};

onMounted(carregarDadosDoCurso);
</script>

<style scoped>
/* ESTRUTURA E PLAYER */
.classroom-layout { display: grid; grid-template-columns: 1fr 350px; gap: 30px; align-items: start; }
.video-container { aspect-ratio: 16 / 9; background: #000; border-radius: 20px; overflow: hidden; }
.video-placeholder { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; gap: 10px; }
.play-icon { font-size: 3rem; }

/* PLAYLIST */
.playlist-section { max-height: 80vh; display: flex; flex-direction: column; }
.playlist-title { padding: 20px; font-weight: 800; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
.modules-list { overflow-y: auto; }
.module-header { padding: 12px 20px; background: #eff6ff; color: #1e40af; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }

.lesson-item { display: flex; align-items: center; gap: 12px; padding: 15px 20px; border-bottom: 1px solid #f8fafc; cursor: pointer; transition: 0.2s; }
.lesson-item:hover { background: #f8fafc; }
.lesson-item.active { background: #eff6ff; border-left: 4px solid #1e40af; }
.lesson-name { font-size: 0.9rem; font-weight: 600; color: #1e293b; }
.lesson-item.active .lesson-name { color: #1e40af; font-weight: 800; }

/* LOADING */
.loading-state { text-align: center; padding: 100px; color: #64748b; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #1e40af; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.mt-6 { margin-top: 24px; }
.btn-complete { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 10px 16px; border-radius: 12px; font-weight: 700; cursor: pointer; }

@media (max-width: 1024px) {
  .classroom-layout { grid-template-columns: 1fr; }
}
</style>