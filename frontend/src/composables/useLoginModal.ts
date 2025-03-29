import { ref } from 'vue';
import { useRouter } from 'vue-router';

/**
 * Composable for managing the login modal state
 * Provides functionality to show/hide the login modal and handle login-required redirects
 */
export function useLoginModal() {
  const showLoginModal = ref(false);
  const router = useRouter();
  const redirectPath = ref('');

  /**
   * Open the login modal
   * @param path Optional path to redirect to after successful login
   */
  const openLoginModal = (path?: string) => {
    showLoginModal.value = true;
    if (path) {
      redirectPath.value = path;
    }
  };

  /**
   * Close the login modal
   */
  const closeLoginModal = () => {
    showLoginModal.value = false;
  };

  /**
   * Handle successful login
   * Redirects to the saved path if available
   */
  const handleLoginSuccess = () => {
    closeLoginModal();
    if (redirectPath.value) {
      router.push(redirectPath.value);
      redirectPath.value = '';
    }
  };

  /**
   * Check if a user is authenticated
   * If not, show login modal and return false
   * @param redirectTo Optional path to redirect to after login
   * @returns boolean indicating if user is authenticated
   */
  const requireAuth = (redirectTo?: string): boolean => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      openLoginModal(redirectTo);
      return false;
    }
    
    return true;
  };

  return {
    showLoginModal,
    openLoginModal,
    closeLoginModal,
    handleLoginSuccess,
    requireAuth
  };
} 