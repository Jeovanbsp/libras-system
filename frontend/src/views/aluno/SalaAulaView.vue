<template>
  <StudentLayout 
    :pageTitle="curso ? curso.titulo : 'A carregar...'" 
    :pageDescription="curso ? `Nível: ${curso.nivel} | Carga Horária: ${curso.cargaHoraria}h` : ''"
  >
    
    <div class="classroom-layout" v-if="curso">
      
      <div class="player-section">
        
        <div class="progress-card glass-card mb-6">
          <div class="progress-header">
            <span class="progress-label">Progresso do Curso: {{ porcentagemProgresso }}%</span>
            <span class="progress-count">{{ textoContadorAtividades }}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: porcentagemProgresso + '%' }"></div>
          </div>
        </div>

        <div class="tabs-container">
          <button 
            :class="['tab-btn', { active: abaAtiva === 'conteudo' }]" 
            @click="abaAtiva = 'conteudo'"
          >
            <BookOpen :size="18" /> Conteúdo da Aula
          </button>
          <button 
            :class="['tab-btn', { active: abaAtiva === 'forum' }]" 
            @click="abaAtiva = 'forum'"
          >
            <MessageSquare :size="18" /> Fórum da Turma
          </button>
        </div>

        <div v-if="mensagemFeedback" :class="['feedback-toast', tipoFeedback]">
          <CheckCircle2 v-if="tipoFeedback === 'success'" :size="20" />
          <AlertCircle v-else :size="20" />
          <p>{{ mensagemFeedback }}</p>
        </div>

        <div v-if="abaAtiva === 'conteudo'" class="lesson-content">
          <div class="lesson-header glass-card mb-4">
            <h2>{{ aulaAtual.titulo || 'Selecione uma aula' }}</h2>
            <p v-if="aulaAtual.descricao" class="lesson-desc mt-2">{{ aulaAtual.descricao }}</p>
          </div>

          <div v-if="aulaAtual.materiais && aulaAtual.materiais.length > 0">
            <div 
              v-for="(mat, idx) in aulaAtual.materiais" 
              :key="mat._id || idx" 
              class="material-card glass-card mb-4"
            >
              <div class="material-header">
                <div class="material-title-box">
                  <Video v-if="mat.tipo === 'video'" :size="20" class="text-brand-color" />
                  <FileText v-else-if="mat.tipo === 'pdf'" :size="20" class="text-brand-color" />
                  <LinkIcon v-else-if="mat.tipo === 'link'" :size="20" class="text-brand-color" />
                  <AlignLeft v-else :size="20" class="text-brand-color" />
                  <h3>{{ mat.titulo || `Atividade ${idx + 1}` }}</h3>
                </div>
                
                <button 
                  :class="['btn-check-atividade', { done: estaConcluido(mat._id) }]"
                  @click="marcarMaterialConcluido(mat._id)"
                >
                  <CheckCircle2 :size="18" />
                  {{ estaConcluido(mat._id) ? 'Concluído' : 'Marcar como Feito' }}
                </button>
              </div>

              <div class="material-body">
                <div v-if="mat.tipo === 'video'" class="video-embed">
                  <iframe 
                    v-if="mat.url"
                    :src="obterUrlEmbed(mat.url)" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                  </iframe>
                  <div v-else class="empty-media">URL de vídeo inválida.</div>
                </div>

                <div v-else-if="mat.tipo === 'pdf'" class="pdf-box">
                  <p>Documento de apoio disponível para visualização e download.</p>
                  <a :href="obterUrlArquivo(mat.url)" target="_blank" class="btn-download" download>
                    <Download :size="18" /> Transferir PDF
                  </a>
                </div>

                <div v-else-if="mat.tipo === 'link'" class="link-box">
                  <p>Aceda ao link externo complementar:</p>
                  <a :href="mat.url" target="_blank" class="external-link">
                    {{ mat.url }} <ExternalLink :size="14" />
                  </a>
                </div>

                <div v-else-if="mat.tipo === 'texto'" class="text-box">
                  <p>{{ mat.url }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="glass-card empty-state">
            <Inbox :size="40" />
            <p>Não há materiais registados para esta aula.</p>
          </div>

          <div v-if="porcentagemProgresso === 100" class="certificate-banner mt-6">
            <div class="cert-content">
              <Trophy :size="48" class="trophy-icon" />
              <h3>Parabéns! Concluiu todas as atividades.</h3>
              <p>Clique no botão abaixo para solicitar o seu certificado oficial via WhatsApp.</p>
              <a :href="urlWhatsappCertificado" target="_blank" class="btn-whatsapp">
                <MessageCircle :size="22" /> Solicitar Certificado
              </a>
            </div>
          </div>
        </div>

        <div v-if="abaAtiva === 'forum'" class="forum-content glass-card">
          <div class="forum-header border-b pb-4 mb-4">
            <h3 class="font-bold text-lg flex items-center gap-2">
              <Users :size="20" class="text-brand-color" /> Fórum de Discussão
            </h3>
            <p class="text-sm text-gray-500">Tire dúvidas e interaja com os colegas da turma e com os professores.</p>
          </div>
          
          <div class="forum-messages">
            <div v-for="(msg, index) in mensagensForum" :key="index" class="message-card">
              <div class="msg-avatar">{{ msg.autor.charAt(0).toUpperCase() }}</div>
              <div class="msg-body">
                <div class="msg-info">
                  <strong>{{ msg.autor }}</strong> <span>{{ msg.data }}</span>
                </div>
                <p>{{ msg.texto }}</p>
              </div>
            </div>
            
            <div v-if="mensagensForum.length === 0" class="text-center py-8 text-gray-400">
              Seja o primeiro a enviar uma mensagem neste fórum!
            </div>
          </div>

          <form @submit.prevent="enviarMensagemForum" class="forum-input-area mt-4">
            <textarea v-model="novaMensagem" placeholder="Escreva a sua dúvida ou comentário..." rows="3" required></textarea>
            <button type="submit" class="btn-primary mt-2">Enviar Mensagem</button>
          </form>
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
                <CheckCircle2 v-if="aulaTotalmenteConcluida(aula)" :size="18" class="status-done" />
                <Circle v-else :size="18" class="status-pending" />
              </div>
              <div class="lesson-details">
                <span class="lesson-name">{{ aula.titulo }}</span>
                <div class="lesson-meta">
                  <span class="text-xs text-gray-400">{{ aula.materiais ? aula.materiais.length : 0 }} atividades</span>
                </div>
              </div>
            </div>
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
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  CheckCircle2, Circle, ListVideo, MessageCircle, FileText, Download, Trophy, 
  BookOpen, MessageSquare, Video, Link as LinkIcon, AlignLeft, ExternalLink, Inbox, Users, AlertCircle
} from 'lucide-vue-next';
import StudentLayout from '../../components/StudentLayout.vue';
import api from '../../services/api';

