<template>
  <div id="app">
    <OfflineNotification />
    <router-view></router-view>
    <Login 
      :is-login-model-open="showLoginModal"
      @update:model-value="closeLoginModal"
      @login-success="handleLoginSuccess"
    />
    <PwaInstallPrompt />
    <PwaUpdateNotifier />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue';
import { useLoginModal } from '@/composables/useLoginModal';
import Login from '@/components/Login.vue';
import PwaInstallPrompt from '@/components/PwaInstallPrompt.vue';
import PwaUpdateNotifier from '@/components/PwaUpdateNotifier.vue';
import OfflineNotification from '@/components/OfflineNotification.vue';
import { ElMessage } from 'element-plus';

// Initialize login modal state and provide to all components
const loginModal = useLoginModal();
const { showLoginModal, closeLoginModal, handleLoginSuccess: originalHandleLoginSuccess } = loginModal;

// Export to globally provide login modal functions
provide('loginModal', loginModal);

// Enhanced login success handler
const handleLoginSuccess = () => {
  ElMessage.success('Login successful');
  originalHandleLoginSuccess();
};
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
