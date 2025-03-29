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
    <PwaUpdateNotification />
  </div>
</template>

<script setup lang="ts">
import { useLoginModal } from '@/composables/useLoginModal';
import Login from '@/components/Login.vue';
import PwaInstallPrompt from '@/components/PwaInstallPrompt.vue';
import PwaUpdateNotification from '@/components/PwaUpdateNotification.vue';
import OfflineNotification from '@/components/OfflineNotification.vue';
import { ElMessage } from 'element-plus';

const { showLoginModal, closeLoginModal } = useLoginModal();

const handleLoginSuccess = () => {
  ElMessage.success('Login successful');
};
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
