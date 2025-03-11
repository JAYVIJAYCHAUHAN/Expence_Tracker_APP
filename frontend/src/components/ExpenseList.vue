<template>
  <el-card class="expense-list">
    <template #header>
      <div class="header-content">
        <h3>Expenses List</h3>
        <div class="filters">
          <el-select
            v-model="selectedMonth"
            placeholder="Select Month"
            style="width: 150px; margin-right: 10px"
          >
            <el-option
              v-for="month in months"
              :key="month.value"
              :label="month.label"
              :value="month.value"
            />
          </el-select>
          <el-select
            v-model="selectedCategory"
            placeholder="All Categories"
            style="width: 150px"
            clearable
          >
            <el-option
              v-for="category in categories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </div>
      </div>
    </template>

    <el-table :data="filteredExpenses" style="width: 100%">
      <el-table-column prop="date" label="Date" width="120">
        <template #default="{ row }">
          {{ formatDate(row.date) }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="Description" />
      <el-table-column prop="category" label="Category" width="120">
        <template #default="{ row }">
          <el-tag>{{ row.category }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="Amount" width="120">
        <template #default="{ row }">
          {{ formatAmount(row.amount) }}
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="150" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button
              size="small"
              type="primary"
              @click="$emit('edit', row)"
            >
              Edit
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="confirmDelete(row)"
            >
              Delete
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <div class="summary">
      <h4>Monthly Summary</h4>
      <p>Total Expenses: {{ formatAmount(totalAmount) }}</p>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';

const props = defineProps<{
  expenses: Array<{
    _id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
  }>;
}>();

const emit = defineEmits(['edit', 'delete']);

const selectedMonth = ref(new Date().getMonth());
const selectedCategory = ref('');

const months = [
  { label: 'January', value: 0 },
  { label: 'February', value: 1 },
  { label: 'March', value: 2 },
  { label: 'April', value: 3 },
  { label: 'May', value: 4 },
  { label: 'June', value: 5 },
  { label: 'July', value: 6 },
  { label: 'August', value: 7 },
  { label: 'September', value: 8 },
  { label: 'October', value: 9 },
  { label: 'November', value: 10 },
  { label: 'December', value: 11 }
];

const categories = [
  { label: 'Food', value: 'food' },
  { label: 'Transportation', value: 'transportation' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Bills', value: 'bills' },
  { label: 'Others', value: 'others' }
];

const filteredExpenses = computed(() => {
  return props.expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const monthMatch = expenseDate.getMonth() === selectedMonth.value;
    const categoryMatch = !selectedCategory.value || expense.category === selectedCategory.value;
    return monthMatch && categoryMatch;
  });
});

const totalAmount = computed(() => {
  return filteredExpenses.value.reduce((sum, expense) => sum + expense.amount, 0);
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const confirmDelete = (expense: any) => {
  ElMessageBox.confirm(
    'Are you sure you want to delete this expense?',
    'Warning',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }
  ).then(() => {
    if (expense._id) {
      emit('delete', expense);
    } else {
      ElMessage.error('Cannot delete expense: Invalid ID');
    }
  }).catch(() => {});
};
</script>

<style scoped>
.expense-list {
  margin: 20px auto;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters {
  display: flex;
  gap: 10px;
}

.summary {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
</style> 