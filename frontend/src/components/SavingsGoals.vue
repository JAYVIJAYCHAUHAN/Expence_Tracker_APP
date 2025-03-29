<template>
  <div class="savings-goals">
    <div class="goals-header">
      <h2>My Savings Goals</h2>
      <el-button type="primary" size="small" @click="showAddGoalDialog">
        <i class="bi bi-plus"></i> Add Goal
      </el-button>
    </div>

    <div v-if="goals.length === 0" class="no-goals">
      <i class="bi bi-piggy-bank"></i>
      <p>You don't have any savings goals yet. Add your first goal to start tracking!</p>
    </div>

    <div v-else class="goals-list">
      <el-card v-for="goal in goals" :key="goal.id" class="goal-card" :class="{ 'completed-goal': goal.isCompleted }">
        <div class="goal-header">
          <div class="goal-icon">
            <i :class="goal.icon || 'bi bi-piggy-bank'"></i>
          </div>
          <div class="goal-title">
            <h3>{{ goal.name }} <span v-if="goal.isCompleted" class="completed-badge"><i class="bi bi-check-circle-fill"></i> Completed</span></h3>
            <div class="goal-meta">
              <span>Target: ₹{{ formatNumber(goal.targetAmount) }}</span>
              <span>Deadline: {{ formatDate(goal.targetDate) }}</span>
            </div>
          </div>
          <div class="goal-actions">
            <el-dropdown trigger="click" @command="(cmd: string) => handleCommand(cmd, goal)">
              <el-button type="text">
                <i class="bi bi-three-dots-vertical"></i>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">
                    <i class="bi bi-pencil"></i> Edit
                  </el-dropdown-item>
                  <el-dropdown-item command="deposit">
                    <i class="bi bi-cash-coin"></i> Add Deposit
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <i class="bi bi-trash"></i> Delete
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        
        <div class="goal-progress">
          <div class="progress-stat">
            <div class="saved-amount">₹{{ formatNumber(goal.currentAmount) }}</div>
            <div class="target-amount">of ₹{{ formatNumber(goal.targetAmount) }}</div>
          </div>
          
          <el-progress 
            :percentage="calculateProgress(goal)" 
            :format="(p: number) => `${p.toFixed(0)}%`"
            :color="getProgressColor(goal)"
          ></el-progress>
          
          <div class="goal-details">
            <div class="detail-item">
              <div class="detail-label">Remaining</div>
              <div class="detail-value">₹{{ formatNumber(goal.targetAmount - goal.currentAmount) }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Time Left</div>
              <div class="detail-value">{{ calculateTimeLeft(goal.targetDate) }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Monthly Need</div>
              <div class="detail-value">₹{{ calculateMonthlyNeed(goal) }}</div>
            </div>
          </div>
        </div>
        
        <div class="goal-description" v-if="goal.description">
          <i class="bi bi-info-circle"></i> {{ goal.description }}
        </div>
      </el-card>
    </div>

    <!-- Add/Edit Goal Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? 'Edit Savings Goal' : 'Add New Savings Goal'"
      width="500px"
    >
      <el-form :model="currentGoal" label-position="top" ref="goalForm" :rules="rules">
        <el-form-item label="Goal Name" prop="name">
          <el-input v-model="currentGoal.name" placeholder="e.g. New Car, Home Down Payment"></el-input>
        </el-form-item>
        
        <el-form-item label="Target Amount (₹)" prop="targetAmount">
          <el-input-number 
            v-model="currentGoal.targetAmount" 
            :min="1" 
            :precision="0" 
            style="width: 100%"
            :controls="false"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="Current Savings (₹)" prop="currentAmount">
          <el-input-number 
            v-model="currentGoal.currentAmount" 
            :min="0" 
            :max="currentGoal.targetAmount" 
            :precision="0" 
            style="width: 100%"
            :controls="false"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="Target Date" prop="targetDate">
          <el-date-picker 
            v-model="currentGoal.targetDate" 
            type="date" 
            style="width: 100%"
            :disabled-date="disablePastDates"
          ></el-date-picker>
        </el-form-item>
        
        <el-form-item label="Icon" prop="icon">
          <el-select v-model="currentGoal.icon" style="width: 100%">
            <el-option label="Piggy Bank" value="bi bi-piggy-bank"></el-option>
            <el-option label="House" value="bi bi-house"></el-option>
            <el-option label="Car" value="bi bi-car-front"></el-option>
            <el-option label="Graduation" value="bi bi-mortarboard"></el-option>
            <el-option label="Gift" value="bi bi-gift"></el-option>
            <el-option label="Briefcase" value="bi bi-briefcase"></el-option>
            <el-option label="Heart" value="bi bi-heart"></el-option>
            <el-option label="Globe" value="bi bi-globe"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="Description (Optional)">
          <el-input 
            v-model="currentGoal.description" 
            type="textarea" 
            rows="2"
            placeholder="Add details about your goal"
          ></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveGoal">Save</el-button>
      </template>
    </el-dialog>

    <!-- Deposit Dialog -->
    <el-dialog
      v-model="depositDialogVisible"
      title="Add Deposit"
      width="400px"
    >
      <el-form :model="depositAmount" label-position="top" ref="depositForm">
        <el-form-item label="Deposit Amount (₹)" prop="amount">
          <el-input-number 
            v-model="depositAmount.amount" 
            :min="1" 
            :precision="0" 
            style="width: 100%"
            :controls="false"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="Date" prop="date">
          <el-date-picker 
            v-model="depositAmount.date" 
            type="date" 
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
        
        <el-form-item label="Note (Optional)">
          <el-input 
            v-model="depositAmount.note" 
            placeholder="Add a note for this deposit"
          ></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="depositDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addDeposit">Save Deposit</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { savingsGoalsApi } from '@/utils/api';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | null;
  startDate: Date;
  icon: string;
  description?: string;
  deposits: Deposit[];
  isCompleted?: boolean;
}

interface Deposit {
  id: string;
  amount: number;
  date: Date;
  note?: string;
}

// State
const goals = ref<SavingsGoal[]>([]);
const dialogVisible = ref(false);
const depositDialogVisible = ref(false);
const isEditing = ref(false);
const currentGoal = ref<SavingsGoal>({
  id: '',
  name: '',
  targetAmount: 10000,
  currentAmount: 0,
  targetDate: null,
  startDate: new Date(),
  icon: 'bi bi-piggy-bank',
  deposits: [],
  isCompleted: false
});
const depositAmount = ref({
  amount: 1000,
  date: new Date(),
  note: ''
});
const selectedGoalId = ref('');

// Form validation rules
const rules = {
  name: [{ required: true, message: 'Please enter a goal name', trigger: 'blur' }],
  targetAmount: [{ required: true, message: 'Please enter a target amount', trigger: 'blur' }],
  targetDate: [{ required: true, message: 'Please select a target date', trigger: 'blur' }]
};

// Disable past dates in date picker
const disablePastDates = (date: Date) => {
  return date.getTime() < Date.now() - 86400000; // Exclude yesterday and before
};

// Load goals from backend API with localStorage fallback
const loadGoals = async () => {
  try {
    const loadedGoals = await savingsGoalsApi.getGoals();
    
    // Convert string dates back to Date objects
    goals.value = loadedGoals.map((goal: any) => ({
      ...goal,
      targetDate: goal.targetDate ? new Date(goal.targetDate) : null,
      startDate: new Date(goal.startDate),
      deposits: goal.deposits?.map((deposit: any) => ({
        ...deposit,
        date: new Date(deposit.date)
      })) || []
    }));
    
    // Save to localStorage as backup
    localStorage.setItem('savings_goals', JSON.stringify(goals.value));
  } catch (error) {
    console.error('Failed to load savings goals:', error);
    
    // Fallback to localStorage
    try {
      const savedGoals = localStorage.getItem('savings_goals');
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals);
        
        goals.value = parsedGoals.map((goal: any) => ({
          ...goal,
          targetDate: goal.targetDate ? new Date(goal.targetDate) : null,
          startDate: new Date(goal.startDate),
          deposits: goal.deposits?.map((deposit: any) => ({
            ...deposit,
            date: new Date(deposit.date)
          })) || []
        }));
      }
    } catch (localError) {
      console.error('Failed to load from localStorage:', localError);
    }
  }
};

