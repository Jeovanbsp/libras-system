<template>
  <MainLayout pageTitle="Gestão de Usuários" pageDescription="Cadastre e gerencie os alunos e administradores da plataforma.">
    <div class="layout-split">
      
      <div class="glass-card side-form">
        <h3 class="form-title">
          <UserPlus :size="20" class="text-brand" /> Cadastro
        </h3>
        
        <div v-if="mensagemFeedback" :class="['feedback-toast', tipoFeedback]">
          <CheckCircle2 v-if="tipoFeedback === 'success'" :size="20" />
          <AlertCircle v-else :size="20" />
          <p>{{ mensagemFeedback }}</p>
        </div>

        <form @submit.prevent="salvarUsuario" class="modern-form">
          <div class="form-group">
            <label>Nome Completo</label>
            <input v-model="form.nome" placeholder="Ex: Maria Souza" required />
          </div>

          <div class="form-group">
            <label>E-mail</label>
            <input v-model="form.email" type="email" placeholder="maria@email.com" required />
          </div>

          <div class="form-row">
            <div class="form-group-col">
              <label>Senha de Acesso</label>
              <input v-model="form.password" type="password" placeholder="Mínimo 6 caracteres" required />
            </div>
            <div class="form-group-col" v-if="form.role === 'aluno'">
              <label>Turma (Opcional)</label>
              <input v-model="form.turma" placeholder="Ex: Turma A - 2026" />
            </div>
          </div>

          <div class="form-group">
            <label>Nível de Acesso</label>
            <select v-model="form.role" class="modern-select">
              <option value="aluno">Aluno (Área de Estudos)</option>
              <option value="professor">Professor (Gestão de Aulas)</option>
              <option v-if="userRole === 'admin'" value="admin_restrito">Administrador Restrito</option>
              <option v-if="userRole === 'admin'" value="admin">Administrador Geral</option>
            </select>
          </div>

          <!-- Campos de Investimento (apenas para alunos) -->
          <div v-if="form.role === 'aluno'" class="investimento-box">
            <h4><DollarSign :size="16" /> Dados de Investimento</h4>
            
            <div class="form-group">
              <label>Modalidade do Curso</label>
              <select v-model="form.modalidade" class="modern-select">
                <option value="">Selecione...</option>
                <option value="Virtual">Virtual</option>
                <option value="Presencial">Presencial</option>
              </select>
            </div>

            <div class="form-group">
              <label>Valor Total do Curso (R$)</label>
              <input v-model.number="form.valorTotalCurso" type="number" step="0.01" placeholder="0.00" />
            </div>

            <div class="form-group">
              <label>Adquiriu Apostila?</label>
              <select v-model="form.apostila" class="modern-select">
                <option value="">Selecione...</option>
                <option value="Digital">Digital</option>
                <option value="Impressa">Impressa</option>
                <option value="Nenhuma">Nenhuma</option>
              </select>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.combo" />
                <span>Adquiriu o Combo (Conversação + Oficina)</span>
              </label>
            </div>

            <div class="form-group">
              <label>Status do Pagamento</label>
              <select v-model="form.statusPagamento" class="modern-select">
                <option value="">Selecione...</option>
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
              </select>
            </div>
          </div>

          <button type="submit" class="btn-primary">
            <UserCheck :size="18" /> Cadastrar Usuário
          </button>
        </form>
      </div>

      <div class="list-section">
        
        <div class="glass-card search-bar">
          <div class="form-row" style="margin-bottom: 0;">
            <div class="form-group-col flex-2">
              <label class="text-xs font-bold text-gray-500">Buscar Aluno (Nome/Email):</label>
              <input v-model="filtros.busca" placeholder="Digite para pesquisar..." @input="carregarUsuarios" />
            </div>
            <div class="form-group-col">
              <label class="text-xs font-bold text-gray-500">Turma:</label>
              <input v-model="filtros.turma" placeholder="Ex: Turma A" @input="carregarUsuarios" />
            </div>
            <div class="form-group-col">
              <label class="text-xs font-bold text-gray-500">Modalidade:</label>
              <select v-model="filtros.modalidade" @change="carregarUsuarios" class="modern-select">
                <option value="">Todas</option>
                <option value="Virtual">Virtual</option>
                <option value="Presencial">Presencial</option>
              </select>
            </div>
            <div class="form-group-col">
              <label class="text-xs font-bold text-gray-500">Cadastrado a partir de:</label>
              <input v-model="filtros.dataInicio" type="date" @change="carregarUsuarios" />
            </div>
            <div class="form-group-col">
              <label class="text-xs font-bold text-gray-500">Até:</label>
              <input v-model="filtros.dataFim" type="date" @change="carregarUsuarios" />
            </div>
          </div>
        </div>

        <div class="glass-card list-box mt-4">
          <div class="list-header">
            <h3 class="form-title">
              <Users :size="20" class="text-brand" /> Usuários Encontrados ({{ usuarios.length }})
            </h3>
            <button v-if="usuarios.length > 0" @click="gerarPDF" class="btn-pdf">
              <FileText :size="18" /> Gerar PDF
            </button>
          </div>
          <div class="user-list">
            <div v-for="user in usuarios" :key="user._id" class="user-item">
              <div class="item-main">
                <strong>{{ user.nome }}</strong>
                <span class="item-email">
                  <Mail :size="12" /> {{ user.email }}
                </span>
                <span class="text-xs text-gray-400 block mt-1">
                  Cadastrado em: {{ formatarData(user.dataCadastro || user.createdAt) }}
                </span>
                <!-- Campos de investimento - só mostrar se existirem dados -->
                <div v-if="user.modalidade || user.valorTotalCurso || user.statusPagamento || (user.certificados && user.certificados.length > 0)" class="investimento-info">
                  <span v-if="user.modalidade" class="badge-modalidade">{{ user.modalidade }}</span>
                  <span v-if="user.valorTotalCurso" class="badge-valor">R$ {{ user.valorTotalCurso.toFixed(2) }}</span>
                  <span v-if="user.apostila" class="badge-apostila">{{ user.apostila }}</span>
                  <span v-if="user.combo" class="badge-combo">Combo</span>
                  <span v-if="user.statusPagamento" :class="['badge-pagamento', user.statusPagamento === 'Pago' ? 'pago' : 'pendente']">{{ user.statusPagamento }}</span>
                  <span v-if="user.certificados && user.certificados.length > 0" class="badge-certificado">Certificados ({{ user.certificados.length }})</span>
                </div>
              </div>
              <div class="item-actions">
                <span v-if="user.turma" class="turma-badge">{{ user.turma }}</span>
                <span :class="['role-badge', user.role === 'aluno' ? 'role-aluno' : 'role-admin']">
                  {{ user.role === 'admin' ? 'Administrador' : (user.role === 'admin_restrito' ? 'Adm Restrito' : 'Aluno') }}
                </span>
                
                <button 
                  v-if="userRole === 'admin' || (userRole === 'admin_restrito' && user.role === 'aluno')" 
                  @click="abrirModalEdicao(user)" 
                  class="btn-edit-mini" 
                  title="Editar Usuário"
                >
                  <Edit2 :size="18" />
                </button>
                
                <button 
                  v-if="userRole === 'admin' || (userRole === 'admin_restrito' && user.role === 'aluno')" 
                  @click="confirmarRemocao(user)" 
                  class="btn-del-mini" 
                  title="Excluir Usuário"
                >
                  <Trash2 :size="18" />
                </button>
              </div>
            </div>
            
            <div v-if="usuarios.length === 0" class="empty-msg">
              <Inbox :size="40" class="opacity-20" />
              <p>Nenhum usuário atende a esses filtros.</p>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div v-if="mostrarModalExclusao" class="modal-overlay" @click.self="cancelarRemocao">
      <div class="glass-card modal-content delete-modal">
        <div class="delete-icon-wrapper">
          <AlertTriangle :size="40" />
        </div>
        <h3>Excluir Usuário?</h3>
        <p>Tem certeza que deseja apagar o usuário <strong>{{ userParaExcluir?.nome }}</strong>?<br>Todo o progresso de aulas dele será perdido e esta ação é irreversível.</p>
        <div class="modal-actions-row">
          <button @click="cancelarRemocao" class="btn-cancel flex-1">Cancelar</button>
          <button @click="executarRemocao" class="btn-primary btn-danger flex-1">Sim, Excluir</button>
        </div>
      </div>
    </div>

    <!-- MODAL DE EDIÇÃO -->
    <div v-if="mostrarModalEdicao" class="modal-overlay" @click.self="fecharModalEdicao">
      <div class="glass-card modal-content edit-modal">
        <div class="edit-icon-wrapper">
          <Edit2 :size="36" />
        </div>
        <h3>Editar Usuário</h3>
        <p class="edit-subtitle">Atualize o nome e/ou e-mail do usuário <strong>{{ userParaEditar?.nome }}</strong>.</p>
        
        <div v-if="editFeedback" :class="['feedback-toast', editFeedbackTipo]" style="margin-bottom: 15px;">
          <CheckCircle2 v-if="editFeedbackTipo === 'success'" :size="20" />
          <AlertCircle v-else :size="20" />
          <p>{{ editFeedback }}</p>
        </div>

        <form @submit.prevent="salvarEdicao" class="edit-form">
          <div class="form-group">
            <label>Nome Completo</label>
            <input v-model="editForm.nome" placeholder="Nome do usuário" required />
          </div>
          <div class="form-group">
            <label>E-mail</label>
            <input v-model="editForm.email" type="email" placeholder="email@exemplo.com" required />
          </div>
          
          <!-- Nova senha - para admin e admin_restrito -->
          <div v-if="userRole === 'admin' || (userRole === 'admin_restrito' && userParaEditar?.role === 'aluno')" class="form-group">
            <label>Nova Senha <span class="text-xs text-gray-400">(deixe vazio para manter a atual)</span></label>
            <input v-model="editForm.novaSenha" type="password" placeholder="Digite nova senha ou deixe vazio" />
            <p class="text-xs text-gray-500 mt-1">Se preenchida, substitui a senha atual do usuário.</p>
          </div>
          
          <!-- Status Pagamento - apenas para alunos -->
          <div v-if="userParaEditar?.role === 'aluno'" class="form-group">
            <label>Status do Pagamento</label>
            <select v-model="editForm.statusPagamento" class="modern-select">
              <option value="">Selecione...</option>
              <option value="Pendente">Pendente</option>
              <option value="Pago">Pago</option>
            </select>
          </div>
          
          <!-- Dados do Investimento - apenas para alunos -->
          <div v-if="userParaEditar?.role === 'aluno'" class="investimento-box">
            <h4><DollarSign :size="16" /> Dados do Investimento</h4>
            
            <div class="form-group">
              <label>Modalidade</label>
              <select v-model="editForm.modalidade" class="modern-select">
                <option value="">Selecione...</option>
                <option value="Virtual">Virtual</option>
                <option value="Presencial">Presencial</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Valor Total do Curso (R$)</label>
              <input v-model.number="editForm.valorTotalCurso" type="number" step="0.01" placeholder="0.00" class="form-input" />
            </div>
            
            <div class="form-group">
              <label>Apostila</label>
              <select v-model="editForm.apostila" class="modern-select">
                <option value="">Selecione...</option>
                <option value="Digital">Digital</option>
                <option value="Impressa">Impressa</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input v-model="editForm.combo" type="checkbox" />
                <span>Adquiriu Combo (Conversação + Oficina)</span>
              </label>
            </div>
          </div>
          
          <!-- Certificado do Aluno -->
          <div v-if="userParaEditar?.role === 'aluno'" class="investimento-box">
            <h4><Award :size="16" /> Certificados ({{ editForm.certificados?.length || 0 }})</h4>
            
            <!-- Lista de certificados -->
            <div v-if="editForm.certificados && editForm.certificados.length > 0" class="certificados-list">
              <div v-for="(cert, idx) in editForm.certificados" :key="idx" class="cert-item">
                <div class="cert-info">
                  <CheckCircle2 :size="16" class="text-green-600" />
                  <span class="cert-nome">{{ cert.nome }}</span>
                  <span class="cert-data">{{ formatarData(cert.dataUpload) }}</span>
                </div>
                <button @click="removerCertificado(idx)" class="btn-remove-cert" title="Remover certificado">
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
            
            <!-- Adicionar novo certificado -->
            <div class="form-group">
              <label>Nome do Certificado</label>
              <input v-model="nomeCertificado" placeholder="Ex: Curso de Libras Intermediário" class="form-input" />
            </div>
            
            <div class="form-group">
              <label>Enviar Certificado (PDF)</label>
              <input type="file" @change="handleCertificado" accept=".pdf" class="form-input" />
            </div>
          </div>
          
          <div class="modal-actions-row mt-4">
            <button type="button" @click="fecharModalEdicao" class="btn-cancel flex-1">Cancelar</button>
            <button type="submit" class="btn-primary btn-save flex-1">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { jsPDF } from 'jspdf';
