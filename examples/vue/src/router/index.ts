import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        return `/${year}/${month}`
      },
    },
    {
      path: '/:year(\\d{4})',
      name: 'year',
      component: () => import('../components/calendar/Calendar.vue'),
      props: route => ({
        view: 'year',
        year: parseInt(route.params.year as string),
      }),
    },
    {
      path: '/:year(\\d{4})/:week(\\d{1,2})',
      name: 'week',
      component: () => import('../components/calendar/Calendar.vue'),
      props: route => ({
        view: 'week',
        year: parseInt(route.params.year as string),
        week: parseInt(route.params.week as string),
      }),
    },
    {
      path: '/:year(\\d{4})/:month(\\d{2})',
      name: 'month',
      component: () => import('../components/calendar/Calendar.vue'),
      props: route => ({
        view: 'month',
        year: parseInt(route.params.year as string),
        month: parseInt(route.params.month as string),
      }),
    },
    {
      path: '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})',
      name: 'day',
      component: () => import('../components/calendar/Calendar.vue'),
      props: route => ({
        view: 'day',
        year: parseInt(route.params.year as string),
        month: parseInt(route.params.month as string),
        day: parseInt(route.params.day as string),
      }),
    },
  ],
})

export default router