// Save goals to backend and localStorage
const saveGoals = async () => {
  // Save to localStorage as backup
  try {
    localStorage.setItem('savings_goals', JSON.stringify(goals.value));
  } catch (error) {
    console.error('Failed to save goals to localStorage:', error);
  }
  
  // Try to sync with backend
  try {
    await savingsGoalsApi.syncGoals();
  } catch (error) {
    console.error('Failed to sync goals with backend:', error);
  }
};

// Format number with commas
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Format date
const formatDate = (date: Date | null) => {
  if (!date) return 'No date set';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Calculate progress percentage
const calculateProgress = (goal: SavingsGoal) => {
  if (goal.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
};

// Get progress color based on percentage
const getProgressColor = (goal: SavingsGoal) => {
  const progress = calculateProgress(goal);
  if (progress < 25) return '#ff9800';
  if (progress < 50) return '#2196f3';
  if (progress < 75) return '#00bcd4';
  return '#4caf50';
};

// Calculate time left until target date
const calculateTimeLeft = (targetDate: Date | null) => {
  if (!targetDate) return 'No deadline';
  
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target.getTime() - now.getTime();
  
  if (diffTime <= 0) return 'Expired';
  
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) return `${diffDays} days`;
  
  const diffMonths = Math.floor(diffDays / 30);
  const remainingDays = diffDays % 30;
  
  if (diffMonths < 12) {
    return remainingDays > 0 
      ? `${diffMonths} month${diffMonths > 1 ? 's' : ''}, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`
      : `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
  }
  
  const diffYears = Math.floor(diffMonths / 12);
  const remainingMonths = diffMonths % 12;
  
  return remainingMonths > 0
    ? `${diffYears} year${diffYears > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
    : `${diffYears} year${diffYears > 1 ? 's' : ''}`;
};

// Calculate monthly amount needed to reach goal
const calculateMonthlyNeed = (goal: SavingsGoal) => {
  if (!goal.targetDate) return 'N/A';
  
  const now = new Date();
  const target = new Date(goal.targetDate);
  const diffTime = target.getTime() - now.getTime();
  
  if (diffTime <= 0) return '0';
  
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  const remaining = goal.targetAmount - goal.currentAmount;
  
  if (remaining <= 0) return '0';
  if (diffMonths <= 0) return formatNumber(remaining);
  
  return formatNumber(Math.ceil(remaining / diffMonths));
};

// Show add goal dialog
const showAddGoalDialog = () => {
  isEditing.value = false;
  currentGoal.value = {
    id: 'new',
    name: '',
    targetAmount: 50000,
    currentAmount: 0,
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 12)), // Default to 1 year from now
    startDate: new Date(),
    icon: 'bi bi-piggy-bank',
    deposits: [],
    isCompleted: false
  };
  dialogVisible.value = true;
};

// Show edit goal dialog
const showEditGoalDialog = (goal: SavingsGoal) => {
  isEditing.value = true;
  currentGoal.value = { ...goal };
  dialogVisible.value = true;
};

// Show deposit dialog
const showDepositDialog = (goal: SavingsGoal) => {
  selectedGoalId.value = goal.id;
  depositAmount.value = {
    amount: 1000,
    date: new Date(),
    note: ''
  };
  depositDialogVisible.value = true;
};

// Handle dropdown commands
const handleCommand = (command: string, goal: SavingsGoal) => {
  switch (command) {
    case 'edit':
      showEditGoalDialog(goal);
      break;
    case 'deposit':
      showDepositDialog(goal);
      break;
    case 'delete':
      deleteGoal(goal.id);
      break;
  }
};

// Save goal
const saveGoal = async () => {
  if (!currentGoal.value.name || !currentGoal.value.targetAmount || !currentGoal.value.targetDate) {
    ElMessage.warning('Please fill in all required fields');
    return;
  }
  
  try {
    // Save to backend
    const savedGoal = await savingsGoalsApi.saveGoal(currentGoal.value);
    
    if (isEditing.value) {
      // Update existing goal
      const index = goals.value.findIndex(g => g.id === savedGoal.id);
      if (index !== -1) {
        goals.value[index] = { ...savedGoal };
        ElMessage.success('Goal updated successfully');
      }
    } else {
      // Add new goal
      goals.value.push({ ...savedGoal });
      ElMessage.success('Goal added successfully');
    }
    
    // Update localStorage
    saveGoals();
    dialogVisible.value = false;
  } catch (error) {
    console.error('Failed to save goal:', error);
    ElMessage.error('Failed to save goal. Please try again.');
  }
};

// Add deposit to goal
const addDeposit = async () => {
  if (!depositAmount.value.amount || depositAmount.value.amount <= 0) {
    ElMessage.warning('Please enter a valid deposit amount');
    return;
  }
  
  const goalIndex = goals.value.findIndex(g => g.id === selectedGoalId.value);
  if (goalIndex === -1) return;
  
  // Prepare deposit object
  const newDeposit = {
    amount: depositAmount.value.amount,
    date: depositAmount.value.date,
    notes: depositAmount.value.note // Backend uses 'notes' instead of 'note'
  };
  
  try {
    // Save deposit to backend
    const result = await savingsGoalsApi.addDeposit(selectedGoalId.value, newDeposit);
    
    if (result) {
      // Update goal with new data from API
      if (result.deposit) {
        // Format the deposit date
        result.deposit.date = new Date(result.deposit.date);
        
        // Add to existing deposits
        goals.value[goalIndex].deposits.push(result.deposit);
      }
      
      // Update current amount from API response
      if (result.currentAmount !== undefined) {
        goals.value[goalIndex].currentAmount = result.currentAmount;
      } else {
        // Fallback if API doesn't return updated amount
        goals.value[goalIndex].currentAmount += depositAmount.value.amount;
      }
      
      // Update completion status if provided
      if (result.isCompleted !== undefined) {
        goals.value[goalIndex].isCompleted  = result.isCompleted;
      }
    } else {
      // Fallback if API call worked but returned no data
      const fallbackDeposit = {
        id: `deposit_${Date.now()}`,
        amount: depositAmount.value.amount,
        date: depositAmount.value.date,
        notes: depositAmount.value.note
      };
      
      goals.value[goalIndex].deposits.push(fallbackDeposit);
      goals.value[goalIndex].currentAmount += depositAmount.value.amount;
    }
    
    // Save to localStorage for backup
    saveGoals();
    depositDialogVisible.value = false;
    
    ElMessage.success(`Added ₹${formatNumber(depositAmount.value.amount)} to ${goals.value[goalIndex].name}`);
    
    // Check if goal is completed
    if (goals.value[goalIndex].currentAmount >= goals.value[goalIndex].targetAmount) {
      // Set the completed flag
      goals.value[goalIndex].isCompleted = true;
      
      ElMessage.success({
        message: `Congratulations! You've reached your goal: ${goals.value[goalIndex].name}`,
        duration: 5000
      });
    }
  } catch (error) {
    console.error('Failed to add deposit:', error);
    ElMessage.error('Failed to add deposit. Please try again.');
  }
};

// Delete goal
const deleteGoal = async (goalId: string) => {
  ElMessageBox.confirm(
    'Are you sure you want to delete this savings goal?',
    'Delete Goal',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // Delete from backend
      await savingsGoalsApi.deleteGoal(goalId);
      
      // Remove from local state
      goals.value = goals.value.filter(g => g.id !== goalId);
      
      // Update localStorage
      saveGoals();
      ElMessage.success('Goal deleted successfully');
    } catch (error) {
      console.error('Failed to delete goal:', error);
      ElMessage.error('Failed to delete goal. Please try again.');
    }
  }).catch(() => {
    // User cancelled
  });
};

