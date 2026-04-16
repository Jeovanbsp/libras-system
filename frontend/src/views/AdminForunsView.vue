<template>
  <MainLayout pageTitle="Fórum dos Alunos" pageDescription="Gerencie discussões, responda dúvidas e interaja com os alunos.">

    <div class="forum-layout">
      <!-- Coluna Esquerda: Lista de Tópicos -->
      <div class="topics-col">
        <div class="glass-card">
          <div class="col-header">
            <h3 class="section-title"><MessageSquare :size="20" class="text-brand" /> Tópicos</h3>
            <button @click="abrirNovoTopico" class="btn-primary-sm">
              <Plus :size="16" /> Novo
            </button>
          </div>

          <div class="search-box">
            <Search :size="16" class="search-icon" />
            <input v-model="busca" placeholder="Pesquisar tópicos..." class="search-input" />
          </div>

          <div v-if="loading" class="loading-state">
            <Loader :size="24" class="spin" /> Carregando...
          </div>

          <div v-else-if="topicosFiltrados.length === 0" class="empty-state">
            <MessageSquare :size="40" class="opacity-20" />
            <p>Nenhum tópico encontrado</p>
          </div>

          <div v-else class="topics-list">
            <div
              v-for="t in topicosFiltrados"
              :key="t._id"
              @click="selecionarTopico(t)"
              :class="['topic-item', { active: topicoSelecionado?._id === t._id }]"
            >
              <div class="topic-item-top">
                <span class="topic-title">{{ t.titulo }}</span>
                <span class="topic-date">{{ formatarData(t.dataCriacao) }}</span>
              </div>
              <div class="topic-item-bottom">
                <span class="topic-author">
                  <UserCircle :size="13" /> {{ t.autor?.nome || 'Anônimo' }}
                  <span :class="['role-badge', t.autor?.role]">{{ formatarRole(t.autor?.role) }}</span>
                </span>
                <span class="topic-replies">
                  <MessageCircle :size="13" /> {{ t.respostas?.length || 0 }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Coluna Direita: Detalhe do Tópico -->
      <div class="detail-col">
        <div v-if="!topicoSelecionado" class="glass-card empty-detail">
          <MessageSquare :size="60" class="opacity-10" />
          <p>Selecione um tópico para ver a conversa</p>
        </div>

        <div v-else class="glass-card detail-card">
          <!-- Cabeçalho do tópico -->
          <div class="detail-header">
            <div class="detail-title-row">
              <h2>{{ topicoSelecionado.titulo }}</h2>
              <div class="detail-actions">
                <button
                  v-if="podeExcluirTopico"
                  @click="excluirTopico(topicoSelecionado._id)"
                  class="btn-icon btn-danger"
                  title="Excluir tópico"
                >
                  <Trash2 :size="16" />
                </button>
                <button @click="topicoSelecionado = null" class="btn-icon" title="Fechar">
                  <X :size="18" />
                </button>
              </div>
            </div>
            <div class="detail-meta">
              <span class="meta-author">
                <UserCircle :size="14" /> {{ topicoSelecionado.autor?.nome || 'Anônimo' }}
                <span :class="['role-badge', topicoSelecionado.autor?.role]">{{ formatarRole(topicoSelecionado.autor?.role) }}</span>
              </span>
              <span class="meta-date"><Calendar :size="14" /> {{ formatarDataCompleta(topicoSelecionado.dataCriacao) }}</span>
            </div>
            <div class="detail-content">
              <p v-html="realcarMencoes(topicoSelecionado.conteudo)"></p>
            </div>
          </div>

          <!-- Respostas -->
          <div class="replies-section">
            <h4 class="replies-title">
              <MessageCircle :size="16" /> 
              {{ topicoSelecionado.respostas?.length || 0 }} Resposta(s)
            </h4>

            <div v-if="topicoSelecionado.respostas?.length === 0" class="no-replies">
              Seja o primeiro a responder!
            </div>

            <div
              v-for="reply in topicoSelecionado.respostas"
              :key="reply._id"
              :class="['reply-card', reply.autor?.role]"
            >
              <div class="reply-header">
                <div class="reply-author">
                  <div :class="['reply-avatar', reply.autor?.role]">
                    {{ (reply.autor?.nome || 'A')[0].toUpperCase() }}
                  </div>
                  <div>
                    <span class="reply-name">{{ reply.autor?.nome || 'Anônimo' }}</span>
                    <span :class="['role-badge', reply.autor?.role]">{{ formatarRole(reply.autor?.role) }}</span>
                    <span v-if="reply.editada" class="edited-tag">editada</span>
                  </div>
                </div>
                <div class="reply-actions">
                  <span class="reply-date">{{ formatarDataCompleta(reply.dataCriacao) }}</span>
                  <button
                    v-if="podeEditarResposta(reply)"
                    @click="iniciarEdicao(reply)"
                    class="btn-icon-sm"
                    title="Editar"
                  >
                    <Pencil :size="14" />
                  </button>
                  <button
                    v-if="podeExcluirResposta(reply)"
                    @click="excluirResposta(reply._id)"
                    class="btn-icon-sm btn-danger-sm"
                    title="Excluir"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>

              <!-- Modo edição inline -->
              <div v-if="replyEmEdicao === reply._id" class="reply-edit-mode">
                <div class="mention-wrapper">
                  <textarea
                    v-model="textoEdicao"
                    class="reply-textarea"
                    rows="3"
                    @input="verificarMencao"
                  ></textarea>
                  <div v-if="mostrarSugestoes && sugestoesUsuarios.length > 0" class="mention-dropdown">
                    <div
                      v-for="u in sugestoesUsuarios"
                      :key="u._id"
                      @click="inserirMencao(u.nome)"
                      class="mention-item"
                    >
                      <span>{{ u.nome }}</span>
                      <span :class="['role-badge', u.role]">{{ formatarRole(u.role) }}</span>
                    </div>
                  </div>
                </div>
                <div class="edit-actions">
                  <button @click="cancelarEdicao" class="btn-secondary-sm">Cancelar</button>
                  <button @click="salvarEdicao(reply._id)" class="btn-primary-sm">Salvar</button>
                </div>
              </div>
              <div v-else class="reply-body">
                <p v-html="realcarMencoes(reply.texto)"></p>
              </div>
            </div>
          </div>

          <!-- Formulário de resposta -->
          <div class="reply-form">
            <h4 class="reply-form-title"><Send :size="16" /> Sua Resposta</h4>
            <div class="mention-wrapper">
              <textarea
                v-model="novaResposta"
                placeholder="Digite sua resposta... Use @nome para mencionar alguém"
                class="reply-textarea"
                rows="3"
                @input="verificarMencaoResposta"
              ></textarea>
              <div v-if="mostrarSugestoesResposta && sugestoesUsuarios.length > 0" class="mention-dropdown">
                <div
                  v-for="u in sugestoesUsuarios"
                  :key="u._id"
                  @click="inserirMencaoResposta(u.nome)"
                  class="mention-item"
                >
                  <span>{{ u.nome }}</span>
                  <span :class="['role-badge', u.role]">{{ formatarRole(u.role) }}</span>
                </div>
              </div>
            </div>
            <div class="reply-form-footer">
              <span class="mention-hint"><AtSign :size="14" /> Digite @ para mencionar alguém</span>
              <button
                @click="enviarResposta"
                class="btn-primary-sm"
                :disabled="!novaResposta.trim() || enviando"
              >
                <Send :size="15" /> {{ enviando ? 'Enviando...' : 'Enviar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Novo Tópico -->
    <div v-if="mostrarModalNovoTopico" class="modal-overlay" @click.self="mostrarModalNovoTopico = false">
      <div class="modal-box">
        <div class="modal-header">
          <h3><Plus :size="20" /> Novo Tópico</h3>
          <button @click="mostrarModalNovoTopico = false" class="btn-icon"><X :size="20" /></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Título</label>
            <input v-model="novoTopico.titulo" placeholder="Ex: Dúvida sobre módulo 3..." class="form-input" />
          </div>
          <div class="form-group">
            <label>Categoria</label>
            <select v-model="novoTopico.categoria" class="form-select">
              <option>Geral</option>
              <option>Dúvidas</option>
              <option>Anúncios</option>
              <option>Sugestões</option>
            </select>
          </div>
          <div class="form-group">
            <label>Mensagem <span class="hint">Use @nome para mencionar alguém</span></label>
            <div class="mention-wrapper">
              <textarea
                v-model="novoTopico.conteudo"
                placeholder="Descreva o tópico..."
                class="form-textarea"
                rows="5"
                @input="verificarMencaoTopico"
              ></textarea>
              <div v-if="mostrarSugestoesTopico && sugestoesUsuarios.length > 0" class="mention-dropdown">
                <div
                  v-for="u in sugestoesUsuarios"
                  :key="u._id"
                  @click="inserirMencaoTopico(u.nome)"
                  class="mention-item"
                >
                  <span>{{ u.nome }}</span>
                  <span :class="['role-badge', u.role]">{{ formatarRole(u.role) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="mostrarModalNovoTopico = false" class="btn-secondary">Cancelar</button>
          <button @click="criarTopico" class="btn-primary" :disabled="criando">
            {{ criando ? 'Criando...' : 'Criar Tópico' }}
          </button>
        </div>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  MessageSquare, MessageCircle, Plus, Search, Loader,
  UserCircle, Calendar, Trash2, X, Pencil, Send, AtSign
} from 'lucide-vue-next';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const loading = ref(false);
const enviando = ref(false);
const criando = ref(false);
const busca = ref('');
const topicos = ref([]);
const topicoSelecionado = ref(null);
const novaResposta = ref('');
const mostrarModalNovoTopico = ref(false);
const novoTopico = ref({ titulo: '', conteudo: '', categoria: 'Geral' });
const replyEmEdicao = ref(null);
const textoEdicao = ref('');
const todosUsuarios = ref([]);

const userRole = ref(localStorage.getItem('userRole') || '');
const userId = ref(localStorage.getItem('userId') || '');

// Mencoes
const mostrarSugestoes = ref(false);
const mostrarSugestoesResposta = ref(false);
const mostrarSugestoesTopico = ref(false);
const sugestoesUsuarios = ref([]);
let targetMencao = null;

const topicosFiltrados = computed(() => {
  if (!busca.value) return topicos.value;
  const b = busca.value.toLowerCase();
  return topicos.value.filter(t =>
    t.titulo.toLowerCase().includes(b) ||
    (t.autor?.nome || '').toLowerCase().includes(b)
  );
});

const podeExcluirTopico = computed(() => {
  if (!topicoSelecionado.value) return false;
  const isAdmin = userRole.value === 'admin' || userRole.value === 'admin_restrito';
  const isAutor = topicoSelecionado.value.autor?._id === userId.value;
  return isAdmin || isAutor;
});

const podeEditarResposta = (reply) => {
  const isAdmin = userRole.value === 'admin' || userRole.value === 'admin_restrito';
  return isAdmin || reply.autor?._id === userId.value;
};

const podeExcluirResposta = (reply) => {
  const isAdmin = userRole.value === 'admin' || userRole.value === 'admin_restrito';
  return isAdmin || reply.autor?._id === userId.value;
};

const carregarTopicos = async () => {
  loading.value = true;
  try {
    const res = await api.get('/forum/topics');
    topicos.value = res.data;
  } catch {
    toast.error('Erro ao carregar fórum');
  } finally {
    loading.value = false;
  }
};

const carregarUsuarios = async () => {
  try {
    const res = await api.get('/forum/users');
    todosUsuarios.value = res.data;
  } catch {}
};

const selecionarTopico = async (t) => {
  try {
    const res = await api.get(`/forum/topics/${t._id}`);
    topicoSelecionado.value = res.data;
  } catch {
    toast.error('Erro ao carregar tópico');
  }
};

const abrirNovoTopico = () => {
  novoTopico.value = { titulo: '', conteudo: '', categoria: 'Geral' };
  mostrarModalNovoTopico.value = true;
};

const criarTopico = async () => {
  if (!novoTopico.value.titulo.trim() || !novoTopico.value.conteudo.trim()) return;
  criando.value = true;
  try {
    await api.post('/forum/topics', novoTopico.value);
    toast.success('Tópico criado!');
    mostrarModalNovoTopico.value = false;
    await carregarTopicos();
  } catch {
    toast.error('Erro ao criar tópico');
  } finally {
    criando.value = false;
  }
};

const enviarResposta = async () => {
  if (!novaResposta.value.trim()) return;
  enviando.value = true;
  try {
    const res = await api.post(`/forum/topics/${topicoSelecionado.value._id}/replies`, {
      texto: novaResposta.value
    });
    topicoSelecionado.value = res.data;
    novaResposta.value = '';
    toast.success('Resposta enviada!');
    await carregarTopicos();
  } catch {
    toast.error('Erro ao enviar resposta');
  } finally {
    enviando.value = false;
  }
};

const excluirTopico = async (id) => {
  if (!confirm('Deseja excluir este tópico?')) return;
  try {
    await api.delete(`/forum/topics/${id}`);
    toast.success('Tópico excluído');
    topicoSelecionado.value = null;
    await carregarTopicos();
  } catch {
    toast.error('Erro ao excluir');
  }
};

const iniciarEdicao = (reply) => {
  replyEmEdicao.value = reply._id;
  textoEdicao.value = reply.texto;
};

const cancelarEdicao = () => {
  replyEmEdicao.value = null;
  textoEdicao.value = '';
};

const salvarEdicao = async (replyId) => {
  try {
    const res = await api.put(`/forum/topics/${topicoSelecionado.value._id}/replies/${replyId}`, {
      texto: textoEdicao.value
    });
    topicoSelecionado.value = res.data;
    replyEmEdicao.value = null;
    toast.success('Editado com sucesso');
  } catch {
    toast.error('Erro ao editar');
  }
};

const excluirResposta = async (replyId) => {
  if (!confirm('Deseja excluir esta resposta?')) return;
  try {
    const res = await api.delete(`/forum/topics/${topicoSelecionado.value._id}/replies/${replyId}`);
    topicoSelecionado.value = res.data;
    toast.success('Resposta excluída');
  } catch {
    toast.error('Erro ao excluir');
  }
};

// Menções
const buscarSugestoes = (texto) => {
  const match = texto.match(/@(\w*)$/);
  if (match) {
    const termo = match[1].toLowerCase();
    sugestoesUsuarios.value = todosUsuarios.value.filter(u =>
      u.nome.toLowerCase().startsWith(termo)
    ).slice(0, 6);
    return true;
  }
  return false;
};

const verificarMencao = (e) => {
  mostrarSugestoes.value = buscarSugestoes(e.target.value);
  targetMencao = 'edicao';
};

const verificarMencaoResposta = (e) => {
  mostrarSugestoesResposta.value = buscarSugestoes(e.target.value);
  targetMencao = 'resposta';
};

const verificarMencaoTopico = (e) => {
  mostrarSugestoesTopico.value = buscarSugestoes(e.target.value);
  targetMencao = 'topico';
};

const inserirMencao = (nome) => {
  textoEdicao.value = textoEdicao.value.replace(/@\w*$/, `@${nome} `);
  mostrarSugestoes.value = false;
};

const inserirMencaoResposta = (nome) => {
  novaResposta.value = novaResposta.value.replace(/@\w*$/, `@${nome} `);
  mostrarSugestoesResposta.value = false;
};

const inserirMencaoTopico = (nome) => {
  novoTopico.value.conteudo = novoTopico.value.conteudo.replace(/@\w*$/, `@${nome} `);
  mostrarSugestoesTopico.value = false;
};

const realcarMencoes = (texto) => {
  if (!texto) return '';
  return texto.replace(/@(\w+)/g, '<span class="mencao">@$1</span>');
};

const formatarRole = (role) => {
  if (role === 'admin') return 'Admin';
  if (role === 'admin_restrito') return 'Admin';
  return 'Aluno';
};

const formatarData = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pt-BR');
};

const formatarDataCompleta = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleString('pt-BR');
};

onMounted(() => {
  carregarTopicos();
  carregarUsuarios();
});
</script>

<style scoped>
.forum-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 25px;
  align-items: start;
}

.glass-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
  padding: 25px;
}

