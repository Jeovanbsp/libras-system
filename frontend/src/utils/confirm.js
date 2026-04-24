import { createApp, h } from 'vue';
import ConfirmModal from '../components/ConfirmModal.vue';

// Criar app temporário para o modal
let modalApp = null;
let modalInstance = null;

// Estado do modal
const state = {
  show: false,
  title: '',
  message: '',
  details: [],
  type: 'warning',
  confirmText: '',
  cancelText: 'Cancelar',
  confirmTextButton: 'Confirmar',
  size: 'md',
  loading: false,
  resolve: null,
  reject: null
};

function createModalApp() {
  if (modalApp) return;
  
  modalApp = createApp({
    render() {
      return h(ConfirmModal, {
        show: state.show,
        title: state.title,
        message: state.message,
        details: state.details,
        type: state.type,
        confirmText: state.confirmText,
        cancelText: state.cancelText,
        confirmTextButton: state.confirmTextButton,
        size: state.size,
        loading: state.loading,
        onConfirm: () => {
          if (state.resolve) state.resolve(true);
          closeModal();
        },
        onCancel: () => {
          if (state.reject) state.reject(false);
          closeModal();
        }
      });
    }
  });
  
  // Criar elemento DOM
  const el = document.createElement('div');
  el.id = 'confirm-modal-container';
  document.body.appendChild(el);
  
  modalInstance = modalApp.mount(el);
}

function openModal(options) {
  // Mesclar opções
  state.show = true;
  state.title = options.title || 'Confirmar Ação';
  state.message = options.message || 'Tem certeza que deseja continuar?';
  state.details = options.details || [];
  state.type = options.type || 'warning';
  state.confirmText = options.confirmText || '';
  state.cancelText = options.cancelText || 'Cancelar';
  state.confirmTextButton = options.confirmTextButton || 'Confirmar';
  state.size = options.size || 'md';
  state.loading = false;
  
  // Garantir que o app existe
  createModalApp();
  
  // Force update
  modalInstance.update();
  
  // Retornar promise
  return new Promise((resolve, reject) => {
    state.resolve = resolve;
    state.reject = reject;
  });
}

function closeModal() {
  state.show = false;
  state.loading = false;
  if (modalInstance) {
    modalInstance.update();
  }
}

function setLoading(loading) {
  state.loading = loading;
  if (modalInstance) {
    modalInstance.update();
  }
}

// Funções de atalho
export function confirm(options) {
  return openModal({ type: 'warning', ...options });
}

export function confirmDanger(options) {
  return openModal({ type: 'danger', ...options });
}

export function confirmEdit(options) {
  return openModal({ type: 'edit', ...options });
}

export function confirmSuccess(options) {
  return openModal({ type: 'success', ...options });
}

export function confirmDelete(itemName, confirmText = 'excluir') {
  return openModal({
    type: 'danger',
    title: 'Confirmar Exclusão',
    message: `Tem certeza que deseja excluir este item?`,
    details: [`A ação de excluir ${itemName} não pode ser desfeita.`],
    confirmText: confirmText,
    confirmTextButton: 'Sim, Excluir',
    cancelText: 'Cancelar'
  });
}

export function confirmEdit(itemName) {
  return openModal({
    type: 'edit',
    title: 'Editar',
    message: `Alterar ${itemName}?`,
    confirmTextButton: 'Salvar',
    cancelText: 'Cancelar'
  });
}

export function showAlert(options) {
  return openModal({ type: 'info', ...options });
}

export default {
  confirm,
  confirmDanger,
  confirmEdit,
  confirmSuccess,
  confirmDelete,
  confirmEdit as edit,
  showAlert,
  setLoading
};