<template>
  <MainLayout pageTitle="Logs de Auditoria" pageDescription="Monitoramento em tempo real das ações dos administradores restritos.">
    
    <div class="glass-card">
      <div class="header-row">
        <div>
          <h3 class="section-title"><ClipboardList :size="20" class="text-brand" /> Registro de Atividades</h3>
          <p class="section-desc">Todas as ações de escrita realizadas pelo Admin Restrito são registradas aqui.</p>
        </div>
        <button @click="fetchLogs" class="btn-refresh" :disabled="carregando">
          <RefreshCw :size="16" :class="{ spin: carregando }" /> Atualizar
        </button>
      </div>

      <div v-if="carregando" class="loading-state">
        <RefreshCw :size="24" class="spin" /> Carregando logs...
      </div>

      <div v-else-if="logs.length === 0" class="empty-state">
        <ClipboardList :size="48" class="opacity-20" />
        <p>Nenhuma atividade registrada ainda.</p>
        <span>As ações do Admin Restrito aparecerão aqui automaticamente.</span>
      </div>

      <div v-else class="logs-table-wrapper">
        <table class="logs-table">
          <thead>
            <tr>
              <th>Data e Hora</th>
              <th>Usuário</th>
              <th>Ação</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log._id" class="log-row">
              <td class="td-date">
                <Clock :size="14" class="icon-inline" />
                {{ formatDate(log.timestamp) }}
              </td>
              <td class="td-user">
                <div class="user-chip">
                  <div class="user-avatar">{{ (log.userId?.nome || 'S')[0].toUpperCase() }}</div>
                  <span>{{ log.userId?.nome || 'Sistema' }}</span>
                </div>
              </td>
              <td class="td-action">
                <span :class="['action-badge', getActionClass(log.action)]">
                  {{ getActionLabel(log.action) }}
                </span>
                <span class="action-path">{{ getActionPath(log.action) }}</span>
              </td>
              <td class="td-details">
                <code class="details-code">{{ formatDetails(log.details) }}</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ClipboardList, RefreshCw, Clock } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const logs = ref([]);
const carregando = ref(false);

const fetchLogs = async () => {
  carregando.value = true;
  try {
    const res = await api.get('/admin/logs');
    logs.value = res.data;
  } catch (error) {
    console.error("Erro ao carregar logs:", error);
  } finally {
    carregando.value = false;
  }
};

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleString('pt-BR');
};

const formatDetails = (details) => {
  if (!details) return '-';
  const content = details.body || details;
  const str = JSON.stringify(content);
  return str.length > 120 ? str.substring(0, 120) + '...' : str;
};

const getActionClass = (action) => {
  if (!action) return 'badge-default';
  if (action.includes('DELETE')) return 'badge-delete';
  if (action.includes('PUT') || action.includes('PATCH')) return 'badge-update';
  if (action.includes('POST')) return 'badge-create';
  return 'badge-default';
};

const getActionLabel = (action) => {
  if (!action) return '?';
  if (action.includes('DELETE')) return 'Excluiu';
  if (action.includes('PUT') || action.includes('PATCH')) return 'Editou';
  if (action.includes('POST')) return 'Criou';
  return 'Acessou';
};

const getActionPath = (action) => {
  if (!action) return '';
  const parts = action.split(' ');
  return parts[1] || '';
};

onMounted(fetchLogs);
</script>

<style scoped>
.glass-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
  padding: 30px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
  gap: 20px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 4px 0;
}

.text-brand { color: #004aad; }
.section-desc { font-size: 0.85rem; color: #64748b; margin: 0; }

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #004aad;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.2s;
  flex-shrink: 0;
}
.btn-refresh:hover:not(:disabled) { background: #003a8c; }
.btn-refresh:disabled { opacity: 0.6; cursor: not-allowed; }

.loading-state {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  padding: 40px;
  color: #94a3b8;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 50px;
  color: #94a3b8;
  text-align: center;
}
.empty-state p { font-size: 1rem; font-weight: 600; margin: 0; color: #64748b; }
.empty-state span { font-size: 0.85rem; }
.opacity-20 { opacity: 0.2; }

.logs-table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.logs-table thead tr {
  background: #f8fafc;
}

.logs-table th {
  padding: 12px 16px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.log-row { border-bottom: 1px solid #f1f5f9; transition: 0.15s; }
.log-row:last-child { border-bottom: none; }
.log-row:hover { background: #f8fafc; }

.logs-table td {
  padding: 12px 16px;
  vertical-align: middle;
}

.td-date {
  color: #64748b;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}
.icon-inline { color: #94a3b8; }

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-avatar {
  width: 28px;
  height: 28px;
  background: #004aad;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.td-action {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.action-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
.badge-create { background: #dcfce7; color: #166534; }
.badge-update { background: #fef3c7; color: #92400e; }
.badge-delete { background: #fee2e2; color: #991b1b; }
.badge-default { background: #f1f5f9; color: #475569; }

.action-path {
  font-size: 0.75rem;
  color: #94a3b8;
  font-family: monospace;
}

.details-code {
  font-size: 0.72rem;
  color: #64748b;
  background: #f8fafc;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  font-family: 'Courier New', monospace;
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .header-row { flex-direction: column; }
  .logs-table { font-size: 0.8rem; }
}
</style>
