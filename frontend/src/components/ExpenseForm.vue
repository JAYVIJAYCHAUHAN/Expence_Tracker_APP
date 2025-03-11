<template>
  <el-card class="expense-form">
    <template #header>
      <h3>{{ isEditing ? 'Edit Expense' : 'Add New Expense' }}</h3>
    </template>
    
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="Amount" prop="amount">
        <el-input-number 
          v-model="form.amount" 
          :min="0" 
          :precision="2"
          :step="0.01"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="Description" prop="description">
        <el-input 
          v-model="form.description" 
          type="text"
          placeholder="Enter expense description"
        />
      </el-form-item>

      <el-form-item label="Category" prop="category">
        <el-select v-model="form.category" placeholder="Select category" style="width: 100%">
          <el-option label="Food" value="food" />
          <el-option label="Transportation" value="transportation" />
          <el-option label="Entertainment" value="entertainment" />
          <el-option label="Shopping" value="shopping" />
          <el-option label="Bills" value="bills" />
          <el-option label="Others" value="others" />
        </el-select>
      </el-form-item>

      <el-form-item label="Date" prop="date">
        <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="Select date"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">
          {{ isEditing ? 'Update' : 'Add' }} Expense
        </el-button>
        <el-button @click="resetForm">Reset</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

interface Expense {
  id?: string;
  amount: number;
  description: string;
  category: string;
  date: Date | string;
}

const props = defineProps<{
  isEditing: boolean;
  editData: Expense | null;
}>();

const emit = defineEmits<{
  (e: 'submit', data: Expense): void;
}>();

const formRef = ref<FormInstance>();
const form = ref<Expense>({
  amount: 0,
  description: '',
  category: '',
  date: new Date()
});

// Watch for changes in editData and update form
watch(() => props.editData, (newVal) => {
  if (newVal) {
    form.value = { ...newVal };
  }
}, { immediate: true });

const rules: FormRules = {
  amount: [
    { required: true, message: 'Please enter amount', trigger: 'blur' },
    { type: 'number', min: 0, message: 'Amount must be greater than 0', trigger: 'blur' }
  ],
  description: [
    { required: true, message: 'Please enter description', trigger: 'blur' },
    { min: 3, message: 'Description must be at least 3 characters', trigger: 'blur' }
  ],
  category: [
    { required: true, message: 'Please select category', trigger: 'change' }
  ],
  date: [
    { required: true, message: 'Please select date', trigger: 'change' }
  ]
};

const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', form.value);
      if (!props.isEditing) {
        resetForm();
      }
    }
  });
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
};
</script>

<style scoped>
.expense-form {
  max-width: 600px;
  margin: 20px auto;
}
</style> 