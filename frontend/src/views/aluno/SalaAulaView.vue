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
            <span class="progress-count">{{ materiaisConcluidos.length }} de {{ totalMateriais }} concluídos</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: porcentagemProgresso + '%' }"></div>
          </div>
        </div>

        <div class="tabs-container">
          <button :class="['tab-btn', { active: abaAtiva === 'conteudo' }]" @click="abaAtiva = 'conteudo'">
            <BookOpen :size="18" /> Conteúdo da Aula
          </button>
          <button :class="['tab-btn', { active: abaAtiva === 'forum' }]" @click="abaAtiva = 'forum'">
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
            <div v-for="(mat, idx) in aulaAtual.materiais" :key="mat._id || idx" class="material-card glass-card mb-4">
              <div class="material-header">
                <div class="material-title-box">
                  <Video v-if="mat.tipo === 'video'" :size="20" class="text-brand-color" />
                  <FileText v-else-if="mat.tipo === 'pdf'" :size="20" class="text-brand-color" />
                  <LinkIcon v-else-if="mat.tipo === 'link'" :size="20" class="text-brand-color" />
                  <AlignLeft v-else :size="20" class="text-brand-color" />
                  <h3>{{ mat.titulo || `Atividade ${idx + 1}` }}</h3>
                </div>
                
                <button :class="['btn-check-atividade', { done: estaConcluido(mat._id) }]" @click="marcarMaterialConcluido(mat._id)">
                  <CheckCircle2 :size="18" />
                  {{ estaConcluido(mat._id) ? 'Concluído' : 'Marcar como Feito' }}
                </button>
              </div>

              <div class="material-body">
                <div v-if="mat.tipo === 'video'" class="video-embed">
                  <iframe v-if="mat.url" :src="obterUrlEmbed(mat.url)" frameborder="0" allowfullscreen></iframe>
                  <div v-else class="empty-media">URL de vídeo inválida.</div>
                </div>

                <div v-else-if="mat.tipo === 'pdf'" class="pdf-box">
                  <p>Documento de apoio disponível.</p>
                  <a :href="obterUrlArquivo(mat.url)" target="_blank" class="btn-download">
                    <Download :size="18" /> Transferir PDF
                  </a>
                </div>

                <div v-else-if="mat.tipo === 'link'" class="link-box">
                  <a :href="mat.url" target="_blank" class="external-link">{{ mat.url }} <ExternalLink :size="14" /></a>
                </div>

                <div v-else-if="mat.tipo === 'texto'" class="text-box"><p>{{ mat.url }}</p></div>
              </div>
            </div>
          </div>

          <div v-if="porcentagemProgresso === 100" class="certificate-banner mt-6">
            <Trophy :size="48" class="trophy-icon" />
            <h3>Parabéns! Você concluiu todos os requisitos.</h3>
            <a :href="urlWhatsappCertificado" target="_blank" class="btn-whatsapp">
              <MessageCircle :size="22" /> Solicitar Certificado via WhatsApp
            </a>
          </div>
        </div>

        <div v-if="abaAtiva === 'forum'" class="forum-content glass-card chat-area">
          <header class="chat-header">
            <div class="chat-title">
              <h3>Fórum de Discussão</h3>
              <p>Tire dúvidas e interaja com a turma</p>
            </div>
          </header>

          <div class="messages-container" ref="messagesContainer">
            <div 
              v-for="(msg, index) in mensagensForum" 
              :key="msg._id || index" 
              :class="['message', msg.isMinhaMensagem ? 'sent' : 'received']"
            >
              <div class="msg-header">
                <div class="msg-meta">
                  <span class="msg-name">{{ msg.autor }}</span>
                  <span class="msg-time">{{ msg.data }}</span>
                </div>
                <div v-if="msg.isMinhaMensagem" class="msg-actions">
                  <button @click="deletarMensagem(msg._id, index)" class="btn-msg-action delete" title="Excluir">
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>

              <div class="msg-bubble">
                <p>{{ msg.texto }}</p>
                <div v-if="msg.imagem" class="attachment-box">
                  <a :href="obterUrlArquivoInteiro(msg.imagem)" target="_blank">
                    <img v-if="isImage(msg.imagem)" :src="obterUrlArquivoInteiro(msg.imagem)" alt="Anexo" class="attachment-image"/>
                    <div v-else class="btn-download-anexo">
                      <FileText :size="16" /> Abrir Anexo
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <footer class="chat-input-wrapper">
            <div v-if="anexoFile" class="attachment-preview">
              <span class="file-name">{{ anexoFile.name }}</span>
              <button @click="removerAnexo" type="button" class="btn-remove"><X :size="16" /></button>
            </div>

            <form @submit.prevent="enviarMensagemForum" class="input-form">
              <button type="button" class="btn-action btn-attach" @click="triggerFileInput">
                <Paperclip :size="22" />
              </button>
              <input type="file" ref="fileInputRef" class="hidden-input" @change="handleFileChange" accept="image/*,.pdf" />

              <textarea 
                v-model="novaMensagem" 
                placeholder="Escreva sua dúvida..." 
                rows="1" 
                @keydown.enter.exact.prevent="enviarMensagemForum" 
                class="message-input"
              ></textarea>

              <button type="submit" class="btn-action btn-send" :disabled="!novaMensagem.trim() && !anexoFile">
                <Send :size="22" />
              </button>
            </form>
          </footer>
        </div>
      </div>

      <aside class="playlist-section glass-card">
        <div class="playlist-header">
          <ListVideo :size="20" class="header-icon" />
          <h3 class="playlist-title">Conteúdo do Curso</h3>
        </div>
        <div class="modules-list">
          <div v-for="(modulo, mIdx) in curso.modulos" :key="mIdx" class="module-group">
            <div class="module-header">{{ modulo.titulo }}</div>
            <div 
              v-for="(aula, aIdx) in modulo.aulas" :key="aIdx"
              @click="selecionarAula(aula)"
              :class="['lesson-item', { 'active': aulaAtual._id === aula._id }]"
            >
              <CheckCircle2 v-if="aulaTotalmenteConcluida(aula)" :size="18" class="status-done" />
              <Circle v-else :size="18" class="status-pending" />
              <span class="lesson-name">{{ aula.titulo }}</span>
            </div>
          </div>
        </div>
      </aside>

    </div>

    <div v-else class="loading-state">
      <div class="spinner"></div>
      <p>A carregar o seu ambiente de estudos...</p>
    </div>
  </StudentLayout>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  CheckCircle2, Circle, ListVideo, MessageCircle, FileText, Download, Trophy, 
  BookOpen, MessageSquare, Video, Link as LinkIcon, AlignLeft, ExternalLink, Paperclip, Send, X, Trash2, AlertCircle
} from 'lucide-vue-next';
import StudentLayout from '../../components/StudentLayout.vue';
import api from '../../services/api';

