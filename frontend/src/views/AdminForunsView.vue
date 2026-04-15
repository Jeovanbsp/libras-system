<template>
  <MainLayout pageTitle="Fórum dos Cursos" pageDescription="Central de dúvidas e interação com os alunos.">
    <div class="forum-container">
      
      <aside class="forum-sidebar glass-card">
        <div class="sidebar-header">
          <h3>Cursos Ativos</h3>
        </div>
        <div class="curso-list">
          <div v-if="cursos.length === 0" class="empty-sidebar">
            <p>Nenhum curso encontrado.</p>
          </div>
          <div 
            v-for="curso in cursos" 
            :key="curso._id" 
            :class="['curso-item', { active: cursoSelecionado && cursoSelecionado._id === curso._id }]"
            @click="selecionarCurso(curso)"
          >
            <div class="curso-avatar">
              <BookOpen :size="20" />
            </div>
            <div class="curso-info">
              <h4>{{ curso.titulo }}</h4>
              <p>{{ curso.nivel || 'Sem nível' }}</p>
            </div>
          </div>
        </div>
      </aside>

      <main class="chat-area glass-card">
        
        <div v-if="!cursoSelecionado" class="empty-chat">
          <MessageSquare :size="48" />
          <h3>Selecione um curso</h3>
          <p>Escolha um curso na lista lateral para ver as mensagens do fórum.</p>
        </div>

        <template v-else>
          <header class="chat-header">
            <div class="chat-title">
              <h3>{{ cursoSelecionado.titulo }}</h3>
              <p>{{ mensagens.length }} mensagen{{ mensagens.length === 1 ? '' : 's' }} no fórum</p>
            </div>
            <button class="btn-refresh" @click="carregarMensagens" title="Atualizar mensagens">
              <RefreshCw :size="18" />
            </button>
          </header>

          <div class="messages-container" ref="messagesContainer">
            
            <div v-if="carregandoMensagens" class="loading-state">
              <div class="spinner"></div>
              <p>A carregar mensagens...</p>
            </div>

            <div v-else-if="mensagens.length === 0" class="empty-state">
              <MessageSquare :size="40" />
              <p>Nenhuma mensagem neste fórum ainda.</p>
            </div>

            <div 
              v-else
              v-for="msg in mensagens" 
              :key="msg._id" 
              :class="['message', msg.isMinha ? 'sent' : 'received']"
            >
              <div class="msg-header">
                <span class="msg-name">{{ msg.autorNome }} <span v-if="msg.autorRole !== 'aluno'" class="role-badge">({{ msg.autorRole === 'admin' ? 'Admin' : 'Prof.' }})</span><span v-else class="role-badge aluno">(Aluno)</span></span>
                <span class="msg-time">{{ msg.dataFormatada }}</span>
              </div>
              <div class="msg-bubble">
                <p v-if="editandoId !== msg._id">{{ msg.texto }}</p>
                <div v-else class="edit-inline">
                  <textarea v-model="textoEditando" rows="2" class="edit-input"></textarea>
                  <div class="edit-actions">
                    <button @click="salvarEdicao(msg._id)" class="btn-save-edit">Salvar</button>
                    <button @click="cancelarEdicao" class="btn-cancel-edit">Cancelar</button>
                  </div>
                </div>
                <span v-if="msg.editada && editandoId !== msg._id" class="edited-label">(editada)</span>
                
                <div v-if="msg.imagem" class="attachment-box">
                  <a :href="obterUrlArquivo(msg.imagem)" target="_blank">
                    <img v-if="isImage(msg.imagem)" :src="obterUrlArquivo(msg.imagem)" alt="Anexo" class="attachment-image"/>
                    <div v-else class="btn-download-anexo">
                      <FileText :size="16" /> Abrir Anexo
                    </div>
                  </a>
                </div>
              </div>
              <div class="msg-actions" v-if="editandoId !== msg._id">
                <button v-if="msg.isMinha || userRole === 'admin'" @click="iniciarEdicao(msg)" class="btn-msg-action" title="Editar">
                  <Pencil :size="14" />
                </button>
                <button v-if="msg.isMinha || userRole === 'admin'" @click="excluirMensagem(msg._id)" class="btn-msg-action btn-danger" title="Excluir">
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>

          </div>

          <footer class="chat-input-wrapper">
            
            <div v-if="anexoFile" class="attachment-preview">
              <div class="preview-info">
                <Paperclip :size="16" />
                <span class="file-name">{{ anexoFile.name }}</span>
              </div>
              <button @click="removerAnexo" class="btn-remove" title="Remover anexo">
                <X :size="16" />
              </button>
            </div>

            <form @submit.prevent="enviarMensagem" class="input-form">
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
                v-model="textoMensagem" 
                placeholder="Digite sua resposta aqui..." 
                rows="1"
                @keydown.enter.exact.prevent="enviarMensagem"
                class="message-input"
              ></textarea>

              <button type="submit" class="btn-action btn-send" :disabled="!textoMensagem.trim() && !anexoFile">
                <Send :size="22" />
              </button>
            </form>
            <div class="input-hint">Pressione <strong>Enter</strong> para enviar e <strong>Shift + Enter</strong> para pular linha.</div>
          </footer>
        </template>

      </main>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { BookOpen, Paperclip, Send, X, MessageSquare, RefreshCw, Pencil, Trash2, FileText } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const cursos = ref([]);
