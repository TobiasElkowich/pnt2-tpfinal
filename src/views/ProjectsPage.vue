<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const projects = ref([]);
const showCreateModal = ref(false);
const isEditing = ref(false);
const currentProject = ref({
  id: null,
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'Active'
});
const errorMessage = ref('');
const loading = ref(false);

const API_BASE_URL = 'https://6a3d8565d8e212699e23f503.mockapi.io/api'; 


const fetchProjects = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await axios.get(`${API_BASE_URL}/project`);
    projects.value = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error fetching projects:', error);
    errorMessage.value = 'Error al cargar los proyectos. Inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
};

const saveProject = async () => {
  if (!currentProject.value.name || !currentProject.value.description) {
    errorMessage.value = 'Nombre y descripción son obligatorios.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    if (isEditing.value) {
      await axios.put(`${API_BASE_URL}/project/${currentProject.value.id}`, currentProject.value);
    } else {
      const newProjectData = {
        ...currentProject.value,
        createdAt: new Date().toISOString(),
      };
      await axios.post(`${API_BASE_URL}/project`, newProjectData);
    }
    await fetchProjects();
    closeModal();
  } catch (error) {
    console.error('Error saving project:', error);
    errorMessage.value = `Error al ${isEditing.value ? 'actualizar' : 'crear'} el proyecto.`;
  } finally {
    loading.value = false;
  }
};

const deleteProject = async (projectId) => {
  if (!confirm('¿Estás seguro de que quieres eliminar este proyecto? Todas sus tareas también se eliminarán.')) {
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    await axios.delete(`${API_BASE_URL}/project/${projectId}`);
    await fetchProjects();
  } catch (error) {
    console.error('Error deleting project:', error);
    errorMessage.value = 'Error al eliminar el proyecto.';
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  currentProject.value = { 
    id: null, name: '', description: '', startDate: '', endDate: '', status: 'Active' 
  };
  errorMessage.value = '';
  showCreateModal.value = true;
};

const openEditModal = (project) => {
  isEditing.value = true;
  currentProject.value = { ...project }; 
  errorMessage.value = '';
  showCreateModal.value = true;
};

const closeModal = () => {
  showCreateModal.value = false;
};

const goToProjectDetail = (projectId) => {
  router.push({ name: 'project-detail', params: { id: projectId } });
};

onMounted(() => {
  fetchProjects();
});
</script>

<template>
  <div class="projects-page container">
    <div class="header-section">
      <h1>Proyectos</h1>
      <button @click="openCreateModal" class="primary-button">
        Crear Nuevo Proyecto
      </button>
    </div>

    <div v-if="loading" class="loading-message">
      Cargando proyectos...
    </div>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <div v-if="!loading && projects.length === 0" class="no-data-message card">
      No hay proyectos creados aún. ¡Crea uno para empezar!
    </div>

    <div v-else class="project-list">
      <div v-for="project in projects" :key="project.id" class="project-card card">
        <div class="project-info">
          <h2 @click="goToProjectDetail(project.id)" class="project-name-link">{{ project.name }}</h2>
          <p>{{ project.description }}</p>
          <div class="project-meta">
            <span>Inicio: {{ new Date(project.startDate).toLocaleDateString() }}</span>
            <span>Fin: {{ new Date(project.endDate).toLocaleDateString() }}</span>
            <span :class="['project-status', `status-${project.status.toLowerCase().replace(' ', '-')}`]">
              Estado: {{ project.status }}
            </span>
          </div>
        </div>
        <div class="project-actions">
          <button @click="openEditModal(project)" class="edit-button">Editar</button>
          <button @click="deleteProject(project.id)" class="delete-button">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal para Crear/Editar Proyecto -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content card">
        <h2>{{ isEditing ? 'Editar Proyecto' : 'Crear Nuevo Proyecto' }}</h2>
        <form @submit.prevent="saveProject">
          <div class="form-group">
            <label for="projectName">Nombre del Proyecto:</label>
            <input type="text" id="projectName" v-model="currentProject.name" required />
          </div>
          <div class="form-group">
            <label for="projectDescription">Descripción:</label>
            <textarea id="projectDescription" v-model="currentProject.description" required></textarea>
          </div>
          <div class="form-group">
            <label for="projectStartDate">Fecha de Inicio:</label>
            <input type="date" id="projectStartDate" v-model="currentProject.startDate" />
          </div>
          <div class="form-group">
            <label for="projectEndDate">Fecha de Fin:</label>
            <input type="date" id="projectEndDate" v-model="currentProject.endDate" />
          </div>
          <div class="form-group">
            <label for="projectStatus">Estado:</label>
            <select id="projectStatus" v-model="currentProject.status">
              <option value="Active">Activo</option>
              <option value="On Hold">En Pausa</option>
              <option value="Completed">Completado</option>
              <option value="Archived">Archivado</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="submit" :disabled="loading">{{ isEditing ? 'Actualizar' : 'Crear' }} Proyecto</button>
            <button type="button" @click="closeModal" class="secondary-button">Cancelar</button>
          </div>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.projects-page {
  margin-top: 30px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

h1 {
  color: #34495e;
  margin: 0;
}

.primary-button {
  background-color: #28a745; /* Verde para acción principal */
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

.primary-button:hover {
  background-color: #218838;
}

.loading-message, .no-data-message, .error-message {
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 5px;
  text-align: center;
}

.loading-message {
  background-color: #e0f7fa;
  color: #00796b;
}

.error-message {
  background-color: #fce4e4;
  color: #c0392b;
}

.no-data-message {
  background-color: #f0f4f7;
  color: #555;
  margin-top: 30px;
}

.project-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* Responsive grid */
  gap: 20px;
}

.project-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.project-info {
  margin-bottom: 15px;
}

.project-name-link {
  color: #34495e;
  cursor: pointer;
  margin-bottom: 10px;
  transition: color 0.3s ease;
}

.project-name-link:hover {
  color: #3498db;
  text-decoration: underline;
}

.project-card p {
  color: #555;
  font-size: 0.9em;
  line-height: 1.5;
  margin-bottom: 10px;
}

.project-meta span {
  display: block;
  font-size: 0.85em;
  color: #777;
  margin-bottom: 5px;
}

.project-status {
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 3px;
  display: inline-block;
  margin-top: 5px;
}

/* Colores de estado específicos */
.status-active { background-color: #e8f5e9; color: #2e7d32; }
.status-on-hold { background-color: #fff3e0; color: #ef6c00; }
.status-completed { background-color: #e3f2fd; color: #1976d2; }
.status-archived { background-color: #eceff1; color: #455a64; }


.project-actions {
  display: flex;
  gap: 10px;
  margin-top: auto; /* Empuja los botones hacia abajo */
}

.edit-button, .delete-button {
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.3s ease;
  flex-grow: 1; /* Para que los botones se expandan */
}

.edit-button {
  background-color: #f0ad4e; /* Amarillo-naranja */
  color: white;
  border: none;
}
.edit-button:hover {
  background-color: #ec971f;
}

.delete-button {
  background-color: #d9534f; /* Rojo */
  color: white;
  border: none;
}
.delete-button:hover {
  background-color: #c9302c;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  text-align: left;
  position: relative;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #34495e;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.secondary-button {
  background-color: #6c757d; /* Gris para acción secundaria */
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

.secondary-button:hover {
  background-color: #5a6268;
}

</style>