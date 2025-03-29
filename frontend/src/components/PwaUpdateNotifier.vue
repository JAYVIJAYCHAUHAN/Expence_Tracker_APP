<template>
  <div class="pwa-update-notifier" v-if="showUpdateNotification">
    <div class="update-content">
      <div class="update-icon">
        <i class="bi bi-arrow-clockwise"></i>
      </div>
      <div class="update-message">
        <strong>New version available!</strong>
        <p>Update to get the latest features and improvements.</p>
      </div>
      <div class="update-actions">
        <el-button type="primary" size="small" @click="updateApp">
          Update Now
        </el-button>
        <el-button type="text" size="small" @click="dismissUpdate">
          Later
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';

const showUpdateNotification = ref(false);
let updateSW: (() => Promise<void>) | null = null;

const handleSWUpdate = () => {
  console.info('New version available: showing update notification');
  showUpdateNotification.value = true;
};

const updateApp = async () => {
  showUpdateNotification.value = false;
  
  try {
    if (updateSW) {
      await updateSW();
      ElMessage.success({
        message: 'App updated successfully! Refreshing...',
        duration: 2000,
        onClose: () => window.location.reload()
      });
    }
  } catch (error) {
    console.error('Failed to update app:', error);
    ElMessage.error('Failed to update. Please refresh the page manually.');
  }
};

const dismissUpdate = () => {
  showUpdateNotification.value = false;
  // Store dismissal timestamp to prevent showing too frequently
  localStorage.setItem('updateDismissed', Date.now().toString());
};

onMounted(() => {
  // Get updateSW function from window
  updateSW = (window as any).__updateSW;
  
  // Listen for SW update events
  window.addEventListener('sw-updated', handleSWUpdate);
  
  // Check if update was recently dismissed (within last hour)
  const lastDismissed = localStorage.getItem('updateDismissed');
  if (lastDismissed && Date.now() - parseInt(lastDismissed) < 3600000) {
    // Don't show notification if dismissed within the last hour
    return;
  }
});

onUnmounted(() => {
  window.removeEventListener('sw-updated', handleSWUpdate);
});
</script>

<style scoped>
.pwa-update-notifier {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  width: 320px;
  animation: slide-in 0.3s ease-out;
}

@keyframes slide-in {
  0% { 
    transform: translateY(100px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.update-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-left: 4px solid #00c4cc;
}

.update-icon {
  font-size: 1.5rem;
  color: #00c4cc;
  margin-bottom: 4px;
}

.update-message strong {
  font-size: 1rem;
  display: block;
  margin-bottom: 4px;
}

.update-message p {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.update-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

@media (max-width: 640px) {
  .pwa-update-notifier {
    bottom: 10px;
    right: 10px;
    left: 10px;
    width: auto;
  }
}
</style> 