.col-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-brand { color: #004aad; }

.search-box {
  position: relative;
  margin-bottom: 15px;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}
.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  font-size: 0.9rem;
  color: #1e293b;
  box-sizing: border-box;
}
.search-input:focus { outline: none; border-color: #004aad; background: white; }

.loading-state {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
  padding: 20px 0;
  justify-content: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 30px 0;
  color: #94a3b8;
  text-align: center;
}

.opacity-10 { opacity: 0.1; }
.opacity-20 { opacity: 0.2; }

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}
.topics-list::-webkit-scrollbar { width: 5px; }
.topics-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

.topic-item {
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.topic-item:hover { border-color: #bfdbfe; background: #f8fafc; }
.topic-item.active { border-color: #004aad; background: #eff6ff; }

.topic-item-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}
.topic-title {
  font-weight: 700;
  font-size: 0.9rem;
  color: #1e293b;
  line-height: 1.3;
}
.topic-date { font-size: 0.72rem; color: #94a3b8; white-space: nowrap; }

.topic-item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.topic-author, .topic-replies {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #64748b;
}

/* Detail column */
.empty-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 400px;
  color: #94a3b8;
}

.detail-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-header {
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 20px;
}

.detail-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.detail-title-row h2 {
  font-size: 1.3rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  line-height: 1.3;
}
.detail-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}
.meta-author, .meta-date {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  color: #64748b;
}

.detail-content p {
  font-size: 0.95rem;
  color: #374151;
  line-height: 1.6;
  margin: 0;
}

/* Replies */
.replies-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.replies-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 5px 0;
}
.no-replies {
  font-size: 0.85rem;
  color: #94a3b8;
  text-align: center;
  padding: 15px;
  background: #f8fafc;
  border-radius: 10px;
}

