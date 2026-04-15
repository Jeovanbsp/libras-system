<template>
  <div class="p-6 bg-[#f0f2f5] min-h-screen">
    <div class="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      
      <!-- Cabeçalho -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Logs de Auditoria</h1>
          <p class="text-sm text-gray-500">Monitoramento de ações dos administradores restritos</p>
        </div>
        <button @click="fetchLogs" class="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
          Atualizar
        </button>
      </div>

      <!-- Tabela -->
      <div class="overflow-hidden border border-gray-100 rounded-lg">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
              <th class="p-4 font-semibold">Data e Hora</th>
              <th class="p-4 font-semibold">Usuário</th>
              <th class="p-4 font-semibold">Ação</th>
              <th class="p-4 font-semibold">Módulo/Detalhes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="log in logs" :key="log._id" class="hover:bg-gray-50 transition-colors">
              <td class="p-4 text-sm text-gray-600">
                {{ formatDate(log.timestamp) }}
              </td>
              <td class="p-4">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 uppercase">
                    {{ log.userId?.name?.charAt(0) || 'S' }}
                  </div>
                  <span class="text-sm font-medium text-gray-700">{{ log.userId?.name || 'Sistema' }}</span>
                </div>
              </td>
              <td class="p-4">
                <span :class="getActionBadge(log.action)" class="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight">
                  {{ log.action }}
                </span>
              </td>
              <td class="p-4">
                <div class="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                  <code class="break-all">{{ formatDetails(log.details) }}</code>
                </div>
              </td>
            </tr>
            <tr v-if="logs.length === 0">
              <td colspan="4" class="p-12 text-center text-gray-400">
                Nenhuma atividade registrada no momento.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const logs = ref([]);

const fetchLogs = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3000/api/admin/logs', {
      headers: { Authorization: `Bearer ${token}` }
    });
    logs.value = response.data;
  } catch (error) {
    console.error("Erro ao carregar logs:", error);
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('pt-BR');
};

const formatDetails = (details) => {
  if (!details) return '-';
  // Simplifica o objeto para mostrar apenas o que importa (ex: nome do curso editado)
  const content = details.body || details;
  return JSON.stringify(content).substring(0, 100) + (JSON.stringify(content).length > 100 ? '...' : '');
};

const getActionBadge = (action) => {
  if (action.includes('POST')) return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  if (action.includes('PUT') || action.includes('PATCH')) return 'bg-amber-100 text-amber-700 border border-amber-200';
  if (action.includes('DELETE')) return 'bg-rose-100 text-rose-700 border border-rose-200';
  return 'bg-slate-100 text-slate-700 border border-slate-200';
};

onMounted(fetchLogs);
</script>

<style scoped>
/* Estilo para simular o padrão do seu dashboard */
table {
  font-feature-settings: "tnum" on, "lnum" on;
}
</style>