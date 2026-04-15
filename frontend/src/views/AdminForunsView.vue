<template>
  <div class="admin-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo-section">
        <img src="/src/assets/images.png" alt="Logo" class="logo" />
      </div>
      
      <nav class="menu">
        <router-link to="/admin/dashboard" class="menu-item">
          <i class="fas fa-home"></i>
          <span>Dashboard</span>
        </router-link>
        <router-link to="/admin/usuarios" class="menu-item">
          <i class="fas fa-users"></i>
          <span>Usuários</span>
        </router-link>
        <router-link to="/admin/cursos" class="menu-item">
          <i class="fas fa-graduation-cap"></i>
          <span>Cursos</span>
        </router-link>
        <router-link to="/admin/forum" class="menu-item active">
          <i class="fas fa-comments"></i>
          <span>Fórum</span>
        </router-link>
        <router-link to="/admin/materiais" class="menu-item">
          <i class="fas fa-book"></i>
          <span>Materiais</span>
        </router-link>
        <router-link to="/admin/financeiro" class="menu-item" v-if="userRole === 'admin'">
          <i class="fas fa-chart-line"></i>
          <span>Financeiro</span>
        </router-link>
        <router-link to="/admin/logs" class="menu-item" v-if="userRole === 'admin'">
          <i class="fas fa-file-alt"></i>
          <span>Logs</span>
        </router-link>
      </nav>

      <div class="logout-section">
        <button @click="logout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i>
          <span>Sair</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <div class="forum-header">
        <h1>Fórum de Discussão</h1>
        <div class="header-actions">
          <button @click="showNewTopicModal = true" class="btn-primary">
            <i class="fas fa-plus"></i>
            Novo Tópico
          </button>
        </div>
      </div>

      <!-- Lista de Tópicos -->
      <div class="topics-container">
        <div v-if="loading" class="loading">
          <i class="fas fa-spinner fa-spin"></i>
          Carregando tópicos...
        </div>

        <div v-else-if="topics.length === 0" class="empty-state">
          <i class="fas fa-comments fa-3x"></i>
          <p>Nenhum tópico criado ainda</p>
          <button @click="showNewTopicModal = true" class="btn-primary">
            Criar Primeiro Tópico
          </button>
        </div>

        <div v-else class="topics-list">
          <div 
            v-for="topic in topics" 
            :key="topic._id"
            class="topic-card"
            @click="selectTopic(topic)"
            :class="{ active: selectedTopic?._id === topic._id }"
          >
            <div class="topic-header">
              <h3>{{ topic.title }}</h3>
              <span class="topic-date">{{ formatDate(topic.createdAt) }}</span>
            </div>
            <div class="topic-info">
              <span class="topic-author">
                <i class="fas fa-user"></i>
                {{ topic.author?.name || 'Anônimo' }}
              </span>
              <span class="topic-replies">
                <i class="fas fa-comment"></i>
                {{ topic.replies?.length || 0 }} respostas
              </span>
              <span v-if="topic.hasAttachment" class="topic-attachment">
                <i class="fas fa-paperclip"></i>
                Anexo
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Visualização do Tópico Selecionado -->
      <div v-if="selectedTopic" class="topic-detail">
        <div class="detail-header">
          <h2>{{ selectedTopic.title }}</h2>
          <button @click="closeTopic" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="detail-content">
          <div class="original-post">
            <div class="post-author">
              <i class="fas fa-user-circle fa-2x"></i>
              <div>
                <strong>{{ selectedTopic.author?.name || 'Anônimo' }}</strong>
                <small>{{ formatDate(selectedTopic.createdAt) }}</small>
              </div>
            </div>
            <div class="post-body">
              <p>{{ selectedTopic.content }}</p>
              
              <!-- Visualização de Anexo PDF -->
              <div v-if="selectedTopic.attachment" class="attachment-section">
                <div class="attachment-header">
                  <i class="fas fa-file-pdf"></i>
                  <span>Documento Anexado</span>
                </div>
                
                <!-- Preview do PDF -->
                <div class="pdf-preview">
                  <iframe 
                    v-if="selectedTopic.attachment.type === 'application/pdf'"
                    :src="`${API_URL}/uploads/${selectedTopic.attachment.filename}`"
                    class="pdf-viewer"
                    frameborder="0"
                  ></iframe>
                  
                  <div v-else class="file-preview">
                    <i class="fas fa-file fa-3x"></i>
                    <p>{{ selectedTopic.attachment.originalname }}</p>
                  </div>
                </div>
                
                <!-- Botões de Ação -->
                <div class="attachment-actions">
                  <a 
                    :href="`${API_URL}/uploads/${selectedTopic.attachment.filename}`"
                    target="_blank"
                    class="btn-secondary"
                  >
                    <i class="fas fa-external-link-alt"></i>
                    Abrir em Nova Aba
                  </a>
                  <a 
                    :href="`${API_URL}/uploads/${selectedTopic.attachment.filename}`"
                    :download="selectedTopic.attachment.originalname"
                    class="btn-secondary"
                  >
                    <i class="fas fa-download"></i>
                    Baixar PDF
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Respostas -->
          <div class="replies-section">
            <h3>Respostas ({{ selectedTopic.replies?.length || 0 }})</h3>
            
            <div v-if="selectedTopic.replies?.length === 0" class="no-replies">
              <p>Nenhuma resposta ainda. Seja o primeiro!</p>
            </div>

            <div v-else class="replies-list">
              <div 
                v-for="reply in selectedTopic.replies" 
                :key="reply._id"
                class="reply-card"
              >
                <div class="reply-header">
                  <div class="reply-author">
                    <i class="fas fa-user-circle"></i>
                    <strong>{{ reply.author?.name || 'Anônimo' }}</strong>
                  </div>
                  <small>{{ formatDate(reply.createdAt) }}</small>
                </div>
                <div class="reply-content">
                  <p>{{ reply.content }}</p>
                </div>
                
                <!-- Ações do Admin para moderar -->
                <div class="reply-actions" v-if="userRole === 'admin'">
                  <button 
                    @click="deleteReply(selectedTopic._id, reply._id)" 
                    class="btn-danger-small"
                    title="Excluir resposta"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Formulário de Resposta -->
          <div class="reply-form">
            <h3>Adicionar Resposta</h3>
            <textarea 
              v-model="newReply"
              placeholder="Digite sua resposta..."
              class="form-textarea"
              rows="4"
            ></textarea>
            <button 
              @click="submitReply" 
              class="btn-primary"
              :disabled="!newReply.trim()"
            >
              <i class="fas fa-paper-plane"></i>
              Enviar Resposta
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Novo Tópico -->
    <div v-if="showNewTopicModal" class="modal" @click.self="showNewTopicModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Criar Novo Tópico</h2>
          <button @click="showNewTopicModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Título do Tópico</label>
            <input 
              v-model="newTopic.title"
              type="text"
              placeholder="Digite o título do tópico"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label>Conteúdo</label>
            <textarea 
              v-model="newTopic.content"
              placeholder="Descreva o assunto..."
              class="form-textarea"
              rows="6"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>Anexar Arquivo (opcional)</label>
            <input 
              type="file"
              @change="handleFileUpload"
              accept=".pdf,.doc,.docx,.txt"
              class="form-input"
            />
            <small>Formatos aceitos: PDF, DOC, DOCX, TXT</small>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showNewTopicModal = false" class="btn-secondary">
            Cancelar
          </button>
          <button 
            @click="createTopic" 
            class="btn-primary"
            :disabled="!newTopic.title || !newTopic.content"
          >
            <i class="fas fa-check"></i>
            Criar Tópico
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { toast } from 'vue3-toastify';

