<template>
  <MainLayout pageTitle="Fórum dos Cursos" pageDescription="Acompanhe as dúvidas dos alunos e responda diretamente.">
    <div class="layout-split">
      
      <div class="glass-card side-list">
        <h3 class="font-bold text-brand-color mb-4">Selecione um Curso</h3>
        <div class="courses-list">
          <button 
            v-for="curso in cursos" :key="curso._id"
            :class="['course-btn', { active: cursoAtual?._id === curso._id }]"
            @click="selecionarCurso(curso)"
          >
            <BookOpen :size="18" /> {{ curso.titulo }}
          </button>
        </div>
      </div>

      <div class="glass-card chat-area" v-if="cursoAtual">
        <div class="chat-header border-b pb-4 mb-4 flex justify-between items-center">
          <h3 class="font-bold text-lg">Fórum: {{ cursoAtual.titulo }}</h3>
        </div>

        <div class="forum-messages">
          <div v-for="msg in mensagens" :key="msg._id" class="message-card">
            <div class="msg-avatar">{{ msg.autor?.nome ? msg.autor.nome.charAt(0).toUpperCase() : 'U' }}</div>
            <div class="msg-body w-full">
              <div class="msg-info flex justify-between">
                <div>
                  <strong>{{ msg.autor?.nome || 'Usuário' }}</strong> 
                  <span class="text-xs text-gray-500 ml-2">{{ formatarData(msg.dataCriacao) }} <em v-if="msg.editada">(Editado)</em></span>
                </div>
                <div class="actions flex gap-2">
                  <button @click="iniciarEdicao(msg)" class="text-blue-500 hover:text-blue-700" title="Editar"><Pencil :size="14"/></button>
                  <button @click="excluirMensagem(msg._id)" class="text-red-500 hover:text-red-700" title="Excluir"><Trash2 :size="14"/></button>
                </div>
              </div>

              <div v-if="editandoId === msg._id" class="mt-2">
                <textarea v-model="textoEdicao" class="w-full p-2 border rounded" rows="2"></textarea>
                <div class="flex gap-2 mt-2">
                  <button @click="salvarEdicao(msg._id)" class="bg-blue-600 text-white px-3 py-1 rounded text-xs">Salvar</button>
                  <button @click="editandoId = null" class="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs">Cancelar</button>
                </div>
              </div>

              <div v-else>
                <p class="mt-1 text-gray-700">{{ msg.texto }}</p>
                <a v-if="msg.imagem" :href="obterUrlArquivo(msg.imagem)" target="_blank" class="block mt-2">
                  <img :src="obterUrlArquivo(msg.imagem)" class="max-h-32 rounded border border-gray-200 hover:opacity-80 transition" />
                </a>
              </div>
            </div>
          </div>
          
          <div v-if="mensagens.length === 0" class="text-center py-10 text-gray-400">
            Nenhuma mensagem neste fórum.
          </div>
        </div>

        <form @submit.prevent="enviarResposta" class="forum-input-area mt-4">
          <div class="relative">
            <textarea v-model="novaMensagem" placeholder="Responda como administrador..." rows="3" required class="w-full p-3 border rounded-xl bg-slate-50"></textarea>
          </div>
          <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-xl mt-2 font-bold w-full flex justify-center items-center gap-2">
            <Send :size="16" /> Enviar Resposta
          </button>
        </form>
      </div>

      <div v-else class="glass-card flex items-center justify-center text-gray-400">
        Selecione um curso ao lado para abrir o fórum.
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { BookOpen, Pencil, Trash2, Send } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const cursos = ref([]);
const cursoAtual = ref(null);
const mensagens = ref([]);
const novaMensagem = ref('');

const editandoId = ref(null);
const textoEdicao = ref('');

const carregarCursos = async () => {
  try {
    const res = await api.get('/cursos');
    cursos.value = res.data;
  } catch (err) { console.error(err); }
};

const selecionarCurso = async (curso) => {
  cursoAtual.value = curso;
  editandoId.value = null;
  try {
    const res = await api.get(`/cursos/${curso._id}/forum`);
    mensagens.value = res.data;
  } catch (err) { console.error(err); }
};

const enviarResposta = async () => {
  if(!novaMensagem.value.trim()) return;
  try {
    await api.post(`/cursos/${cursoAtual.value._id}/forum`, { texto: novaMensagem.value });
    novaMensagem.value = '';
    selecionarCurso(cursoAtual.value); // Recarrega o chat
  } catch (err) { alert('Erro ao enviar.'); }
};

const iniciarEdicao = (msg) => { editandoId.value = msg._id; textoEdicao.value = msg.texto; };

const salvarEdicao = async (msgId) => {
  try {
    await api.put(`/cursos/${cursoAtual.value._id}/forum/${msgId}`, { texto: textoEdicao.value });
    editandoId.value = null;
    selecionarCurso(cursoAtual.value);
  } catch (err) { alert("Erro ao editar."); }
};

const excluirMensagem = async (msgId) => {
  if(!confirm("Apagar esta mensagem permanentemente?")) return;
  try {
    await api.delete(`/cursos/${cursoAtual.value._id}/forum/${msgId}`);
    selecionarCurso(cursoAtual.value);
  } catch (err) { alert("Erro ao excluir."); }
};

const obterUrlArquivo = (caminho) => {
  const baseUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:3000';
  return `${baseUrl}/uploads/${caminho.replace(/\\/g, '/')}`;
};

const formatarData = (iso) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

onMounted(carregarCursos);
</script>

<style scoped>
.layout-split { display: grid; grid-template-columns: 300px 1fr; gap: 20px; align-items: start; height: 75vh;}
.glass-card { background: white; padding: 25px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.03); height: 100%; display: flex; flex-direction: column;}
.courses-list { overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
.course-btn { text-align: left; padding: 12px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; color: #475569; font-weight: 700; display: flex; align-items: center; gap: 8px; transition: 0.2s; cursor: pointer; }
.course-btn:hover { background: #e2e8f0; }
.course-btn.active { background: #004aad; color: white; border-color: #004aad; }

.forum-messages { flex-grow: 1; overflow-y: auto; padding-right: 10px; display: flex; flex-direction: column; gap: 15px; }
.message-card { display: flex; gap: 15px; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; }
.msg-avatar { width: 40px; height: 40px; border-radius: 50%; background: #004aad; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0; }
textarea:focus { outline: none; border-color: #004aad; }
</style>