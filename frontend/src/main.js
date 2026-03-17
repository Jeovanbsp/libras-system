import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Apenas um ponto aqui!

const app = createApp(App)
app.use(router)
app.mount('#app')