const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Estados
const topics = ref([]);
const selectedTopic = ref(null);
const loading = ref(false);
const showNewTopicModal = ref(false);
const newReply = ref('');
const userRole = computed(() => localStorage.getItem('userRole'));

const newTopic = ref({
  title: '',
  content: '',
  attachment: null
});

// Carregar tópicos
const loadTopics = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_URL}/api/forum/topics`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    topics.value = response.data;
  } catch (error) {
    toast.error('Erro ao carregar tópicos');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// Selecionar tópico
const selectTopic = async (topic) => {
  try {
    const response = await axios.get(`${API_URL}/api/forum/topics/${topic._id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    selectedTopic.value = response.data;
  } catch (error) {
    toast.error('Erro ao carregar detalhes do tópico');
  }
};

// Fechar tópico
const closeTopic = () => {
  selectedTopic.value = null;
};

// Criar novo tópico
const createTopic = async () => {
  try {
    const formData = new FormData();
    formData.append('title', newTopic.value.title);
    formData.append('content', newTopic.value.content);
    
    if (newTopic.value.attachment) {
      formData.append('attachment', newTopic.value.attachment);
    }
    
    await axios.post(`${API_URL}/api/forum/topics`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    toast.success('Tópico criado com sucesso!');
    showNewTopicModal.value = false;
    newTopic.value = { title: '', content: '', attachment: null };
    loadTopics();
  } catch (error) {
    toast.error('Erro ao criar tópico');
    console.error(error);
  }
};

// Enviar resposta
const submitReply = async () => {
  if (!newReply.value.trim()) return;
  
  try {
    await axios.post(
      `${API_URL}/api/forum/topics/${selectedTopic.value._id}/replies`,
      { content: newReply.value },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    toast.success('Resposta enviada!');
    newReply.value = '';
    selectTopic(selectedTopic.value); // Recarregar tópico
  } catch (error) {
    toast.error('Erro ao enviar resposta');
  }
};

// Deletar resposta (admin)
const deleteReply = async (topicId, replyId) => {
  if (!confirm('Deseja realmente excluir esta resposta?')) return;
  
  try {
    await axios.delete(
      `${API_URL}/api/forum/topics/${topicId}/replies/${replyId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    toast.success('Resposta excluída');
    selectTopic(selectedTopic.value); // Recarregar
  } catch (error) {
    toast.error('Erro ao excluir resposta');
  }
};

// Upload de arquivo
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    newTopic.value.attachment = file;
  }
};

// Formatar data
const formatDate = (date) => {
  return new Date(date).toLocaleString('pt-BR');
};

// Logout
const logout = () => {
  localStorage.clear();
  router.push('/aluno/login');
};

onMounted(() => {
  loadTopics();
});
</script>

<style scoped>
.admin-container {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: white;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.logo-section {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.logo {
  max-width: 150px;
  height: auto;
}

.menu {
  flex: 1;
  padding: 20px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s;
}

.menu-item:hover,
.menu-item.active {
  background: #f0f2ff;
  color: #667eea;
}

.menu-item i {
  width: 20px;
  text-align: center;
}

.logout-section {
  padding: 20px;
  border-top: 1px solid #eee;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: #ff3838;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.forum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.forum-header h1 {
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* Topics Container */
.topics-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #999;
}

.loading i {
  font-size: 24px;
  margin-bottom: 10px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state i {
  color: #ddd;
  margin-bottom: 20px;
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.topic-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.topic-card:hover {
  background: #f0f2ff;
  border-color: #667eea;
}

.topic-card.active {
  background: #f0f2ff;
  border-color: #667eea;
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 10px;
}

.topic-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.topic-date {
  color: #999;
  font-size: 12px;
}

.topic-info {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
}

.topic-info span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.topic-attachment {
  color: #667eea;
}

/* Topic Detail */
.topic-detail {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #eee;
}

.detail-header h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  transition: color 0.3s;
}

.btn-close:hover {
  color: #ff4757;
}

.detail-content {
  max-height: 70vh;
  overflow-y: auto;
}

.original-post {
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.post-author i {
  color: #667eea;
}

.post-body {
  color: #444;
  line-height: 1.6;
}

/* Attachment Section - MELHORADO */
.attachment-section {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.attachment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: #495057;
  font-weight: 600;
}

.attachment-header i {
  color: #dc3545;
  font-size: 20px;
}

.pdf-preview {
  margin-bottom: 15px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dee2e6;
}

.pdf-viewer {
  width: 100%;
  height: 600px;
  border: none;
}

.file-preview {
  padding: 40px;
  text-align: center;
  color: #6c757d;
}

.file-preview i {
  color: #dc3545;
  margin-bottom: 10px;
}

.attachment-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.attachment-actions a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.3s;
}

.attachment-actions a:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Replies Section */
.replies-section {
  margin-top: 30px;
}

.replies-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.no-replies {
  text-align: center;
  padding: 30px;
  color: #999;
  background: #f8f9fa;
  border-radius: 8px;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.reply-card {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #667eea;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.reply-author {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #495057;
}

.reply-content {
  color: #444;
  line-height: 1.5;
}

.reply-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 5px;
}

.btn-danger-small {
  padding: 4px 8px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.btn-danger-small:hover {
  background: #ff3838;
}

/* Reply Form */
.reply-form {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid #eee;
}

.reply-form h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Forms */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #495057;
  font-weight: 500;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

/* Buttons */
.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a67d8;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e9ecef;
  color: #495057;
}

.btn-secondary:hover {
  background: #dee2e6;
}
</style>