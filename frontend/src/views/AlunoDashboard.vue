<template>
  <div class="min-h-screen bg-slate-50 font-sans">
    <nav class="bg-white shadow-sm border-b border-slate-200 p-4 px-8 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <span class="bg-blue-50 text-xl p-2 rounded-xl">🤟</span>
        <h1 class="text-xl font-extrabold text-slate-800">Libras<span class="text-blue-700">System</span></h1>
      </div>
      <button @click="logout" class="text-red-500 text-sm font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition">
        Sair do Sistema
      </button>
    </nav>

    <main class="p-6 md:p-10 max-w-7xl mx-auto">
      <div class="bg-blue-700 rounded-3xl p-8 mb-10 text-white flex justify-between items-center shadow-lg shadow-blue-200/50">
        <div>
          <h2 class="text-3xl font-bold mb-2">Olá, Aluno! 👋</h2>
          <p class="text-blue-100 text-sm md:text-base max-w-lg">
            Bem-vindo de volta à sua área de estudos. Continue o seu aprendizado e acesse os seus materiais didáticos abaixo.
          </p>
        </div>
        <div class="hidden md:block text-7xl opacity-20 transform rotate-12">🎓</div>
      </div>
      
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-slate-800">Meus Cursos</h3>
      </div>

      <div v-if="cursos.length === 0" class="bg-white p-12 rounded-3xl text-center shadow-sm border border-slate-200">
        <div class="text-6xl mb-4 opacity-50">📭</div>
        <p class="text-slate-500 font-medium text-lg">Você ainda não está matriculado em nenhum curso.</p>
        <button class="mt-6 bg-blue-50 text-blue-700 px-6 py-2 rounded-xl font-bold hover:bg-blue-100 transition">
          Ver cursos disponíveis
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="curso in cursos" 
          :key="curso._id" 
          class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:-translate-y-1 hover:shadow-md transition duration-200 flex flex-col"
        >
          <div class="h-40 bg-blue-50 flex items-center justify-center text-6xl border-b border-slate-100 relative">
            📖
            <span class="absolute top-4 right-4 bg-green-100 text-green-700 text-[10px] uppercase font-black px-3 py-1 rounded-full tracking-wide">
              Matriculado
            </span>
          </div>
          
          <div class="p-6 flex flex-col flex-grow">
            <h4 class="font-bold text-lg text-slate-800 mb-2">{{ curso.titulo }}</h4>
            <p class="text-sm text-slate-500 mb-6 line-clamp-2 flex-grow">{{ curso.descricao }}</p>
            
            <button 
              @click="$router.push(`/aluno/curso/${curso._id}`)" 
              class="w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition"
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
    // Por enquanto, listamos todos os cursos ativos. 
    // Futuramente filtraremos pelos cursos em que o aluno está realmente matriculado.
    const response = await api.get('/cursos');
    cursos.value = response.data;
  } catch (error) {
    console.error("Erro ao carregar cursos");
  }
});
</script>