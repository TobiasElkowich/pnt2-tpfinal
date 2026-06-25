<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="not-found-page container card">
    <h1>404 - Página no encontrada</h1>
    <p>Lo sentimos, la página que buscas no existe.</p>
    <RouterLink to="/">Volver al inicio</RouterLink>
  </div>
</template>

<style scoped>
.not-found-page {
  margin-top: 100px;
}
</style>