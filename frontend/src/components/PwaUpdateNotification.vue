<template>
  <div v-if="updateAvailable" class="pwa-update-notification">
    <div class="notification-content">
      <i class="bi bi-arrow-repeat notification-icon"></i>
      <div class="notification-text">
        New version available!
      </div>
      <el-button type="primary" size="small" @click="refreshApp">
        Update
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const updateAvailable = ref(false);
let registration: ServiceWorkerRegistration | null = null;

onMounted(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => {
      registration = reg;
    });

    window.addEventListener('sw-updated', () => {
      updateAvailable.value = true;
    });

    // Also check registration for waiting SW
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg && reg.waiting) {
        updateAvailable.value = true;
        registration = reg;
      }
    });
  }
});

const refreshApp = () => {
  updateAvailable.value = false;
  
  if (registration && registration.waiting) {
    // Send message to the waiting service worker
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
  
  // Reload the page to use the new service worker
  window.location.reload();
};
</script>

<style scoped>
.pwa-update-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.notification-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
}

.notification-icon {
  font-size: 1.2rem;
  color: #00c4cc;
}

.notification-text {
  font-weight: 500;
  color: #333;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .pwa-update-notification {
    bottom: 70px;
    right: 10px;
    left: 10px;
    width: auto;
  }
  
  .notification-content {
    justify-content: space-between;
  }
}
</style> 