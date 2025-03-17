<template>
  <div class="user-menu">
    <template v-if="!isAuthenticated">
      <router-link to="/signup">
        <el-button type="primary" class="auth-button signup-btn">Sign Up</el-button>
      </router-link>
      <el-button class="auth-button login-btn" @click="openLoginModal">
        Login
      </el-button>
    </template>
    <template v-else>
      <el-dropdown trigger="click" @command="handleCommand">
        <el-button class="user-menu-btn" @click="toggleChevron">
          <el-avatar 
            :size="24" 
            :src="userData?.avatarUrl" 
            class="user-avatar"
          >
            <i class="bi bi-person-circle"></i>
          </el-avatar>
          {{ userName }}
          <i :class="`bi bi-chevron-${chevron ? 'up' : 'down'} ms-1 fs-6`"></i>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <i class="bi bi-person"></i> Edit Profile
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <i class="bi bi-box-arrow-right"></i> Logout
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useLoginModal } from '@/composables/useLoginModal';

interface UserData {
  fullName: string;
  userName: string;
  email: string;
  phone: string;
  bio: string;
  avatarUrl: string;
}

const router = useRouter();
const { openLoginModal } = useLoginModal();
const isAuthenticated = ref(!!localStorage.getItem('token'));
const userData = ref<UserData | null>(null);
const chevron = ref(false);

const userName = computed(() => {
  if (!userData.value) return 'User';
  return userData.value.userName || 'User';
});

const loadUserData = () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      userData.value = JSON.parse(storedUser) as UserData;
    } catch (error) {
      userData.value = null;
    }
  } else {
    userData.value = null;
  }
  isAuthenticated.value = !!localStorage.getItem('token');
};

const handleLoginSuccess = () => {
  loadUserData();
  ElMessage.success('Login successful');
};

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile');
      break;
    case 'logout':
      handleLogout();
      break;
  }
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  isAuthenticated.value = false;
  userData.value = null;
  ElMessage.success('Logged out successfully');
  router.push('/');
};

// Watch for changes in localStorage
window.addEventListener('storage', loadUserData);

// Initial load
loadUserData();

// Clean up event listener
onUnmounted(() => {
  window.removeEventListener('storage', loadUserData);
});

// Watch for route changes
watch(() => router.currentRoute.value.path, () => {
  loadUserData();
});

function toggleChevron() {
  chevron.value = !chevron.value;
}
</script>

<style scoped>
.user-menu {
  display: flex;
  gap: 12px;
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

.login-btn {
  border: 2px solid #00c4cc;
  color: #00c4cc;
}

.user-menu-btn {
  width: 150px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 2px solid #eee;
  background: transparent;
  color: #333;
  transition: all 0.3s ease;
}

.user-menu-btn:hover {
  border-color: #00c4cc;
  color: #00c4cc;
}

.user-menu-btn i {
  font-size: 1.2rem;
}

.user-avatar {
  border: 1px solid #eee;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
}

:deep(.el-dropdown-menu__item i) {
  font-size: 1.1rem;
  color: #666;
}

:deep(.el-dropdown-menu__item:hover i) {
  color: #00c4cc;
}

:deep(.login-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.login-dialog .el-dialog__header) {
  margin: 0;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

:deep(.login-dialog .el-dialog__body) {
  padding: 0;
}

:deep(.login-dialog .el-dialog__headerbtn) {
  top: 20px;
}
</style> 