import { UserPlus, UserCheck, Users, Mail, Trash2, Inbox, AlertTriangle, CheckCircle2, AlertCircle, Edit2, DollarSign, FileText, Award } from 'lucide-vue-next';
import MainLayout from '../components/MainLayout.vue';
import api from '../services/api';

const userRole = ref(localStorage.getItem('userRole') || 'aluno');

const usuarios = ref([]);
const form = ref({ nome: '', email: '', password: '', role: 'aluno', turma: '', modalidade: '', valorTotalCurso: 0, apostila: '', combo: false, statusPagamento: '' });

const filtros = ref({
  busca: '',
  turma: '',
  modalidade: '',
  dataInicio: '',
  dataFim: ''
});

// Estado para o Modal de Exclusão
const mostrarModalExclusao = ref(false);
const userParaExcluir = ref(null);

// Sistema de Notificações
const mensagemFeedback = ref('');
const tipoFeedback = ref('');
const mostrarMensagem = (msg, tipo = 'success') => {
  mensagemFeedback.value = msg;
  tipoFeedback.value = tipo;
  setTimeout(() => { mensagemFeedback.value = ''; }, 4000);
};

const carregarUsuarios = async () => {
  try {
    const res = await api.get('/usuarios', { params: filtros.value });
    usuarios.value = res.data;
  } catch (error) {
    console.error('Erro ao carregar usuários');
  }
};

