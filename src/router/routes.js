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
      {
        path: 'contact',
        component: () => import('@/pages/ContactPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'social-media',
        component: () => import('@/pages/SocialMediaPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'gallery',
        component: () => import('@/pages/GalleryPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'users',
        component: () => import('@/pages/UserPage.vue'),
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
