<template>
  <div class="reset-password-container">
    <el-card class="reset-password-card">
      <template #header>
        <div class="card-header">
          <h2>Reset Your Password</h2>
          <p>Enter your new password to secure your account</p>
        </div>
      </template>
      
      <div v-if="isTokenValid === false" class="error-message">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <p>Invalid or expired token</p>
        <small>This reset link is no longer valid. Please request a new password reset.</small>
        
        <div class="action-buttons">
          <router-link to="/forgot-password">
            <el-button type="primary" class="action-btn">Request New Reset Link</el-button>
          </router-link>
        </div>
      </div>
      
      <div v-else-if="isTokenChecking">
        <div class="loading-message">
          <i class="el-icon-loading"></i>
          <p>Verifying your reset link...</p>
        </div>
      </div>
      
      <div v-else-if="isResetComplete">
        <div class="success-message">
          <i class="bi bi-check-circle-fill"></i>
          <p>Password Reset Complete!</p>
          <small>Your password has been successfully updated. You can now log in with your new password.</small>
          
          <div class="action-buttons">
            
              <el-button type="primary" class="action-btn" @click="handleLogin">Proceed to Login</el-button>
            
          </div>
        </div>
      </div>
      
      <el-form
        v-else
        ref="resetFormRef"
        :model="resetForm"
        :rules="resetRules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item prop="newPassword" label="New Password">
          <el-input
            v-model="resetForm.newPassword"
            placeholder="Enter new password"
            type="password"
            show-password
          >
            <template #prefix>
              <i class="bi bi-lock"></i>
            </template>
          </el-input>
          <div class="password-requirements">
            <p>Password must:</p>
            <ul>
              <li :class="{ 'requirement-met': passwordLength }">Be at least 6 characters long</li>
              <li :class="{ 'requirement-met': passwordHasNumber }">Include at least one number</li>
              <li :class="{ 'requirement-met': passwordHasSpecial }">Include at least one special character</li>
            </ul>
          </div>
        </el-form-item>
        
        <el-form-item prop="confirmPassword" label="Confirm Password">
          <el-input
            v-model="resetForm.confirmPassword"
            placeholder="Confirm new password"
            type="password"
            show-password
          >
            <template #prefix>
              <i class="bi bi-lock-fill"></i>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="isSubmitting"
            class="submit-btn"
          >
            Reset Password
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="form-footer">
        <div  @click="handleLogin">Back to Login</div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, FormInstance } from 'element-plus';
import axios from 'axios';
import { useLoginModal } from '@/composables/useLoginModal';

// Constants
const API_URL = import.meta.env.VITE_API_URL;

// Router
const router = useRouter();
const route = useRoute();

// Define the type for the login modal
type LoginModal = ReturnType<typeof useLoginModal>;

 
// First try to use the globally provided login modal (preferred)
const injectedLoginModal = inject<LoginModal>('loginModal');
// Fallback to local instance if not provided
const loginModal = injectedLoginModal || useLoginModal();

// Form
const resetFormRef = ref<FormInstance>();
const resetForm = ref({
  userId: '',
  token: '',
  newPassword: '',
  confirmPassword: ''
});

// State
const isSubmitting = ref(false);
const isTokenChecking = ref(true);
const isTokenValid = ref<boolean | null>(null);
const isResetComplete = ref(false);

// Password validation
const passwordLength = computed(() => resetForm.value.newPassword.length >= 6);
const passwordHasNumber = computed(() => /\d/.test(resetForm.value.newPassword));
const passwordHasSpecial = computed(() => /[!@#$%^&*(),.?":{}|<>]/.test(resetForm.value.newPassword));

// Rules
const resetRules = {
  newPassword: [
    { required: true, message: 'Please enter a new password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' },
    { 
      validator: (rule: any, value: string, callback: any) => {
        if (!/\d/.test(value)) {
          callback(new Error('Password must include at least one number'));
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          callback(new Error('Password must include at least one special character'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm your password', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== resetForm.value.newPassword) {
          callback(new Error('Passwords do not match'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// Check if token is valid on mount
onMounted(() => {
  // Get userId and token from route parameters
  const userId = route.params.userId as string;
  const token = route.params.token as string;
  
  if (!userId || !token) {
    isTokenValid.value = false;
    isTokenChecking.value = false;
    return;
  }
  
  // Set the form values
  resetForm.value.userId = userId;
  resetForm.value.token = token;
  
  // For the purpose of this demo, we'll assume the token is valid
  // In a real implementation, you would verify the token here
  setTimeout(() => {
    isTokenValid.value = true;
    isTokenChecking.value = false;
  }, 1500);
});

// Methods
const handleSubmit = async () => {
  if (!resetFormRef.value) return;
  
  await resetFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        isSubmitting.value = true;
        
        await axios.post(`${API_URL}/auth/reset-password`, {
          userId: resetForm.value.userId,
          token: resetForm.value.token,
          newPassword: resetForm.value.newPassword
        });
        
        ElMessage.success('Password reset successful');
        isResetComplete.value = true;
        
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || 'Failed to reset password');
        if (error.response?.status === 400) {
          isTokenValid.value = false;
        }
      } finally {
        isSubmitting.value = false;
      }
    }
  });
};
function handleLogin(){
  loginModal.openLoginModal;
}
</script>

<style scoped>
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.reset-password-card {
  width: 100%;
  max-width: 480px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin-bottom: 8px;
  color: #333;
}

.card-header p {
  margin: 0;
  color: #666;
}

.submit-btn {
  width: 100%;
  border-radius: 8px;
  margin-top: 12px;
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  border: none;
}

.action-btn {
  width: 100%;
  border-radius: 8px;
  margin-top: 16px;
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  border: none;
}

.form-footer {
  margin-top: 20px;
  text-align: center;
}

.success-message,
.error-message,
.loading-message {
  text-align: center;
  margin: 20px 0;
  padding: 20px;
}

.success-message {
  color: #67c23a;
}

.error-message {
  color: #f56c6c;
}

.loading-message {
  color: #409eff;
}

.success-message i,
.error-message i {
  font-size: 48px;
  margin-bottom: 16px;
}

.success-message p,
.error-message p,
.loading-message p {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 8px;
}

.success-message small,
.error-message small,
.loading-message small {
  color: #666;
}

.password-requirements {
  margin-top: 8px;
  font-size: 0.85rem;
  color: #666;
}

.password-requirements p {
  margin-bottom: 4px;
}

.password-requirements ul {
  margin: 0;
  padding-left: 20px;
}

.requirement-met {
  color: #67c23a;
}

.action-buttons {
  margin-top: 20px;
}
</style> 