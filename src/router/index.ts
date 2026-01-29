import NotFoundView from '@/views/NotFoundView.vue'
import Welcome from '@/views/Welcome.vue'
import { createRouter, createWebHistory } from 'vue-router' 

const routes = [
  { path: '/', component: Welcome, name:'home' },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})