const cursoSelecionado = ref(null);
const mensagens = ref([]);
const carregandoMensagens = ref(false);
const textoMensagem = ref('');
const anexoFile = ref(null);
const fileInputRef = ref(null);
const messagesContainer = ref(null);

const editandoId = ref(null);
const textoEditando = ref('');

const userId = localStorage.getItem('userId') || '';
const userRole = localStorage.getItem('userRole') || '';

const carregarCursos = async () => {
  try {
    const res = await api.get('/cursos');
    cursos.value = res.data;
    if (cursos.value.length > 0) {
      selecionarCurso(cursos.value[0]);
    }
  } catch (error) {
    console.error('Erro ao carregar cursos:', error);
  }
};

const selecionarCurso = async (curso) => {
  cursoSelecionado.value = curso;
  await carregarMensagens();
};

const carregarMensagens = async () => {
  if (!cursoSelecionado.value) return;
  carregandoMensagens.value = true;
  try {
    const res = await api.get(`/cursos/${cursoSelecionado.value._id}/forum`);
    mensagens.value = res.data.map(m => ({
      _id: m._id,
      autorId: m.autor?._id || m.autor,
      autorNome: m.autor?.nome || 'Utilizador',
      autorRole: m.autor?.role || 'aluno',
      isMinha: (m.autor?._id === userId) || (m.autor === userId),
      dataFormatada: new Date(m.dataCriacao).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' }),
      texto: m.texto,
      imagem: m.imagem,
      editada: m.editada || false
    }));
    scrollToBottom();
  } catch (error) {
    console.error('Erro ao carregar mensagens:', error);
  } finally {
    carregandoMensagens.value = false;
  }
};

const enviarMensagem = async () => {
  if (!textoMensagem.value.trim() && !anexoFile.value) return;
  if (!cursoSelecionado.value) return;

  const formData = new FormData();
  formData.append('texto', textoMensagem.value);
  if (anexoFile.value) {
    formData.append('anexo', anexoFile.value);
  }

  try {
    const res = await api.post(`/cursos/${cursoSelecionado.value._id}/forum`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    mensagens.value.push({
      _id: res.data._id,
      autorId: res.data.autor?._id || userId,
      autorNome: res.data.autor?.nome || localStorage.getItem('userName') || 'Você',
      autorRole: res.data.autor?.role || userRole,
      isMinha: true,
      dataFormatada: new Date(res.data.dataCriacao || Date.now()).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' }),
      texto: res.data.texto,
      imagem: res.data.imagem,
      editada: false
    });

    textoMensagem.value = '';
    removerAnexo();
    scrollToBottom();
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    alert('Falha ao enviar mensagem. Tente novamente.');
  }
};

const iniciarEdicao = (msg) => {
  editandoId.value = msg._id;
  textoEditando.value = msg.texto;
};

const cancelarEdicao = () => {
  editandoId.value = null;
  textoEditando.value = '';
};

const salvarEdicao = async (mensagemId) => {
  if (!textoEditando.value.trim()) return;
  try {
    await api.put(`/cursos/forum/mensagem/${mensagemId}`, { texto: textoEditando.value });
    const msg = mensagens.value.find(m => m._id === mensagemId);
    if (msg) {
      msg.texto = textoEditando.value;
      msg.editada = true;
    }
    cancelarEdicao();
  } catch (error) {
    console.error('Erro ao editar mensagem:', error);
    alert('Falha ao editar mensagem.');
  }
};

const excluirMensagem = async (mensagemId) => {
  if (!confirm('Tem certeza que deseja excluir esta mensagem?')) return;
  try {
    await api.delete(`/cursos/forum/mensagem/${mensagemId}`);
    mensagens.value = mensagens.value.filter(m => m._id !== mensagemId);
  } catch (error) {
    console.error('Erro ao excluir mensagem:', error);
    alert('Falha ao excluir mensagem.');
  }
};

const triggerFileInput = () => {
  fileInputRef.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo é muito grande. O limite é 5MB.');
      return;
    }
    anexoFile.value = file;
  }
};

