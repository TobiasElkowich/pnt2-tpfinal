<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const projectId = route.params.id;

const API_BASE_URL = 'https://6a3d8565d8e212699e23f503.mockapi.io/api';

const project = ref(null);
const tasks = ref([]);
const loadingProject = ref(true);
const loadingTasks = ref(true);
const errorMessage = ref('');

const showTaskModal = ref(false);
const isEditing = ref(false);
const currentTask = ref({
  id: null,
  projectId: projectId,
  title: '',
  description: '',
  dueDate: '',
  status: 'Pending',
  assignee: ''
});

const fetchProjectDetails = async () => {
  loadingProject.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/project/${projectId}`);
    project.value = response.data;
  } catch (error) {
    console.error('Error fetching project:', error);
    errorMessage.value = 'No se pudo cargar la información del proyecto.';
  } finally {
    loadingProject.value = false;
  }
};

const fetchTasks = async () => {
  loadingTasks.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/task?projectId=${projectId}`);
    tasks.value = response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    tasks.value = [];
  } finally {
    loadingTasks.value = false;
  }
};

const saveTask = async () => {
  if (!currentTask.value.title || !currentTask.value.description) {
    alert('El título y la descripción son campos requeridos.');
    return;
  }

  try {
    if (isEditing.value) {
      await axios.put(`${API_BASE_URL}/task/${currentTask.value.id}`, currentTask.value);
    } else {
      const newTask = {
        ...currentTask.value,
        projectId: projectId
      };
      await axios.post(`${API_BASE_URL}/task`, newTask);
    }
    await fetchTasks();
    closeModal();
  } catch (error) {
    console.error('Error saving task:', error);
    alert('Ocurrió un error al guardar la tarea.');
  }
};

const deleteTask = async (taskId) => {
  if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
    return;
  }

  try {
    await axios.delete(`${API_BASE_URL}/task/${taskId}`);
    await fetchTasks();
  } catch (error) {
    console.error('Error deleting task:', error);
    alert('Error al intentar eliminar la tarea.');
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  currentTask.value = {
    id: null,
    projectId: projectId,
    title: '',
    description: '',
    dueDate: '',
    status: 'Pending',
    assignee: ''
  };
  showTaskModal.value = true;
};

const openEditModal = (task) => {
  isEditing.value = true;
  currentTask.value = { ...task };
  showTaskModal.value = true;
};

const closeModal = () => {
  showTaskModal.value = false;
};

const goBack = () => {
  router.push({ name: 'projects' });
};

onMounted(() => {
  fetchProjectDetails();
  fetchTasks();
});
</script>