// Initialize - watch for authentication changes
const token = ref(localStorage.getItem('token'));

watch(() => localStorage.getItem('token'), (newToken) => {
  token.value = newToken;
  if (newToken) {
    loadGoals();
  } else {
    goals.value = [];
  }
});

// Initialize
onMounted(async () => {
  if (token.value) {
    await loadGoals();
    
    // Add sample goal if no goals exist
    if (goals.value.length === 0) {
      const sampleGoal = {
        name: 'Emergency Fund',
        targetAmount: 100000,
        targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        icon: 'bi bi-piggy-bank',
        description: 'Building a 3-month emergency fund for unexpected expenses'
      };
      
      try {
        const savedGoal = await savingsGoalsApi.saveGoal(sampleGoal);
        
        if (savedGoal) {
          // Format dates for the sample goal
          savedGoal.targetDate = savedGoal.targetDate ? new Date(savedGoal.targetDate) : null;
          savedGoal.startDate = new Date(savedGoal.startDate);
          
          // Add sample deposit if needed
          if (!savedGoal.deposits || savedGoal.deposits.length === 0) {
            const sampleDeposit = {
              amount: 25000,
              date: new Date(),
              notes: 'Initial deposit'
            };
            
            try {
              await savingsGoalsApi.addDeposit(savedGoal.id, sampleDeposit);
              // Reload goals to get updated data with deposit
              await loadGoals();
            } catch (depositError) {
              console.error('Failed to add sample deposit:', depositError);
            }
          } else {
            goals.value = [savedGoal];
          }
        }
      } catch (error) {
        console.error('Failed to save sample goal:', error);
        // Add a local sample goal as fallback
        const localSampleGoal = {
          id: `goal_${Date.now()}`,
          name: 'Emergency Fund',
          targetAmount: 100000,
          currentAmount: 25000,
          targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
          startDate: new Date(),
          icon: 'bi bi-piggy-bank',
          description: 'Building a 3-month emergency fund for unexpected expenses',
          isCompleted: false,
          deposits: [
            {
              id: `deposit_${Date.now()}`,
              amount: 25000,
              date: new Date(),
              note: 'Initial deposit'
            }
          ]
        };
        
        goals.value = [localSampleGoal];
        localStorage.setItem('savings_goals', JSON.stringify(goals.value));
      }
    }
  }
});
</script>

