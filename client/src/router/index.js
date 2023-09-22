import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import MessagesView from '../views/MessagesView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/messages',
      name: 'messages',
      component: MessagesView,
    },
  ],
});

export default router;
