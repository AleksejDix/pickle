import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/calendar',
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('../components/calendar/Calendar.vue'),
    },
  ],
})

export default router
