import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Notificações Toast
import Vue3Toasity from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const app = createApp(App);

app.use(Vue3Toasity, {
  autoClose: 5000,
  position: 'top-right',
  theme: 'colored',
});

app.use(router);
app.mount('#app');