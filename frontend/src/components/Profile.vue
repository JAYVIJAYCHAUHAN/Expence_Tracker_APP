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
          v-model="formData.avatarUrl"
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
const API_URL = import.meta.env.VITE_API_URL;
const formData = ref({
  fullName: '',
  userName: '',
  email: '',
  phone: '',
  bio: '',
  avatarUrl: ''
});

// Add maximum file size constant
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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

// Add image compression function
const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Max dimensions
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG with 0.8 quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const handleAvatarChange = async (file: UploadFile) => {
  if (!file.raw) return;
  
  // Check file size
  if (file.raw.size > MAX_FILE_SIZE) {
    ElMessage.error('Image size should not exceed 5MB');
    return;
  }
  
  // Check file type
  if (!file.raw.type.startsWith('image/')) {
    ElMessage.error('Please upload an image file');
    return;
  }
  
  loading.value = true;
  try {
    const compressedImage = await compressImage(file.raw);
    formData.value.avatarUrl = compressedImage;
    ElMessage.success('Image uploaded successfully');
  } catch (error) {
    console.error('Error processing image:', error);
    ElMessage.error('Error processing image');
  } finally {
    loading.value = false;
  }
};

const submitForm = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    loading.value = true;
    
    // Remove extra fields that shouldn't be sent to the backend
    const updateData = {
      fullName: formData.value.fullName,
      userName: formData.value.userName,
      email: formData.value.email,
      phone: formData.value.phone,
      bio: formData.value.bio,
      avatarUrl: formData.value.avatarUrl
    };
    
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    // Update local storage with new user data
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Dispatch storage event for other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'user',
      newValue: JSON.stringify(data.user)
    }));
    
    ElMessage.success(data.message || 'Profile updated successfully');
    
    // Emit event for parent components
    emit('profile-updated', data.user);
    
  } catch (error: any) {
    console.error('Profile update error:', error);
    ElMessage.error(error.message || 'Error updating profile');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
    loadUserData(); // Reload original data
  }
};

// Add defineEmits
const emit = defineEmits(['profile-updated']);

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

@media (max-width: 640px) {
  .profile-container {
    margin: 20px auto;
    padding: 16px;
  }

  .profile-form {
    padding: 20px;
  }
}
</style> 