const removerAnexo = () => {
  anexoFile.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const obterUrlArquivo = (caminho) => {
  if (!caminho) return '#';
  const baseUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:3000';
  if (caminho.startsWith('/')) {
    return `${baseUrl}${caminho}`;
  }
  return `${baseUrl}/${caminho}`;
};

const isImage = (url) => {
  if (!url) return false;
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
};

onMounted(() => {
  carregarCursos();
});
</script>

<style scoped>
/* ESTRUTURA GERAL */
.forum-container {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  height: calc(100vh - 140px);
  min-height: 600px;
}

.glass-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* SIDEBAR */
.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}
.sidebar-header h3 { margin: 0; font-size: 1.1rem; color: #1e293b; font-weight: 700; }

.curso-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.empty-sidebar {
  padding: 20px;
  text-align: center;
  color: #94a3b8;
}

.curso-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 5px;
}
.curso-item:hover { background: #f1f5f9; }
.curso-item.active { background: #eff6ff; border-left: 4px solid #004aad; }

.curso-avatar {
  width: 40px; height: 40px;
  background: #dbeafe; color: #004aad;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.curso-info { overflow: hidden; }
.curso-info h4 { margin: 0 0 4px 0; font-size: 0.95rem; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.curso-info p { margin: 0; font-size: 0.8rem; color: #64748b; }

/* CHAT AREA */
.empty-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  gap: 12px;
}
.empty-chat h3 { margin: 0; color: #64748b; }
.empty-chat p { margin: 0; }

.chat-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.chat-title h3 { margin: 0 0 5px 0; font-size: 1.2rem; color: #0f172a; }
.chat-title p { margin: 0; font-size: 0.85rem; color: #64748b; }

.btn-refresh {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  color: #64748b;
  transition: 0.2s;
}
.btn-refresh:hover { background: #e2e8f0; color: #004aad; }

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading-state, .empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  gap: 12px;
}

.spinner {
  width: 32px; height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #004aad;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.message { max-width: 75%; display: flex; flex-direction: column; position: relative; }
.message.received { align-self: flex-start; }
.message.sent { align-self: flex-end; }

.msg-header {
  display: flex; gap: 10px; margin-bottom: 6px; font-size: 0.8rem;
}
.message.sent .msg-header { flex-direction: row-reverse; }

.msg-name { font-weight: 700; color: #475569; }
.msg-time { color: #94a3b8; }

.role-badge { font-weight: 500; color: #004aad; font-size: 0.75rem; }
.role-badge.aluno { color: #059669; }

.msg-bubble {
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 0.95rem;
  line-height: 1.5;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
}
.message.received .msg-bubble {
  background: #ffffff;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  border-top-left-radius: 4px;
}
.message.sent .msg-bubble {
  background: #004aad;
  color: #ffffff;
  border-top-right-radius: 4px;
}

.edited-label { font-size: 0.7rem; opacity: 0.7; font-style: italic; }

/* MSG ACTIONS */
.msg-actions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}
.message:hover .msg-actions { opacity: 1; }
.message.sent .msg-actions { align-self: flex-end; }

.btn-msg-action {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  transition: 0.2s;
}
.btn-msg-action:hover { background: #e2e8f0; color: #004aad; }
.btn-msg-action.btn-danger:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca; }

/* EDIT INLINE */
.edit-inline { display: flex; flex-direction: column; gap: 8px; }
.edit-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  color: #1e293b;
}
.edit-actions { display: flex; gap: 8px; }
.btn-save-edit {
  background: #004aad; color: white; border: none;
  padding: 4px 12px; border-radius: 6px; cursor: pointer;
  font-size: 0.8rem;
}
.btn-cancel-edit {
  background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0;
  padding: 4px 12px; border-radius: 6px; cursor: pointer;
  font-size: 0.8rem;
}

/* IMAGENS NO CHAT */
.attachment-box { 
  margin-top: 10px; 
  background: rgba(0,0,0,0.05); 
  border-radius: 8px;
  overflow: hidden;
}
.attachment-image { 
  display: block;
  max-width: 100%; 
  max-height: 250px;
  object-fit: contain;
}
.btn-download-anexo {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px;
  color: #004aad;
  font-weight: 600;
  font-size: 0.85rem;
}

/* INPUT */
.chat-input-wrapper {
  padding: 20px 24px;
  background: #ffffff;
}

.attachment-preview {
  display: flex; justify-content: space-between; align-items: center;
  background: #eff6ff; padding: 10px 15px;
  border-radius: 8px; margin-bottom: 10px;
  border: 1px solid #bfdbfe;
}
.preview-info { display: flex; align-items: center; gap: 10px; color: #1e40af; font-weight: 600; font-size: 0.9rem;}
.btn-remove { background: none; border: none; color: #ef4444; cursor: pointer; }

.input-form {
  display: flex; align-items: flex-end; gap: 12px;
  background: #f8fafc; padding: 8px 12px;
  border-radius: 20px; border: 1px solid #e2e8f0;
}

.message-input {
  flex: 1; background: transparent; border: none;
  resize: none; padding: 10px 0; outline: none;
  font-family: inherit; font-size: 1rem;
}

.hidden-input { display: none; }

.btn-action {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; border: none; transition: 0.2s;
}
.btn-attach { background: transparent; color: #64748b; }
.btn-attach:hover { color: #004aad; }
.btn-send { background: #004aad; color: white; }
.btn-send:disabled { background: #cbd5e1; }

.input-hint { text-align: center; font-size: 0.75rem; color: #94a3b8; margin-top: 10px; }

@media (max-width: 992px) {
  .forum-container { grid-template-columns: 1fr; }
  .forum-sidebar { display: none; }
}
</style>
