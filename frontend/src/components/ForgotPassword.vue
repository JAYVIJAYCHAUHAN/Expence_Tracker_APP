<template>
  <div class="forgot-password-container">
    <el-card class="forgot-password-card">
      <template #header>
        <div class="card-header">
          <h2>Reset Your Password</h2>
          <p>Enter your email to receive a password reset link</p>
        </div>
      </template>
      
      <el-form
        v-if="!resetRequested"
        ref="resetFormRef"
        :model="resetForm"
        :rules="resetRules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-form-item prop="email" label="Email Address">
          <el-input
            v-model="resetForm.email"
            placeholder="Enter your email"
            type="email"
          >
            <template #prefix>
              <i class="bi bi-envelope"></i>
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
            Request Password Reset
          </el-button>
        </el-form-item>
        
        <div class="form-footer">
          <router-link to="/login">Back to Login</router-link>
        </div>
      </el-form>
      
      <div v-else class="email-simulation">
        <div class="success-message">
          <i class="bi bi-check-circle-fill"></i>
          <p>Reset Email Sent!</p>
          <small>We've sent instructions to {{ resetForm.email }}.<br>Please check your inbox.</small>
        </div>
        
        <div class="email-preview">
          <div class="email-header">
            <i class="bi bi-envelope-check"></i>
            <h3>Password Reset - Expense Tracker</h3>
            <p>From: noreply@expensetracker.com</p>
            <p>To: {{ resetForm.email }}</p>
          </div>
          
          <div class="email-body">
            <h4>Reset Your Password</h4>
            <p>Hello,</p>
            <p>We received a request to reset your password for your Expense Tracker account. Please click the button below to reset your password:</p>
            
            <div class="email-button-container">
              <router-link :to="`/reset-password/${resetForm.userId}/${resetForm.token}`">
                <button class="email-button">Reset Password</button>
              </router-link>
            </div>
            
            <p>Or copy and paste this link in your browser:</p>
            <div class="email-link">{{ resetLink }}</div>
            
            <p>This link will expire in 60 minutes.</p>
            <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
            
            <p>Best regards,<br>The Expense Tracker Team</p>
          </div>
        </div>
        
        <div class="action-buttons">
          <router-link :to="`/reset-password/${resetForm.userId}/${resetForm.token}`">
            <el-button type="primary" class="proceed-btn">Continue to Reset Password</el-button>
          </router-link>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, FormInstance } from 'element-plus';
import axios from 'axios';

// Constants
const API_URL = import.meta.env.VITE_API_URL;
const APP_URL = window.location.origin;

// Router
const router = useRouter();

// Form
const resetFormRef = ref<FormInstance>();
const resetForm = ref({
  email: '',
  userId: '',
  token: ''
});

// State
const isSubmitting = ref(false);
const resetRequested = ref(false);

// Computed
const resetLink = computed(() => {
  return `${APP_URL}/reset-password/${resetForm.value.userId}/${resetForm.value.token}`;
});

// Rules
const resetRules = {
  email: [
    { required: true, message: 'Please enter your email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email', trigger: 'blur' }
  ]
};

// Methods
const handleSubmit = async () => {
  if (!resetFormRef.value) return;
  
  await resetFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        isSubmitting.value = true;
        
        const response = await axios.post(`${API_URL}/auth/request-reset`, {
          email: resetForm.value.email
        });
        
        // In a real app, the token would be in the email, not returned directly
        resetForm.value.token = response.data.resetToken;
        resetForm.value.userId = response.data.userId;
        
        resetRequested.value = true;
        ElMessage.success('Password reset instructions sent to your email');
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || 'Failed to request password reset');
      } finally {
        isSubmitting.value = false;
      }
    }
  });
};
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.forgot-password-card {
  width: 100%;
  max-width: 580px;
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

.form-footer {
  margin-top: 20px;
  text-align: center;
}

.success-message {
  text-align: center;
  color: #67c23a;
  margin: 20px 0;
}

.success-message i {
  font-size: 48px;
  margin-bottom: 16px;
}

.success-message p {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 8px;
}

.success-message small {
  color: #666;
}

.email-preview {
  margin-top: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.email-header {
  background: #f8f8f8;
  padding: 15px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.email-header i {
  float: right;
  font-size: 24px;
  color: #67c23a;
}

.email-header h3 {
  margin: 0 0 10px;
  color: #333;
}

.email-header p {
  margin: 5px 0;
  color: #666;
  font-size: 0.9rem;
}

.email-body {
  padding: 20px;
  background: white;
  text-align: left;
}

.email-body h4 {
  margin-top: 0;
  color: #333;
}

.email-body p {
  color: #444;
  line-height: 1.5;
}

.email-button-container {
  text-align: center;
  margin: 25px 0;
}

.email-button {
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.email-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 196, 204, 0.2);
}

.email-link {
  background: #f1f1f1;
  padding: 10px;
  border-radius: 4px;
  margin: 15px 0;
  word-break: break-all;
  font-size: 0.85rem;
  color: #00c4cc;
}

.action-buttons {
  text-align: center;
  margin-top: 25px;
}

.proceed-btn {
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  border: none;
  width: 80%;
  max-width: 300px;
  height: 46px;
  font-size: 1.1rem;
  border-radius: 8px;
}
</style> 