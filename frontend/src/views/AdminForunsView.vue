<template>
  <MainLayout pageTitle="Fórum dos Cursos" pageDescription="Central de dúvidas e interação com os alunos.">
    <div class="forum-container">
      
      <aside class="forum-sidebar glass-card">
        <div class="sidebar-header">
          <h3>Cursos Ativos</h3>
        </div>
        <div class="curso-list">
          <div class="curso-item active">
            <div class="curso-avatar">
              <BookOpen :size="20" />
            </div>
            <div class="curso-info">
              <h4>Libras Básico - Turma A</h4>
              <p>Última msg: 10 min atrás</p>
            </div>
            <div class="unread-badge">2</div>
          </div>
          
          <div class="curso-item">
            <div class="curso-avatar">
              <BookOpen :size="20" />
            </div>
            <div class="curso-info">
              <h4>Libras Intermediário</h4>
              <p>Nenhuma nova</p>
            </div>
          </div>
        </div>
      </aside>

      <main class="chat-area glass-card">
        
        <header class="chat-header">
          <div class="chat-title">
            <h3>Libras Básico - Turma A</h3>
            <p>Dúvidas em aberto</p>
          </div>
        </header>

        <div class="messages-container" ref="messagesContainer">
          
          <div class="message received">
            <div class="msg-header">
              <span class="msg-name">João Silva (Aluno)</span>
              <span class="msg-time">10:30</span>
            </div>
            <div class="msg-bubble">
              <p>Professor, fiquei com dúvida no sinal de "Trabalho" mostrado na aula 2. Pode explicar de novo?</p>
            </div>
          </div>

          <div class="message sent">
            <div class="msg-header">
              <span class="msg-time">10:45</span>
              <span class="msg-name">Você (Admin)</span>
            </div>
            <div class="msg-bubble">
              <p>Claro, João! O sinal de trabalho é feito com as duas mãos em formato de 'L'. Veja a foto que anexei.</p>
              
              <div class="attachment-box">
                <img 
                  src="https://placehold.co/400x250/004aad/FFF?text=Sinal+de+Trabalho" 
                  alt="Anexo" 
                  class="attachment-image"
                />
              </div>
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

      </main>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { BookOpen, Paperclip, Send, X } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api'; 

const textoMensagem = ref('');
const anexoFile = ref(null);
const fileInputRef = ref(null);
const messagesContainer = ref(null);

const triggerFileInput = () => {
  fileInputRef.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validação simples de tamanho (ex: 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("O arquivo é muito grande. O limite é 5MB.");
      return;
    }
    anexoFile.value = file;
  }
};

const removerAnexo = () => {
  anexoFile.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
};

const enviarMensagem = async () => {
  if (!textoMensagem.value.trim() && !anexoFile.value) return;

  const formData = new FormData();
  formData.append('texto', textoMensagem.value);
  
  if (anexoFile.value) {
    formData.append('anexo', anexoFile.value);
  }

  try {
    // Simulação de chamada API
    // await api.post(`/cursos/id-exemplo/forum`, formData);
    
    console.log("Mensagem enviada com sucesso!");

    // Limpa os campos
    textoMensagem.value = '';
    removerAnexo();
    scrollToBottom();
    
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    alert("Falha ao enviar mensagem. Tente novamente.");
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

onMounted(() => {
  scrollToBottom();
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
}

.curso-info h4 { margin: 0 0 4px 0; font-size: 0.95rem; color: #0f172a; }
.curso-info p { margin: 0; font-size: 0.8rem; color: #64748b; }

.unread-badge {
  background: #ef4444; color: white;
  font-size: 0.7rem; font-weight: bold;
  padding: 2px 8px; border-radius: 20px;
  margin-left: auto;
}

/* CHAT AREA */
.chat-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
}
.chat-title h3 { margin: 0 0 5px 0; font-size: 1.2rem; color: #0f172a; }
.chat-title p { margin: 0; font-size: 0.85rem; color: #64748b; }

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message { max-width: 75%; display: flex; flex-direction: column; }
.message.received { align-self: flex-start; }
.message.sent { align-self: flex-end; }

.msg-header {
  display: flex; gap: 10px; margin-bottom: 6px; font-size: 0.8rem;
}
.message.sent .msg-header { flex-direction: row-reverse; }

.msg-name { font-weight: 700; color: #475569; }
.msg-time { color: #94a3b8; }

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
.btn-send { background: #004aad; color: white; }
.btn-send:disabled { background: #cbd5e1; }

.input-hint { text-align: center; font-size: 0.75rem; color: #94a3b8; margin-top: 10px; }

@media (max-width: 992px) {
  .forum-container { grid-template-columns: 1fr; }
  .forum-sidebar { display: none; }
}
</style>