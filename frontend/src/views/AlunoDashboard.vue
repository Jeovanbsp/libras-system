<template>
  <div class="aluno-container">
    <aside class="sidebar-aluno">
      <div class="logo">🤟 Libras<span>Aluno</span></div>
      <nav>
        <div class="nav-item active">🏠 Meus Cursos</div>
        <div class="nav-item">📚 Materiais</div>
        <div class="nav-item">🎓 Certificados</div>
      </nav>
      <button @click="handleLogout" class="btn-logout">Sair</button>
    </aside>

    <main class="aluno-content">
      <header>
        <h1>Olá, {{ nomeUsuario }}! 👋</h1>
        <p>Continue seus estudos de onde parou.</p>
      </header>

      <div class="cursos-grid">
        <div class="curso-card">
          <div class="curso-thumb">🎬</div>
          <div class="curso-info">
            <h3>Libras Iniciante: Módulo 1</h3>
            <div class="progress-bar">
              <div class="progress" style="width: 45%"></div>
            </div>
            <span>45% concluído</span>
          </div>
        </div>

        <div class="curso-card">
          <div class="curso-thumb">🤟</div>
          <div class="curso-info">
            <h3>Sinais de Família e Casa</h3>
            <div class="progress-bar">
              <div class="progress" style="width: 10%"></div>
            </div>
            <span>10% concluído</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const nomeUsuario = ref(localStorage.getItem('userNome') || 'Aluno');

const handleLogout = () => {
  localStorage.clear();
  router.push('/');
};
</script>

<style scoped>
.aluno-container { display: flex; min-height: 100vh; background: #f4f7fe; }
.sidebar-aluno { width: 260px; background: #fff; padding: 30px; display: flex; flex-direction: column; box-shadow: 4px 0 10px rgba(0,0,0,0.02); }
.logo { font-size: 1.5rem; font-weight: bold; margin-bottom: 40px; color: #2d3436; }
.logo span { color: #6c5ce7; }
.nav-item { padding: 15px; border-radius: 12px; cursor: pointer; margin-bottom: 10px; color: #636e72; transition: 0.3s; }
.nav-item.active { background: #6c5ce7; color: white; }
.btn-logout { margin-top: auto; padding: 12px; border: none; border-radius: 10px; background: #ffeaa7; color: #d63031; font-weight: bold; cursor: pointer; }

.aluno-content { flex: 1; padding: 40px; text-align: left; }
.cursos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 30px; }
.curso-card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.curso-thumb { height: 150px; background: #a29bfe; display: flex; align-items: center; justify-content: center; font-size: 3rem; }
.curso-info { padding: 20px; }
.progress-bar { height: 8px; background: #eee; border-radius: 4px; margin: 15px 0 5px; }
.progress { height: 100%; background: #6c5ce7; border-radius: 4px; }
.curso-info span { font-size: 0.8rem; color: #b2bec3; }
</style>