.reply-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  transition: 0.2s;
}
.reply-card.admin, .reply-card.admin_restrito {
  border-left: 3px solid #004aad;
  background: #f8fbff;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.reply-author {
  display: flex;
  align-items: center;
  gap: 10px;
}
.reply-avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}
.reply-avatar.admin, .reply-avatar.admin_restrito {
  background: #004aad;
  color: white;
}
.reply-name {
  font-weight: 700;
  font-size: 0.85rem;
  color: #1e293b;
  display: block;
}
.reply-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.reply-date { font-size: 0.72rem; color: #94a3b8; }

.reply-body p {
  font-size: 0.9rem;
  color: #374151;
  line-height: 1.6;
  margin: 0;
}

.edited-tag {
  font-size: 0.68rem;
  color: #94a3b8;
  margin-left: 6px;
  font-style: italic;
}

/* Reply Form */
.reply-form {
  border-top: 1px solid #f1f5f9;
  padding-top: 20px;
}
.reply-form-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px 0;
}
.reply-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  font-size: 0.9rem;
  color: #1e293b;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
  box-sizing: border-box;
}
.reply-textarea:focus { outline: none; border-color: #004aad; background: white; }

.reply-form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}
.mention-hint {
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Edit mode */
.reply-edit-mode {
  margin-top: 10px;
}
.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}

