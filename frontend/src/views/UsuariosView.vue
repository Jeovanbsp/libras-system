<template>
  <MainLayout pageTitle="Gestão de Alunos" pageDescription="Visualize e gerencie os usuários cadastrados no sistema.">
    <div class="glass-card table-container">
      <table class="modern-table">
        <thead>
          <tr>
            <th>NOME DO ALUNO</th>
            <th>E-MAIL</th>
            <th>DATA DE CADASTRO</th>
            <th class="text-right">AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in usuarios" :key="user._id">
            <td class="font-bold">{{ user.nome }}</td>
            <td>{{ user.email }}</td>
            <td>{{ new Date().toLocaleDateString() }}</td>
            <td class="text-right">
              <button @click="removerUsuario(user._id)" class="btn-icon-del">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const usuarios = ref([]);
const buscarUsuarios = async () => { const res = await api.get('/usuarios'); usuarios.value = res.data; };
const removerUsuario = async (id) => { if(confirm("Remover?")) { await api.delete(`/usuarios/${id}`); buscarUsuarios(); }};
onMounted(buscarUsuarios);
</script>

<style scoped>
.glass-card { background: white; padding: 25px; border-radius: 24px; border: 1px solid #edf2f7; box-shadow: 0 10px 25px rgba(0,0,0,0.03); }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { text-align: left; font-size: 0.7rem; color: #a0aec0; letter-spacing: 1px; padding: 15px; border-bottom: 2px solid #f7fafc; }
.modern-table td { padding: 20px 15px; color: #4a5568; border-bottom: 1px solid #f7fafc; }
.font-bold { font-weight: 600; color: #2d3748; }
.text-right { text-align: right; }
.btn-icon-del { background: #fff5f5; border: none; padding: 10px; border-radius: 12px; cursor: pointer; }
</style>