import { createRouter, createWebHistory } from 'vue-router'

// Importa tus componentes de vista aquí a medida que los crees
// Por ahora, solo tendremos Login y un placeholder para Home/Dashboard

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../views/LoginPage.vue') // Componente para la página de login
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardPage.vue'), // Placeholder para el dashboard
      meta: { requiresAuth: true } // Marca esta ruta como protegida
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('../views/ProjectsPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/projects/:id',
      name: 'project-detail',
      component: () => import('../views/ProjectDetailPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersPage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true } // Requiere autenticación y rol de admin
    },
    // Ruta catch-all para 404
    {
      path: '/:catchAll(.*)',
      name: 'NotFound',
      component: () => import('../views/NotFoundPage.vue') 
    }
  ]
})

// Guarda este middleware, lo usaremos después para la autenticación
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('userToken') // Simula un token de autenticación
  const userRole = localStorage.getItem('userRole') // Simula el rol del usuario

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Si la ruta requiere autenticación y el usuario no está autenticado, redirige al login
    next({ name: 'login' })
  } else if (to.meta.requiresAdmin && userRole !== 'admin') {
    // Si la ruta requiere admin y el usuario no es admin, redirige al dashboard o a una página de error
    alert('No tienes permisos para acceder a esta página.')
    next({ name: 'dashboard' }) // O a una página de "acceso denegado"
  } else if (to.name === 'login' && isAuthenticated) {
    // Si ya está autenticado e intenta ir a login, redirige al dashboard
    next({ name: 'dashboard' })
  } else {
    next() // Continúa a la ruta
  }
})

export default router