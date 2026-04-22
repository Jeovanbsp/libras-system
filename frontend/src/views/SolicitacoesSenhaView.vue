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

  <div v-if="mostrarModal" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-popup">
        <div class="modal-icon" :class="modalTipo">
          <CheckCircle2 v-if="modalTipo === 'success'" :size="48" />
          <AlertCircle v-else :size="48" />
        </div>
        <h3>{{ modalTitulo }}</h3>
        <p>{{ modalMensagem }}</p>
        <div class="modal-actions">
          <button @click="fecharModal" class="btn-modal btn-cancel">Fechar</button>
        </div>
      </div>
    </div>
    
    <!-- Modal de Confirmação -->
    <div v-if="mostrarConfirm" class="modal-overlay" @click.self="fecharConfirm">
      <div class="modal-popup confirm-popup">
        <div class="modal-icon warning">
          <HelpCircle :size="48" />
        </div>
        <h3>{{ confirmTitulo }}</h3>
        <p>{{ confirmMensagem }}</p>
        <div class="modal-actions">
          <button @click="fecharConfirm" class="btn-modal btn-cancel">Cancelar</button>
          <button @click="executarConfirm" class="btn-modal btn-confirm" :class="confirmTipo">{{ confirmBtnText }}</button>
        </div>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { KeyRound, User, Check, X, Inbox, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const solicitacoes = ref([]);

// Modal states
const mostrarModal = ref(false);
const modalTipo = ref('success');
const modalTitulo = ref('');
const modalMensagem = ref('');

const mostrarConfirm = ref(false);
const confirmTitulo = ref('');
const confirmMensagem = ref('');
const confirmTipo = ref('success');
const confirmBtnText = ref('');
const confirmCallback = ref(null);

const fecharModal = () => { mostrarModal.value = false; };

const abrirConfirm = (titulo, mensagem, tipo, btnText, callback) => {
  confirmTitulo.value = titulo;
  confirmMensagem.value = mensagem;
  confirmTipo.value = tipo;
  confirmBtnText.value = btnText;
  confirmCallback.value = callback;
  mostrarConfirm.value = true;
};

const fecharConfirm = () => { mostrarConfirm.value = false; };
const executarConfirm = () => {
  if (confirmCallback.value) confirmCallback.value();
  fecharConfirm();
};

const carregarSolicitacoes = async () => {
  try {
    const res = await api.get('/solicitacoes-senha');
    solicitacoes.value = res.data;
  } catch (err) {
    console.error("Erro ao carregar:", err);
  }
};

const responder = async (id, action) => {
  const isAprovar = action === 'aprovar';
  abrirConfirm(
    isAprovar ? 'Aprovar Solicitação?' : 'Rejeitar Solicitação?',
    isAprovar 
      ? 'A senha do aluno será alterada para a nova senha solicitada.' 
      : 'O aluno continuará com a senha atual. A solicitação será removida.',
    isAprovar ? 'success' : 'error',
    isAprovar ? 'Aprovar' : 'Rejeitar',
    async () => {
      try {
        await api.put(`/solicitacoes-senha/${id}/responder`, { action });
        modalTitulo.value = isAprovar ? 'Senha Atualizada!' : 'Solicitação Rejeitada';
        modalMensagem.value = isAprovar 
          ? 'A nova senha foi aplicada com sucesso para o aluno.' 
          : 'A solicitação de senha foi rejeitada.';
        modalTipo.value = 'success';
        mostrarModal.value = true;
        carregarSolicitacoes();
      } catch (err) {
        modalTitulo.value = 'Erro';
        modalMensagem.value = 'Não foi possível processar a solicitação.';
        modalTipo.value = 'error';
        mostrarModal.value = true;
      }
    }
  );
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

/* Modal Popup */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
.modal-popup { background: white; border-radius: 20px; padding: 30px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-icon { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
.modal-icon.success { background: #dcfce7; color: #059669; }
.modal-icon.error { background: #fee2e2; color: #dc2626; }
.modal-icon.warning { background: #fef3c7; color: #d97706; }
.modal-popup h3 { margin: 0 0 10px; font-size: 1.4rem; color: #1e293b; }
.modal-popup p { color: #64748b; margin: 0 0 25px; line-height: 1.5; }
.modal-actions { display: flex; gap: 12px; justify-content: center; }
.btn-modal { padding: 12px 30px; border-radius: 12px; font-weight: 700; cursor: pointer; border: none; transition: 0.2s; }
.btn-modal.btn-cancel { background: #f1f5f9; color: #64748b; }
.btn-modal.btn-cancel:hover { background: #e2e8f0; }
.btn-modal.btn-confirm { color: white; }
.btn-modal.btn-confirm.success { background: #059669; }
.btn-modal.btn-confirm.success:hover { background: #047857; }
.btn-modal.btn-confirm.error { background: #dc2626; }
.btn-modal.btn-confirm.error:hover { background: #b91c1c; }
</style>