const route = useRoute();
const router = useRouter();

// Refs
const curso = ref(null);
const aulaAtual = ref({ _id: '', titulo: '', descricao: '', materiais: [] });
const materiaisConcluidos = ref([]); 
const abaAtiva = ref('conteudo');
const novaMensagem = ref('');
const mensagensForum = ref([]);
const anexoFile = ref(null);
const fileInputRef = ref(null);
const messagesContainer = ref(null);
const userIdLocal = ref('');
const mensagemFeedback = ref('');
const tipoFeedback = ref('success');

// Métodos de Feedback
const mostrarMensagem = (msg, tipo = 'success') => {
  mensagemFeedback.value = msg;
  tipoFeedback.value = tipo;
  setTimeout(() => { mensagemFeedback.value = ''; }, 3000);
};

// Carregamento de Dados
const carregarDadosDoCurso = async () => {
  try {
    const cursoId = route.params.id;
    const [cursoRes, progressoRes, userRes] = await Promise.all([
      api.get(`/cursos/${cursoId}`),
      api.get('/cursos/progresso/aluno'),
      api.get('/auth/me')
    ]);

    curso.value = cursoRes.data;
    materiaisConcluidos.value = progressoRes.data || [];
    userIdLocal.value = userRes.data._id || userRes.data.id;

    if (curso.value.modulos?.[0]?.aulas?.[0]) {
      selecionarAula(curso.value.modulos[0].aulas[0]);
    }
    carregarForum();
  } catch (error) {
    console.error("Erro ao carregar curso:", error);
    router.push('/aluno/cursos');
  }
};

const carregarForum = async () => {
  try {
    const res = await api.get(`/cursos/${route.params.id}/forum`);
    mensagensForum.value = res.data.map(formatarMensagem);
    scrollToBottom();
  } catch (error) { console.error(error); }
};

const formatarMensagem = (m) => ({
  _id: m._id,
  autor: m.autor?.nome || 'Usuário',
  isMinhaMensagem: (m.autor?._id === userIdLocal.value) || (m.autor === userIdLocal.value),
  data: new Date(m.dataCriacao).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  texto: m.texto,
  imagem: m.imagem
});

// Ações do Fórum
const enviarMensagemForum = async () => {
  if (!novaMensagem.value.trim() && !anexoFile.value) return;
  const formData = new FormData();
  formData.append('texto', novaMensagem.value);
  if (anexoFile.value) formData.append('anexo', anexoFile.value);

  try {
    const res = await api.post(`/cursos/${route.params.id}/forum`, formData);
    mensagensForum.value.push(formatarMensagem(res.data));
    novaMensagem.value = '';
    removerAnexo();
    scrollToBottom();
  } catch (error) { mostrarMensagem("Erro ao enviar mensagem.", "error"); }
};

