<template>
  <MainLayout pageTitle="Gestão de Cursos" pageDescription="Crie e edite seus treinamentos de Libras.">
    <div class="layout-split">
      <div class="glass-card side-form">
        <h3 class="form-title">{{ editandoId ? '📝 Editar Curso' : '✨ Novo Curso' }}</h3>
        <form @submit.prevent="salvarCurso" class="modern-form">
          <label>Título do Curso</label>
          <input v-model="curso.titulo" placeholder="Ex: Libras Avançado" required />
          
          <label>Descrição</label>
          <textarea v-model="curso.descricao" rows="4"></textarea>
          
          <div class="form-row">
            <div>
              <label>Carga Horária</label>
              <input v-model.number="curso.cargaHoraria" type="number" />
            </div>
            <div>
              <label>Nível</label>
              <select v-model="curso.nivel">
                <option value="Básico">Básico</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
              </select>
            </div>
          </div>
          
          <button type="submit" class="btn-primary">{{ editandoId ? 'Salvar Alterações' : 'Cadastrar' }}</button>
          <button v-if="editandoId" @click="cancelarEdicao" type="button" class="btn-cancel">Cancelar</button>
        </form>
      </div>

      <div class="cursos-grid">
        <div v-for="c in cursos" :key="c._id" class="glass-card curso-card">
          <div class="curso-badge">{{ c.nivel }}</div>
          <h4>{{ c.titulo }}</h4>
          <p>{{ c.descricao }}</p>
          <div class="curso-footer">
            <span>🕒 {{ c.cargaHoraria }}h</span>
            <div class="actions">
              <button @click="prepararEdicao(c)" class="btn-edit">✏️</button>
              <button @click="removerCurso(c._id)" class="btn-del">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const cursos = ref([]);
const editandoId = ref(null);
const curso = ref({ titulo: '', descricao: '', cargaHoraria: 0, nivel: 'Básico' });

const buscarCursos = async () => { const res = await api.get('/cursos'); cursos.value = res.data; };
const salvarCurso = async () => {
  if (editandoId.value) await api.put(`/cursos/${editandoId.value}`, curso.value);
  else await api.post('/cursos', curso.value);
  cancelarEdicao(); buscarCursos();
};
const prepararEdicao = (c) => { editandoId.value = c._id; curso.value = { ...c }; };
const cancelarEdicao = () => { editandoId.value = null; curso.value = { titulo: '', descricao: '', cargaHoraria: 0, nivel: 'Básico' }; };
const removerCurso = async (id) => { if(confirm("Remover curso?")) { await api.delete(`/cursos/${id}`); buscarCursos(); } };

onMounted(buscarCursos);
</script>

<style scoped>
.layout-split { display: grid; grid-template-columns: 350px 1fr; gap: 30px; }
.glass-card { background: white; padding: 25px; border-radius: 24px; border: 1px solid #edf2f7; }
.form-title { margin-bottom: 20px; color: #2d3748; }
.modern-form label { display: block; font-size: 0.8rem; font-weight: 600; color: #718096; margin: 10px 0 5px; }
.modern-form input, .modern-form textarea, .modern-form select { 
  width: 100%; padding: 12px; border: 1px solid #edf2f7; border-radius: 12px; background: #f8f9fd; 
}
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.btn-primary { width: 100%; background: #8e44ad; color: white; border: none; padding: 15px; border-radius: 12px; margin-top: 20px; font-weight: bold; cursor: pointer; }
.cursos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.curso-card { position: relative; display: flex; flex-direction: column; }
.curso-badge { position: absolute; top: 15px; right: 15px; background: #f3e8ff; color: #8e44ad; padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: bold; }
.curso-card h4 { margin-bottom: 10px; color: #2d3748; }
.curso-card p { font-size: 0.9rem; color: #718096; flex: 1; }
.curso-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #f7fafc; }
.btn-edit, .btn-del { border: none; background: #f8f9fd; padding: 8px; border-radius: 8px; cursor: pointer; margin-left: 5px; }
</style>