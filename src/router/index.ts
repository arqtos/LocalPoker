import GameView from '@/views/GameView.vue'
import SetupView from '@/views/SetupView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Setup',
      component: SetupView
    },
    {
      path: '/game',
      name: 'Game',
      component: GameView
    }
  ],
})

export default router
