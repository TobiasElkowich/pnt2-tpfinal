<script setup>
import { ref, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import axios from 'axios';

// --- Configuración API ---
const API_BASE_URL = 'https://6a3d8565d8e212699e23f503.mockapi.io/api'; // Cambia por tu URL

// --- Estado de Usuario ---
const userRole = ref('');
const userEmail = ref('');

// --- Datos del Sistema ---
const projects = ref([]);
const tasks = ref([]);
const loading = ref(true);
const errorMessage = ref('');

// --- Estado de la IA Generativa ---
const aiPrompt = ref('');
const aiGenerating = ref(false);
const generatedTasks = ref(null);

// --- Carga de Datos ---
const fetchData = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const [projectsRes, tasksRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/project`),
      axios.get(`${API_BASE_URL}/task`)
    ]);
    projects.value = projectsRes.data;
    tasks.value = tasksRes.data;
  } catch (error) {
    console.error('Error al cargar datos del dashboard:', error);
    errorMessage.value = 'No se pudieron recuperar los datos del sistema para las estadísticas.';
  } finally {
    loading.value = false;
  }
};

// --- Estadísticas Computadas (Solo para Admin) ---
const stats = computed(() => {
  const totalProjects = projects.value.length;
  const activeProjects = projects.value.filter(p => p.status === 'Active').length;
  const totalTasks = tasks.value.length;
  const completedTasks = tasks.value.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.value.filter(t => t.status === 'In Progress').length;
  const pendingTasks = tasks.value.filter(t => t.status === 'Pending').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Distribución de tareas por encargado
  const tasksByAssignee = {};
  tasks.value.forEach(t => {
    const name = t.assignee || 'Sin asignar';
    if (!tasksByAssignee[name]) {
      tasksByAssignee[name] = { pending: 0, completed: 0, total: 0 };
    }
    tasksByAssignee[name].total++;
    if (t.status === 'Completed') {
      tasksByAssignee[name].completed++;
    } else {
      tasksByAssignee[name].pending++;
    }
  });

  return {
    totalProjects,
    activeProjects,
    totalTasks,
    completedTasks,
    inProgressTasks,
    pendingTasks,
    completionRate,
    tasksByAssignee
  };
});

// --- Motor de Diagnóstico por IA ---
const aiDiagnostics = computed(() => {
  const alerts = [];
  const today = new Date();

  // 1. Detección de sobrecarga (Cuellos de botella)
  if (stats.value.tasksByAssignee) {
    Object.entries(stats.value.tasksByAssignee).forEach(([name, data]) => {
      if (name !== 'Sin asignar' && data.pending > 3) {
        alerts.push({
          type: 'danger',
          message: `Detección de sobrecarga: ${name} tiene ${data.pending} tareas pendientes. Riesgo alto de retraso.`
        });
      }
    });
  }

  // 2. Detección de tareas retrasadas
  const overdueTasks = tasks.value.filter(t => {
    if (t.status === 'Completed' || !t.dueDate) return false;
    return new Date(t.dueDate) < today;
  });

  if (overdueTasks.length > 0) {
    alerts.push({
      type: 'warning',
      message: `Riesgo de Cronograma: Se detectaron ${overdueTasks.length} tareas fuera de plazo. Se sugiere reprogramación.`
    });
  }

  // 3. Proyectos inactivos
  projects.value.forEach(p => {
    const projectTasks = tasks.value.filter(t => t.projectId === p.id);
    if (p.status === 'Active' && projectTasks.length === 0) {
      alerts.push({
        type: 'info',
        message: `Proyecto Desatendido: El proyecto "${p.name}" está marcado como Activo pero no tiene tareas asociadas.`
      });
    }
  });

  if (alerts.length === 0) {
    alerts.push({
      type: 'success',
      message: 'Salud del Sistema Óptima: No se detectan anomalías ni cuellos de botella en la distribución de tareas.'
    });
  }

  return alerts;
});

// --- Generador de Tareas IA (Simulado con procesamiento de lenguaje local) ---
const generateSmartTasks = () => {
  if (!aiPrompt.value.trim()) return;
  aiGenerating.value = true;
  generatedTasks.value = null;

  // Simulamos retardo de procesamiento de IA para dar realismo a la experiencia de usuario
  setTimeout(() => {
    const prompt = aiPrompt.value.toLowerCase();
    let tasksSuggestion = [];

    // Motor heurístico que responde según palabras clave ingresadas por el usuario
    if (prompt.includes('pago') || prompt.includes('stripe') || prompt.includes('compra')) {
      tasksSuggestion = [
        { title: 'Integrar SDK de Stripe', desc: 'Configurar variables de entorno y conexión con la API de pruebas.', effort: 'Alta', role: 'Developer Senior' },
        { title: 'Diseñar Checkout UI', desc: 'Crear formulario de tarjeta reactivo adaptado a dispositivos móviles.', effort: 'Media', role: 'UI Designer' },
        { title: 'Validación de webhook de pagos', desc: 'Asegurar que el estado de la compra se actualice en la base de datos.', effort: 'Alta', role: 'Backend Dev' }
      ];
    } else if (prompt.includes('login') || prompt.includes('usuario') || prompt.includes('auth')) {
      tasksSuggestion = [
        { title: 'Definir Esquema de Sesión JWT', desc: 'Configurar middleware de autenticación y caducidad de tokens.', effort: 'Media', role: 'Backend Dev' },
        { title: 'Maquetar Vistas de Login y Registro', desc: 'Diseñar pantallas responsivas agregando validaciones de campos.', effort: 'Baja', role: 'Frontend Dev' },
        { title: 'Pruebas de Seguridad en Rutas', desc: 'Verificar la interceptación de peticiones no autorizadas.', effort: 'Baja', role: 'QA Tester' }
      ];
    } else {
      // Respuesta genérica inteligente
      tasksSuggestion = [
        { title: `Fase 1: Análisis de ${aiPrompt.value}`, desc: 'Definir requerimientos específicos y alcance técnico de la funcionalidad.', effort: 'Baja', role: 'Analista Funcional' },
        { title: `Fase 2: Implementación de prototipo`, desc: 'Escribir la estructura lógica principal utilizando buenas prácticas.', effort: 'Alta', role: 'Developer' },
        { title: `Fase 3: Pruebas y despliegue`, desc: 'Realizar pruebas unitarias básicas y verificar el funcionamiento general.', effort: 'Media', role: 'QA / DevOps' }
      ];
    }

    generatedTasks.value = tasksSuggestion;
    aiGenerating.value = false;
  }, 1500);
};

onMounted(() => {
  // Recuperamos la información del usuario del localStorage
  userRole.value = localStorage.getItem('userRole') || 'member';
  userEmail.value = localStorage.getItem('userToken') ? 'Usuario Activo' : '';
  fetchData();
});
</script>

<template>
  <div class="dashboard-page container">
    <!-- Encabezado de bienvenida -->
    <div class="welcome-header card">
      <h1>Hola, ¡Bienvenido de nuevo!</h1>
      <p>Has iniciado sesión con el rol de: <strong class="role-highlight">{{ userRole }}</strong></p>
    </div>

    <!-- VISTA PARA MIEMBRO COMÚN -->
    <div v-if="userRole !== 'admin'" class="member-view card text-center">
      <h2>Acceso Limitado de Colaborador</h2>
      <p>Como Miembro del equipo, puedes ver la lista de proyectos y gestionar el estado de tus tareas asignadas.</p>
      <div class="action-links">
        <RouterLink to="/projects" class="primary-btn">Ir a Proyectos y Tareas</RouterLink>
      </div>
    </div>

    <!-- VISTA PARA ADMINISTRADORES (ESTADÍSTICAS + IA) -->
    <div v-else class="admin-dashboard">
      
      <!-- Mensajes de Carga o Error -->
      <div v-if="loading" class="loading-state card text-center">
        Analizando métricas y cargando datos del sistema...
      </div>
      <div v-else-if="errorMessage" class="error-box card">
        {{ errorMessage }}
      </div>

      <div v-else>
        <!-- Panel de Tarjetas de Resumen -->
        <div class="metrics-grid">
          <div class="metric-card card">
            <span class="metric-title">Proyectos Totales</span>
            <span class="metric-value">{{ stats.totalProjects }}</span>
            <span class="metric-sub">{{ stats.activeProjects }} Activos actualmente</span>
          </div>
          <div class="metric-card card">
            <span class="metric-title">Tareas Registradas</span>
            <span class="metric-value">{{ stats.totalTasks }}</span>
            <span class="metric-sub">{{ stats.completedTasks }} Completadas</span>
          </div>
          <div class="metric-card card">
            <span class="metric-title">Tasa de Finalización</span>
            <div class="progress-container">
              <div class="progress-bar" :style="{ width: stats.completionRate + '%' }"></div>
            </div>
            <span class="metric-value-sub">{{ stats.completionRate }}%</span>
          </div>
        </div>

        <!-- Sección Principal: Estadísticas de Personal y Diagnóstico de IA -->
        <div class="dashboard-main-layout">
          
          <!-- Reporte de Tareas por Colaborador -->
          <div class="card chart-card">
            <h2>Distribución de Trabajo</h2>
            <p class="section-subtitle">Tareas asignadas por miembro del equipo</p>
            
            <div class="bar-chart">
              <div v-for="(data, name) in stats.tasksByAssignee" :key="name" class="chart-row">
                <div class="chart-label">{{ name }}</div>
                <div class="chart-bar-wrapper">
                  <div class="chart-bar completed" :style="{ width: (data.completed / stats.totalTasks * 100) + '%' }" title="Completadas"></div>
                  <div class="chart-bar pending" :style="{ width: (data.pending / stats.totalTasks * 100) + '%' }" title="Pendientes"></div>
                </div>
                <div class="chart-value">{{ data.total }} u.</div>
              </div>
            </div>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-color completed-color"></span> Completadas</span>
              <span class="legend-item"><span class="legend-color pending-color"></span> Pendientes</span>
            </div>
          </div>

          <!-- Diagnóstico de IA (Salud del Proyecto) -->
          <div class="card ai-card">
            <div class="ai-header">
              <span class="ai-icon">✨</span>
              <h2>Diagnóstico de Salud IA</h2>
            </div>
            <p class="section-subtitle">Análisis predictivo de retrasos y asignación de recursos</p>
            
            <div class="ai-alerts-list">
              <div v-for="(alert, index) in aiDiagnostics" :key="index" :class="['ai-alert', `alert-${alert.type}`]">
                <span class="alert-bullet"></span>
                <p>{{ alert.message }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Herramienta Interactiva de IA: Generador de Tareas -->
        <div class="card ai-generator-card">
          <div class="ai-header">
            <span class="ai-icon">🧠</span>
            <h2>Asistente de Planificación IA</h2>
          </div>
          <p class="section-subtitle">Introduce un requerimiento de desarrollo y nuestro modelo generará las tareas sugeridas de inmediato.</p>

          <form @submit.prevent="generateSmartTasks" class="ai-form">
            <input 
              type="text" 
              v-model="aiPrompt" 
              placeholder="Ej: Diseñar flujo de login con recuperación de clave" 
              required
              :disabled="aiGenerating"
            />
            <button type="submit" :disabled="aiGenerating" class="ai-submit-btn">
              {{ aiGenerating ? 'Procesando con IA...' : 'Generar Tareas' }}
            </button>
          </form>

          <!-- Resultados Generados por la IA -->
          <div v-if="aiGenerating" class="ai-loading">
            <div class="spinner"></div>
            <p>Generando desglose técnico de requerimientos...</p>
          </div>

          <div v-if="generatedTasks" class="ai-results animate-fade-in">
            <h3>Sugerencias Estructuradas de Tareas</h3>
            <div class="ai-tasks-grid">
              <div v-for="(task, idx) in generatedTasks" :key="idx" class="ai-task-card">
                <span class="ai-task-num">0{{ idx + 1 }}</span>
                <h4>{{ task.title }}</h4>
                <p>{{ task.desc }}</p>
                <div class="ai-task-badges">
                  <span class="ai-badge effort">Esfuerzo: {{ task.effort }}</span>
                  <span class="ai-badge role">Sugerido: {{ task.role }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  margin-top: 30px;
}

.welcome-header {
  background: linear-gradient(135deg, #2c3e50, #3498db);
  color: white;
  padding: 25px 30px;
  text-align: left;
}

.welcome-header h1 {
  color: white;
  margin: 0 0 10px 0;
}

.role-highlight {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  font-size: 0.9em;
  letter-spacing: 1px;
}

.member-view {
  padding: 40px;
  margin-top: 30px;
}

.primary-btn {
  background-color: #3498db;
  color: white;
  padding: 12px 25px;
  border-radius: 5px;
  font-weight: bold;
  display: inline-block;
  margin-top: 20px;
  transition: background-color 0.3s;
}

.primary-btn:hover {
  background-color: #2980b9;
  text-decoration: none;
}

/* Métricas Clave */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 25px;
}

.metric-card {
  text-align: left;
  border-top: 4px solid #3498db;
}

.metric-title {
  display: block;
  font-size: 0.9em;
  color: #7f8c8d;
  font-weight: bold;
  text-transform: uppercase;
}

.metric-value {
  display: block;
  font-size: 2.2em;
  font-weight: bold;
  color: #2c3e50;
  margin: 5px 0;
}

.metric-sub {
  font-size: 0.85em;
  color: #95a5a6;
}

.metric-value-sub {
  font-size: 1.2em;
  font-weight: bold;
  color: #27ae60;
}

.progress-container {
  background-color: #ecf0f1;
  border-radius: 10px;
  height: 8px;
  margin: 15px 0 5px 0;
  overflow: hidden;
}

.progress-bar {
  background-color: #2ecc71;
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease-in-out;
}

/* Distribución de Grid Principal */
.dashboard-main-layout {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px;
  margin-top: 25px;
}

@media (max-width: 900px) {
  .dashboard-main-layout {
    grid-template-columns: 1fr;
  }
}

.section-subtitle {
  color: #7f8c8d;
  margin-top: -5px;
  margin-bottom: 20px;
  font-size: 0.95em;
  text-align: left;
}

.chart-card {
  text-align: left;
}

/* Gráfico de Barras CSS */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chart-row {
  display: flex;
  align-items: center;
  font-size: 0.95em;
}

.chart-label {
  width: 120px;
  font-weight: 500;
  color: #2c3e50;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chart-bar-wrapper {
  flex-grow: 1;
  background-color: #ecf0f1;
  height: 20px;
  border-radius: 4px;
  display: flex;
  overflow: hidden;
  margin: 0 15px;
}

.chart-bar {
  height: 100%;
  transition: width 0.4s;
}

.chart-bar.completed { background-color: #2ecc71; }
.chart-bar.pending { background-color: #f1c40f; }

.chart-value {
  width: 50px;
  text-align: right;
  font-weight: bold;
  color: #34495e;
}

.chart-legend {
  display: flex;
  gap: 20px;
  margin-top: 25px;
  font-size: 0.85em;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #7f8c8d;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.completed-color { background-color: #2ecc71; }
.pending-color { background-color: #f1c40f; }

/* Tarjeta del Diagnóstico IA */
.ai-card {
  text-align: left;
  border-left: 6px solid #9b59b6;
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.ai-icon {
  font-size: 1.5em;
}

.ai-header h2 {
  margin: 0;
  color: #2c3e50;
}

.ai-alerts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 15px;
  border-radius: 6px;
  font-size: 0.9em;
}

.ai-alert p {
  margin: 0;
  font-weight: 500;
}

.alert-danger { background-color: #fadbd8; color: #78281f; }
.alert-warning { background-color: #fdebd0; color: #7e5109; }
.alert-info { background-color: #e8f8f5; color: #117a65; }
.alert-success { background-color: #eaf2f8; color: #1a5276; }

.alert-bullet {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
}
.alert-danger .alert-bullet { background-color: #c0392b; }
.alert-warning .alert-bullet { background-color: #e67e22; }
.alert-info .alert-bullet { background-color: #1abc9c; }
.alert-success .alert-bullet { background-color: #2980b9; }

/* Generador de Tareas IA */
.ai-generator-card {
  text-align: left;
  border-top: 4px solid #9b59b6;
  margin-top: 25px;
}

.ai-form {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.ai-form input {
  flex-grow: 1;
  padding: 12px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 0;
}

.ai-submit-btn {
  background-color: #9b59b6;
  color: white;
  padding: 12px 25px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  white-space: nowrap;
}

.ai-submit-btn:hover {
  background-color: #8e44ad;
}

.ai-loading {
  text-align: center;
  padding: 30px;
  color: #7f8c8d;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #9b59b6;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.ai-results {
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 25px;
}

.ai-tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.ai-task-card {
  background-color: #fcf8ff;
  border: 1px solid #e8d7f5;
  border-radius: 6px;
  padding: 20px;
  position: relative;
}

.ai-task-num {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 1.5em;
  font-weight: bold;
  color: #e8d7f5;
}

.ai-task-card h4 {
  color: #8e44ad;
  margin: 0 0 10px 0;
}

.ai-task-card p {
  font-size: 0.9em;
  color: #555;
}

.ai-task-badges {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.ai-badge {
  font-size: 0.75em;
  padding: 3px 8px;
  border-radius: 3px;
  font-weight: bold;
}

.ai-badge.effort { background-color: #f1c40f; color: #7f6000; }
.ai-badge.role { background-color: #e8f5e9; color: #2e7d32; }

.loading-state {
  padding: 50px;
  color: #7f8c8d;
}
</style>