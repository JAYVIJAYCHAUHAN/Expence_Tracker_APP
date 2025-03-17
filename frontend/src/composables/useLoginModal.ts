import { ref } from 'vue';

const showLoginModal = ref(false);

export function useLoginModal() {
  const openLoginModal = () => {
    showLoginModal.value = true;
  };

  const closeLoginModal = () => {
    showLoginModal.value = false;
  };

  return {
    showLoginModal,
    openLoginModal,
    closeLoginModal
  };
} 