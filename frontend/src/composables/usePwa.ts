import { ref, onMounted, onUnmounted } from 'vue';

/**
 * Composable for managing PWA installation
 * Provides functionality to check if the app is installable and to prompt the user to install it
 */
export function usePwa() {
  const isInstallable = ref(false);
  const deferredPrompt = ref<any>(null);

  const promptInstall = async () => {
    if (!deferredPrompt.value) {
      console.warn('No installation prompt available');
      return false;
    }

    // Show the installation prompt
    deferredPrompt.value.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.value.userChoice;
    
    // Clear the saved prompt regardless of outcome
    deferredPrompt.value = null;
    isInstallable.value = false;

    // Was the app installed?
    return choiceResult.outcome === 'accepted';
  };

  // Handle beforeinstallprompt event
  const handleBeforeInstallPrompt = (e: Event) => {
    // Prevent Chrome 76+ from automatically showing the prompt
    e.preventDefault();
    
    // Save the prompt for later
    deferredPrompt.value = e;
    isInstallable.value = true;
    
    console.log('App is installable, prompt ready');
  };

  // Handle appinstalled event
  const handleAppInstalled = () => {
    console.log('PWA was installed');
    
    // Clear the prompt since it's no longer needed
    deferredPrompt.value = null;
    isInstallable.value = false;
    
    // Could dispatch an event or call an analytics function here
  };

  onMounted(() => {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Listen for the appinstalled event
    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is running in standalone mode (already installed)');
    }
  });

  onUnmounted(() => {
    // Remove the event listeners
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.removeEventListener('appinstalled', handleAppInstalled);
  });

  return {
    isInstallable,
    promptInstall
  };
} 