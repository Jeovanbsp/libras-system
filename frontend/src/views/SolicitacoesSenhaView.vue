<template>
  <MainLayout pageTitle="Solicitações de Senha" pageDescription="Aprove ou rejeite solicitações de nova senha dos alunos.">
    
    <div class="glass-card">
      <h3 class="section-title">
        <KeyRound :size="22" class="text-brand" /> Solicitações Pendentes ({{ solicitacoes.length }})
      </h3>
      
      <div v-if="solicitacoes.length === 0" class="empty-state">
        <Inbox :size="48" class="opacity-30" />
        <p>Nenhuma solicitação de senha pendente.</p>
      </div>

      <div v-else class="solicitacoes-list">
        <div v-for="sol in solicitacoes" :key="sol._id" class="solicitacao-card">
          <div class="sol-header">
            <div class="sol-user">
              <User :size="18" class="text-brand" />
              <div>
                <strong>{{ sol.usuario?.nome || 'Usuário' }}</strong>
                <span class="sol-email">{{ sol.email }}</span>
              </div>
            </div>
            <span class="sol-date">{{ formatarData(sol.dataSolicitacao) }}</span>
          </div>
          
          <div class="sol-details">
            <div class="sol-info">
              <span class="label">Nova Senha Solicitada:</span>
              <code class="senha-box">{{ sol.novaSenha }}</code>
            </div>
          </div>
          
          <div class="sol-actions">
            <button @click="responder(sol._id, 'rejeitar')" class="btn-reject">
              <X :size="18" /> Rejeitar
            </button>
            <button @click="responder(sol._id, 'aprovar')" class="btn-approve">
              <Check :size="18" /> Aprovar
            </button>
          </div>
        </div>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { KeyRound, User, Check, X, Inbox } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const solicitacoes = ref([]);

const carregarSolicitacoes = async () => {
  try {
    const res = await api.get('/solicitacoes-senha');
    solicitacoes.value = res.data;
  } catch (err) {
    console.error("Erro ao carregar:", err);
  }
};

const responder = async (id, action) => {
  const confirmMsg = action === 'aprovar' 
    ? "Aprovar esta solicitação?\n\nA senha do aluno será alterada para a nova senha." 
    : "Rejeitar esta solicitação?\n\nO aluno continuará com a senha atual.";
  
  if (!confirm(confirmMsg)) return;
  
  try {
    await api.put(`/solicitacoes-senha/${id}/responder`, { action });
    alert(action === 'aprovar' ? 'Senha atualizada com sucesso!' : 'Solicitação rejeitada.');
    carregarSolicitacoes();
  } catch (err) {
    alert('Erro ao processar solicitação.');
  }
};

const formatarData = (data) => {
  if (!data) return '';
  return new Date(data).toLocaleString('pt-BR');
};

onMounted(carregarSolicitacoes);
</script>

<style scoped>
.section-title { display: flex; align-items: center; gap: 10px; font-size: 1.2rem; color: #1e293b; margin-bottom: 20px; }
.text-brand { color: #004aad; }
.opacity-30 { opacity: 0.3; }

.empty-state { text-align: center; padding: 60px 20px; color: #94a3b8; }
.empty-state p { margin-top: 15px; font-size: 1rem; }

.solicitacoes-list { display: flex; flex-direction: column; gap: 15px; }

.solicitacao-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  transition: 0.2s;
}
.solicitacao-card:hover { border-color: #bfdbfe; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

.sol-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.sol-user { display: flex; align-items: center; gap: 12px; }
.sol-user strong { display: block; color: #1e293b; font-size: 1rem; }
.sol-email { display: block; font-size: 0.85rem; color: #64748b; }
.sol-date { font-size: 0.8rem; color: #94a3b8; background: #f8fafc; padding: 6px 12px; border-radius: 8px; }

.sol-details { background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 15px; }
.sol-info .label { font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 8px; }
.senha-box { 
  display: inline-block; 
  background: #fff; 
  border: 1px solid #e2e8f0; 
  padding: 8px 16px; 
  border-radius: 8px; 
  font-family: monospace; 
  font-size: 1rem;
  color: #059669;
}

.sol-actions { display: flex; gap: 10px; justify-content: flex-end; }
.btn-approve, .btn-reject { 
  display: flex; align-items: center; gap: 8px; 
  padding: 10px 20px; border-radius: 10px; font-weight: 700; 
  cursor: pointer; transition: 0.2s; border: none;
}
.btn-approve { background: #059669; color: white; }
.btn-approve:hover { background: #047857; }
.btn-reject { background: #f1f5f9; color: #64748b; }
.btn-reject:hover { background: #e2e8f0; }
</style>
