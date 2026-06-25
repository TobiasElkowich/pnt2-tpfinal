<script setup>
import { ref, onMounted } from 'vue';

const users = ref([]);
const loading = ref(true);
const errorMessage = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const currentUser = ref({
  id: null,
  name: '',
  email: '',
  password: '',
  role: 'member'
});

const loggedInUserEmail = 'admin@taskflow.com';

const initializeLocalUsers = () => {
  const localData = localStorage.getItem('taskflow_users');
  
  if (!localData) {
    const seedUsers = [
      {
        id: "1",
        createdAt: new Date("2026-01-10T10:00:00.000Z").toISOString(),
        name: "Admin Principal",
        email: "admin@taskflow.com",
        role: "admin",
        password: "password"
      },
      {
        id: "2",
        createdAt: new Date("2026-02-15T11:30:00.000Z").toISOString(),
        name: "Sofía Martínez",
        email: "user@taskflow.com",
        role: "member",
        password: "password"
      },
      {
        id: "3",
        createdAt: new Date("2026-03-20T09:45:00.000Z").toISOString(),
        name: "Lucas Pérez",
        email: "lucas.perez@example.com",
        role: "member",
        password: "password123"
      },
      {
        id: "4",
        createdAt: new Date("2026-04-01T14:20:00.000Z").toISOString(),
        name: "María Gómez",
        email: "maria.gomez@example.com",
        role: "member",
        password: "password123"
      }
    ];
    localStorage.setItem('taskflow_users', JSON.stringify(seedUsers));
    users.value = seedUsers;
  } else {
    users.value = JSON.parse(localData);
  }
};


const fetchUsers = () => {
  loading.value = true;
  try {
    const localData = localStorage.getItem('taskflow_users');
    users.value = localData ? JSON.parse(localData) : [];
  } catch (error) {
    console.error("Error al leer usuarios locales:", error);
    errorMessage.value = 'No se pudieron recuperar los usuarios locales.';
  } finally {
    loading.value = false;
  }
};

const saveUser = () => {
  if (!currentUser.value.name || !currentUser.value.email || (!isEditing.value && !currentUser.value.password)) {
    alert('Por favor, completa todos los campos obligatorios.');
    return;
  }

  try {
    let updatedUsers = [...users.value];

    if (isEditing.value) {
      updatedUsers = updatedUsers.map(u => {
        if (u.id === currentUser.value.id) {
          return {
            ...u,
            name: currentUser.value.name,
            role: currentUser.value.role
          };
        }
        return u;
      });
    } else {
      const newUser = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        name: currentUser.value.name,
        email: currentUser.value.email,
        password: currentUser.value.password,
        role: currentUser.value.role
      };
      
      const emailExists = updatedUsers.some(u => u.email.toLowerCase() === newUser.email.toLowerCase());
      if (emailExists) {
        alert('Este correo electrónico ya está registrado.');
        return;
      }
      
      updatedUsers.push(newUser);
    }

    localStorage.setItem('taskflow_users', JSON.stringify(updatedUsers));
    users.value = updatedUsers;
    closeModal();
  } catch (error) {
    console.error("Error al guardar el usuario:", error);
    alert('Ocurrió un error al procesar la solicitud.');
  }
};

const deleteUser = (user) => {
  if (user.email === loggedInUserEmail) {
    alert('No puedes eliminar tu propia cuenta de administrador.');
    return;
  }
  if (!confirm(`¿Estás seguro de que quieres eliminar a ${user.name}?`)) {
    return;
  }

  try {
    const updatedUsers = users.value.filter(u => u.id !== user.id);
    localStorage.setItem('taskflow_users', JSON.stringify(updatedUsers));
    users.value = updatedUsers;
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    alert('Ocurrió un error al intentar eliminar el usuario.');
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  currentUser.value = { id: null, name: '', email: '', password: '', role: 'member' };
  showModal.value = true;
};

const openEditModal = (user) => {
  isEditing.value = true;
  currentUser.value = { ...user, password: '' }; 
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

onMounted(() => {
  initializeLocalUsers();
  fetchUsers();
});
</script>

<template>
  <div class="users-page container">
    <div class="header-section">
      <h1>Gestión de Usuarios</h1>
      <button @click="openCreateModal" class="add-user-btn">
        + Añadir Usuario
      </button>
    </div>

    <div v-if="loading" class="loading-state card">
      Cargando usuarios del sistema...
    </div>
    <p v-else-if="errorMessage" class="error-box card">{{ errorMessage }}</p>

    <div v-else class="users-table-container card">
      <table class="users-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Miembro Desde</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="['role-badge', `role-${user.role}`]">{{ user.role }}</span>
            </td>
            <td>{{ new Date(user.createdAt).toLocaleDateString() }}</td>
            <td>
              <div class="action-buttons">
                <button @click="openEditModal(user)" class="edit-btn">Editar</button>
                <button @click="deleteUser(user)" class="delete-btn" :disabled="user.email === loggedInUserEmail">
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para Crear/Editar Usuario -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content card">
        <h2>{{ isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}</h2>
        <form @submit.prevent="saveUser">
          <div class="form-group">
            <label for="userName">Nombre Completo:</label>
            <input type="text" id="userName" v-model="currentUser.name" required />
          </div>
          <div class="form-group">
            <label for="userEmail">Correo Electrónico:</label>
            <input type="email" id="userEmail" v-model="currentUser.email" required :disabled="isEditing"/>
          </div>
           <div class="form-group" v-if="!isEditing">
            <label for="userPassword">Contraseña:</label>
            <input type="password" id="userPassword" v-model="currentUser.password" required />
          </div>
          <div class="form-group">
            <label for="userRole">Rol en el Sistema:</label>
            <select id="userRole" v-model="currentUser.role" :disabled="currentUser.email === loggedInUserEmail">
              <option value="member">Miembro (Member)</option>
              <option value="admin">Administrador (Admin)</option>
            </select>
             <p v-if="currentUser.email === loggedInUserEmail" class="form-note">
              No puedes cambiar tu propio rol.
            </p>
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
.users-page {
  margin-top: 30px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.add-user-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-user-btn:hover {
  background-color: #218838;
}

.users-table-container {
  overflow-x: auto;
  padding: 0;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.users-table th,
.users-table td {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.users-table th {
  background-color: #f8f9fa;
  font-size: 0.9em;
  text-transform: uppercase;
  color: #555;
}

.users-table tbody tr:hover {
  background-color: #f1f1f1;
}

.role-badge {
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.8em;
  font-weight: bold;
  text-transform: capitalize;
}

.role-admin {
  background-color: #d6eaf8;
  color: #1a5276;
}

.role-member {
  background-color: #e8f8f5;
  color: #117a65;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.edit-btn, .delete-btn {
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-size: 0.85em;
  transition: background-color 0.2s;
}

.edit-btn {
  background-color: #f0ad4e;
  color: white;
}
.edit-btn:hover {
  background-color: #ec971f;
}

.delete-btn {
  background-color: #d9534f;
  color: white;
}
.delete-btn:hover {
  background-color: #c9302c;
}

.delete-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Modal Styles */
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
  max-width: 450px;
}

.modal-content h2 {
  text-align: center;
  margin-top: 0;
  color: #2c3e50;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
}

.save-btn, .cancel-btn {
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  border: none;
}

.save-btn {
  background-color: #2ecc71;
  color: white;
}

.cancel-btn {
  background-color: #bdc3c7;
  color: #333;
}

.form-note {
  font-size: 0.8em;
  color: #7f8c8d;
  margin-top: 5px;
}
</style>