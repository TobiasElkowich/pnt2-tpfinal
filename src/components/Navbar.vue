<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { ref, watchEffect } from 'vue';

const router = useRouter();
const isAuthenticated = ref(false);
const userRole = ref('');

// Comprueba el estado de autenticación y el rol al cargar y cuando cambie el localStorage
watchEffect(() => {
  isAuthenticated.value = !!localStorage.getItem('userToken');
  userRole.value = localStorage.getItem('userRole') || '';
});

const handleLogout = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userRole');
  isAuthenticated.value = false; // Actualizar estado local
  userRole.value = ''; // Limpiar rol
  router.push({ name: 'login' }); // Redirigir al login
};
</script>

<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <RouterLink to="/dashboard">TaskFlow</RouterLink>
    </div>
    <div class="navbar-menu">
      <template v-if="isAuthenticated">
        <RouterLink to="/projects">Proyectos</RouterLink>
        <RouterLink v-if="userRole === 'admin'" to="/users">Usuarios</RouterLink>
        <button @click="handleLogout" class="logout-btn">Cerrar Sesión</button>
      </template>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #34495e; /* Color oscuro para la barra */
  padding: 15px 30px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.navbar-brand a {
  color: white;
  font-size: 1.5em;
  font-weight: bold;
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  gap: 20px;
  align-items: center;
}

.navbar-menu a {
  color: #ecf0f1; /* Gris claro para los enlaces */
  text-decoration: none;
  font-weight: 500;
  padding: 5px 0;
  transition: color 0.3s ease;
}

.navbar-menu a:hover,
.navbar-menu a.router-link-exact-active {
  color: #3498db; /* Azul al pasar el ratón o estar activo */
  text-decoration: none;
}

.logout-btn {
  background-color: #e74c3c; /* Rojo para el botón de salir */
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background-color: #c0392b;
}
</style>