<template>
  <div class="project-detail-page container">
    <!-- Botón para volver atrás -->
    <button @click="goBack" class="back-button">&larr; Volver a Proyectos</button>

    <!-- Sección de Detalles del Proyecto -->
    <div v-if="loadingProject" class="loading-box">
      Cargando información del proyecto...
    </div>
    <div v-else-if="project" class="project-header-card card">
      <div class="project-title-area">
        <h1>{{ project.name }}</h1>
        <span :class="['status-badge', `status-${project.status.toLowerCase().replace(' ', '-')}`]">
          {{ project.status }}
        </span>
      </div>
      <p class="project-description">{{ project.description }}</p>
      <div class="project-dates">
        <span><strong>Fecha de Inicio:</strong> {{ new Date(project.startDate).toLocaleDateString() }}</span>
        <span><strong>Fecha de Fin:</strong> {{ new Date(project.endDate).toLocaleDateString() }}</span>
      </div>
    </div>
    <div v-else class="error-box">
      {{ errorMessage || 'No se pudo encontrar el proyecto seleccionado.' }}
    </div>

    <!-- Sección del Listado de Tareas (ABM) -->
    <div class="tasks-section">
      <div class="tasks-header">
        <h2>Tareas del Proyecto</h2>
        <button @click="openCreateModal" class="add-task-btn" :disabled="!project">
          + Nueva Tarea
        </button>
      </div>

      <div v-if="loadingTasks" class="loading-box">
        Cargando tareas...
      </div>
      
      <div v-else-if="tasks.length === 0" class="no-tasks card">
        No hay tareas asignadas a este proyecto. ¡Crea la primera tarea para comenzar!
      </div>

      <div v-else class="tasks-list">
        <div v-for="task in tasks" :key="task.id" class="task-item card">
          <div class="task-content">
            <h3 class="task-title">{{ task.title }}</h3>
            <p class="task-desc">{{ task.description }}</p>
            <div class="task-meta">
              <span><strong>Asignado a:</strong> {{ task.assignee || 'Sin asignar' }}</span>
              <span><strong>Fecha límite:</strong> {{ task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha limit' }}</span>
              <span :class="['task-status', `status-${task.status.toLowerCase().replace(' ', '-')}`]">
                {{ task.status }}
              </span>
            </div>
          </div>
          <div class="task-actions">
            <button @click="openEditModal(task)" class="edit-task-btn">Editar</button>
            <button @click="deleteTask(task.id)" class="delete-task-btn">Eliminar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para Crear/Editar Tarea -->
    <div v-if="showTaskModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content card">
        <h2>{{ isEditing ? 'Modificar Tarea' : 'Crear Tarea' }}</h2>
        <form @submit.prevent="saveTask">
          <div class="form-group">
            <label for="taskTitle">Título de la Tarea:</label>
            <input type="text" id="taskTitle" v-model="currentTask.title" required />
          </div>
          
          <div class="form-group">
            <label for="taskDesc">Descripción:</label>
            <textarea id="taskDesc" v-model="currentTask.description" required></textarea>
          </div>

          <div class="form-group">
            <label for="taskAssignee">Responsable / Asignado a:</label>
            <input type="text" id="taskAssignee" v-model="currentTask.assignee" placeholder="Ej: Juan Pérez" />
          </div>

          <div class="form-group">
            <label for="taskDueDate">Fecha Límite:</label>
            <input type="date" id="taskDueDate" v-model="currentTask.dueDate" />
          </div>

          <div class="form-group">
            <label for="taskStatus">Estado de la Tarea:</label>
            <select id="taskStatus" v-model="currentTask.status">
              <option value="Pending">Pendiente</option>
              <option value="In Progress">En Progreso</option>
              <option value="Completed">Completada</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="submit" class="save-btn">{{ isEditing ? 'Actualizar' : 'Crear' }}</button>
            <button type="button" @click="closeModal" class="cancel-btn">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-detail-page {
  margin-top: 30px;
  text-align: left;
}

.back-button {
  background: none;
  border: none;
  color: #3498db;
  font-size: 1.1em;
  cursor: pointer;
  padding: 0;
  margin-bottom: 20px;
  font-weight: 500;
}

.back-button:hover {
  text-decoration: underline;
}

.project-header-card {
  border-left: 6px solid #3498db;
  padding: 25px;
  background-color: white;
  margin-bottom: 30px;
}

.project-title-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.project-title-area h1 {
  margin: 0;
  color: #2c3e50;
}

.status-badge {
  font-weight: bold;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9em;
}

.project-description {
  font-size: 1.1em;
  color: #555;
  margin-bottom: 20px;
}

.project-dates {
  display: flex;
  gap: 30px;
  color: #7f8c8d;
  font-size: 0.95em;
}

/* Sección de Tareas */
.tasks-section {
  margin-top: 40px;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #ddd;
  padding-bottom: 10px;
}

.tasks-header h2 {
  margin: 0;
  color: #2c3e50;
}

.add-task-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-task-btn:hover:not(:disabled) {
  background-color: #2980b9;
}

.add-task-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.loading-box, .error-box, .no-tasks {
  text-align: center;
  padding: 30px;
  color: #7f8c8d;
  font-size: 1.1em;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.task-item:hover {
  transform: translateX(5px);
}

.task-content {
  flex-grow: 1;
}

.task-title {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.task-desc {
  margin: 0 0 15px 0;
  color: #7f8c8d;
  font-size: 0.95em;
}

.task-meta {
  display: flex;
  gap: 20px;
  font-size: 0.85em;
  color: #95a5a6;
  align-items: center;
  flex-wrap: wrap;
}

.task-status {
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 4px;
}

/* Estados Visuales */
.status-pending { background-color: #ffeaa7; color: #d63031; }
.status-in-progress { background-color: #dfe6e9; color: #0984e3; }
.status-completed { background-color: #badc58; color: #6ab04c; }
.status-active { background-color: #e8f5e9; color: #2e7d32; }
.status-on-hold { background-color: #fff3e0; color: #ef6c00; }

.task-actions {
  display: flex;
  gap: 10px;
}

.edit-task-btn, .delete-task-btn {
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-weight: bold;
  font-size: 0.85em;
  transition: background-color 0.2s;
}

.edit-task-btn {
  background-color: #ffeaa7;
  color: #d35400;
}

.edit-task-btn:hover {
  background-color: #f1c40f;
}

.delete-task-btn {
  background-color: #ff7675;
  color: white;
}

.delete-task-btn:hover {
  background-color: #d63031;
}

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
}

.modal-content h2 {
  margin-top: 0;
  text-align: center;
  color: #2c3e50;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.save-btn {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:hover {
  background-color: #27ae60;
}

.cancel-btn {
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #7f8c8d;
}
</style>