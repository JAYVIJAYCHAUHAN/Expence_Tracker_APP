<template>
  <div class="summary-container">
    <div class="summary-header">
      <h2>Financial Summary</h2>
      <p>Quick overview of your financial health</p>
    </div>

    <!-- Month Selector -->
    <div class="month-selector mb-2">
          <el-date-picker
            v-model="selectedMonth"
            type="month"
            placeholder="Select Month"
            @change="handleMonthChange"
          />
          <div class="budget-container">
            <el-tag type="info" class="budget-tag" @click="showBudgetDialog">
              Monthly Budget: ₹{{ formatAmount(monthlyBudget) }}
              <i class="bi bi-pencil-square ms-2"></i>
            </el-tag>
          </div>
    </div>

    <!-- Budget Progress -->
    <div class="budget-section">
      <div class="budget-header">
        <h3>Budget Overview</h3>
        <p>{{ getDaysRemaining() }} days remaining this month</p>
      </div>
      <el-progress 
        :percentage="getBudgetPercentage()" 
        :status="getBudgetStatus()"
        :stroke-width="20"
        :format="formatBudgetProgress"
      />
      <div class="budget-stats">
        <div class="stat-item">
          <span class="label">Spent</span>
          <span class="value">₹{{ formatAmount(totalSpent) }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Remaining</span>
          <span class="value">₹{{ formatAmount(remainingBudget) }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Daily Average</span>
          <span class="value">₹{{ formatAmount(dailyAverage) }}</span>
        </div>
      </div>
    </div>

    <!-- Category Breakdown -->
    <div class="categories-section">
      <h3>Category Breakdown</h3>
      <div class="category-list">
        <div v-for="category in categoryBreakdown" :key="category.name" class="category-item">
          <div class="category-header">
            <el-tag :type="getCategoryType(category.name)">{{ category.name }}</el-tag>
            <span class="amount">₹{{ formatAmount(category.amount) }}</span>
          </div>
          <el-progress 
            :percentage="(category.amount / monthlyBudget) * 100" 
            :stroke-width="8"
            :show-text="false"
          />
          <div class="category-stats">
            <span>{{ ((category.amount / totalSpent) * 100).toFixed(1) }}% of total</span>
            <span>{{ category.count }} transactions</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Insights Section -->
    <div class="insights-section">
      <h3>Monthly Insights</h3>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" v-for="insight in insights" :key="insight.title">
          <div class="insight-card" :class="insight.type">
            <i :class="insight.icon"></i>
            <div class="insight-content">
              <h4>{{ insight.title }}</h4>
              <p>{{ insight.description }}</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Recent Activity -->
    <div class="recent-activity">
      <div class="section-header">
        <h3>Recent Activity</h3>
        <router-link to="/expence">
          <el-button type="primary" plain size="small">Add Expense</el-button>
        </router-link>
      </div>
      <el-timeline>
        <el-timeline-item
          v-for="activity in recentActivity"
          :key="activity._id"
          :timestamp="formatDate(activity.date)"
          :type="getActivityType(activity.category)"
        >
          <div class="activity-content">
            <h4>{{ activity.description }}</h4>
            <p>
              <el-tag size="small" :type="getCategoryType(activity.category)">
                {{ activity.category }}
              </el-tag>
              <span class="activity-amount">₹{{ formatAmount(activity.amount) }}</span>
            </p>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>

    <!-- Savings Goals -->
    <div class="savings-goals" v-if="isSavingsGoalsEnabled">
      <div class="section-header">
        <h3>Savings Goals</h3>
        <router-link to="/settings">
          <el-button type="primary" plain size="small">Manage Goals</el-button>
        </router-link>
      </div>
      <el-progress 
        :percentage="overallSavingsProgress"
        :status="getSavingsGoalsStatus()"
        :stroke-width="20"
        :format="formatSavingsGoalsProgress"
      />
      <div class="savings-goals-stats">
        <div class="stat-item">
          <span class="label">Total Savings</span>
          <span class="value">₹{{ formatAmount(totalSavings) }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Total Goals</span>
          <span class="value">{{ savingsGoals.length }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Target Amount</span>
          <span class="value">₹{{ formatAmount(totalSavingsTarget) }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Budget Edit Dialog -->
  <el-dialog
    v-model="showEditBudgetDialog"
    title="Edit Monthly Budget"
    width="400px"
  >
    <div>
      <p class="text-muted mb-3">Set your target spending limit for each month</p>
      <el-form>
        <el-form-item label="Monthly Budget (₹)">
          <el-input-number 
            v-model="newBudgetAmount" 
            :min="1000" 
            :step="1000" 
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showEditBudgetDialog = false">Cancel</el-button>
        <el-button type="primary" @click="updateBudget">Save</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import axios from 'axios';
import type { Expense } from '@/type/types';
import { Feature, useFeatureFlags } from '@/utils/featureFlags';
import { budgetApi, savingsGoalsApi, expenseApi } from '@/utils/api';

const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL;

// State
const selectedMonth = ref(new Date());
const monthlyBudget = ref<number>(0);
const expenses = ref<Expense[]>([]);
const isLoading = ref(false);
const showEditBudgetDialog = ref(false);
const newBudgetAmount = ref<number | null>(null);

// Feature flags
const { isFeatureEnabled } = useFeatureFlags();
const isSavingsGoalsEnabled = computed(() => {
  return localStorage.getItem('feature_savings_goals') === 'true';
});

// Savings goals data
const savingsGoals = ref<any[]>([]);

// Computed values
const totalSpent = computed(() => {
  return expenses.value.reduce((sum, expense) => sum + expense.amount, 0);
});

const remainingBudget = computed(() => {
  return monthlyBudget.value - totalSpent.value;
});

const dailyAverage = computed(() => {
  const daysInMonth = new Date(
    selectedMonth.value.getFullYear(),
    selectedMonth.value.getMonth() + 1,
    0
  ).getDate();
  return totalSpent.value / daysInMonth;
});

const categoryBreakdown = computed(() => {
  const breakdown = new Map();
  
  expenses.value.forEach(expense => {
    if (!breakdown.has(expense.category)) {
      breakdown.set(expense.category, { amount: 0, count: 0 });
    }
    const category = breakdown.get(expense.category);
    category.amount += expense.amount;
    category.count += 1;
  });

  return Array.from(breakdown.entries()).map(([name, data]) => ({
    name,
    amount: data.amount,
    count: data.count
  })).sort((a, b) => b.amount - a.amount);
});

const insights = computed(() => {
  const highestCategory = categoryBreakdown.value[0];
  const budgetPercentage = (totalSpent.value / monthlyBudget.value) * 100;
  const insights = [];

  if (highestCategory) {
    insights.push({
      title: 'Top Expense Category',
      description: `${highestCategory.name} accounts for ${((highestCategory.amount / totalSpent.value) * 100).toFixed(1)}% of your spending`,
      icon: 'bi bi-graph-up',
      type: 'info'
    });
  }

  if (budgetPercentage > 80) {
    insights.push({
      title: 'Budget Alert',
      description: 'You\'ve used ' + budgetPercentage.toFixed(1) + '% of your monthly budget',
      icon: 'bi bi-exclamation-triangle',
      type: 'warning'
    });
  }

  if (dailyAverage.value > (monthlyBudget.value / 30)) {
    insights.push({
      title: 'Daily Spending Alert',
      description: 'Your daily average is higher than recommended',
      icon: 'bi bi-calendar-check',
      type: 'warning'
    });
  }

  return insights;
});

const recentActivity = computed(() => {
  return [...expenses.value]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
});

// Load the monthly budget from API
const loadBudget = async () => {
  try {
    const budget = await budgetApi.getBudget(
      selectedMonth.value.getMonth() + 1,
      selectedMonth.value.getFullYear()
    );
    monthlyBudget.value = budget || 50000; // Default to ₹50,000 if no budget is set
  } catch (error) {
    console.error('Failed to load budget:', error);
    // Fallback to localStorage
    const savedBudget = localStorage.getItem('monthly_budget');
    monthlyBudget.value = savedBudget ? parseInt(savedBudget) : 50000;
  }
};

// Update the budget
const updateBudget = async () => {
  if (!newBudgetAmount.value || newBudgetAmount.value < 1000) {
    ElMessage.warning('Budget amount must be at least ₹1,000');
    return;
  }

  try {
    await budgetApi.saveBudget(
      selectedMonth.value.getMonth() + 1, 
      selectedMonth.value.getFullYear(), 
      newBudgetAmount.value
    );
    
    monthlyBudget.value = newBudgetAmount.value;
    showEditBudgetDialog.value = false;
    
    // Also update localStorage as backup
    localStorage.setItem('monthly_budget', monthlyBudget.value.toString());
    
    ElMessage.success('Budget updated successfully');
  } catch (error) {
    console.error('Failed to update budget:', error);
    ElMessage.error('Failed to update budget. Using local storage instead.');
    
    // Fallback to local storage
    monthlyBudget.value = newBudgetAmount.value;
    localStorage.setItem('monthly_budget', monthlyBudget.value.toString());
  }
};

// Load savings goals from API
const loadSavingsGoals = async () => {
  if (!isSavingsGoalsEnabled.value) return;
  
  try {
    const goals = await savingsGoalsApi.getGoals();
    
    savingsGoals.value = goals.map((goal: any) => ({
      ...goal,
      targetDate: goal.targetDate ? new Date(goal.targetDate) : null,
      startDate: new Date(goal.startDate),
      deposits: goal.deposits?.map((deposit: any) => ({
        ...deposit,
        date: new Date(deposit.date)
      })) || []
    }));
  } catch (error) {
    console.error('Failed to load savings goals:', error);
    
    // Fallback to localStorage
    try {
      const savedGoals = localStorage.getItem('savings_goals');
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals);
        savingsGoals.value = parsedGoals;
      }
    } catch (localError) {
      console.error('Failed to load from localStorage:', localError);
    }
  }
};

// Fetch expenses
const fetchExpenses = async () => {
  try {
    // Get expenses from API
    const month = selectedMonth.value.getMonth() + 1;
    const year = selectedMonth.value.getFullYear();
    const response = await expenseApi.getExpenses(month, year);
    expenses.value = response;
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    expenses.value = []; // Clear expenses on error
  }
};

// Methods
const handleMonthChange = () => {
  fetchExpenses();
};

const getDaysRemaining = () => {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return lastDay.getDate() - today.getDate();
};

const getBudgetPercentage = () => {
  return Math.min((totalSpent.value / monthlyBudget.value) * 100, 100);
};

const getBudgetStatus = () => {
  const percentage = getBudgetPercentage();
  if (percentage >= 90) return 'exception';
  if (percentage >= 80) return 'warning';
  return 'success';
};

const formatBudgetProgress = (percentage: number) => {
  return `${percentage.toFixed(1)}%`;
};

const formatAmount = (amount: number) => {
  return amount.toLocaleString('en-IN');
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getCategoryType = (category: string) => {
  const types: { [key: string]: string } = {
    'Groceries': 'success',
    'Transportation': 'warning',
    'Entertainment': 'info',
    'Utilities': 'danger',
    'Shopping': 'primary',
    'Bills': 'warning',
    'Others': 'info'
  };
  return types[category] || 'default';
};

const getActivityType = (category: string) => {
  const types: { [key: string]: string } = {
    'Groceries': 'success',
    'Transportation': 'warning',
    'Entertainment': 'info',
    'Utilities': 'danger',
    'Shopping': 'primary',
    'Bills': 'warning',
    'Others': 'info'
  };
  return types[category] || 'primary';
};

// Calculate total savings and progress
const totalSavings = computed(() => {
  return savingsGoals.value.reduce((sum, goal) => sum + goal.currentAmount, 0);
});

const totalSavingsTarget = computed(() => {
  return savingsGoals.value.reduce((sum, goal) => sum + goal.targetAmount, 0);
});

const overallSavingsProgress = computed(() => {
  if (totalSavingsTarget.value === 0) return 0;
  return Math.min(100, Math.round((totalSavings.value / totalSavingsTarget.value) * 100));
});

// Get savings goals status
const getSavingsGoalsStatus = () => {
  if (overallSavingsProgress.value >= 100) return 'success';
  if (overallSavingsProgress.value >= 80) return 'warning';
  return 'danger';
};

// Format savings goals progress
const formatSavingsGoalsProgress = (percentage: number) => {
  return `${percentage.toFixed(1)}%`;
};

// Show budget edit dialog
const showBudgetDialog = () => {
  newBudgetAmount.value = monthlyBudget.value;
  showEditBudgetDialog.value = true;
};

// Watch for month changes
watch(selectedMonth, async () => {
  await loadBudget();
  await fetchExpenses();
});

// Watch for authentication changes
const token = ref(localStorage.getItem('token'));

watch(() => localStorage.getItem('token'), (newToken) => {
  token.value = newToken;
  if (newToken) {
    loadBudget();
    loadSavingsGoals();
    fetchExpenses();
  } else {
    monthlyBudget.value = 50000;
    savingsGoals.value = [];
    expenses.value = [];
  }
});

// Initialize
onMounted(async () => {
  if (token.value) {
    await loadBudget();
    await loadSavingsGoals();
    await fetchExpenses();
  }
});
</script>

<style scoped>
.summary-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.summary-header {
  text-align: center;
  margin-bottom: 32px;
}

.summary-header h2 {
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 2rem;
  margin-bottom: 8px;
}

.summary-header p {
  color: #666;
}

.month-selector {
 display: grid;
 grid-template-columns: auto auto;
 column-gap: 16px;
 @media (max-width:480px) {
  grid-template-columns:auto;
  row-gap: 8px;
 }
}

.budget-container {
  display: flex;
  align-items: center;
}

.budget-tag {
  font-size: 1rem;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.budget-tag:hover {
  background-color: #e6f7ff;
  border-color: #1890ff;
}

.text-muted {
  color: #666;
}

.budget-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.budget-header h3 {
  margin: 0;
  color: #333;
}

.budget-header p {
  margin: 0;
  color: #666;
}

.budget-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-item .label {
  color: #666;
  font-size: 0.9rem;
}

.stat-item .value {
  color: #333;
  font-weight: bold;
  font-size: 1.1rem;
}

.categories-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
}

.categories-section h3 {
  margin: 0 0 20px;
  color: #333;
}

.category-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.category-item {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.category-header .amount {
  font-weight: bold;
  color: #333;
}

.category-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 0.9rem;
  color: #666;
}

.insights-section {
  margin-bottom: 32px;
}

.insights-section h3 {
  margin: 0 0 20px;
  color: #333;
}

.insight-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.insight-card i {
  font-size: 24px;
}

.insight-card.info i {
  color: #00c4cc;
}

.insight-card.warning i {
  color: #ff9f43;
}

.insight-content h4 {
  margin: 0 0 8px;
  color: #333;
}

.insight-content p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.recent-activity {
  background: white;
  border-radius: 16px;
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

.activity-content {
  h4 {
    margin: 0 0 8px;
    color: #333;
  }

  p {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .activity-amount {
    font-weight: bold;
    color: #333;
  }
}

.savings-goals {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
}

.savings-goals h3 {
  margin: 0 0 20px;
  color: #333;
}

.savings-goals-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.savings-goals-stats .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.savings-goals-stats .stat-item .label {
  color: #666;
  font-size: 0.9rem;
}

.savings-goals-stats .stat-item .value {
  color: #333;
  font-weight: bold;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .summary-container {
    padding: 16px;
  }

  .budget-stats {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }

  .category-list {
    grid-template-columns: 1fr;
  }
}
</style>
