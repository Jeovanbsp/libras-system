<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-overlay" @click.self="handleCancel">
        <div class="modal-container" :class="[`modal-${type}`, { 'modal-sm': size === 'sm', 'modal-lg': size === 'lg' }]">
          
          <!-- Ícone -->
          <div class="modal-icon">
            <component :is="iconComponent" :size="iconSize" />
          </div>
          
          <!-- Título -->
          <h3 class="modal-title">{{ title }}</h3>
          
          <!-- Mensagem -->
          <p class="modal-message">{{ message }}</p>
          
          <!-- Detalhes (opcional) -->
          <div v-if="details" class="modal-details">
            <p v-for="(detail, index) in details" :key="index">{{ detail }}</p>
          </div>
          
          <!-- Campo de confirmação (para ações perigosas) -->
          <div v-if="requireConfirmText" class="confirm-input-wrapper">
            <label>Digite <strong>{{ confirmText }}</strong> para confirmar:</label>
            <input 
              v-model="confirmInput" 
              type="text" 
              :placeholder="`Digite '${confirmText}'`"
              class="confirm-input"
            />
          </div>
          
          <!-- Ações -->
          <div class="modal-actions">
            <button 
              type="button" 
              class="btn-modal btn-cancel" 
              @click="handleCancel"
              :disabled="loading"
            >
              {{ cancelText }}
            </button>
            <button 
              type="button" 
              class="btn-modal btn-confirm" 
              :class="[`btn-${type}`, { 'btn-loading': loading }]"
              @click="handleConfirm"
              :disabled="requireConfirmText && confirmInput !== confirmText"
            >
              <span v-if="loading" class="spinner"></span>
              {{ confirmTextButton }}
            </button>
          </div>
          
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle,
  Trash2,
  Edit2,
  Save,
  X
} from 'lucide-vue-next';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirmar Ação'
  },
  message: {
    type: String,
    default: 'Tem certeza que deseja continuar?'
  },
  details: {
    type: Array,
    default: () => []
  },
  type: {
    type: String,
    default: 'warning', // warning, success, danger, info, edit
    validator: (val) => ['warning', 'success', 'danger', 'info', 'edit'].includes(val)
  },
  confirmText: {
    type: String,
    default: ''
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  confirmTextButton: {
    type: String,
    default: 'Confirmar'
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg
    validator: (val) => ['sm', 'md', 'lg'].includes(val)
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const confirmInput = ref('');

// Reset input when modal opens/closes
watch(() => props.show, (newVal) => {
  if (!newVal) {
    confirmInput.value = '';
  }
});

const iconComponent = computed(() => {
  const icons = {
    warning: AlertTriangle,
    success: CheckCircle,
    danger: Trash2,
    info: Info,
    edit: Edit2
  };
  return icons[props.type] || AlertTriangle;
});

const iconSize = computed(() => {
  const sizes = {
    sm: 28,
    md: 36,
    lg: 48
  };
  return sizes[props.size];
});

const requireConfirmText = computed(() => {
  return props.confirmText && props.confirmText.length > 0;
});

function handleCancel() {
  emit('cancel');
}

function handleConfirm() {
  if (requireConfirmText.value && confirmInput.value !== props.confirmText) {
    return;
  }
  emit('confirm');
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 24px;
  padding: 35px;
  width: 100%;
  max-width: 420px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-sm {
  max-width: 350px;
  padding: 25px;
}

.modal-lg {
  max-width: 520px;
  padding: 40px;
}

/* Ícone */
.modal-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

/* Tipos de ícones e cores */
.modal-warning .modal-icon {
  color: #f59e0b;
}

.modal-success .modal-icon {
  color: #10b981;
}

.modal-danger .modal-icon {
  color: #ef4444;
}

.modal-info .modal-icon {
  color: #3b82f6;
}

.modal-edit .modal-icon {
  color: #8b5cf6;
}

/* Título */
.modal-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 12px 0;
}

/* Mensagem */
.modal-message {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 20px 0;
}

/* Detalhes */
.modal-details {
  background: #f8fafc;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: left;
}

.modal-details p {
  color: #475569;
  font-size: 0.85rem;
  margin: 0;
  padding: 4px 0;
}

/* Campo de confirmação */
.confirm-input-wrapper {
  margin-bottom: 25px;
  text-align: left;
}

.confirm-input-wrapper label {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 8px;
}

.confirm-input {
  width: 100%;
  padding: 14px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: 0.2s;
}

.confirm-input:focus {
  outline: none;
  border-color: #004aad;
  box-shadow: 0 0 0 3px rgba(0, 74, 173, 0.1);
}

/* Ações */
.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn-modal {
  flex: 1;
  padding: 14px 24px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: 0.2s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-cancel:hover:not(:disabled) {
  background: #e2e8f0;
  color: #475569;
}

.btn-confirm {
  background: #004aad;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #003a8c;
  transform: translateY(-2px);
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Botões por tipo */
.btn-warning {
  background: #f59e0b;
}

.btn-warning:hover:not(:disabled) {
  background: #d97706;
}

.btn-danger {
  background: #ef4444;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-success {
  background: #10b981;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

/* Spinner de carregamento */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Transições */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.9);
}

/* Responsividade */
@media (max-width: 480px) {
  .modal-container {
    padding: 25px 20px;
  }
  
  .modal-actions {
    flex-direction: column-reverse;
    gap: 10px;
  }
  
  .btn-modal {
    width: 100%;
  }
}
</style>