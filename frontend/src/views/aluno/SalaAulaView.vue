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
              :key="index" 
              :class="['message', msg.isMinhaMensagem ? 'sent' : 'received']"
            >
              <div class="msg-header">
                <span class="msg-name">{{ msg.autor }}</span>
                <span class="msg-time">{{ msg.data }}</span>
              </div>
              <div class="msg-bubble">
                <p>{{ msg.texto }}</p>
                <div v-if="msg.imagem" class="attachment-box">
                  <a :href="obterUrlArquivoInteiro(msg.imagem)" target="_blank">
                    <img v-if="isImage(msg.imagem)" :src="obterUrlArquivoInteiro(msg.imagem)" alt="Anexo" class="attachment-image"/>
                    <div v-else class="btn-download-anexo">
                      <FileText :size="16" /> Abrir Anexo PDF
                    </div>
                  </a>
                </div>
              </div>
            </div>
            
            <div v-if="mensagensForum.length === 0" class="empty-state">
              <MessageSquare :size="40" />
              <p>Seja o primeiro a enviar uma dúvida!</p>
            </div>
          </div>

          <footer class="chat-input-wrapper">
            <div v-if="anexoFile" class="attachment-preview">
              <div class="preview-info">
                <Paperclip :size="16" />
                <span class="file-name">{{ anexoFile.name }}</span>
              </div>
              <button @click="removerAnexo" type="button" class="btn-remove" title="Remover anexo">
                <X :size="16" />
              </button>
            </div>

            <form @submit.prevent="enviarMensagemForum" class="input-form">
              <button type="button" class="btn-action btn-attach" @click="triggerFileInput" title="Anexar foto ou arquivo">
                <Paperclip :size="22" />
              </button>
              <input 
                type="file" 
                ref="fileInputRef" 
                class="hidden-input" 
                @change="handleFileChange"
                accept="image/*,.pdf,.doc,.docx"
              />

              <textarea 
                v-model="novaMensagem" 
                placeholder="Escreva a sua dúvida aqui..." 
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
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  CheckCircle2, Circle, ListVideo, MessageCircle, FileText, Download, Trophy, 
  BookOpen, MessageSquare, Video, Link as LinkIcon, AlignLeft, ExternalLink, Inbox, AlertCircle, Paperclip, Send, X
} from 'lucide-vue-next';
import StudentLayout from '../../components/StudentLayout.vue';
import api from '../../services/api';

const route = useRoute();
const router = useRouter();

const curso = ref(null);
const aulaAtual = ref({ _id: '', titulo: '', descricao: '', materiais: [] });
const materiaisConcluidos = ref([]); 
const abaAtiva = ref('conteudo');

// Estado do Fórum
const novaMensagem = ref('');
const mensagensForum = ref([]);
const anexoFile = ref(null);
const fileInputRef = ref(null);
const messagesContainer = ref(null);

const userIdLocal = ref(''); // Para saber qual é a mensagem "minha"

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
    const [cursoRes, progressoRes, userRes] = await Promise.all([
      api.get(`/cursos/${cursoId}`),
      api.get('/cursos/progresso/aluno'),
      api.get('/auth/me') // Para pegar o ID do aluno logado
    ]);

    curso.value = cursoRes.data;
    materiaisConcluidos.value = progressoRes.data || [];
    userIdLocal.value = userRes.data._id || userRes.data.id;

    if (curso.value.modulos?.length > 0 && curso.value.modulos[0].aulas?.length > 0) {
      selecionarAula(curso.value.modulos[0].aulas[0]);
    }
  } catch (error) {
    console.error("Erro ao carregar curso:", error);
    if (!curso.value) router.push('/aluno/cursos');
  }
};

// ==========================================
// FUNÇÕES DO FÓRUM 
// ==========================================
const triggerFileInput = () => { fileInputRef.value.click(); };

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) anexoFile.value = file;
};

