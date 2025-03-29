<template>
  <div class="user-menu">
    <template v-if="!isAuthenticated">
      <router-link to="/signup">
        <el-button type="primary" class="auth-button signup-btn">Sign Up</el-button>
      </router-link>
      <el-button class="auth-button login-btn" @click="handleLogin">
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
            <el-dropdown-item command="settings">
              <i class="bi bi-gear"></i> Settings
            </el-dropdown-item>
            <el-dropdown-item command="about">
              <i class="bi bi-info-circle"></i> About
              <span class="version-badge">v{{ appVersion }}</span>
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
import { computed, onUnmounted, ref, watch, getCurrentInstance, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useLoginModal } from '@/composables/useLoginModal';
import { userApi } from '@/utils/api';
import { useGamification } from '@/utils/gamification';

interface UserData {
  fullName: string;
  userName: string;
  email: string;
  phone: string;
  bio: string;
  avatarUrl: string;
}

// Define the type for the login modal
type LoginModal = ReturnType<typeof useLoginModal>;

const router = useRouter();
// First try to use the globally provided login modal (preferred)
const injectedLoginModal = inject<LoginModal>('loginModal');
// Fallback to local instance if not provided
const loginModal = injectedLoginModal || useLoginModal();

const isAuthenticated = ref(!!localStorage.getItem('token'));
const userData = ref<UserData | null>(null);
const chevron = ref(false);

// Get app version from global properties
const instance = getCurrentInstance();
const appVersion = computed(() => instance?.appContext.config.globalProperties.$appVersion || '2.0.0');

// Initialize user name and initial (fix for read-only computed property)
const userName = ref('User');
const userInitial = ref('U');

const { resetProgress } = useGamification();

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

const handleLogin = () => {
  // Use the login modal from injection or local instance
  loginModal.openLoginModal('/dashboard');
};

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile');
      break;
    case 'settings':
      router.push('/settings');
      break;
    case 'about':
      router.push('/about');
      break;
    case 'logout':
      handleLogout();
      break;
  }
};

const handleLogout = async () => {
  try {
    // Call the logout API to invalidate token on server
    await userApi.logout().catch(() => {
      // Silently catch errors from logout API
      console.log('API logout failed, continuing with client logout');
    });
    
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset user-specific feature data
    localStorage.removeItem('savings_goals');
    localStorage.removeItem('monthly_budget');
    localStorage.removeItem('notification_settings');
    
    // Reset user progress using the gamification service
    resetProgress();
    
    // Reset feature flags to defaults
    localStorage.setItem('feature_savings_goals', 'false');
    localStorage.setItem('feature_budget_tips', 'false');
    localStorage.setItem('feature_data_export', 'false');
    localStorage.setItem('feature_progress_tracking', 'true');
    
    // Show success message
    ElMessage.success('Logged out successfully');
    
    // Redirect to login page
    router.push('/signup');
  } catch (error: any) {
    console.error('Error during logout:', error);
    
    // Still perform client-side logout even if API call fails
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    resetProgress(); // Also reset progress here
    ElMessage.warning('Logged out locally. Some server data may not have been cleared.');
    router.push('/login');
  }
};

// Initialize
onMounted(async () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      // Validate token and get user data
      const response = await userApi.getProfile();
      const userData = response.data; // Access the data property of the response
      
      if (userData) {
        userName.value = userData.name || userData.userName || 'User';
        userInitial.value = ((userData.name || userData.userName) && 
          (userData.name || userData.userName).charAt(0).toUpperCase()) || 'U';
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      // Handle invalid token
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
    }
  }
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

.version-badge {
  background: linear-gradient(135deg, #00c4cc20, #7209b720);
  color: #7209b7;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  margin-left: 8px;
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