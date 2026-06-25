<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Variables reactivas para los campos del formulario
const email = ref('');
const password = ref('');
const errorMessage = ref(''); // Para mostrar mensajes de error al usuario

// Función para simular el proceso de login
const handleLogin = async () => {
  errorMessage.value = ''; // Limpiar mensajes de error anteriores

  // Simulación de credenciales de usuario y roles
  // En una aplicación real, esto se haría mediante una llamada a una API
  const mockUsers = [
    { email: 'admin@taskflow.com', password: 'password', role: 'admin' },
    { email: 'user@taskflow.com', password: 'password', role: 'member' }
  ];

  const user = mockUsers.find(
    u => u.email === email.value && u.password === password.value
  );

  if (user) {
    // Si las credenciales son válidas, simular un token y guardar rol
    const token = `mock-jwt-token-${user.role}-${Date.now()}`;
    localStorage.setItem('userToken', token);
    localStorage.setItem('userRole', user.role); // Guardar el rol del usuario

    // Redirigir al dashboard
    router.push({ name: 'dashboard' });
  } else {
    errorMessage.value = 'Credenciales inválidas. Inténtalo de nuevo.';
  }
};
</script>

<template>
  <div class="login-page">
    <h1>Iniciar Sesión</h1>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">Correo Electrónico:</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <button type="submit">Entrar</button>
    </form>
    <div class="mock-credentials">
      <p>Credenciales de prueba:</p>
      <p>Admin: `admin@taskflow.com` / `password`</p>
      <p>Usuario: `user@taskflow.com` / `password`</p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 80px auto;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}
h1 {
  color: #34495e;
  margin-bottom: 20px;
}
.error-message {
  color: #e74c3c;
  margin-bottom: 15px;
  font-weight: bold;
}
.mock-credentials {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  font-size: 0.9em;
  color: #666;
  text-align: left;
}
.mock-credentials p {
  margin: 5px 0;
}
</style>