<template>
  <div class="nav-wrapper">
    <div class="logo-header">
      <div class="logo">
        <img src="@/assets/images/logo.jpeg" alt="Expense Tracker" />
        <span class="tracker-title fs-2">Expense Tracker</span>
      </div>
    </div>
    <!-- Navigation Menu for Large Screens -->
    <div class="nav-items" v-if="!isSmallScreen">
      <el-menu mode="horizontal" @select="handleSelect" :router="true">
        <el-tooltip content="Home" placement="top">
          <el-menu-item index="/" :route="{ name: 'Root' }" class="fw-bold">
            <span class="bi bi-house fs-2"></span>
          </el-menu-item>
        </el-tooltip>

        <el-tooltip content="Summery" placement="top">
          <el-menu-item
            index="/summery"
            :route="{ name: 'Summery' }"
            class="fw-bold"
          >
            <span class="bi bi-bar-chart-fill fs-2"></span>
          </el-menu-item>
        </el-tooltip>

        <el-tooltip content="Report" placement="top">
          <el-menu-item
            index="/report"
            :route="{ name: 'Report' }"
            class="fw-bold"
          >
            <span class="bi bi-file-pdf fs-2"></span>
          </el-menu-item>
        </el-tooltip>

        <el-tooltip content="Expance" placement="top">
          <el-menu-item
            index="/expence"
            :route="{ name: 'Expance' }"
            class="fw-bold"
          >
            <span class="bi bi-currency-rupee fs-2"></span>
          </el-menu-item>
        </el-tooltip>
        <div class="nav-actions">
          <el-button type="primary">Sign Up</el-button>
          <el-button>Login</el-button>
        </div>
      </el-menu>
    </div>
    <!-- Sidebar for Small Screens -->
    <div class="sidebar" :class="{ active: isActive }" v-if="isSmallScreen">
      <el-menu mode="vertical" @select="handleSelect" :router="true">
        <el-menu-item index="/" :route="{ name: 'Root' }">
          <span class="fs-5 fw-bold">Home</span>
        </el-menu-item>
        <el-menu-item index="/summery" :route="{ name: 'Summery' }">
          <span class="fs-5 fw-bold"> Summery</span>
        </el-menu-item>
        <el-menu-item index="/report" :route="{ name: 'Report' }">
          <span class="fs-5 fw-bold">Report</span>
        </el-menu-item>
        <el-menu-item index="/expence" :route="{ name: 'Expance' }">
          <span class="fs-5 fw-bold">Expance</span>
        </el-menu-item>
        <div class="action-button">
          <router-link to="/signup">
            <el-button type="primary">Sign Up</el-button>
          </router-link>
          <router-link to="/login">
            <el-button>Login</el-button>
          </router-link>
        </div>
      </el-menu>
    </div>
    <!-- Hamburger Menu -->
    <div class="toggle" @click="toggleSidebar" v-if="isSmallScreen">
      <div class="line top" :class="{ active: isActive }"></div>
      <div class="line middle" :class="{ active: isActive }"></div>
      <div class="line bottom" :class="{ active: isActive }"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const isActive = ref(false);
const isSmallScreen = ref(false);

const handleSelect = (key, keyPath) => {
  console.log(key, keyPath);
};

const toggleSidebar = () => {
  isActive.value = !isActive.value;
};

const updateScreenSize = () => {
  isSmallScreen.value = window.innerWidth <= 768;
};
// Detect click outside to close the sidebar
const closeSidebar = (event) => {
  const sidebar = document.querySelector(".sidebar");
  const toggle = document.querySelector(".toggle");
  if (!sidebar.contains(event.target) && !toggle.contains(event.target)) {
    isActive.value = false;
  }
};

// Add event listener on mount
onMounted(() => {
  document.addEventListener("click", closeSidebar);
});

// Remove event listener on unmount
onUnmounted(() => {
  document.removeEventListener("click", closeSidebar);
});
onMounted(() => {
  updateScreenSize();
  window.addEventListener("resize", updateScreenSize);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateScreenSize);
});
</script>

<style scoped>
/* General styles */
.nav-wrapper {
  width: 100%;
  position: fixed;
  top: 0;
  z-index: 100;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
}

.logo-header {
  display: flex;
  align-items: center;
}

.logo img {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  margin-right: 10px;
}

span {
  color: #336ad7;
  font-size: 20px;
}

.nav-items {
  display: flex;
  align-items: end;
}

.nav-actions {
  display: flex;
  gap: 10px;
  margin-left: 20px;
}

.sidebar {
  position: fixed;
  top: 0;
  right: -250px;
  width: 250px;
  height: 100%;
  background-color: white;
  transition: right 0.3s ease;
}

.sidebar.active {
  right: 0;
}

.action-button {
  display: flex;
  flex-direction: column;
  justify-content: end;
  justify-items: end;
  gap: 15px;
  margin: 20px;
}

.toggle {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 999;
  width: 30px;
  height: 20px;
  cursor: pointer;
  display: none;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.line {
  width: 30px;
  height: 4px;
  background-color: #345eb2;
  border-radius: 5px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.line.active.top {
  transform: rotate(45deg) translate(5px, 5px);
}

.line.active.middle {
  opacity: 0;
}

.line.active.bottom {
  transform: rotate(-45deg) translate(5px, -5px);
}

@media only screen and (max-width: 768px) {
  .toggle {
    display: flex;
  }

  .nav-items {
    display: none;
  }
}
.tracker-title {
  background-image: linear-gradient(90deg, #00c4cc, #9556e8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: bold;
}
</style>