const salvarUsuario = async () => {
  try {
    await api.post('/auth/register', form.value);
    form.value = { nome: '', email: '', password: '', role: 'aluno', turma: '' };
    mostrarMensagem('Usuário cadastrado com sucesso!');
    carregarUsuarios();
  } catch (error) {
    mostrarMensagem('Erro ao cadastrar: ' + (error.response?.data?.msg || 'Verifique os dados'), 'error');
  }
};

// ==========================================
// LÓGICA DO NOVO MODAL DE EXCLUSÃO
// ==========================================
const confirmarRemocao = (user) => {
  userParaExcluir.value = user;
  mostrarModalExclusao.value = true;
};

const cancelarRemocao = () => {
  mostrarModalExclusao.value = false;
  userParaExcluir.value = null;
};

const executarRemocao = async () => {
  if (!userParaExcluir.value) return;
  try {
    await api.delete(`/usuarios/${userParaExcluir.value._id}`);
    carregarUsuarios();
    mostrarMensagem("Usuário excluído com sucesso.");
  } catch (error) {
    mostrarMensagem("Erro ao excluir usuário.", "error");
  } finally {
    cancelarRemocao();
  }
};
// ==========================================

// ==========================================
// LÓGICA DO MODAL DE EDIÇÃO
// ==========================================
const mostrarModalEdicao = ref(false);
const userParaEditar = ref(null);
const editForm = ref({ nome: '', email: '', novaSenha: '', statusPagamento: '', modalidade: '', valorTotalCurso: 0, apostila: '', combo: false, certificados: [] });
const nomeCertificado = ref('');
const editFeedback = ref('');
const editFeedbackTipo = ref('');

