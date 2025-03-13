<template>
  <div class="profile-container">
    <div class="profile-header">
      <h2>Edit Profile</h2>
      <p>Update your personal information</p>
    </div>

    <el-form 
      :model="formData" 
      :rules="rules" 
      ref="formRef" 
      label-position="top" 
      class="profile-form"
    >
      <div class="avatar-section">
        <el-avatar 
          :size="100" 
          :src="formData.avatarUrl" 
          class="profile-avatar"
        >
          <i class="bi bi-person-circle"></i>
        </el-avatar>
        <el-upload
          class="avatar-upload"
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleAvatarChange"
        >
          <el-button type="primary" class="upload-btn">
            <i class="bi bi-camera me-2"></i> Change Photo
          </el-button>
        </el-upload>
      </div>

      <el-form-item label="Full Name" prop="fullName">
        <el-input 
          v-model="formData.fullName" 
          placeholder="Enter your full name"
        >
          <template #prefix>
            <i class="bi bi-person"></i>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="Username" prop="userName">
        <el-input 
          v-model="formData.userName" 
          placeholder="Choose a username"
        >
          <template #prefix>
            <i class="bi bi-at"></i>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="Email" prop="email">
        <el-input 
          v-model="formData.email" 
          placeholder="Enter your email"
        >
          <template #prefix>
            <i class="bi bi-envelope"></i>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="Phone Number" prop="phone">
        <el-input 
          v-model="formData.phone" 
          placeholder="Enter your phone number"
        >
          <template #prefix>
            <i class="bi bi-phone"></i>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="Bio" prop="bio">
        <el-input 
          v-model="formData.bio" 
          type="textarea" 
          :rows="3"
          placeholder="Tell us about yourself"
        />
      </el-form-item>

      <div class="form-actions">
        <el-button @click="resetForm">Cancel</el-button>
        <el-button type="primary" @click="submitForm" :loading="loading">
          Save Changes
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import type { UploadFile } from 'element-plus';

const formRef = ref<FormInstance>();
const loading = ref(false);

const formData = ref({
  fullName: '',
  userName: '',
  email: '',
  phone: '',
  bio: '',
  avatarUrl: ''
});

const rules: FormRules = {
  fullName: [
    { required: true, message: 'Please enter your full name', trigger: 'blur' },
    { min: 3, message: 'Name must be at least 3 characters', trigger: 'blur' }
  ],
  userName: [
    { required: true, message: 'Please choose a username', trigger: 'blur' },
    { min: 3, message: 'Username must be at least 3 characters', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Please enter your email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^\+?[\d\s-]{10,}$/, message: 'Please enter a valid phone number', trigger: 'blur' }
  ]
};

const loadUserData = () => {
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const parsedData = JSON.parse(userData);
      formData.value = {
        ...formData.value,
        ...parsedData
      };
    } catch (error) {
      ElMessage.error('Error loading user data');
    }
  }
};

const handleAvatarChange = (file: UploadFile) => {
  if (!file.raw) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    formData.value.avatarUrl = e.target?.result as string;
  };
  reader.readAsDataURL(file.raw);
};

const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {

        
        // Here you would typically make an API call to update the profile
        // For now, we'll just update localStorage
        localStorage.setItem('user', JSON.stringify(formData.value));
        ElMessage.success('Profile updated successfully');
      } catch (error) {
        ElMessage.error('Failed to update profile');
      } finally {
        loading.value = false;
      }
    }
  });
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
    loadUserData();
  }
};

onMounted(() => {
  loadUserData();
});
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
}

.profile-header h2 {
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 2rem;
  margin-bottom: 8px;
}

.profile-header p {
  color: #666;
}

.profile-form {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.profile-avatar {
  margin-bottom: 16px;
  border: 3px solid #00c4cc;
  background: #f5f7fa;
}

.profile-avatar i {
  font-size: 2rem;
  color: #666;
}

.upload-btn {
  background: transparent;
  border: 2px solid #00c4cc;
  color: #00c4cc;
}

.upload-btn:hover {
  background: #00c4cc;
  color: white;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-input__prefix) {
  margin-right: 8px;
}

:deep(.el-input__prefix i) {
  font-size: 1.2rem;
  color: #666;
}

@media (max-width: 576px) {
  .profile-container {
    margin: 20px auto;
    padding: 16px;
  }

  .profile-form {
    padding: 20px;
  }
}
</style> 