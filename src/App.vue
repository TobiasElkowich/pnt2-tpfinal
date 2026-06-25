<script setup>
import { RouterView, useRoute } from 'vue-router'
import { ref, watch } from 'vue';
import Navbar from './components/Navbar.vue'

const route = useRoute();
const showNavbar = ref(true);

watch(() => route.name, (newName) => {
  showNavbar.value = newName !== 'login';
}, { immediate: true });
</script>

<template>
  <div id="app-container">
    <Navbar v-if="showNavbar" /> 
    <RouterView /> 
  </div>
</template>

<style scoped>
#app-container {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: #f4f7f6;
}
</style>