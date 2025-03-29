<template>
  <div class="nav-wrapper" :class="{ 'nav-shadow': scrolled }">
    <div class="logo-header">
      <div class="logo">
        <img src="@/assets/images/logo.jpeg" alt="Expense Tracker" class="logo-image" />
        <span class="tracker-title">Expense Tracker</span>
      </div>
    </div>
    <!-- Navigation Menu for Large Screens -->
    <div class="nav-items" v-if="!isSmallScreen">
      <el-menu mode="horizontal" @select="handleSelect" :router="true" class=" nav-items-left">
        <el-tooltip content="Home" placement="bottom" effect="light">
          <el-menu-item index="/" :route="{ name: 'Home' }" class="nav-item">
            <i class="bi bi-house-door-fill nav-icon"></i>
          </el-menu-item>
        </el-tooltip>
        <el-tooltip content="Summary" placement="bottom" effect="light">
          <el-menu-item index="/summery" :route="{ name: 'Summery' }" class="nav-item">
            <i class="bi bi-graph-up nav-icon"></i>
          </el-menu-item>
        </el-tooltip>
        <el-tooltip content="Report" placement="bottom" effect="light">
          <el-menu-item index="/report" :route="{ name: 'Report' }" class="nav-item">
            <i class="bi bi-file-earmark-text nav-icon"></i>
          </el-menu-item>
        </el-tooltip>
        <el-tooltip content="Expense" placement="bottom" effect="light">
          <el-menu-item index="/expence" :route="{ name: 'Expence' }" class="nav-item">
            <i class="bi bi-wallet2 nav-icon"></i>
          </el-menu-item>
        </el-tooltip>
        <el-tooltip content="Settings" placement="bottom" effect="light">
          <el-menu-item index="/settings" :route="{ name: 'Settings' }" class="nav-item">
            <i class="bi bi-gear nav-icon"></i>
          </el-menu-item>
        </el-tooltip>
      </el-menu>
      <div class="nav-actions">
        <NotificationCenter />
        <UserMenu />
      </div>
    </div>

    <!-- Sidebar for Small Screens -->
    <div class="sidebar" :class="{ active: isActive }" v-if="isSmallScreen">
      <div class="sidebar-header">
        <img src="@/assets/images/logo.jpeg" alt="Expense Tracker" class="sidebar-logo" />
        <span class="tracker-title">Expense Tracker</span>
      </div>
      <el-menu mode="vertical" @select="handleSelect" :router="true" class="sidebar-menu">
        <el-menu-item index="/" :route="{ name: 'Home' }" class="sidebar-item">
          <i class="bi bi-house-door-fill nav-icon"></i>
          <span>Home</span>
        </el-menu-item>
        <el-menu-item index="/summery" :route="{ name: 'Summery' }" class="sidebar-item">
          <i class="bi bi-graph-up nav-icon"></i>
          <span>Summary</span>
        </el-menu-item>
        <el-menu-item index="/report" :route="{ name: 'Report' }" class="sidebar-item">
          <i class="bi bi-file-earmark-text nav-icon"></i>
          <span>Report</span>
        </el-menu-item>
        <el-menu-item index="/expence" :route="{ name: 'Expence' }" class="sidebar-item">
          <i class="bi bi-wallet2 nav-icon"></i>
          <span>Expense</span>
        </el-menu-item>
        <el-menu-item index="/settings" :route="{ name: 'Settings' }" class="sidebar-item">
          <i class="bi bi-gear nav-icon"></i>
          <span>Settings</span>
        </el-menu-item>
      </el-menu>
      <div class="nav-actions-sidebar">
        <NotificationCenter />
        <UserMenu />
      </div>
    </div>

    <!-- Hamburger Menu -->
    <div class="toggle" @click="toggleSidebar" v-if="isSmallScreen">
      <div class="line top" :class="{ active: isActive }"></div>
      <div class="line middle" :class="{ active: isActive }"></div>
      <div class="line bottom" :class="{ active: isActive }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import UserMenu from '@/components/UserMenu.vue';
import NotificationCenter from "@/components/NotificationCenter.vue";

const isActive = ref(false);
const isSmallScreen = ref(false);
const scrolled = ref(false);

const handleSelect = (key: string, keyPath: string) => {
  console.log(key, keyPath);
  if (isSmallScreen.value) {
    isActive.value = false;
  }
};

