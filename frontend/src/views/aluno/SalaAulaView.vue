<template>
  <div class="sala-aula">
    <!-- Header -->
    <header class="sala-header">
      <div class="header-content">
        <button @click="goBack" class="btn-back">
          <i class="fas fa-arrow-left"></i>
          Voltar
        </button>
        <h1>{{ curso?.titulo || 'Sala de Aula' }}</h1>
        <div class="header-info">
          <span>
            <i class="fas fa-book"></i>
            {{ curso?.aulas?.length || 0 }} aulas
          </span>
        </div>
      </div>
    </header>

    <!-- Container Principal -->
    <div class="sala-container">
      <!-- Sidebar de Navegação -->
      <aside class="sala-sidebar">
        <nav class="sidebar-nav">
          <button 
            @click="activeTab = 'aulas'"
            :class="['nav-item', { active: activeTab === 'aulas' }]"
          >
            <i class="fas fa-play-circle"></i>
            <span>Aulas</span>
          </button>
          <button 
            @click="activeTab = 'materiais'"
            :class="['nav-item', { active: activeTab === 'materiais' }]"
          >
            <i class="fas fa-file-pdf"></i>
            <span>Materiais</span>
          </button>
          <button 
            @click="activeTab = 'forum'"
            :class="['nav-item', { active: activeTab === 'forum' }]"
          >
            <i class="fas fa-comments"></i>
            <span>Fórum</span>
            <span v-if="unreadMessages > 0" class="badge">{{ unreadMessages }}</span>
          </button>
          <button 
            @click="activeTab = 'atividades'"
            :class="['nav-item', { active: activeTab === 'atividades' }]"
          >
            <i class="fas fa-tasks"></i>
            <span>Atividades</span>
          </button>
        </nav>

        <!-- Progresso do Curso -->
        <div class="course-progress">
          <h3>Seu Progresso</h3>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <span class="progress-text">{{ progressPercentage }}% completo</span>
        </div>
      </aside>

      <!-- Conteúdo Principal -->
      <main class="sala-content">
        <!-- Tab de Aulas -->
        <div v-if="activeTab === 'aulas'" class="tab-content">
          <div class="aulas-list">
            <div v-if="curso?.aulas?.length === 0" class="empty-state">
              <i class="fas fa-video fa-3x"></i>
              <p>Nenhuma aula disponível ainda</p>
            </div>
            
            <div 
              v-for="(aula, index) in curso?.aulas" 
              :key="aula._id"
              class="aula-card"
              @click="selectAula(aula)"
              :class="{ active: selectedAula?._id === aula._id }"
            >
              <div class="aula-number">{{ index + 1 }}</div>
              <div class="aula-info">
                <h3>{{ aula.titulo }}</h3>
                <p>{{ aula.descricao }}</p>
                <div class="aula-meta">
                  <span>
                    <i class="fas fa-clock"></i>
                    {{ aula.duracao || '10' }} min
                  </span>
                  <span v-if="aula.completed" class="completed">
                    <i class="fas fa-check-circle"></i>
                    Concluída
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Player de Vídeo -->
          <div v-if="selectedAula" class="video-player">
            <h2>{{ selectedAula.titulo }}</h2>
            <div class="video-container">
              <video 
                v-if="selectedAula.videoUrl"
                :src="selectedAula.videoUrl"
                controls
                class="video-element"
              ></video>
              <div v-else class="video-placeholder">
                <i class="fas fa-play-circle fa-4x"></i>
                <p>Vídeo em breve</p>
              </div>
            </div>
            <div class="video-description">
              <p>{{ selectedAula.descricao }}</p>
            </div>
          </div>
        </div>

        <!-- Tab de Materiais -->
        <div v-if="activeTab === 'materiais'" class="tab-content">
          <div class="materials-grid">
            <div v-if="!curso?.materiais?.length" class="empty-state">
              <i class="fas fa-file-pdf fa-3x"></i>
              <p>Nenhum material disponível</p>
            </div>
            
            <div 
              v-for="material in curso?.materiais" 
              :key="material._id"
              class="material-card"
            >
              <div class="material-icon">
                <i class="fas fa-file-pdf"></i>
              </div>
              <div class="material-info">
                <h4>{{ material.titulo }}</h4>
                <p>{{ material.descricao }}</p>
              </div>
              <button @click="downloadMaterial(material)" class="btn-download">
                <i class="fas fa-download"></i>
                Baixar
              </button>
            </div>
          </div>
        </div>

        <!-- Tab de Fórum - ATUALIZADA -->
        <div v-if="activeTab === 'forum'" class="tab-content forum-tab">
          <div class="forum-header">
            <h2>Fórum de Discussão</h2>
            <button @click="showNewTopicModal = true" class="btn-new-topic">
              <i class="fas fa-plus"></i>
              Novo Tópico
            </button>
          </div>

          <div class="forum-container-inner">
            <!-- Lista de Tópicos -->
            <div class="topics-section">
              <div v-if="forumTopics.length === 0" class="empty-state">
                <i class="fas fa-comments fa-2x"></i>
                <p>Nenhum tópico criado ainda</p>
                <button @click="showNewTopicModal = true" class="btn-primary">
                  Criar Primeiro Tópico
                </button>
              </div>

              <div v-else class="topics-list">
                <div 
                  v-for="topic in forumTopics" 
                  :key="topic._id"
                  @click="selectForumTopic(topic)"
                  class="forum-topic-card"
                  :class="{ active: selectedForumTopic?._id === topic._id }"
                >
                  <div class="topic-header">
                    <h4>{{ topic.title }}</h4>
                    <span class="topic-date">{{ formatDate(topic.createdAt) }}</span>
                  </div>
                  
                  <div class="topic-meta">
                    <span>
                      <i class="fas fa-user"></i>
                      {{ topic.author?.name || 'Anônimo' }}
                    </span>
                    <span>
                      <i class="fas fa-comment"></i>
                      {{ topic.replies?.length || 0 }} respostas
                    </span>
                    <span v-if="topic.attachment" class="has-attachment">
                      <i class="fas fa-paperclip"></i>
                      PDF
                    </span>
                  </div>

                  <!-- Ações do autor -->
                  <div v-if="topic.author?._id === currentUserId" class="topic-actions">
                    <button 
                      @click.stop="editForumTopic(topic)" 
                      class="btn-icon"
                      title="Editar"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      @click.stop="deleteForumTopic(topic._id)" 
                      class="btn-icon btn-danger"
                      title="Excluir"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Visualização do Tópico Selecionado -->
            <div v-if="selectedForumTopic" class="topic-detail">
              <div class="detail-header">
                <h3>{{ selectedForumTopic.title }}</h3>
                <button @click="selectedForumTopic = null" class="btn-close-topic">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="detail-body">
                <!-- Post Original -->
                <div class="original-post">
                  <div class="post-author">
                    <i class="fas fa-user-circle fa-2x"></i>
                    <div>
                      <strong>{{ selectedForumTopic.author?.name }}</strong>
                      <small>{{ formatDate(selectedForumTopic.createdAt) }}</small>
                    </div>
                  </div>
                  <div class="post-content">
                    <p>{{ selectedForumTopic.content }}</p>
                    
                    <!-- Visualização de PDF - MELHORADA -->
                    <div v-if="selectedForumTopic.attachment" class="pdf-attachment">
                      <div class="pdf-header">
                        <i class="fas fa-file-pdf"></i>
                        <span>{{ selectedForumTopic.attachment.originalname || 'Documento PDF' }}</span>
                      </div>
                      
                      <!-- Visualizador de PDF -->
                      <div class="pdf-viewer-wrapper">
                        <iframe 
                          v-if="selectedForumTopic.attachment.type === 'application/pdf'"
                          :src="`${API_URL}/uploads/${selectedForumTopic.attachment.filename}`"
                          class="pdf-iframe"
                          frameborder="0"
                        ></iframe>
                        
                        <div v-else class="file-preview">
                          <i class="fas fa-file fa-3x"></i>
                          <p>{{ selectedForumTopic.attachment.originalname }}</p>
                        </div>
                      </div>
                      
                      <!-- Ações do PDF -->
                      <div class="pdf-actions">
                        <a 
                          :href="`${API_URL}/uploads/${selectedForumTopic.attachment.filename}`"
                          target="_blank"
                          class="btn-pdf-action"
                        >
                          <i class="fas fa-external-link-alt"></i>
                          Abrir em Nova Aba
                        </a>
                        <a 
                          :href="`${API_URL}/uploads/${selectedForumTopic.attachment.filename}`"
                          :download="selectedForumTopic.attachment.originalname"
                          class="btn-pdf-action btn-download-pdf"
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
                  <h4>
                    <i class="fas fa-comments"></i>
                    Respostas ({{ selectedForumTopic.replies?.length || 0 }})
                  </h4>

                  <div v-if="!selectedForumTopic.replies?.length" class="no-replies">
                    <p>Seja o primeiro a responder!</p>
                  </div>

                  <div v-else class="replies-list">
                    <div 
                      v-for="reply in selectedForumTopic.replies" 
                      :key="reply._id"
                      class="reply-item"
                    >
                      <div class="reply-header">
                        <div class="reply-author">
                          <i class="fas fa-user-circle"></i>
                          <strong>{{ reply.author?.name }}</strong>
                          <small>{{ formatDate(reply.createdAt) }}</small>
                          <span v-if="reply.edited" class="edited-tag">(editado)</span>
                        </div>
                        
                        <!-- Ações para o autor da resposta -->
                        <div v-if="reply.author?._id === currentUserId" class="reply-actions">
                          <button 
                            @click="editReply(reply)" 
                            class="btn-icon-small"
                            title="Editar"
                          >
                            <i class="fas fa-edit"></i>
                          </button>
                          <button 
                            @click="deleteReply(selectedForumTopic._id, reply._id)" 
                            class="btn-icon-small btn-danger"
                            title="Excluir"
                          >
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>

                      <!-- Modo de Edição -->
                      <div v-if="editingReply?._id === reply._id" class="reply-edit-mode">
                        <textarea 
                          v-model="editingReplyContent"
                          class="edit-textarea"
                          rows="3"
                        ></textarea>
                        <div class="edit-buttons">
                          <button @click="cancelEditReply" class="btn-cancel">
                            Cancelar
                          </button>
                          <button @click="saveEditReply" class="btn-save">
                            <i class="fas fa-check"></i>
                            Salvar
                          </button>
                        </div>
                      </div>

                      <!-- Conteúdo Normal -->
                      <div v-else class="reply-content">
                        <p>{{ reply.content }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Formulário de Resposta -->
                <div class="reply-form">
                  <h4>Adicionar Resposta</h4>
                  <textarea 
                    v-model="newReply"
                    placeholder="Digite sua resposta..."
                    class="reply-textarea"
                    rows="4"
                  ></textarea>
                  <button 
                    @click="submitReply"
                    :disabled="!newReply.trim()"
                    class="btn-submit"
                  >
                    <i class="fas fa-paper-plane"></i>
                    Enviar Resposta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab de Atividades -->
        <div v-if="activeTab === 'atividades'" class="tab-content">
          <div class="activities-list">
            <div v-if="!curso?.atividades?.length" class="empty-state">
              <i class="fas fa-tasks fa-3x"></i>
              <p>Nenhuma atividade disponível</p>
            </div>
            
            <div 
              v-for="atividade in curso?.atividades" 
              :key="atividade._id"
              class="activity-card"
            >
              <div class="activity-header">
                <h3>{{ atividade.titulo }}</h3>
                <span :class="['activity-status', atividade.status]">
                  {{ atividade.status === 'completed' ? 'Concluída' : 'Pendente' }}
                </span>
              </div>
              <p>{{ atividade.descricao }}</p>
              <div class="activity-footer">
                <span class="due-date">
                  <i class="fas fa-calendar"></i>
                  Prazo: {{ formatDate(atividade.prazo) }}
                </span>
                <button @click="startActivity(atividade)" class="btn-start">
                  Iniciar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal Novo/Editar Tópico -->
    <div v-if="showNewTopicModal || editingTopic" class="modal" @click.self="closeTopicModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingTopic ? 'Editar Tópico' : 'Criar Novo Tópico' }}</h2>
          <button @click="closeTopicModal" class="btn-modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Título</label>
            <input 
              v-model="topicForm.title"
              type="text"
              placeholder="Digite o título do tópico"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Conteúdo</label>
            <textarea 
              v-model="topicForm.content"
              placeholder="Descreva o assunto..."
              class="form-textarea"
              rows="6"
            ></textarea>
          </div>

          <div v-if="!editingTopic" class="form-group">
            <label>Anexar PDF (opcional)</label>
            <input 
              type="file"
              @change="handleFileUpload"
              accept=".pdf"
              class="file-input"
            />
            <small>Apenas arquivos PDF até 10MB</small>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeTopicModal" class="btn-cancel">
            Cancelar
          </button>
          <button 
            @click="saveTopic"
            :disabled="!topicForm.title || !topicForm.content"
            class="btn-save"
          >
            <i class="fas fa-check"></i>
            {{ editingTopic ? 'Salvar Alterações' : 'Criar Tópico' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { toast } from 'vue3-toastify';

const route = useRoute();
const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Estados
const curso = ref(null);
const activeTab = ref('aulas');
const selectedAula = ref(null);
const forumTopics = ref([]);
const selectedForumTopic = ref(null);
const showNewTopicModal = ref(false);
const newReply = ref('');
const unreadMessages = ref(0);
const progressPercentage = ref(0);
const editingTopic = ref(null);
const editingReply = ref(null);
const editingReplyContent = ref('');
const currentUserId = computed(() => localStorage.getItem('userId'));

const topicForm = ref({
  title: '',
  content: '',
  attachment: null
});

// Carregar dados do curso
const loadCourse = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/cursos/${route.params.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    curso.value = response.data;
    calculateProgress();
  } catch (error) {
    toast.error('Erro ao carregar curso');
    console.error(error);
  }
};

// Carregar tópicos do fórum
const loadForumTopics = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/forum/curso/${route.params.id}/topics`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    forumTopics.value = response.data;
  } catch (error) {
    console.error('Erro ao carregar fórum:', error);
  }
};

// Selecionar tópico do fórum
const selectForumTopic = async (topic) => {
  try {
    const response = await axios.get(`${API_URL}/api/forum/topics/${topic._id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    selectedForumTopic.value = response.data;
  } catch (error) {
    toast.error('Erro ao carregar tópico');
  }
};

// Criar/Editar tópico
const saveTopic = async () => {
  try {
    if (editingTopic.value) {
      // Editar tópico
      await axios.put(
        `${API_URL}/api/forum/topics/${editingTopic.value._id}`,
        {
          title: topicForm.value.title,
          content: topicForm.value.content
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      toast.success('Tópico atualizado!');
    } else {
      // Criar novo tópico
      const formData = new FormData();
      formData.append('title', topicForm.value.title);
      formData.append('content', topicForm.value.content);
      formData.append('cursoId', route.params.id);
      
      if (topicForm.value.attachment) {
        formData.append('attachment', topicForm.value.attachment);
      }
      
      await axios.post(`${API_URL}/api/forum/topics`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Tópico criado!');
    }
    
    closeTopicModal();
    loadForumTopics();
  } catch (error) {
    toast.error('Erro ao salvar tópico');
  }
};

// Editar tópico
const editForumTopic = (topic) => {
  editingTopic.value = topic;
  topicForm.value = {
    title: topic.title,
    content: topic.content,
    attachment: null
  };
};

// Excluir tópico
const deleteForumTopic = async (topicId) => {
  if (!confirm('Deseja realmente excluir este tópico?')) return;
  
  try {
    await axios.delete(`${API_URL}/api/forum/topics/${topicId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    toast.success('Tópico excluído!');
    if (selectedForumTopic.value?._id === topicId) {
      selectedForumTopic.value = null;
    }
    loadForumTopics();
  } catch (error) {
    toast.error('Erro ao excluir tópico');
  }
};

// Enviar resposta
const submitReply = async () => {
  if (!newReply.value.trim()) return;
  
  try {
    await axios.post(
      `${API_URL}/api/forum/topics/${selectedForumTopic.value._id}/replies`,
      { content: newReply.value },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    toast.success('Resposta enviada!');
    newReply.value = '';
    selectForumTopic(selectedForumTopic.value);
  } catch (error) {
    toast.error('Erro ao enviar resposta');
  }
};

// Editar resposta
const editReply = (reply) => {
  editingReply.value = reply;
  editingReplyContent.value = reply.content;
};

// Salvar edição da resposta
const saveEditReply = async () => {
  try {
    await axios.put(
      `${API_URL}/api/forum/topics/${selectedForumTopic.value._id}/replies/${editingReply.value._id}`,
      { content: editingReplyContent.value },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    toast.success('Resposta atualizada!');
    cancelEditReply();
    selectForumTopic(selectedForumTopic.value);
  } catch (error) {
    toast.error('Erro ao atualizar resposta');
  }
};

// Cancelar edição
const cancelEditReply = () => {
  editingReply.value = null;
  editingReplyContent.value = '';
};

// Excluir resposta
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
    
    toast.success('Resposta excluída!');
    selectForumTopic(selectedForumTopic.value);
  } catch (error) {
    toast.error('Erro ao excluir resposta');
  }
};

// Fechar modal
const closeTopicModal = () => {
  showNewTopicModal.value = false;
  editingTopic.value = null;
  topicForm.value = {
    title: '',
    content: '',
    attachment: null
  };
};

// Upload de arquivo
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB');
      return;
    }
    topicForm.value.attachment = file;
  }
};

// Selecionar aula
const selectAula = (aula) => {
  selectedAula.value = aula;
};

// Download material
const downloadMaterial = async (material) => {
  try {
    window.open(`${API_URL}/uploads/${material.filename}`, '_blank');
  } catch (error) {
    toast.error('Erro ao baixar material');
  }
};

// Iniciar atividade
const startActivity = (atividade) => {
  toast.info('Funcionalidade em desenvolvimento');
};

// Calcular progresso
const calculateProgress = () => {
  if (!curso.value?.aulas?.length) {
    progressPercentage.value = 0;
    return;
  }
  const completed = curso.value.aulas.filter(a => a.completed).length;
  progressPercentage.value = Math.round((completed / curso.value.aulas.length) * 100);
};

// Formatar data
const formatDate = (date) => {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Voltar
const goBack = () => {
  router.push('/aluno/cursos');
};

onMounted(() => {
  loadCourse();
  loadForumTopics();
});
</script>

<style scoped>
.sala-aula {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Header */
.sala-header {
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-back {
  padding: 8px 16px;
  background: #f8f9fa;
  color: #495057;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-back:hover {
  background: #e9ecef;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #6c757d;
}

/* Container */
.sala-container {
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 20px;
}

/* Sidebar */
.sala-sidebar {
  background: white;
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: #495057;
  text-align: left;
}

.nav-item:hover {
  background: #f8f9fa;
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.badge {
  margin-left: auto;
  background: #ff4757;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

/* Progress */
.course-progress {
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.course-progress h3 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #495057;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: #6c757d;
}

/* Content */
.sala-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  min-height: 600px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.tab-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #adb5bd;
}

.empty-state i {
  margin-bottom: 20px;
}

/* Aulas */
.aulas-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.aula-card {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.aula-card:hover {
  background: #f0f2ff;
  border-color: #667eea;
}

.aula-card.active {
  background: #f0f2ff;
  border-color: #667eea;
}

.aula-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.aula-info h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.aula-info p {
  color: #6c757d;
  font-size: 14px;
  margin: 0 0 10px 0;
}

.aula-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #6c757d;
}

.completed {
  color: #28a745;
}

/* Video Player */
.video-player {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 2px solid #eee;
}

.video-container {
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  margin: 20px 0;
}

.video-element {
  width: 100%;
  height: auto;
}

.video-placeholder {
  padding: 100px 20px;
  text-align: center;
  color: #fff;
}

/* Forum Tab - ATUALIZADA */
.forum-tab {
  padding: 0;
}

.forum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.forum-header h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-new-topic {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-new-topic:hover {
  background: #5a67d8;
}

.forum-container-inner {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}

.topics-section {
  max-height: 600px;
  overflow-y: auto;
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.forum-topic-card {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  position: relative;
}

.forum-topic-card:hover {
  background: #f0f2ff;
  border-color: #667eea;
}

.forum-topic-card.active {
  background: #f0f2ff;
  border-color: #667eea;
}

.topic-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.topic-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
}

.topic-date {
  font-size: 12px;
  color: #6c757d;
}

.topic-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #6c757d;
}

.topic-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.has-attachment {
  color: #667eea;
  font-weight: 600;
}

.topic-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
}

.btn-icon {
  background: white;
  border: 1px solid #dee2e6;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  color: #6c757d;
}

.btn-icon:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-icon.btn-danger:hover {
  background: #ff4757;
  border-color: #ff4757;
}

/* Topic Detail */
.topic-detail {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
}

.detail-header h3 {
  margin: 0;
  color: #2c3e50;
}

.btn-close-topic {
  background: transparent;
  border: none;
  font-size: 20px;
  color: #6c757d;
  cursor: pointer;
}

.btn-close-topic:hover {
  color: #ff4757;
}

.detail-body {
  padding-top: 20px;
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

.post-content {
  color: #495057;
  line-height: 1.6;
}

/* PDF Attachment - MELHORADA */
.pdf-attachment {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid #dee2e6;
}

.pdf-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  background: white;
  border-radius: 8px;
}

.pdf-header i {
  color: #dc3545;
  font-size: 24px;
}

.pdf-header span {
  font-weight: 600;
  color: #495057;
}

.pdf-viewer-wrapper {
  margin-bottom: 15px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.pdf-iframe {
  width: 100%;
  height: 600px;
  border: none;
}

.file-preview {
  padding: 60px 20px;
  text-align: center;
  color: #6c757d;
}

.pdf-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn-pdf-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  color: #495057;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s;
  font-weight: 500;
}

.btn-pdf-action:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-2px);
}

.btn-download-pdf {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.btn-download-pdf:hover {
  background: #218838;
  border-color: #218838;
}

/* Replies */
.replies-section {
  margin-bottom: 30px;
}

.replies-section h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.no-replies {
  text-align: center;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #6c757d;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.reply-item {
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

.reply-author strong {
  color: #2c3e50;
}

.edited-tag {
  font-size: 11px;
  color: #6c757d;
  font-style: italic;
}

.reply-actions {
  display: flex;
  gap: 5px;
}

.btn-icon-small {
  background: white;
  border: 1px solid #dee2e6;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 12px;
  transition: all 0.3s;
}

.btn-icon-small:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-icon-small.btn-danger:hover {
  background: #ff4757;
  border-color: #ff4757;
}

.reply-content {
  color: #495057;
  line-height: 1.5;
}

/* Edit Mode */
.reply-edit-mode {
  margin-top: 10px;
}

.edit-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
}

.edit-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
}

/* Reply Form */
.reply-form {
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.reply-form h4 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.reply-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.3s;
}

.reply-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.btn-submit {
  margin-top: 10px;
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-submit:hover:not(:disabled) {
  background: #5a67d8;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.btn-modal-close {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
}

.btn-modal-close:hover {
  color: #ff4757;
}

.modal-body {
  padding: 20px;
}

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

.file-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel,
.btn-save {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-cancel {
  background: #e9ecef;
  color: #495057;
}

.btn-cancel:hover {
  background: #dee2e6;
}

.btn-save {
  background: #667eea;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #5a67d8;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Materials */
.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.material-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.material-card:hover {
  background: #f0f2ff;
  transform: translateY(-2px);
}

.material-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.material-info {
  flex: 1;
}

.material-info h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.material-info p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.btn-download {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-download:hover {
  background: #218838;
}

/* Activities */
.activities-list {
  display: grid;
  gap: 20px;
}

.activity-card {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.activity-card:hover {
  background: #f0f2ff;
  transform: translateY(-2px);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.activity-header h3 {
  margin: 0;
  color: #2c3e50;
}

.activity-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.activity-status.completed {
  background: #d4edda;
  color: #155724;
}

.activity-status.pending {
  background: #fff3cd;
  color: #856404;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.due-date {
  color: #6c757d;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-start {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-start:hover {
  background: #5a67d8;
}

/* Responsividade */
@media (max-width: 768px) {
  .sala-container {
    grid-template-columns: 1fr;
  }
  
  .sala-sidebar {
    position: sticky;
    top: 70px;
  }
  
  .forum-container-inner {
    grid-template-columns: 1fr;
  }
  
  .pdf-iframe {
    height: 400px;
  }
}
</style>