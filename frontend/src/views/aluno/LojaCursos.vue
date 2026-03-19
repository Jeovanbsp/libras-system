<template>
  <StudentLayout pageTitle="Catálogo de Cursos" pageDescription="Explore novos treinamentos e aprimore a sua fluência em Libras.">
    <div class="courses-grid">
      
      <div v-for="c in cursosDisponiveis" :key="c._id" class="glass-card course-card">
        <div class="badge">{{ c.nivel }}</div>
        
        <div class="course-icon">
          <Star :size="32" />
        </div>
        
        <h3>{{ c.titulo }}</h3>
        <p>{{ c.descricao }}</p>

        <div class="price-section">
          <div v-if="!c.gratuito" class="price-tag">
            <span class="currency">R$</span>
            <span class="amount">{{ c.valor.toFixed(2).replace('.', ',') }}</span>
          </div>
          <div v-else class="price-tag free">
            <span class="amount">Gratuito</span>
          </div>
        </div>
        
        <div class="course-footer">
          <span class="duration">
            <Clock :size="16" class="footer-icon" /> {{ c.cargaHoraria }}h
          </span>

          <button 
            v-if="c.gratuito" 
            @click="matricular(c._id)" 
            class="btn-enroll" 
            :disabled="loading === c._id"
          >
            {{ loading === c._id ? 'Processando...' : 'Matricular-se' }}
          </button>

          <a 
            v-else 
            :href="gerarLinkWhatsapp(c.titulo)" 
            target="_blank" 
            class="btn-whatsapp-request"
          >
            <MessageCircle :size="18" /> Solicitar Acesso
          </a>
        </div>
      </div>

      <div v-if="cursosDisponiveis.length === 0" class="empty-msg">
        <div class="empty-icon-wrapper">
          <ShoppingBag :size="48" />
        </div>
        <p>Não há novos cursos disponíveis no momento.</p>
      </div>

    </div>
  </StudentLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Star, Clock, ShoppingBag, MessageCircle } from 'lucide-vue-next';
import StudentLayout from '../../components/StudentLayout.vue';
import api from '../../services/api';

const router = useRouter();
const cursosDisponiveis = ref([]);
const loading = ref(null);

const carregarCatalogo = async () => {
  try {
    const res = await api.get('/cursos');
    cursosDisponiveis.value = res.data;
  } catch (err) {
    console.error("Erro ao carregar catálogo", err);
  }
};

const matricular = async (cursoId) => {
  loading.value = cursoId;
  try {
    await api.post(`/cursos/${cursoId}/matricular`);
    alert("Matrícula confirmada com sucesso! Bem-vindo(a) à turma.");
    router.push('/aluno/cursos');
  } catch (error) {
    // Caso o backend retorne o erro 403 que configuramos para cursos pagos
    alert(error.response?.data?.message || "Erro ao realizar matrícula.");
  } finally {
    loading.value = null;
  }
};

const gerarLinkWhatsapp = (tituloCurso) => {
  const fone = "5571988361371";
  const msg = encodeURIComponent(`Olá! Tenho interesse no curso "${tituloCurso}" e gostaria de saber como realizar o pagamento para liberar meu acesso.`);
  return `https://wa.me/${fone}?text=${msg}`;
};

onMounted(carregarCatalogo);
</script>

<style scoped>
.courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; }
.glass-card { background: white; padding: 30px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05); }
.course-card { position: relative; display: flex; flex-direction: column; transition: all 0.3s ease; }
.course-card:hover { transform: translateY(-6px); border-color: #004aad; box-shadow: 0 15px 35px rgba(30, 64, 175, 0.1); }

.badge { position: absolute; top: 25px; right: 25px; background: #eff6ff; color: #004aad; padding: 6px 14px; border-radius: 10px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }

.course-icon { 
  margin-bottom: 20px; 
  background: #f8fafc; 
  width: 70px; 
  height: 70px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  border-radius: 18px; 
  border: 1px solid #f1f5f9;
  color: #004aad; 
}

.course-card h3 { color: #1e293b; margin-bottom: 12px; font-size: 1.25rem; font-weight: 800; padding-right: 80px; }
.course-card p { color: #64748b; font-size: 0.95rem; margin-bottom: 15px; flex-grow: 1; line-height: 1.5; }

/* Preço */
.price-section { margin-bottom: 20px; }
.price-tag { display: flex; align-items: baseline; gap: 4px; color: #1e293b; }
.price-tag.free { color: #059669; }
.currency { font-size: 0.85rem; font-weight: 700; }
.amount { font-size: 1.4rem; font-weight: 900; }

.course-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 20px; }
.duration { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #64748b; font-weight: 600; }
.footer-icon { color: #94a3b8; }

/* Botões */
.btn-enroll { background: #059669; color: white; border: none; padding: 12px 20px; border-radius: 14px; cursor: pointer; font-weight: 800; font-size: 0.9rem; transition: 0.2s; }
.btn-enroll:hover:not(:disabled) { background: #047857; transform: scale(1.05); }

.btn-whatsapp-request { 
  background: #004aad; 
  color: white; 
  text-decoration: none; 
  padding: 12px 20px; 
  border-radius: 14px; 
  font-weight: 800; 
  font-size: 0.85rem; 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  transition: 0.2s; 
}
.btn-whatsapp-request:hover { background: #003580; transform: scale(1.05); }

.btn-enroll:disabled { opacity: 0.6; cursor: not-allowed; }

.empty-msg { grid-column: 1 / -1; text-align: center; padding: 60px; color: #94a3b8; font-weight: 500; background: white; border-radius: 24px; border: 2px dashed #e2e8f0; display: flex; flex-direction: column; align-items: center; gap: 15px; }
</style>