const removerAnexo = () => {
  anexoFile.value = null;
  fileInputRef.value.value = ''; 
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const carregarForum = async () => {
  try {
    const cursoId = route.params.id;
    const res = await api.get(`/cursos/${cursoId}/forum`);
    
    mensagensForum.value = res.data.map(m => ({
      _id: m._id,
      autorId: m.autor?._id || m.autor,
      autor: (m.autor?.nome || 'Utilizador') + (m.autor?.role !== 'aluno' ? ' (Professor)' : ''),
      isMinhaMensagem: (m.autor?._id === userIdLocal.value) || (m.autor === userIdLocal.value),
      data: new Date(m.dataCriacao).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' }),
      texto: m.texto,
      imagem: m.imagem
    }));
    scrollToBottom();
  } catch (error) {
    console.error('Erro ao carregar forum', error);
  }
};

const enviarMensagemForum = async () => {
  if (!novaMensagem.value.trim() && !anexoFile.value) return;
  
  const formData = new FormData();
  formData.append('texto', novaMensagem.value);
  if (anexoFile.value) formData.append('anexo', anexoFile.value);

  try {
    const cursoId = route.params.id;
    const res = await api.post(`/cursos/${cursoId}/forum`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    mensagensForum.value.push({
      _id: res.data._id,
      autor: (res.data.autor?.nome || 'Você') + (res.data.autor?.role !== 'aluno' ? ' (Professor)' : ''),
      isMinhaMensagem: true,
      data: new Date(res.data.dataCriacao || Date.now()).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' }),
      texto: res.data.texto,
      imagem: res.data.imagem
    });
    
    novaMensagem.value = '';
    removerAnexo();
    scrollToBottom();
  } catch (error) {
    mostrarMensagem("Erro ao enviar mensagem.", "error");
  }
};

const isImage = (url) => {
  if(!url) return false;
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
};

// ==========================================
// FUNÇÕES DO CURSO
// ==========================================
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

// Ajuste na função para lidar com o fato de a imagem já vir com barra no BD
const obterUrlArquivoInteiro = (caminho) => {
  if(!caminho) return '#';
  const baseUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:3000';
  // Verifica se o caminho já começa com barra
  if (caminho.startsWith('/')) {
     return `${baseUrl}${caminho}`;
  }
  return `${baseUrl}/${caminho}`;
};

const obterUrlArquivo = (nomeFicheiro) => {
  return obterUrlArquivoInteiro(`/uploads/materiais/${nomeFicheiro}`);
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

/* =========================================
   ESTILOS DO FÓRUM (CHAT)
   ========================================= */
.chat-area { display: flex; flex-direction: column; height: calc(100vh - 200px); min-height: 500px; padding: 0; overflow: hidden; }
.chat-header { padding: 20px; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
.chat-title h3 { margin: 0 0 5px 0; font-size: 1.1rem; color: #0f172a; }
.chat-title p { margin: 0; font-size: 0.85rem; color: #64748b; }

.messages-container { flex: 1; overflow-y: auto; padding: 20px; background: #ffffff; display: flex; flex-direction: column; gap: 16px; }

.message { max-width: 85%; display: flex; flex-direction: column; }
.message.received { align-self: flex-start; }
.message.sent { align-self: flex-end; }

.msg-header { display: flex; gap: 10px; margin-bottom: 6px; font-size: 0.8rem; }
.message.received .msg-header { flex-direction: row; }
.message.sent .msg-header { flex-direction: row-reverse; }

.msg-name { font-weight: 700; color: #475569; }
.msg-time { color: #94a3b8; }

.msg-bubble { padding: 14px 18px; border-radius: 16px; font-size: 0.95rem; line-height: 1.5; box-shadow: 0 2px 5px rgba(0,0,0,0.02); word-wrap: break-word; }
.message.received .msg-bubble { background: #f8fafc; color: #1e293b; border: 1px solid #e2e8f0; border-top-left-radius: 4px; }
.message.sent .msg-bubble { background: #004aad; color: #ffffff; border-top-right-radius: 4px; }
.msg-bubble p { margin: 0; }

.attachment-box { margin-top: 10px; background: rgba(255,255,255,0.1); padding: 5px; border-radius: 8px;}
.attachment-image { max-width: 100%; border-radius: 8px; display: block; }
.btn-download-anexo { display: inline-flex; align-items: center; gap: 5px; color: inherit; font-weight: bold; text-decoration: underline; }

.chat-input-wrapper { padding: 20px; background: #ffffff; border-top: 1px solid #f1f5f9; }

.attachment-preview { display: flex; justify-content: space-between; align-items: center; background: #eff6ff; padding: 10px 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #bfdbfe; }
.preview-info { display: flex; align-items: center; gap: 10px; color: #1e40af; font-weight: 600; font-size: 0.9rem;}
.btn-remove { background: none; border: none; color: #ef4444; cursor: pointer; display: flex; align-items: center;}

.input-form { display: flex; align-items: flex-end; gap: 12px; background: #f8fafc; padding: 8px 12px; border-radius: 20px; border: 1px solid #e2e8f0; transition: all 0.3s ease; }
.input-form:focus-within { border-color: #004aad; background: #ffffff; box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1); }

.hidden-input { display: none; }

.message-input { flex: 1; background: transparent; border: none; resize: none; padding: 10px 0; font-family: inherit; font-size: 1rem; color: #1e293b; max-height: 120px; outline: none; }

.btn-action { background: none; border: none; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; cursor: pointer; transition: all 0.2s; }
.btn-attach { color: #64748b; }
.btn-attach:hover { background: #e2e8f0; color: #0f172a; }

.btn-send { background: #004aad; color: white; }
.btn-send:hover:not(:disabled) { background: #003a8c; transform: scale(1.05); }
.btn-send:disabled { background: #cbd5e1; cursor: not-allowed; }

.loading-state { text-align: center; padding: 100px; color: #64748b; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #004aad; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }

@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 1024px) {
  .classroom-layout { grid-template-columns: 1fr; }
  .playlist-section { max-height: none; }
}
</style>