const abrirModalEdicao = (user) => {
  userParaEditar.value = user;
  editForm.value = { 
    nome: user.nome, 
    email: user.email, 
    novaSenha: '',
    statusPagamento: user.statusPagamento || '',
    modalidade: user.modalidade || '',
    valorTotalCurso: user.valorTotalCurso || 0,
    apostila: user.apostila || '',
    combo: user.combo || false,
    certificados: user.certificados || []
  };
  nomeCertificado.value = '';
  editFeedback.value = '';
  mostrarModalEdicao.value = true;
};

const fecharModalEdicao = () => {
  mostrarModalEdicao.value = false;
  userParaEditar.value = null;
  editForm.value = { nome: '', email: '', novaSenha: '' };
  editFeedback.value = '';
};

const salvarEdicao = async () => {
  if (!userParaEditar.value) return;
  try {
    const dados = { nome: editForm.value.nome, email: editForm.value.email };
    
    if (editForm.value.novaSenha && editForm.value.novaSenha.length >= 6) {
      dados.password = editForm.value.novaSenha;
    }
    
    // Status pagamento e investimento - apenas para alunos
    if (userParaEditar.value.role === 'aluno') {
      if (editForm.value.statusPagamento) dados.statusPagamento = editForm.value.statusPagamento;
      if (editForm.value.modalidade) dados.modalidade = editForm.value.modalidade;
      if (editForm.value.valorTotalCurso) dados.valorTotalCurso = editForm.value.valorTotalCurso;
      if (editForm.value.apostila) dados.apostila = editForm.value.apostila;
      dados.combo = editForm.value.combo || false;
    }
    
    await api.put(`/usuarios/${userParaEditar.value._id}`, dados);
    
    // Upload do certificado se existir
    if (certificadoFile.value && userParaEditar.value.role === 'aluno') {
      await uploadCertificado(userParaEditar.value._id);
      certificadoFile.value = null;
    }
    
    if (editForm.value.novaSenha) {
      editFeedback.value = 'Usuário e senha atualizados com sucesso!';
    } else {
      editFeedback.value = 'Usuário atualizado com sucesso!';
    }
    editFeedbackTipo.value = 'success';
    carregarUsuarios();
    setTimeout(() => fecharModalEdicao(), 1500);
  } catch (error) {
    editFeedback.value = error.response?.data?.error || 'Erro ao atualizar usuário.';
    editFeedbackTipo.value = 'error';
  }
};
// ==========================================