/* Mencoes dropdown */
.mention-wrapper { position: relative; }
.mention-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}
.mention-item {
  padding: 10px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #1e293b;
  font-weight: 600;
}
.mention-item:hover { background: #f1f5f9; }

/* Role badges */
.role-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 5px;
  text-transform: uppercase;
  margin-left: 4px;
}
.role-badge.admin, .role-badge.admin_restrito {
  background: #eff6ff;
  color: #1d4ed8;
}
.role-badge.aluno {
  background: #f0fdf4;
  color: #16a34a;
}

/* Botões */
.btn-primary-sm {
  background: #004aad;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: 0.2s;
}
.btn-primary-sm:hover:not(:disabled) { background: #003a8c; }
.btn-primary-sm:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-secondary-sm {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 7px 14px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.2s;
}
.btn-secondary-sm:hover { background: #f8fafc; }

.btn-icon {
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  transition: 0.2s;
}
.btn-icon:hover { background: #f1f5f9; color: #1e293b; }
.btn-icon.btn-danger:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }

.btn-icon-sm {
  background: transparent;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #94a3b8;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: 0.2s;
}
.btn-icon-sm:hover { color: #475569; background: #f1f5f9; }
.btn-danger-sm:hover { color: #ef4444 !important; background: #fef2f2 !important; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
}
.modal-box {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 560px;
  margin: 20px;
  overflow: hidden;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #f1f5f9;
}
.modal-header h3 {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.modal-body {
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.modal-footer {
  padding: 20px 28px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.hint { font-size: 0.7rem; color: #94a3b8; text-transform: none; font-weight: 500; margin-left: 6px; }
.form-input, .form-select, .form-textarea {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  font-size: 0.9rem;
  color: #1e293b;
  font-family: inherit;
  box-sizing: border-box;
  width: 100%;
}
.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #004aad;
  background: white;
}
.form-textarea { resize: vertical; line-height: 1.5; }

.btn-primary {
  background: #004aad;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}
.btn-primary:hover:not(:disabled) { background: #003a8c; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-secondary {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.btn-secondary:hover { background: #f8fafc; }

/* Spin animation */
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Mencao highlight */
:deep(.mencao) {
  color: #004aad;
  font-weight: 700;
  background: #eff6ff;
  padding: 1px 4px;
  border-radius: 4px;
}

@media (max-width: 900px) {
  .forum-layout { grid-template-columns: 1fr; }
}
</style>