const toggleSidebar = () => {
  isActive.value = !isActive.value;
};

const updateScreenSize = () => {
  isSmallScreen.value = window.innerWidth <= 640;
};

const handleScroll = () => {
  scrolled.value = window.scrollY > 20;
};

const closeSidebar = (event: MouseEvent) => {
  const sidebar = document.querySelector(".sidebar");
  const toggle = document.querySelector(".toggle");
  
  if (sidebar && toggle && !sidebar.contains(event.target as Node) && !toggle.contains(event.target as Node)) {
    isActive.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeSidebar);
  window.addEventListener("scroll", handleScroll);
  updateScreenSize();
  window.addEventListener("resize", updateScreenSize);
});

onUnmounted(() => {
  document.removeEventListener("click", closeSidebar);
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", updateScreenSize);
});
</script>

<style scoped>
.nav-wrapper {
  width: 100%;
  position: fixed;
  top: 0;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  transition: all 0.3s ease;
}

.nav-shadow {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.logo-header {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-image {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.logo-image:hover {
  transform: scale(1.1);
}

.tracker-title {
  background-image: linear-gradient(135deg, #00c4cc, #7209b7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: bold;
  font-size: 1.5rem;
}

.nav-items {
  display: grid;
  grid-template-columns:auto 1fr ;
  align-items: center;
}

.nav-item {
  height: 50px !important;
  width: 50px !important;
  padding: 0 !important;
  margin: 0 5px !important;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.nav-items-left {
  display: flex;
}

:deep(.el-menu--horizontal.el-menu) {
  width: 360px !important;
  border-bottom: none !important;
  display: flex;
  justify-content: start;
}

.nav-item:hover {
  background-color: rgba(0, 196, 204, 0.1);
}

.nav-icon {
  font-size: 1.4rem;
  color: #336ad7;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.nav-item:hover .nav-icon {
  transform: translateY(-2px);
  color: #00c4cc;
}

.nav-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.nav-actions-sidebar {
  margin-left: auto;
  margin-right: 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.auth-button {
  border-radius: 8px;
  padding: 8px 20px;
  transition: all 0.3s ease;
}

.signup-btn {
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  border: none;
}

.signup-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 196, 204, 0.2);
}

.login-btn:hover {
  transform: translateY(-2px);
  border-color: #00c4cc;
  color: #00c4cc;
}

.sidebar {
  position: fixed;
  top: 0;
  right: -300px;
  width: 300px;
  height: 100vh;
  background-color: white;
  transition: right 0.3s ease;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.sidebar.active {
  right: 0;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #eee;
}

.sidebar-logo {
  width: 40px;
  height: 40px;
  border-radius: 12px;
}

.sidebar-menu {
  flex: 1;
  border: none;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px !important;
  margin: 8px 0;
}

.sidebar-actions {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid #eee;
}

.toggle {
  position: relative;
  width: 30px;
  height: 24px;
  cursor: pointer;
  display: none;
  flex-direction: column;
  justify-content: space-between;
  z-index: 1000;
}

.line {
  width: 100%;
  height: 3px;
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.line.active.top {
  transform: rotate(45deg) translate(6px, 6px);
}

.line.active.middle {
  opacity: 0;
  transform: translateX(-20px);
}

.line.active.bottom {
  transform: rotate(-45deg) translate(6px, -6px);
}

@media only screen and (max-width: 640px) {
  .toggle {
    display: flex;
  }

  :deep(.el-menu--horizontal.el-menu) {
    width: 100% !important;
  }
  
  .nav-items {
    display: none;
  }

  .nav-wrapper {
    padding: 10px 16px;
  }

  .tracker-title {
    font-size: 1.2rem;
  }

  .logo-image {
    width: 35px;
    height: 35px;
  }
}

@media only screen and (min-width: 641px) {
  .toggle {
    display: none;
  }

  .sidebar {
    display: none;
  }

  .nav-items {
    display: flex;
  }

  .nav-wrapper {
    padding: 10px 24px;
  }

  .nav-actions {
    margin-left: 30px;
  }
}

@media only screen and (min-width: 992px) {
  .nav-wrapper {
    padding: 10px 40px;
  }

  .nav-item {
    margin: 0 8px !important;
  }

  .nav-actions {
    margin-left: 40px;
  }
}

.w-100 {
  width: 100%;
}
</style>
