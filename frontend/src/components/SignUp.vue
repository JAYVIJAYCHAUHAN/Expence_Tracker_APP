<template>
  <div class="signup-container">
    <div class="signup-card">
      <div class="signup-header">
        <h2 class="gradient-text">Create Account</h2>
        <p class="subtitle">Start your financial journey with us</p>
      </div>
      
      <el-form
        :model="formValues"
        ref="signupForm"
        :rules="validationRules"
        label-position="top"
        class="signup-form"
      >
        <el-form-item label="Username" prop="userName">
          <el-input
            id="userName"
            v-model="formValues.userName"
            placeholder="Choose a username"
          >
            <template #prefix>
              <i class="bi bi-person"></i>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="Email" prop="email">
          <el-input
            id="email"
            v-model="formValues.email"
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
            placeholder="Create a password"
            show-password
          >
            <template #prefix>
              <i class="bi bi-lock"></i>
            </template>
          </el-input>
        </el-form-item>

        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="isSubmitting"
          class="submit-btn"
        >
          Create Account
        </el-button>

        <div class="login-link">
          Already have an account? 
          <el-button 
            link 
            type="primary" 
            @click="openLoginModal"
            class="login-btn"
            style="margin-bottom: 5px;"
          >
            Log in
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
  <Login :isLoginModelOpen="isLoginModalVisible" @update:model-value="isLoginModalVisible = $event" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from 'element-plus';
import Login from "./Login.vue";

const isSubmitting = ref(false);
const signupForm = ref();
const isLoginModalVisible = ref(false);
const formValues = ref({
  userName: "",
  email: "",
  password: "",
});

const validationRules = {
  userName: [
    {
      required: true,
      message: "Please enter a username",
      trigger: "blur",
    },
    {
      min: 3,
      message: "Username must be at least 3 characters",
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: "Please enter your email", trigger: "blur" },
    { type: "email", message: "Please enter a valid email", trigger: "blur" },
  ],
  password: [
    {
      required: true,
      message: "Please enter a password",
      trigger: "blur",
    },
    {
      min: 6,
      message: "Password must be at least 6 characters",
      trigger: "blur",
    },
  ],
};

async function handleSubmit() {
  try {
    await signupForm.value.validate();
    isSubmitting.value = true;

    const response = await fetch("http://localhost:5000/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName: formValues.value.userName,
        email: formValues.value.email,
        password: formValues.value.password
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create account');
    }

    const data = await response.json();
    
    // Store token and user data
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    
    ElMessage.success('Account created successfully!');
    formValues.value = { userName: "", email: "", password: "" };
    isLoginModalVisible.value = true; // Open login modal after successful signup
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : 'Failed to create account');
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
}

function openLoginModal() {
  isLoginModalVisible.value = true;
}
</script>

<style scoped>
.signup-container {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #00c4cc10, #7209b710);
}

.signup-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.signup-header {
  text-align: center;
  margin-bottom: 40px;
}

.gradient-text {
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.signup-form {
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

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.login-btn {
  font-weight: 600;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .signup-card {
    padding: 30px 20px;
  }

  .gradient-text {
    font-size: 2rem;
  }
}
</style>