const deletarMensagem = async (msgId, index) => {
  if (!confirm("Deseja realmente excluir esta mensagem?")) return;
  try {
    await api.delete(`/cursos/forum/mensagem/${msgId}`);
    mensagensForum.value.splice(index, 1);
    mostrarMensagem("Mensagem removida com sucesso.");
  } catch (error) { mostrarMensagem("Erro ao excluir mensagem.", "error"); }
};

// Manipulação de Arquivos e URLs
const triggerFileInput = () => fileInputRef.value.click();
const handleFileChange = (e) => { anexoFile.value = e.target.files[0]; };
const removerAnexo = () => { anexoFile.value = null; if (fileInputRef.value) fileInputRef.value.value = ''; };
const isImage = (url) => url && /\.(jpg|jpeg|png|gif)$/i.test(url);

const obterUrlArquivoInteiro = (caminho) => {
  if (!caminho) return '#';
  const baseUrl = api.defaults.baseURL.replace('/api', '');
  const cleanPath = caminho.startsWith('/') ? caminho : `/${caminho}`;
  return `${baseUrl}${cleanPath}`;
};

const obterUrlArquivo = (file) => {
  return obterUrlArquivoInteiro(`/uploads/materiais/${file}`);
};

const obterUrlEmbed = (url) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0` : url;
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Progresso e Seleção de Aula
const selecionarAula = (aula) => { 
  aulaAtual.value = aula; 
  window.scrollTo({ top: 0, behavior: 'smooth' }); 
};

const estaConcluido = (id) => materiaisConcluidos.value.includes(id?.toString());

const aulaTotalmenteConcluida = (aula) => {
  if (!aula.materiais || aula.materiais.length === 0) return false;
  return aula.materiais.every(m => estaConcluido(m._id));
};

const marcarMaterialConcluido = async (id) => {
  if (estaConcluido(id)) return;
  try {
    const res = await api.post('/cursos/concluir-aula', { materialId: id });
    materiaisConcluidos.value = res.data.materiaisConcluidos;
    mostrarMensagem("Atividade concluída!");
  } catch (err) { 
    console.error(err);
    mostrarMensagem("Erro ao salvar progresso.", "error");
  }
};

// Computed Properties
const totalMateriais = computed(() => {
  if (!curso.value) return 0;
  return curso.value.modulos.reduce((acc, m) => {
    return acc + (m.aulas.reduce((a, l) => a + (l.materiais?.length || 0), 0));
  }, 0);
});

const porcentagemProgresso = computed(() => {
  if (totalMateriais.value === 0) return 0;
  // Filtramos os materiais concluídos que pertencem a este curso específico
  const concluidosDesteCurso = materiaisConcluidos.value.filter(id => {
    return curso.value.modulos.some(m => 
      m.aulas.some(l => l.materiais.some(mat => mat._id === id))
    );
  });
  return Math.round((concluidosDesteCurso.length / totalMateriais.value) * 100);
});

const urlWhatsappCertificado = computed(() => {
  const texto = encodeURIComponent(`Olá! Concluí o curso "${curso.value?.titulo}" e gostaria de solicitar meu certificado.`);
  return `https://wa.me/5571988361371?text=${texto}`;
});

onMounted(carregarDadosDoCurso);
</script>

