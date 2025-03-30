<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h2>Financial Dashboard</h2>
      <p>Your financial overview at a glance</p>
    </div>

    <!-- Date Range Selector -->
    <el-card class="filter-card">
      <div class="date-filter">
        <el-radio-group v-model="dateRange" @change="handleDateRangeChange">
          <el-radio-button label="week" class="me-2">This Week</el-radio-button>
          <el-radio-button label="month" class="me-2">This Month</el-radio-button>
          <el-radio-button label="year" class="me-2">This Year</el-radio-button>
          <el-radio-button label="custom" class="me-2">Custom</el-radio-button>
        </el-radio-group>
        
        <el-date-picker
          v-if="dateRange === 'custom'"
          v-model="customDateRange"
          type="daterange"
          range-separator="to"
          start-placeholder="Start date"
          end-placeholder="End date"
          :disabled-date="disableFutureDates"
          @change="handleCustomDateChange"
        />
      </div>
    </el-card>

    <!-- Refresh Settings -->
    <el-card class="refresh-settings">
      <div class="refresh-controls">
        <el-switch
          v-model="autoRefresh"
          active-text="Auto Refresh"
          :inactive-text="'Manual Refresh'"
        />
        <el-select 
          v-model="refreshInterval" 
          placeholder="Refresh Interval"
          :disabled="!autoRefresh"
          @change="() => {
            refreshTimer.pause();
            refreshTimer.resume();
          }"
        >
          <el-option label="15 seconds" :value="15000" />
          <el-option label="30 seconds" :value="30000" />
          <el-option label="1 minute" :value="60000" />
          <el-option label="5 minutes" :value="300000" />
        </el-select>
        <el-button 
          type="primary" 
          @click="fetchExpenses"
          :loading="isLoading"
        >
          <i :class="autoRefresh ? 'bi bi-arrow-repeat' : 'bi bi-arrow-clockwise'"></i>
          Refresh Now
        </el-button>
      </div>
    </el-card>

    <!-- Summary Cards -->
    <template v-if="isLoading">
      <Skeletons name="summary-card" :count="4" />
      
      <div style="margin-top: 20px">
        <el-row :gutter="20">
          <el-col :xs="24" :lg="14">
            <Skeletons name="chart" height="350px" />
          </el-col>
          <el-col :xs="24" :lg="10">
            <Skeletons name="chart" height="350px" />
          </el-col>
        </el-row>
      </div>
      
      <div style="margin-top: 20px">
        <Skeletons name="table" :count="5" />
      </div>
    </template>
    
    <template v-else>
      <!-- Summary Cards -->
      <el-row :gutter="20" class="summary-cards">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="summary-card total-card">
            <template #header>
              <div class="card-header">
                <i class="bi bi-wallet2"></i>
                <span>Total Expenses</span>
              </div>
            </template>
            <div class="card-amount">₹{{ formatAmount(totalExpenses) }}</div>
            <div class="card-footer" :class="getTrendClass(expenseTrend)">
              <i :class="getTrendIcon(expenseTrend)"></i>
              <span>{{ expenseTrend }}% vs previous period</span>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="summary-card average-card">
            <template #header>
              <div class="card-header">
                <i class="bi bi-calendar3"></i>
                <span>Daily Average</span>
              </div>
            </template>
            <div class="card-amount">₹{{ formatAmount(dailyAverage) }}</div>
            <div class="card-footer">
              <span>Target: ₹{{ formatAmount(dailyTarget) }}</span>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="summary-card category-card">
            <template #header>
              <div class="card-header">
                <i class="bi bi-pie-chart"></i>
                <span>Top Category</span>
              </div>
            </template>
            <div class="card-category">
              <el-tag :type="getCategoryType(topCategory.category)">
                {{ getCategoryLabel(topCategory.category) }}
              </el-tag>
            </div>
            <div class="card-amount">₹{{ formatAmount(topCategory.amount) }}</div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="summary-card payment-card">
            <template #header>
              <div class="card-header">
                <i class="bi bi-credit-card"></i>
                <span>Most Used Payment</span>
              </div>
            </template>
            <div class="card-payment">
              <el-tag :type="getPaymentType(topPayment.method)">
                {{ formatPaymentMethod(topPayment.method) }}
              </el-tag>
            </div>
            <div class="card-amount">{{ topPayment.count }} transactions</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- Charts Section -->
      <el-row :gutter="20" class="chart-section">
        <el-col :xs="24" :lg="14">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <h3>Expense Trend</h3>
                <el-radio-group v-model="trendTimeframe" size="small" @change="updateTrendChart">
                  <el-radio-button label="daily">Daily</el-radio-button>
                  <el-radio-button label="weekly">Weekly</el-radio-button>
                  <el-radio-button label="monthly">Monthly</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container">
              <LineChart 
                :data="trendData"
                :height="300"
                :loading="false"
              />
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="10">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <h3>Category Distribution</h3>
              </div>
            </template>
            <div class="chart-container">
              <PieChart 
                :data="categoryData"
                :height="300"
                :loading="false"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- Recent Transactions -->
      <el-card class="transactions-card">
        <template #header>
          <div class="card-header">
            <h3>Recent Transactions</h3>
            <router-link to="/expence">
              <el-button type="primary" plain size="small">
                <i class="bi bi-plus-circle me-2"></i> Add Expense
              </el-button>
            </router-link>
          </div>
        </template>

        <el-table 
          :data="recentTransactions"
          style="width: 100%"
          :max-height="400"
          v-loading="false"
        >
          <el-table-column prop="date" label="Date" width="150">
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
          
          <el-table-column prop="description" label="Description" min-width="200" />
          
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
        </el-table>
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import LineChart from '@/components/charts/LineChart.vue';
import PieChart from '@/components/charts/PieChart.vue';
import Skeletons from '@/components/ui/Skeletons.vue';
import { useIntervalFn } from '@vueuse/core';
import { watch } from 'vue';

