<template>
  <div v-if="isOffline" class="offline-notification">
    <div class="notification-content">
      <i class="bi bi-wifi-off notification-icon"></i>
      <span>You are currently offline. Some features may be limited.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isOffline = ref(!navigator.onLine);

const handleConnectionChange = () => {
  isOffline.value = !navigator.onLine;
};

onMounted(() => {
  window.addEventListener('online', handleConnectionChange);
  window.addEventListener('offline', handleConnectionChange);
});

onUnmounted(() => {
  window.removeEventListener('online', handleConnectionChange);
  window.removeEventListener('offline', handleConnectionChange);
});
</script>

<style scoped>
.offline-notification {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #f44336;
  color: white;
  text-align: center;
  padding: 8px 16px;
  z-index: 9999;
  animation: slideDown 0.3s ease-out;
}

.notification-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.notification-icon {
  font-size: 1.2rem;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}
</style> 