<style scoped>
/* ESTRUTURA PRINCIPAL */
.classroom-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.glass-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* PROGRESSO */
.progress-card { padding: 16px 24px; }
.progress-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
.progress-label { font-weight: 700; color: #1e293b; font-size: 0.9rem; }
.progress-count { font-size: 0.85rem; color: #64748b; }
.progress-track { height: 10px; background: #f1f5f9; border-radius: 20px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #004aad, #00c6ff); transition: width 0.5s ease; }

/* TABS */
.tabs-container { display: flex; gap: 12px; margin-bottom: 20px; }
.tab-btn {
  display: flex; align-items: center; gap: 8px; padding: 12px 20px;
  border: none; background: #f1f5f9; color: #64748b; border-radius: 10px;
  font-weight: 600; cursor: pointer; transition: 0.3s;
}
.tab-btn.active { background: #004aad; color: white; box-shadow: 0 4px 12px rgba(0, 74, 173, 0.2); }

/* CONTEÚDO */
.lesson-header h2 { font-size: 1.5rem; color: #0f172a; margin: 0; }
.lesson-desc { color: #64748b; line-height: 1.6; }
.material-card { border-left: 5px solid #004aad; }
.material-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.material-title-box { display: flex; align-items: center; gap: 10px; }
.material-title-box h3 { font-size: 1.1rem; margin: 0; color: #1e293b; }

.btn-check-atividade {
  display: flex; align-items: center; gap: 6px; padding: 8px 16px;
  border-radius: 8px; border: 1px solid #e2e8f0; background: white;
  color: #64748b; cursor: pointer; font-size: 0.85rem; font-weight: 600;
}
.btn-check-atividade.done { background: #ecfdf5; border-color: #10b981; color: #059669; }

/* MEDIA */
.video-embed { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; background: #000; }
.video-embed iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.pdf-box, .link-box, .text-box { background: #f8fafc; padding: 15px; border-radius: 10px; }
.btn-download {
  display: inline-flex; align-items: center; gap: 8px; background: #004aad;
  color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 10px;
}

/* FÓRUM (CHAT) */
.chat-area { display: flex; flex-direction: column; height: 600px; padding: 0; overflow: hidden; }
.chat-header { padding: 15px 20px; border-bottom: 1px solid #e2e8f0; background: white; }
.messages-container { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; background: #f8fafc; }
.message { max-width: 80%; display: flex; flex-direction: column; }
.message.sent { align-self: flex-end; }
.message.received { align-self: flex-start; }

.msg-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.msg-meta { display: flex; gap: 8px; align-items: center; }
.msg-name { font-size: 0.75rem; font-weight: 700; color: #475569; }
.msg-time { font-size: 0.7rem; color: #94a3b8; }
.msg-actions { opacity: 0; transition: 0.2s; }
.message:hover .msg-actions { opacity: 1; }
.btn-msg-action { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 2px; }
.btn-msg-action.delete:hover { color: #ef4444; }

.msg-bubble { padding: 12px 16px; border-radius: 14px; font-size: 0.95rem; line-height: 1.4; }
.sent .msg-bubble { background: #004aad; color: white; border-bottom-right-radius: 2px; }
.received .msg-bubble { background: white; color: #1e293b; border-bottom-left-radius: 2px; border: 1px solid #e2e8f0; }

.attachment-image { max-width: 100%; border-radius: 8px; margin-top: 8px; display: block; }

.chat-input-wrapper { padding: 15px; background: white; border-top: 1px solid #e2e8f0; }
.input-form { display: flex; gap: 10px; align-items: center; }
.message-input { flex: 1; border: 1px solid #e2e8f0; border-radius: 20px; padding: 10px 15px; resize: none; outline: none; }
.btn-action { background: none; border: none; color: #64748b; cursor: pointer; display: flex; align-items: center; }
.btn-send { color: #004aad; }
.btn-send:disabled { color: #cbd5e1; }
.hidden-input { display: none; }
.attachment-preview { background: #f1f5f9; padding: 5px 12px; border-radius: 8px; display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.8rem; }

/* PLAYLIST */
.playlist-section { height: fit-content; position: sticky; top: 24px; }
.playlist-header { display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; }
.playlist-title { font-size: 1.1rem; margin: 0; }
.module-header { background: #f1f5f9; padding: 6px 10px; font-size: 0.75rem; font-weight: 700; color: #475569; border-radius: 4px; margin: 15px 0 5px 0; }
.lesson-item { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
.lesson-item:hover { background: #f8fafc; }
.lesson-item.active { background: #e0e7ff; color: #004aad; }
.status-done { color: #10b981; }
.status-pending { color: #cbd5e1; }
.lesson-name { font-size: 0.85rem; font-weight: 500; }

/* CERTIFICADO */
.certificate-banner { 
  background: #fffbeb; border: 2px dashed #f59e0b; border-radius: 16px; padding: 25px; 
  text-align: center; display: flex; flex-direction: column; align-items: center; gap: 15px;
}
.trophy-icon { color: #f59e0b; }
.btn-whatsapp { 
  background: #25d366; color: white; padding: 12px 20px; border-radius: 10px; 
  text-decoration: none; font-weight: 700; display: flex; align-items: center; gap: 8px; 
}

/* LOADING */
.loading-state { text-align: center; padding: 100px 20px; color: #64748b; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #004aad; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* FEEDBACK */
.feedback-toast { position: fixed; top: 20px; right: 20px; padding: 12px 20px; border-radius: 8px; color: white; display: flex; align-items: center; gap: 10px; z-index: 2000; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.feedback-toast.success { background: #10b981; }
.feedback-toast.error { background: #ef4444; }

/* RESPONSIVIDADE */
@media (max-width: 1024px) {
  .classroom-layout { grid-template-columns: 1fr; }
  .playlist-section { position: static; order: -1; margin-bottom: 20px; }
}
@media (max-width: 640px) {
  .material-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .btn-check-atividade { width: 100%; justify-content: center; }
}
</style>