const route = useRoute();
const router = useRouter();

const curso = ref(null);
const aulaAtual = ref({ _id: '', titulo: '', descricao: '', materiais: [] });
const materiaisConcluidos = ref([]); 
const abaAtiva = ref('conteudo');

const novaMensagem = ref('');
const mensagensForum = ref([]);

// Sistema de Notificações
const mensagemFeedback = ref('');
const tipoFeedback = ref('');
const mostrarMensagem = (msg, tipo = 'success') => {
  mensagemFeedback.value = msg;
  tipoFeedback.value = tipo;
  setTimeout(() => { mensagemFeedback.value = ''; }, 4000);
};

const carregarDadosDoCurso = async () => {
  try {
    const cursoId = route.params.id;
    const [cursoRes, progressoRes] = await Promise.all([
      api.get(`/cursos/${cursoId}`),
      api.get('/cursos/progresso/aluno') 
    ]);

    curso.value = cursoRes.data;
    materiaisConcluidos.value = progressoRes.data || [];

    if (curso.value.modulos?.length > 0 && curso.value.modulos[0].aulas?.length > 0) {
      selecionarAula(curso.value.modulos[0].aulas[0]);
    }
  } catch (error) {
    console.error("Erro ao carregar curso:", error);
    if (!curso.value) router.push('/aluno/cursos');
  }
};

const carregarForum = async () => {
  try {
    const cursoId = route.params.id;
    const res = await api.get(`/cursos/${cursoId}/forum`);
    
    mensagensForum.value = res.data.map(m => ({
      autor: (m.autor?.nome || 'Utilizador') + (m.autor?.role !== 'aluno' ? ' (Professor)' : ''),
      data: new Date(m.dataCriacao).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' }),
      texto: m.texto
    }));
  } catch (error) {
    console.error('Erro ao carregar forum', error);
  }
};

