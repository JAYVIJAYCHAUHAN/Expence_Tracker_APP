<template>
  <div class="offline-notification" v-if="isOffline">
    <div class="offline-content">
      <i class="bi bi-wifi-off"></i>
      <span>You are currently offline. Some features may be unavailable.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isOffline = ref(false);

const checkOnlineStatus = () => {
  isOffline.value = !navigator.onLine;
};

const handleOnline = () => {
  isOffline.value = false;
  // Display a temporary success message when going back online
  const successToast = document.createElement('div');
  successToast.className = 'online-toast';
  successToast.innerHTML = '<i class="bi bi-wifi"></i> Connection restored';
  document.body.appendChild(successToast);
  
  // Remove after animation completes
  setTimeout(() => {
    successToast.classList.add('fade-out');
    setTimeout(() => {
      document.body.removeChild(successToast);
    }, 500);
  }, 3000);
};

const handleOffline = () => {
  isOffline.value = true;
};

onMounted(() => {
  // Initial check
  checkOnlineStatus();
  
  // Add event listeners
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
});

onUnmounted(() => {
  // Remove event listeners
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
});
</script>

<style scoped>
.offline-notification {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background-color: #f44336;
  color: white;
  text-align: center;
  padding: 8px 16px;
  font-size: 0.875rem;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: slide-down 0.3s ease-out;
}

.offline-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.offline-content i {
  font-size: 1rem;
}

@keyframes slide-down {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(0);
  }
}

/* Online toast styles (injected via JS) */
:global(.online-toast) {
  position: fixed;
  top: 16px;
  right: 16px;
  background-color: #4caf50;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  animation: fade-in 0.3s ease-out;
}

:global(.online-toast i) {
  font-size: 1rem;
}

:global(.fade-out) {
  opacity: 0;
  transition: opacity 0.5s ease-out;
}

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 