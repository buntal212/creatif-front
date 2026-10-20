const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('@/pages/DashboardPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'login',
        component: () => import('@/pages/IndexPage.vue'),
        meta: { guestOnly: true },
      },
      {
        path: 'categories',
        component: () => import('@/pages/CategoryPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'products',
        component: () => import('@/pages/ProductPage.vue'),
        meta: { requiresAuth: true },
      },
      { path: 'second', component: () => import('@/pages/SecondPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