// Types
interface Expense {
  _id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  paymentMethod: string;
}

// Router
const router = useRouter();

// Constants
const API_URL =  import.meta.env.VITE_API_URL;
const dailyTarget = 2000; // This could be made configurable in user settings

// State
const isLoading = ref(false);
const dateRange = ref('month');
const customDateRange = ref<[Date, Date] | null>(null);
const trendTimeframe = ref('daily');
const expenses = ref<Expense[]>([]);
const autoRefresh = ref(true);
const refreshInterval = ref(300000); // 5 minutes

// Date handling
const getDateRange = () => {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (dateRange.value) {
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth(), 1);
      break;
    case 'year':
      start.setMonth(0, 1);
      break;
    case 'custom':
      if (customDateRange.value) {
        return {
          start: customDateRange.value[0],
          end: customDateRange.value[1]
        };
      }
      break;
  }

  return { start, end };
};

// Computed properties
const totalExpenses = computed(() => {
  return expenses.value.reduce((sum, expense) => sum + expense.amount, 0);
});

const dailyAverage = computed(() => {
  const { start, end } = getDateRange();
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  return totalExpenses.value / days;
});

const topCategory = computed(() => {
  const categories = expenses.value.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = { amount: 0, count: 0 };
    }
    acc[expense.category].amount += expense.amount;
    acc[expense.category].count += 1;
    return acc;
  }, {} as Record<string, { amount: number; count: number }>);

  const sorted = Object.entries(categories)
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count
    }))
    .sort((a, b) => b.amount - a.amount);

  return sorted[0] || { category: '', amount: 0, count: 0 };
});

const topPayment = computed(() => {
  const methods = expenses.value.reduce((acc, expense) => {
    const method = expense.paymentMethod || 'other';
    if (!acc[method]) {
      acc[method] = { count: 0, amount: 0 };
    }
    acc[method].count += 1;
    acc[method].amount += expense.amount;
    return acc;
  }, {} as Record<string, { count: number; amount: number }>);

  const sorted = Object.entries(methods)
    .map(([method, data]) => ({
      method,
      count: data.count,
      amount: data.amount
    }))
    .sort((a, b) => b.count - a.count);

  return sorted[0] || { method: '', count: 0, amount: 0 };
});

const expenseTrend = computed(() => {
  const { start, end } = getDateRange();
  const currentTotal = totalExpenses.value;
  
  const periodLength = end.getTime() - start.getTime();
  const previousStart = new Date(start.getTime() - periodLength);
  
  // Calculate previous period's total
  const previousExpenses = expenses.value.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= previousStart && expenseDate < start;
  });
  
  const previousTotal = previousExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  if (previousTotal === 0) return 0;
  return Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
});