<style scoped>
.savings-goals {
  margin-bottom: 2rem;
}

.goals-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.goals-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary, #333);
}

.no-goals {
  text-align: center;
  padding: 3rem 1rem;
  background-color: var(--bg-tertiary, #f5f5f5);
  border-radius: 8px;
  color: var(--text-secondary, #666);
}

.no-goals i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--accent-color, #00c4cc);
  opacity: 0.5;
}

.goals-list {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.goal-card {
  border-radius: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.goal-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.goal-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0, 196, 204, 0.15), rgba(114, 9, 183, 0.15));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.5rem;
  color: var(--accent-color, #00c4cc);
}

.goal-title {
  flex: 1;
}

.goal-title h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.2rem;
  color: var(--text-primary, #333);
}

.goal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
}

.goal-actions {
  margin-left: 1rem;
}

.goal-progress {
  margin-bottom: 1.5rem;
}

.progress-stat {
  display: flex;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.saved-amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--accent-color, #00c4cc);
  margin-right: 0.5rem;
}

.target-amount {
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
}

.goal-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.detail-item {
  text-align: center;
}

.detail-label {
  font-size: 0.8rem;
  color: var(--text-muted, #999);
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 0.95rem;
  color: var(--text-primary, #333);
  font-weight: 500;
}

.goal-description {
  margin-top: auto;
  padding-top: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary, #666);
  border-top: 1px solid var(--border-color, #eaeaea);
  font-style: italic;
}

.completed-goal {
  border: 2px solid #4caf50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.2);
}

.completed-badge {
  display: inline-flex;
  align-items: center;
  background-color: #4caf50;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
  font-weight: normal;
  vertical-align: middle;
}

.completed-badge i {
  margin-right: 3px;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .goals-list {
    grid-template-columns: 1fr;
  }
  
  .goal-details {
    grid-template-columns: 1fr 1fr;
  }
}
</style> 