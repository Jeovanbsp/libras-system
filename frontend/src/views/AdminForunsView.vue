<template>
  <div class="admin-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo-section">
        <!-- CORREÇÃO: Usando caminho relativo para o Vite encontrar a imagem no build -->
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
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
        <router-link v-if="userRole === 'admin'" to="/admin/financeiro" class="menu-item">
          <i class="fas fa-chart-line"></i>
          <span>Financeiro</span>
        </router-link>
        <router-link v-if="userRole === 'admin'" to="/admin/logs" class="menu-item">
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
            <i class="fas fa-plus"></i> Novo Tópico
          </button>
        </div>
      </div>

      <!-- Lista de Tópicos -->
      <div class="topics-container">
        <div v-if="loading" class="loading">
          <i class="fas fa-spinner fa-spin"></i> Carregando tópicos...
        </div>

        <div v-else-if="topics.length === 0" class="empty-state">
          <i class="fas fa-comments fa-3x"></i>
          <p>Nenhum tópico criado ainda</p>
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
              <span><i class="fas fa-user"></i> {{ topic.author?.name || 'Anônimo' }}</span>
              <span><i class="fas fa-comment"></i> {{ topic.replies?.length || 0 }} respostas</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Detalhes do Tópico -->
      <div v-if="selectedTopic" class="topic-detail">
        <div class="detail-header">
          <h2>{{ selectedTopic.title }}</h2>
          <button @click="closeTopic" class="btn-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="detail-content">
          <p>{{ selectedTopic.content }}</p>
          
          <div class="replies-section">
            <div v-for="reply in selectedTopic.replies" :key="reply._id" class="reply-card">
              <strong>{{ reply.author?.name }}:</strong> {{ reply.content }}
            </div>
          </div>

          <div class="reply-form">
            <textarea v-model="newReply" placeholder="Sua resposta..." class="form-textarea"></textarea>
            <button @click="submitReply" class="btn-primary" :disabled="!newReply.trim()">Enviar</button>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Novo Tópico -->
    <div v-if="showNewTopicModal" class="modal">
      <div class="modal-content">
        <h2>Novo Tópico</h2>
        <input v-model="newTopic.title" placeholder="Título" class="form-input" />
        <textarea v-model="newTopic.content" placeholder="Conteúdo" class="form-textarea"></textarea>
        <div class="modal-footer">
          <button @click="showNewTopicModal = false" class="btn-secondary">Cancelar</button>
          <button @click="createTopic" class="btn-primary">Criar</button>
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
import 'vue3-toastify/dist/index.css'; // Importante para as notificações funcionarem

const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const topics = ref([]);
const selectedTopic = ref(null);
const loading = ref(false);
const showNewTopicModal = ref(false);
const newReply = ref('');
const userRole = computed(() => localStorage.getItem('userRole'));
const newTopic = ref({ title: '', content: '' });

const loadTopics = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${API_URL}/api/forum/topics`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    topics.value = res.data;
  } catch (err) {
    toast.error("Erro ao carregar fóruns");
  } finally {
    loading.value = false;
  }
};

const selectTopic = async (topic) => {
  const res = await axios.get(`${API_URL}/api/forum/topics/${topic._id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  selectedTopic.value = res.data;
};

const createTopic = async () => {
  try {
    await axios.post(`${API_URL}/api/forum/topics`, newTopic.value, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    toast.success("Tópico criado!");
    showNewTopicModal.value = false;
    loadTopics();
  } catch (err) { toast.error("Erro ao criar"); }
};

const submitReply = async () => {
  try {
    await axios.post(`${API_URL}/api/forum/topics/${selectedTopic.value._id}/replies`, 
      { content: newReply.value },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
    );
    newReply.value = '';
    selectTopic(selectedTopic.value);
    toast.success("Resposta enviada!");
  } catch (err) { toast.error("Erro ao responder"); }
};

const formatDate = (d) => new Date(d).toLocaleDateString('pt-BR');
const closeTopic = () => selectedTopic.value = null;
const logout = () => { localStorage.clear(); router.push('/aluno/login'); };

onMounted(loadTopics);
</script>

<style scoped>
.admin-container { display: flex; min-height: 100vh; background: #f5f7fa; }
.sidebar { width: 250px; background: white; box-shadow: 2px 0 10px rgba(0,0,0,0.1); }
.logo { max-width: 150px; padding: 20px; }
.main-content { flex: 1; padding: 30px; }
.topic-card { background: white; padding: 15px; margin-bottom: 10px; border-radius: 8px; cursor: pointer; }
.modal { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; }
.modal-content { background:white; padding:30px; border-radius:12px; width:500px; }
.form-input, .form-textarea { width:100%; margin-bottom:15px; padding:10px; border:1px solid #ddd; border-radius:6px; }
</style>  