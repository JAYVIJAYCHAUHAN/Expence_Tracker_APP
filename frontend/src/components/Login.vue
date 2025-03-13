<template>
  <el-dialog
    :model-value="isLoginModelOpen"
    @update:model-value="updateLoginModal"
    width="480px"
    :center="true"
    @close="resetForm"
    class="login-dialog"
    :show-close="false"
  >
    <template #header>
      <div class="dialog-header">
        <h2 class="gradient-text">Welcome Back</h2>
        <p class="subtitle">Continue your financial journey</p>
      </div>
    </template>

    <el-form 
      :model="formValues" 
      ref="loginForm" 
      :rules="validationRules" 
      label-position="top"
      class="login-form"
    >
      <el-form-item label="Email" prop="email">
        <el-input
          v-model="formValues.email"
          id="email"
          placeholder="Enter your email"
        >
          <template #prefix>
            <i class="bi bi-envelope"></i>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="Password" prop="password">
        <el-input
          id="password"
          type="password"
          v-model="formValues.password"
          placeholder="Enter your password"
          show-password
        >
          <template #prefix>
            <i class="bi bi-lock"></i>
          </template>
        </el-input>
      </el-form-item>

      <el-button 
        type="primary" 
        @click="handleLogin" 
        :loading="isSubmitting"
        class="submit-btn"
      >
        Log In
      </el-button>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button plain @click="updateLoginModal(false)" class="cancel-btn">
          Cancel
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
// todo use setup  and emitprops and emit
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const props = defineProps({
  isLoginModelOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:model-value']);

const router = useRouter();
const isSubmitting = ref(false);
const loginForm = ref();
const formValues = ref({
  email: "",
  password: "",
});

const validationRules = {
  email: [
    { required: true, message: "Please enter your email", trigger: "blur" },
    { type: "email", message: "Please enter a valid email", trigger: "blur" },
  ],
  password: [
    {
      required: true,
      message: "Please enter your password",
      trigger: "blur",
    },
  ],
};

async function handleLogin() {
  try {
    await loginForm.value.validate();
    isSubmitting.value = true;

    const response = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formValues.value),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();
    
    // Store token and user data
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    
    // Close the login modal
    emit("update:model-value", false);
    
    // Show success message
    ElMessage.success('Login successful!');
    
    // Redirect to dashboard
    router.push('/dashboard');
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : 'Failed to login');
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
}

function updateLoginModal(value: boolean) {
  emit("update:model-value", value);
}

function resetForm() {
  formValues.value = { email: "", password: "" };
  emit("update:model-value", false);
}
</script>

<style scoped>
.login-dialog {
  :deep(.el-dialog) {
    border-radius: 20px;
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    padding: 0;
    margin: 0;
  }

  :deep(.el-dialog__body) {
    padding: 30px 40px;
  }

  :deep(.el-dialog__footer) {
    padding: 20px 40px;
    border-top: 1px solid #eee;
  }
}

.dialog-header {
  text-align: center;
  padding: 40px 20px 0;
}

.gradient-text {
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 2rem;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.login-form {
  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #333;
  }

  :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: none;
    border: 2px solid #eee;
    transition: all 0.3s ease;

    &:hover, &:focus-within {
      border-color: #00c4cc;
      box-shadow: 0 0 0 1px #00c4cc20;
    }
  }

  :deep(.el-input__prefix-icon) {
    font-size: 1.2rem;
    color: #00c4cc;
  }
}

.submit-btn {
  width: 100%;
  height: 48px;
  margin-top: 20px;
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 10px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.dialog-footer {
  text-align: center;
}

.cancel-btn {
  min-width: 120px;
  height: 40px;
  border-color: #ddd;
  color: #666;

  &:hover {
    border-color: #00c4cc;
    color: #00c4cc;
  }
}

@media (max-width: 768px) {
  .login-dialog {
    :deep(.el-dialog) {
      width: 90% !important;
      margin: 20px auto;
    }

    :deep(.el-dialog__body) {
      padding: 20px;
    }
  }

  .gradient-text {
    font-size: 1.75rem;
  }
}
</style>

 