const enviarMensagemForum = async () => {
  if (!novaMensagem.value.trim()) return;
  try {
    const cursoId = route.params.id;
    const res = await api.post(`/cursos/${cursoId}/forum`, { texto: novaMensagem.value });
    
    mensagensForum.value.push({
      autor: (res.data.autor?.nome || 'Você') + (res.data.autor?.role !== 'aluno' ? ' (Professor)' : ''),
      data: new Date(res.data.dataCriacao || Date.now()).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' }),
      texto: res.data.texto
    });
    
    novaMensagem.value = '';
    mostrarMensagem("Mensagem enviada no fórum.");
  } catch (error) {
    mostrarMensagem("Erro ao enviar mensagem.", "error");
  }
};

const idsMateriaisDesteCurso = computed(() => {
  if (!curso.value || !curso.value.modulos) return [];
  let ids = [];
  curso.value.modulos.forEach(m => {
    m.aulas.forEach(a => {
      if(a.materiais) {
        a.materiais.forEach(mat => {
          if (mat._id) ids.push(mat._id.toString());
        });
      }
    });
  });
  return ids;
});

const concluidosDesteCurso = computed(() => {
  return materiaisConcluidos.value.filter(id => idsMateriaisDesteCurso.value.includes(id.toString()));
});

const totalMateriais = computed(() => idsMateriaisDesteCurso.value.length);

const porcentagemProgresso = computed(() => {
  if (totalMateriais.value === 0) return 0;
  return Math.round((concluidosDesteCurso.value.length / totalMateriais.value) * 100);
});

const textoContadorAtividades = computed(() => {
  return `${concluidosDesteCurso.value.length} de ${totalMateriais.value} atividades`;
});

const estaConcluido = (matId) => {
  if (!matId) return false;
  return materiaisConcluidos.value.includes(matId.toString());
};

const aulaTotalmenteConcluida = (aula) => {
  if (!aula.materiais || aula.materiais.length === 0) return false;
  return aula.materiais.every(mat => estaConcluido(mat._id));
};

const marcarMaterialConcluido = async (matId) => {
  if (estaConcluido(matId)) return; 
  try {
    const res = await api.post('/cursos/concluir-aula', { materialId: matId });
    materiaisConcluidos.value = res.data.materiaisConcluidos;
  } catch (err) { console.error("Erro ao salvar progresso", err); }
};

const selecionarAula = (aula) => {
  aulaAtual.value = aula;
  abaAtiva.value = 'conteudo';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const obterUrlEmbed = (url) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?rel=0`;
  }
  return url;
};

const obterUrlArquivo = (nomeFicheiro) => {
  const baseUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:3000';
  return `${baseUrl}/uploads/materiais/${nomeFicheiro}`;
};

const urlWhatsappCertificado = computed(() => {
  const fone = "5571988361371";
  const texto = encodeURIComponent(`Olá! Concluí 100% das atividades do curso "${curso.value?.titulo}" e gostaria de solicitar o meu certificado.`);
  return `https://wa.me/${fone}?text=${texto}`;
});

onMounted(() => {
  carregarDadosDoCurso();
  carregarForum();
});
</script>

<style scoped>
.classroom-layout { display: grid; grid-template-columns: 1fr 350px; gap: 30px; align-items: start; }
.mb-6 { margin-bottom: 24px; }
.mb-4 { margin-bottom: 16px; }
.mt-6 { margin-top: 24px; }
.mt-4 { margin-top: 16px; }
.mt-2 { margin-top: 8px; }