const trendData = computed(() => {
  const grouped = expenses.value.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const key = date.toISOString().split('T')[0];
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped)
    .map(([date, amount]) => ({
      date,
      amount
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

const categoryData = computed(() => {
  const categories = expenses.value.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categories).map(([name, value]) => ({
    name: getCategoryLabel(name),
    value
  }));
});

const recentTransactions = computed(() => {
  return [...expenses.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
});

const refreshTimer = useIntervalFn(() => {
  if (autoRefresh.value) {
    fetchExpenses();
  }
}, refreshInterval.value);

// Methods
const fetchExpenses = async () => {
  try {
    isLoading.value = true;
    const { start, end } = getDateRange();
    
    const response = await axios.get(`${API_URL}/expenses`, {
      params: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        timeframe: trendTimeframe.value
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    expenses.value = response.data;
    
    // Add success notification for data refresh
    ElMessage.success({
      message: 'Dashboard data updated',
      duration: 2000
    });
  } catch (error: any) {
    if (error.response?.status === 401) {
      ElMessage.error('Please signup to view dashboard');
      router.push('/signup');
    } else {
      ElMessage.error('Failed to fetch expense data');
      console.error('Error fetching expenses:', error);
    }
  } finally {
    isLoading.value = false;
  }
};

const handleDateRangeChange = () => {
  if (dateRange.value !== 'custom') {
    fetchExpenses();
  }
};

const handleCustomDateChange = () => {
  if (customDateRange.value?.length === 2) {
    fetchExpenses();
  }
};

const updateTrendChart = () => {
  fetchExpenses();
};

const disableFutureDates = (date: Date) => {
  return date > new Date();
};

// Utility functions
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const formatAmount = (amount: number) => {
  return amount.toLocaleString('en-IN');
};

const getCategoryLabel = (value: string) => {
  const categories = [
    { label: 'Groceries', value: 'groceries' },
    { label: 'Transportation', value: 'transportation' },
    { label: 'Entertainment', value: 'entertainment' },
    { label: 'Utilities', value: 'utilities' },
    { label: 'Shopping', value: 'shopping' },
    { label: 'Bills', value: 'bills' },
    { label: 'Food', value: 'food' },
    { label: 'Health', value: 'health' },
    { label: 'Education', value: 'education' },
    { label: 'Others', value: 'others' }
  ];
  const category = categories.find(c => c.value === value);
  return category ? category.label : value;
};

const getCategoryType = (category: string) => {
  const types: Record<string, string> = {
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
  const types: Record<string, string> = {
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

const getTrendClass = (trend: number) => {
  return trend > 0 ? 'trend-up' : trend < 0 ? 'trend-down' : 'trend-neutral';
};

const getTrendIcon = (trend: number) => {
  return trend > 0 ? 'bi bi-arrow-up-right' : trend < 0 ? 'bi bi-arrow-down-right' : 'bi bi-dash';
};

// Add this watch effect after the existing methods
watch([dateRange, customDateRange, trendTimeframe], () => {
  fetchExpenses();
});

// Add cleanup on component unmount
onUnmounted(() => {
  if (refreshTimer) {
    refreshTimer.pause();
  }
});

// Initialize
onMounted(() => {
  fetchExpenses();
});
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 32px;
}

.dashboard-header h2 {
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 2rem;
  margin-bottom: 8px;
}

.dashboard-header p {
  color: #666;
}

.filter-card {
  margin-bottom: 24px;
}

.date-filter {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
}

.summary-cards {
  margin-bottom: 24px;
}

.summary-card {
  height: 100%;
  transition: transform 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-header i {
  font-size: 1.2rem;
}

.card-amount {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 16px 0;
  color: #333;
}

.card-footer {
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #f56c6c;
}

.trend-neutral {
  color: #909399;
}

.card-category, .card-payment {
  margin-bottom: 8px;
}

.chart-section {
  margin-bottom: 24px;
}

.chart-card {
  height: 100%;
}

.chart-container {
  height: 300px;
  position: relative;
}

.transactions-card {
  margin-bottom: 24px;
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

.refresh-settings {
  margin-bottom: 24px;
}

.refresh-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .date-filter {
    flex-direction: column;
  }

  .summary-cards {
    row-gap: 20px;
  }

  .chart-section {
    row-gap: 20px;
  }

  .refresh-controls {
    flex-direction: column;
  }
}
</style> 