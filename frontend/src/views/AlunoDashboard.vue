<template>
  <div class="min-h-screen bg-slate-50 font-sans">
    <nav class="bg-white shadow-sm border-b border-slate-200 p-4 px-8 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="bg-blue-50 p-2 rounded-xl">
          <img src="@/assets/logo.png" alt="Libras System" class="h-8 w-auto" />
        </div>
      </div>
      <button @click="logout" class="text-red-500 text-sm font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition flex items-center gap-2">
        <LogOut :size="16" /> Sair do Sistema
      </button>
    </nav>

    <main class="p-6 md:p-10 max-w-7xl mx-auto">
      <div class="bg-brand rounded-3xl p-8 mb-10 text-white flex justify-between items-center shadow-lg shadow-blue-900/10 relative overflow-hidden">
        <div class="relative z-10">
          <h2 class="text-3xl font-bold mb-2">Olá, Aluno!</h2>
          <p class="text-blue-100 text-sm md:text-base max-w-lg opacity-90">
            Bem-vindo de volta à sua área de estudos profissional. Continue sua jornada de aprendizado e acesse seus materiais abaixo.
          </p>
        </div>
        <div class="hidden md:block absolute right-10 opacity-10 transform rotate-12">
          <GraduationCap :size="150" />
        </div>
      </div>
      
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen :size="24" class="text-blue-700" /> Meus Cursos
        </h3>
      </div>

      <div v-if="cursos.length === 0" class="bg-white p-12 rounded-3xl text-center shadow-sm border border-slate-200">
        <div class="flex justify-center mb-4 opacity-20 text-slate-400">
          <Inbox :size="64" />
        </div>
        <p class="text-slate-500 font-medium text-lg">Você ainda não está matriculado em nenhum curso.</p>
        <button @click="$router.push('/aluno/loja')" class="mt-6 bg-blue-50 text-blue-700 px-6 py-2 rounded-xl font-bold hover:bg-blue-100 transition">
          Ver cursos disponíveis
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="curso in cursos" 
          :key="curso._id" 
          class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:-translate-y-1 hover:shadow-md transition duration-200 flex flex-col"
        >
          <div class="h-40 bg-slate-50 flex items-center justify-center border-b border-slate-100 relative">
            <BookMarked :size="48" class="text-blue-200" />
            <span class="absolute top-4 right-4 bg-green-100 text-green-700 text-[10px] uppercase font-black px-3 py-1 rounded-full tracking-wide">
              Matriculado
            </span>
          </div>
          
          <div class="p-6 flex flex-col flex-grow">
            <h4 class="font-bold text-lg text-slate-800 mb-2">{{ curso.titulo }}</h4>
            <p class="text-sm text-slate-500 mb-6 line-clamp-2 flex-grow">{{ curso.descricao }}</p>
            
            <button 
              @click="$router.push(`/aluno/curso/${curso._id}`)" 
              class="w-full bg-brand text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition"
            >
              Acessar Conteúdo
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { LogOut, GraduationCap, BookOpen, Inbox, BookMarked } from 'lucide-vue-next';
import api from '../services/api';

const router = useRouter();
const cursos = ref([]);

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  router.push('/aluno/login');
};

onMounted(async () => {
  try {
    const response = await api.get('/cursos');
    cursos.value = response.data;
  } catch (error) {
    console.error("Erro ao carregar cursos");
  }
});
</script>

<style scoped>
.bg-brand { background-color: #004aad; }
</style>