const formatarData = (dataIso) => {
  if (!dataIso) return 'Data não disponível';
  return new Date(dataIso).toLocaleDateString('pt-BR');
};

// Gerar PDF dos alunos
const gerarPDF = () => {
  const doc = new jsPDF();
  const brandColor = [0, 74, 173];
  
  // Cabeçalho
  doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
  doc.rect(0, 0, 210, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text('Relatório de Alunos - Libras Salvador', 105, 10, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 18, { align: 'center' });
  
  let y = 35;
  
  // Lista de alunos
  usuarios.value.forEach((user, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}. ${user.nome}`, 14, y);
    y += 6;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`E-mail: ${user.email}`, 14, y);
    y += 5;
    doc.text(`Turma: ${user.turma || 'Não definida'} | Modalidade: ${user.modalidade || 'Não definida'}`, 14, y);
    y += 5;
    doc.text(`Valor: R$ ${(user.valorTotalCurso || 0).toFixed(2)} | Apostila: ${user.apostila || 'Nenhuma'} | Combo: ${user.combo ? 'Sim' : 'Não'}`, 14, y);
    y += 5;
    doc.text(`Status Pagamento: ${user.statusPagamento || 'Não definido'} | Cadastrado: ${formatarData(user.createdAt)}`, 14, y);
    y += 10;
  });
  
  doc.save(`alunos_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Upload do certificado
const certificadoFile = ref(null);

const handleCertificado = (event) => {
  certificadoFile.value = event.target.files[0];
};

const removerCertificado = async (index) => {
  if (!userParaEditar.value) return;
  try {
    await api.delete(`/certificados/${userParaEditar.value._id}/${index}`);
    editForm.value.certificados.splice(index, 1);
    editFeedback.value = 'Certificado removido com sucesso!';
    editFeedbackTipo.value = 'success';
    carregarUsuarios();
  } catch (err) {
    editFeedback.value = 'Erro ao remover certificado';
    editFeedbackTipo.value = 'error';
  }
};

const uploadCertificado = async (alunoId) => {
  if (!certificadoFile.value) return;
  const formData = new FormData();
  formData.append('certificado', certificadoFile.value);
  if (nomeCertificado.value) {
    formData.append('nomeCertificado', nomeCertificado.value);
  }
  await api.post(`/certificados/${alunoId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  certificadoFile.value = null;
  nomeCertificado.value = '';
};

onMounted(carregarUsuarios);
</script>

<style scoped>
.layout-split { display: grid; grid-template-columns: 380px 1fr; gap: 30px; align-items: start; }
.list-section { display: flex; flex-direction: column; gap: 20px; }
.glass-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0, 74, 173, 0.05); }
.search-bar { padding: 20px 25px; }

/* FEEDBACK TOAST */
.feedback-toast { display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-radius: 12px; margin-bottom: 20px; font-weight: 700; font-size: 0.9rem; animation: slideDown 0.3s ease-out; }
.feedback-toast.success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
.feedback-toast.error { background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

.text-brand { color: #004aad; }
.mt-4 { margin-top: 1rem; }
.mt-1 { margin-top: 0.25rem; }
.flex-2 { flex: 2; }
.block { display: block; }
.text-gray-400 { color: #94a3b8; }
.text-gray-500 { color: #64748b; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 5px; display: block;}

.form-title { margin-bottom: 25px; color: #1e293b; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }

.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.list-header .form-title { margin-bottom: 0; }
.btn-pdf { 
  background: #dc2626; color: white; border: none; padding: 10px 20px; 
  border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px;
  transition: 0.2s;
}
.btn-pdf:hover { background: #b91c1c; }

.modern-form label { display: block; font-size: 0.8rem; font-weight: 700; color: #64748b; margin: 15px 0 5px; text-transform: uppercase; }
.modern-form input, .modern-form select, .search-bar input { 
  width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; 
  background: #f8fafc; font-size: 0.95rem; color: #1e293b; transition: 0.2s; box-sizing: border-box;
}
.modern-form input:focus, .modern-form select:focus, .search-bar input:focus { outline: none; border-color: #004aad; box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1); background: white; }

.form-row { display: flex; gap: 15px; width: 100%; align-items: flex-end; margin-bottom: 15px; }
.form-group-col { flex: 1; display: flex; flex-direction: column; }

.btn-primary { 
  width: 100%; background: #004aad; color: white; border: none; padding: 16px; 
  border-radius: 14px; margin-top: 25px; font-weight: 800; cursor: pointer; transition: 0.3s;
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.btn-primary:hover { background: #003a8c; transform: translateY(-2px); }

.user-item { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; border-bottom: 1px solid #f1f5f9; }
.user-item:hover { background: #f8fafc; border-radius: 12px; padding: 18px 10px; margin: 0 -10px; }

.item-main strong { display: block; color: #1e293b; font-size: 1rem; margin-bottom: 4px; }
.item-email { font-size: 0.85rem; color: #64748b; display: flex; align-items: center; gap: 5px; }

.item-actions { display: flex; align-items: center; gap: 15px; }
.role-badge { font-weight: 800; font-size: 0.7rem; padding: 6px 12px; border-radius: 8px; text-transform: uppercase; }
.role-admin { color: #6d28d9; background: #f5f3ff; }
.role-aluno { color: #004aad; background: #eff6ff; }
.turma-badge { background: #f8fafc; color: #475569; font-size: 0.7rem; font-weight: 700; padding: 6px 10px; border-radius: 8px; border: 1px solid #e2e8f0; }

/* INVESTIMENTO */
.investimento-info { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.investimento-info span { font-size: 0.7rem; padding: 4px 8px; border-radius: 6px; font-weight: 600; }
.badge-modalidade, .badge-valor, .badge-apostila, .badge-combo, .badge-pagamento { 
  background: #f1f5f9; color: #475569; font-size: 0.7rem; font-weight: 600; padding: 4px 8px; border-radius: 6px; border: 1px solid #cbd5e1; }
.badge-modalidade { background: #e0f2fe; color: #0369a1; }
.badge-valor { background: #dcfce7; color: #166534; }
.badge-apostila { background: #fef3c7; color: #92400e; }
.badge-combo { background: #fce7f3; color: #9d174d; }
.badge-pagamento.pago { background: #dcfce7; color: #166534; }
.badge-pagamento.pendente { background: #fef3c7; color: #92400e; }
.badge-certificado { background: #f0fdf4; color: #166534; border: 1px solid #86efac; }

/* Certificado no modal */
.certificado-atual { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; padding: 10px; background: #f0fdf4; border-radius: 8px; border: 1px solid #86efac; }
.btn-remove-cert { background: none; border: none; color: #dc2626; cursor: pointer; padding: 5px; }
.btn-remove-cert:hover { color: #b91c1c; }

/* Uniformizar selects do investimento */
.investimento-box select {
  width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; 
  background: white; color: #1e293b; font-size: 0.9rem;
}
.investimento-box select:focus { outline: none; border-color: #004aad; box-shadow: 0 0 0 3px rgba(0,74,173,0.1); }

.investimento-box { background: #f8fafc; padding: 20px; border-radius: 14px; margin-top: 20px; border: 1px solid #e2e8f0; }
.investimento-box h4 { display: flex; align-items: center; gap: 8px; color: #1e293b; font-size: 0.9rem; margin-bottom: 15px; }
.checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.checkbox-label input { width: auto; margin: 0; }

.btn-edit-mini { background: transparent; border: none; padding: 10px; border-radius: 10px; cursor: pointer; color: #94a3b8; transition: 0.2s; }
.btn-edit-mini:hover { color: #0284c7; background: #dbeafe; }
.btn-del-mini { background: transparent; border: none; padding: 10px; border-radius: 10px; cursor: pointer; color: #94a3b8; transition: 0.2s; }
.btn-del-mini:hover { color: #ef4444; background: #fef2f2; }

.edit-modal { text-align: center; }
.edit-icon-wrapper { background: #eff6ff; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; color: #004aad; }
.edit-subtitle { color: #64748b; font-size: 0.9rem; margin-bottom: 15px; }
.edit-form .form-group { text-align: left; margin-bottom: 12px; }
.edit-form .form-group label { font-weight: 600; font-size: 0.85rem; color: #334155; margin-bottom: 4px; display: block; }
.edit-form .form-group input { width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; transition: 0.2s; box-sizing: border-box; }
.edit-form .form-group input:focus { outline: none; border-color: #004aad; box-shadow: 0 0 0 3px rgba(0,74,173,0.1); }
.btn-save { background: #004aad !important; }
.btn-save:hover { background: #003a8c !important; }

.empty-msg { text-align: center; padding: 40px; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 10px; }

/* MODAL DE EXCLUSÃO */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
.modal-content { max-width: 400px; width: 90%; padding: 30px; }
.delete-modal { text-align: center; }
.delete-icon-wrapper { display: flex; justify-content: center; color: #ef4444; margin-bottom: 15px; }
.delete-modal h3 { font-size: 1.4rem; color: #1e293b; font-weight: 800; margin-bottom: 10px; }
.delete-modal p { color: #64748b; font-size: 0.95rem; margin-bottom: 25px; line-height: 1.5; }
.modal-actions-row { display: flex; gap: 15px; }
.flex-1 { flex: 1; }
.btn-cancel { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; padding: 14px; border-radius: 14px; font-weight: 700; cursor: pointer; text-align: center; }
.btn-cancel:hover { background: #e2e8f0; }
.btn-danger { background-color: #ef4444 !important; border: none; margin-top: 0; }
.btn-danger:hover { background-color: #dc2626 !important; }

@media (max-width: 992px) {
  .layout-split { grid-template-columns: 1fr; gap: 20px; }
  .form-row { flex-direction: column; gap: 15px; }
  .glass-card { padding: 20px; }
  .header-row, .servico-header, .card-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .item-actions-wrapper, .item-actions { align-items: flex-start; margin-top: 15px; width: 100%; }
}
</style>
