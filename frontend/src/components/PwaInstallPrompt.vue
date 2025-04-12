<template>
  <div v-if="showPrompt" class="pwa-install-prompt">
    <div class="prompt-content">
      <div class="prompt-icon">
        <i class="bi bi-download"></i>
      </div>
      <div class="prompt-text">
        <h4>Install Expense Tracker</h4>
        <p>Add to your home screen for quick access!</p>
        <p v-if="!isInstallable" class="install-status">
          <i class="bi bi-info-circle"></i> 
          Your browser isn't showing the install prompt yet. Try these steps:
        </p>
          <ol>
            <li>Use Chrome on desktop or Android</li>
            <li>Use the app for a few minutes</li>
            <li>Reload the page</li>
          </ol>
        
      </div>
      <div class="prompt-actions">
        <el-button @click="dismiss" plain size="small">Later</el-button>
        <el-button 
          @click="install" 
          type="primary" 
          size="small"
          :disabled="!isInstallable"
        >
          Install
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { usePwa } from '@/composables/usePwa';

const { isInstallable, promptInstall } = usePwa();
const showPrompt = ref(false);

// Show the prompt when the app becomes installable
onMounted(() => {
  // Only check if already installed, don't check for pwa-installed
  // which now only indicates that app has been installed, not that the prompt is available
  if (window.matchMedia('(display-mode: standalone)').matches) {
    // Already installed as standalone app, don't show prompt
    return;
  }

  // If user previously dismissed, respect that choice
  const dismissed = localStorage.getItem('pwa-dismissed');
  if (dismissed && (Date.now() - parseInt(dismissed)) < 1 * 24 * 60 * 60 * 1000) {
    // Dismissed less than 7 days ago
    return;
  }

  // Show prompt after a short delay if it's installable
  setTimeout(() => {
    if (isInstallable.value) {
      showPrompt.value = true;
    }
  }, 5000); // 5 second delay
});

// Watch for installable changes
watch(isInstallable, (newValue) => {
  console.log('Is installable changed:', newValue);
  
  // If becomes installable and no recent dismissal, show prompt
  if (newValue) {
    const dismissed = localStorage.getItem('pwa-dismissed');
    if (!dismissed || (Date.now() - parseInt(dismissed)) >= 1 * 24 * 60 * 60 * 1000) {
      // Show after small delay to not interrupt immediate user interaction
      setTimeout(() => {
        showPrompt.value = true;
      }, 3000);
    }
  }
});

const install = async () => {
  const installed = await promptInstall();
  if (!installed) {
    // If installation was canceled, hide prompt
    console.log('Installation was canceled or failed');
  } else {
    console.log('Installation was successful');
    showPrompt.value = false;
  }
};

const dismiss = () => {
  showPrompt.value = false;
  // Remember the user's preference for 7 days
  localStorage.setItem('pwa-dismissed', Date.now().toString());
  
  // After 1 day, allow the prompt to be shown again
  setTimeout(() => {
    localStorage.removeItem('pwa-dismissed');
  }, 1 * 24 * 60 * 60 * 1000);
};
</script>

<style scoped>
.pwa-install-prompt {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  width: 350px;
  max-width: 90vw;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

.prompt-content {
  display: flex;
  align-items: center;
  padding: 16px;
  flex-wrap: wrap;
}

.prompt-icon {
  font-size: 2rem;
  color: #00c4cc;
  margin-right: 16px;
}

.prompt-text {
  flex: 1;
}

.prompt-text h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.prompt-text p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.install-status {
  margin-top: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 3px solid #00c4cc;
  font-size: 0.85rem;
}

.install-status ol {
  margin-top: 5px;
  margin-bottom: 0;
  padding-left: 20px;
}

.prompt-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  width: 100%;
  justify-content: flex-end;
  padding-left: 58px; /* Align with the content */
}

@keyframes slideUp {
  from {
    transform: translate(-50%, 100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .prompt-content {
    flex-direction: column;
    align-items: flex-start;
    text-align: center;
  }
  
  .prompt-icon {
    margin-right: 0;
    margin-bottom: 10px;
    width: 100%;
    text-align: center;
  }
  
  .prompt-actions {
    padding-left: 0;
    justify-content: center;
  }
}
</style> 