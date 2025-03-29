import { ref, onMounted } from 'vue';

export function usePwa() {
  const installPrompt = ref<Event | null>(null);
  const isInstallable = ref(false);
  const isInstalled = ref(false);
  const isUpdateAvailable = ref(false);

  // Check if the app is already installed
  onMounted(() => {
    // Check if app is installed (standalone or fullscreen mode)
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.matchMedia('(display-mode: fullscreen)').matches || 
        (window.navigator as any).standalone === true) {
      isInstalled.value = true;
    }
    
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent default installation behavior
      e.preventDefault();
      // Store the event for later use
      installPrompt.value = e;
      isInstallable.value = true;
      console.log('Install prompt captured and ready!');
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      isInstalled.value = true;
      isInstallable.value = false;
      installPrompt.value = null;
      console.log('App was installed successfully!');
    });
  });

  // Function to prompt installation
  const promptInstall = async () => {
    if (!installPrompt.value) {
      console.log('No install prompt available');
      return false;
    }
    
    try {
      console.log('Showing install prompt...');
      // Show the installation prompt
      (installPrompt.value as any).prompt();
      
      // Wait for the user to respond to the prompt
      const choiceResult = await (installPrompt.value as any).userChoice;
      console.log('User choice:', choiceResult.outcome);
      
      // Reset the installPrompt value
      installPrompt.value = null;
      isInstallable.value = false;
      
      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.error('Installation failed:', error);
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    isUpdateAvailable,
    promptInstall
  };
} 