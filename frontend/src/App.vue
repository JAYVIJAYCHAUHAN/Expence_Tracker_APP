<template>
  <div id="app">
    <router-view></router-view>
    <Login 
      :is-login-model-open="showLoginModal"
      @update:model-value="closeLoginModal"
      @login-success="handleLoginSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { useLoginModal } from '@/composables/useLoginModal';
import Login from '@/components/Login.vue';
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
