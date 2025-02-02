<template>
  <div>
    <div class="sidebar" :class="{ 'sidebar-expanded': isSidebarExpanded }">
      <a class="navbar-brand tracker-title" href="#">
        <i class="fas fa-wallet"></i> Expense Tracker
      </a>
      <ul class="navbar-nav">
        <li class="nav-item">
          <div>Expense Tracker</div>

          <router-link to="/" class="nav-link">
            <i class="fas fa-home"></i> Home
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/add-expense" class="nav-link mx-2">
            <i class="fas fa-plus-circle"></i> Add Expense
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/summary" class="nav-link">
            <i class="fas fa-chart-line"></i> Summary
          </router-link>
        </li>
      </ul>
    </div>
    <button class="toggle-btn" @click="toggleSidebar">
      <i class="fas fa-bars"></i>
    </button>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">
          <i class="fas fa-wallet"></i> Expense Tracker
        </a>
        <div class="navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link">
                <i class="fas fa-home"></i> Home
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/add-expense" class="nav-link">
                <i class="fas fa-plus-circle"></i> Add Expense
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/summary" class="nav-link">
                <i class="fas fa-chart-line"></i> Summary
              </router-link>
            </li>
          </ul>
        </div>
      </div>
      <el-button type="primary">Primary</el-button>
      <el-button type="success">Success</el-button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const isSidebarExpanded = ref(false);

const toggleSidebar = () => {
  isSidebarExpanded.value = !isSidebarExpanded.value;
};
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: -250px;
  width: 250px;
  height: 100%;
  background-color: #add8e6;
  transition: left 0.3s;
  padding: 20px;
}

.sidebar-expanded {
  left: 0;
}

.navbar-nav {
  list-style-type: none;
  padding: 0;
}

.nav-item {
  margin-bottom: 20px;
}

.toggle-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  font-size: 1.5rem;
}

.navbar {
  display: none;
}

.sidebar-expanded + .main-content {
  margin-left: 0;
}

@media (max-width: 768px) {
  .navbar {
    display: none;
  }

  .sidebar {
    width: 200px;
    position: fixed;
    z-index: 10;
  }
}

@media (min-width: 500px) {
  .sidebar {
    display: none;
  }

  .navbar {
    display: block;
  }
}
</style>
