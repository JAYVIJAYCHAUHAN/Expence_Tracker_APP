<template>
  <div class="expense-container">
    <div class="expense-header">
      <h2>Manage Expenses</h2>
      <p>Add and track your daily expenses</p>
    </div>

    <!-- Expense Form -->
    <el-card class="expense-form-card">
      <template #header>
        <div class="card-header">
          <h3>{{ isEditing ? 'Edit Expense' : 'Add New Expense' }}</h3>
          <el-button v-if="isEditing" type="text" @click="resetForm">
            <i class="bi bi-plus-circle"></i> Add New
          </el-button>
        </div>
      </template>
      
      <el-form 
        ref="expenseFormRef"
        :model="expenseForm"
        :rules="formRules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <el-row :gutter="20">
          <!-- Amount Field -->
          <el-col :span="12">
            <el-form-item label="Amount" prop="amount">
              <el-input
                v-model.number="expenseForm.amount"
                type="number"
                placeholder="Enter amount"
              >
                <template #prefix>₹</template>
              </el-input>
            </el-form-item>
          </el-col>

          <!-- Date Field -->
          <el-col :span="12">
            <el-form-item label="Date" prop="date">
              <el-date-picker
                v-model="expenseForm.date"
                type="datetime"
                placeholder="Select date and time"
                format="YYYY-MM-DD HH:mm"
                :default-time="new Date(2000, 1, 1, 0, 0, 0)"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Category Field -->
        <el-form-item label="Category" prop="category">
          <el-select
            v-model="expenseForm.category"
            placeholder="Select category"
            style="width: 100%"
          >
            <el-option
              v-for="category in categories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            >
              <span style="float: left">
                <i :class="category.icon" style="margin-right: 8px"></i>
                {{ category.label }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- Description Field -->
        <el-form-item label="Description" prop="description">
          <el-input
            v-model="expenseForm.description"
            type="textarea"
            :rows="2"
            placeholder="Enter expense description"
          />
        </el-form-item>

        <!-- Payment Method -->
        <el-form-item label="Payment Method" prop="paymentMethod">
          <el-radio-group v-model="expenseForm.paymentMethod">
            <el-radio label="cash">Cash</el-radio>
            <el-radio label="card">Card</el-radio>
            <el-radio label="upi">UPI</el-radio>
            <el-radio label="other">Other</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- Submit Button -->
        <el-form-item>
          <el-button 
            type="primary" 
            native-type="submit" 
            :loading="isSubmitting"
            style="width: 20%"
          >
            {{ isEditing ? 'Update Expense' : 'Add Expense' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Recent Expenses Table -->
    <div class="recent-expenses">
      <div class="section-header">
        <h3>Recent Expenses</h3>
        <div class="header-actions">
          <el-input
            v-model="searchQuery"
            placeholder="Search expenses"
            style="width: 200px"
          >
            <template #prefix>
              <i class="bi bi-search"></i>
            </template>
          </el-input>
          <el-select v-model="filterCategory" placeholder="All Categories" style="width: 150px">
            <el-option label="All Categories" value="" />
            <el-option
              v-for="category in categories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </div>
      </div>

      <el-table 
        :data="filteredExpenses"
        style="width: 100%"
        v-loading="isLoading"
      >
        <el-table-column prop="date" label="Date" width="160">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="category" label="Category" width="150">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)">
              {{ getCategoryLabel(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="description" label="Description" />
        
        <el-table-column prop="amount" label="Amount" width="150" align="right">
          <template #default="{ row }">
            ₹{{ formatAmount(row.amount) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="paymentMethod" label="Payment" width="120">
          <template #default="{ row }">
            <el-tag size="small" :type="getPaymentType(row.paymentMethod || 'other')">
              {{ formatPaymentMethod(row.paymentMethod) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="Actions" width="150" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button
                size="small"
                type="primary"
                @click="editExpense(row)"
                :icon="Edit"
                 class="mb-2"
              >
                Edit
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="deleteExpense(row)"
                :icon="Delete"
              >
                Delete
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalExpenses"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { Delete, Edit } from '@element-plus/icons-vue';
import axios from 'axios';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import { computed, onMounted, ref } from 'vue';

const API_URL = 'http://localhost:5000/api';

// Form data
const expenseFormRef = ref<FormInstance>();
const isEditing = ref(false);
const isSubmitting = ref(false);
const isLoading = ref(false);

const expenseForm = ref({
  amount: 0,
  date: new Date(),
  category: '',
  description: '',
  paymentMethod: 'cash',
  _id: null as string | null
});

// Categories
const categories = [
  { label: 'Groceries', value: 'groceries', icon: 'bi bi-cart' },
  { label: 'Transportation', value: 'transportation', icon: 'bi bi-car-front' },
  { label: 'Entertainment', value: 'entertainment', icon: 'bi bi-film' },
  { label: 'Utilities', value: 'utilities', icon: 'bi bi-lightning' },
  { label: 'Shopping', value: 'shopping', icon: 'bi bi-bag' },
  { label: 'Bills', value: 'bills', icon: 'bi bi-receipt' },
  { label: 'Food', value: 'food', icon: 'bi bi-cup-hot' },
  { label: 'Health', value: 'health', icon: 'bi bi-heart-pulse' },
  { label: 'Education', value: 'education', icon: 'bi bi-book' },
  { label: 'Others', value: 'others', icon: 'bi bi-three-dots' }
];

// Form validation rules
const formRules = {
  amount: [
    { required: true, message: 'Please enter amount', trigger: 'blur' },
    { type: 'number', min: 1, message: 'Amount must be greater than 0', trigger: 'blur' }
  ],
  date: [
    { required: true, message: 'Please select date', trigger: 'change' }
  ],
  category: [
    { required: true, message: 'Please select category', trigger: 'change' }
  ],
  description: [
    { required: true, message: 'Please enter description', trigger: 'blur' },
    { min: 3, message: 'Description must be at least 3 characters', trigger: 'blur' }
  ],
  paymentMethod: [
    { required: true, message: 'Please select payment method', trigger: 'change' }
  ]
};

// Table data
const expenses = ref([]);
const searchQuery = ref('');
const filterCategory = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const totalExpenses = ref(0);

// Computed properties
const filteredExpenses = computed(() => {
  let filtered = [...expenses.value];
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(expense => 
      expense.description.toLowerCase().includes(query) ||
      expense.category.toLowerCase().includes(query)
    );
  }
  
  if (filterCategory.value) {
    filtered = filtered.filter(expense => 
      expense.category === filterCategory.value
    );
  }
  
  return filtered;
});

// Methods
const fetchExpenses = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get(`${API_URL}/expenses`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    expenses.value = response.data;
    totalExpenses.value = response.data.length;
  } catch (error: any) {
    if (error.response?.status === 401) {
      ElMessage.error('Please signup to manage expenses');
      router.push('/signup');
    } else {
      ElMessage.error('Failed to fetch expenses');
      console.error('Error fetching expenses:', error);
    }
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  if (!expenseFormRef.value) return;
  
  await expenseFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        isSubmitting.value = true;
        const data = {
          ...expenseForm.value,
          date: new Date(expenseForm.value.date).toISOString()
        };

        if (isEditing.value && expenseForm.value._id) {
          await axios.put(
            `${API_URL}/expenses/${expenseForm.value._id}`,
            data,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          ElMessage.success('Expense updated successfully');
        } else {
          await axios.post(
            `${API_URL}/expenses`,
            data,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          ElMessage.success('Expense added successfully');
        }
        
        resetForm();
        fetchExpenses();
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || 'Failed to save expense');
      } finally {
        isSubmitting.value = false;
      }
    }
  });
};

const editExpense = (expense: any) => {
  isEditing.value = true;
  expenseForm.value = {
    ...expense,
    date: new Date(expense.date)
  };
};

const deleteExpense = async (expense: any) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to delete this expense?',
      'Warning',
      {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning'
      }
    );

    await axios.delete(`${API_URL}/expenses/${expense._id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    ElMessage.success('Expense deleted successfully');
    fetchExpenses();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to delete expense');
    }
  }
};

const resetForm = () => {
  if (expenseFormRef.value) {
    expenseFormRef.value.resetFields();
  }
  expenseForm.value = {
    amount: 0,
    date: new Date(),
    category: '',
    description: '',
    paymentMethod: 'cash',
    _id: null
  };
  isEditing.value = false;
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

// Utility functions
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatAmount = (amount: number) => {
  return amount.toLocaleString('en-IN');
};

const getCategoryLabel = (value: string) => {
  const category = categories.find(c => c.value === value);
  return category ? category.label : value;
};

const getCategoryType = (category: string) => {
  const types: { [key: string]: string } = {
    'groceries': 'success',
    'transportation': 'warning',
    'entertainment': 'info',
    'utilities': 'danger',
    'shopping': 'primary',
    'bills': 'warning',
    'food': 'success',
    'health': 'danger',
    'education': 'info',
    'others': 'info'
  };
  return types[category] || 'default';
};

const getPaymentType = (method: string) => {
  const types: { [key: string]: string } = {
    'cash': 'success',
    'card': 'primary',
    'upi': 'warning',
    'other': 'info'
  };
  return types[method] || 'default';
};

const formatPaymentMethod = (method: string) => {
  if (!method) return 'N/A';
  return method.charAt(0).toUpperCase() + method.slice(1);
};

// Initialize
onMounted(() => {
  fetchExpenses();
});
</script>

<style scoped>
.expense-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.expense-header {
  text-align: center;
  margin-bottom: 32px;
}

.expense-header h2 {
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 2rem;
  margin-bottom: 8px;
}

.expense-header p {
  color: #666;
}

.expense-form-card {
  margin-bottom: 32px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #333;
}

.recent-expenses {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .expense-container {
    padding: 16px;
  }

  .header-actions {
    flex-direction: column;
    gap: 8px;
  }

  .el-button-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}
</style>