/* FEEDBACK TOAST */
.feedback-toast {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 18px; border-radius: 12px;
  margin-bottom: 20px; font-weight: 700; font-size: 0.9rem;
  animation: slideDown 0.3s ease-out;
}
.feedback-toast.success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.feedback-toast.error { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Barra de Progresso */
.progress-card { padding: 20px; background: white; border-radius: 20px; }
.progress-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: 800; font-size: 0.85rem; color: #1e293b; }
.progress-track { height: 10px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
.progress-fill { height: 100%; background: #059669; transition: width 0.5s ease; }

/* Tabs de Navegação */
.tabs-container { display: flex; gap: 10px; margin-bottom: 20px; }
.tab-btn { flex: 1; padding: 14px; background: white; border: 1px solid #e2e8f0; border-radius: 14px; font-weight: 700; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
.tab-btn:hover { background: #f8fafc; color: #1e293b; }
.tab-btn.active { background: #004aad; color: white; border-color: #004aad; }

/* Cabeçalho da Aula */
.lesson-header h2 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0; }
.lesson-desc { font-size: 0.95rem; color: #475569; line-height: 1.5; }

/* Cartões de Material */
.material-card { padding: 20px; }
.material-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
.material-title-box { display: flex; align-items: center; gap: 10px; }
.material-title-box h3 { font-size: 1.1rem; font-weight: 800; margin: 0; color: #1e293b; }

.btn-check-atividade { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.2s; }
.btn-check-atividade:hover { background: #e2e8f0; color: #1e293b; }
.btn-check-atividade.done { background: #ecfdf5; color: #059669; border-color: #a7f3d0; cursor: default; }

/* Corpo dos Materiais */
.video-embed { aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; background: #0f172a; border: 1px solid #1e293b; }
.video-embed iframe { width: 100%; height: 100%; }
.empty-media { padding: 50px; text-align: center; color: white; opacity: 0.5; }

.pdf-box, .link-box, .text-box { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
.pdf-box p, .link-box p, .text-box p { margin: 0 0 15px 0; color: #475569; font-size: 0.95rem; }
.btn-download { display: inline-flex; align-items: center; gap: 8px; background: #004aad; color: white; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 0.85rem; transition: 0.2s; }
.btn-download:hover { background: #003580; }
.external-link { color: #004aad; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; word-break: break-all; }
.external-link:hover { text-decoration: underline; }

.empty-state { text-align: center; padding: 50px; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 15px; }

/* Fórum */
.forum-messages { display: flex; flex-direction: column; gap: 15px; max-height: 400px; overflow-y: auto; padding-right: 10px; }
.message-card { display: flex; gap: 15px; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; }
.msg-avatar { width: 40px; height: 40px; border-radius: 50%; background: #004aad; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0; }
.msg-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; font-size: 0.85rem; }
.msg-info span { color: #94a3b8; }
.msg-body p { margin: 0; color: #475569; font-size: 0.95rem; line-height: 1.4; }
.forum-input-area textarea { width: 100%; padding: 15px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; font-family: inherit; font-size: 0.95rem; resize: vertical; }
.forum-input-area textarea:focus { outline: none; border-color: #004aad; background: white; }

/* Banner de Certificado */
.certificate-banner { padding: 40px; background: #ecfdf5; border: 2px dashed #10b981; border-radius: 24px; text-align: center; animation: fadeIn 0.5s ease-out; }
.trophy-icon { color: #f59e0b; margin-bottom: 15px; display: inline-block; }
.cert-content h3 { color: #065f46; font-size: 1.4rem; font-weight: 800; margin-bottom: 10px; }
.cert-content p { color: #047857; font-size: 0.95rem; margin-bottom: 25px; }
.btn-whatsapp { display: inline-flex; align-items: center; gap: 10px; background: #25d366; color: white; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: 800; transition: 0.3s; box-shadow: 0 10px 20px rgba(37, 211, 102, 0.2); }
.btn-whatsapp:hover { background: #128c7e; transform: translateY(-3px); }

/* Playlist Lateral */
.playlist-section { max-height: 85vh; display: flex; flex-direction: column; padding: 0; overflow: hidden; background: white; border-radius: 20px; }
.playlist-header { padding: 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 10px; }
.playlist-title { font-weight: 800; font-size: 1rem; margin: 0; color: #1e293b; }
.modules-list { overflow-y: auto; flex: 1; }
.module-header { padding: 14px 20px; background: #f1f5f9; color: #475569; font-weight: 800; font-size: 0.7rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
.lesson-item { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #f8fafc; cursor: pointer; transition: 0.2s; }
.lesson-item:hover { background: #f8fafc; }
.lesson-item.active { background: #eff6ff; border-left: 4px solid #004aad; }
.status-done { color: #059669; }
.status-pending { color: #cbd5e1; }
.lesson-name { font-weight: 700; color: #1e293b; display: block; font-size: 0.9rem; }

.loading-state { text-align: center; padding: 100px; color: #64748b; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #004aad; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }

@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 1024px) {
  .classroom-layout { grid-template-columns: 1fr; }
  .playlist-section { max-height: none; }
}
</style>