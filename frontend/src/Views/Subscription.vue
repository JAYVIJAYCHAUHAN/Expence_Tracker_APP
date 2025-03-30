<template>
  <div class="subscription-container">
    <div class="subscription-header">
      <h2>Subscription Plans</h2>
      <p>Choose the plan that best fits your needs</p>
    </div>

    <!-- Loading skeleton -->
    <Skeletons name="subscription" v-if="loading" />

    <template v-else>
      <!-- Current Subscription Status -->
      <el-card v-if="currentSubscription" class="current-plan">
        <template #header>
          <div class="card-header">
            <h3>Current Subscription</h3>
            <el-tag :type="getStatusType(currentSubscription.status)">
              {{ currentSubscription.status.toUpperCase() }}
            </el-tag>
          </div>
        </template>
        <div class="plan-details">
          <div class="plan-info">
            <h4>{{ getPlanName(currentSubscription.plan) }} Plan</h4>
            <p>Valid until: {{ formatDate(currentSubscription.currentPeriodEnd) }}</p>
            <p>Days remaining: {{ daysRemaining }}</p>
            <p v-if="currentSubscription.cancelAtPeriodEnd" class="cancellation-notice">
              <i class="bi bi-info-circle"></i> Your subscription will not renew at the end of the current period.
            </p>
          </div>
          <div class="plan-actions">
            <el-button 
              v-if="currentSubscription.status === 'active' && !currentSubscription.cancelAtPeriodEnd"
              type="danger" 
              @click="handleCancelSubscription"
            >
              Cancel Subscription
            </el-button>
            <el-button 
              v-if="currentSubscription.status === 'active' && currentSubscription.cancelAtPeriodEnd"
              type="success" 
              @click="handleResumeSubscription"
            >
              Resume Subscription
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- Usage Summary Card -->
      <el-card v-if="usageData" class="usage-card">
        <template #header>
          <div class="card-header">
            <h3>Your Usage</h3>
          </div>
        </template>
        
        <div class="usage-details">
          <div class="usage-expense">
            <h4>Expenses</h4>
            <el-progress 
              :percentage="Math.round((usageData.expenses.used / usageData.expenses.limit) * 100)" 
              :format="format"
              :stroke-width="12"
            ></el-progress>
            <p class="usage-text">{{ usageData.expenses.used }} / {{ usageData.expenses.limit }} expenses this month</p>
            <p class="reset-text">Resets on {{ formatDate(usageData.expenses.resetDate) }}</p>
          </div>
          
          <div class="feature-access">
            <h4>Feature Access</h4>
            <ul class="feature-access-list">
              <li v-for="(value, key) in usageData.features" :key="key" :class="{enabled: value}">
                <i :class="value ? 'bi bi-check-circle-fill' : 'bi bi-x-circle'"></i>
                {{ formatFeatureName(key) }}
              </li>
            </ul>
          </div>
        </div>
      </el-card>

      <!-- Subscription Plans -->
      <el-row :gutter="20" class="subscription-plans">
        <el-col :xs="24" :sm="24" :md="8" v-for="plan in plans" :key="plan.id">
          <el-card 
            class="plan-card" 
            :class="{ 
              'current': currentSubscription?.plan === plan.id,
              'popular': plan.isPopular 
            }"
          >
            <div class="popular-badge" v-if="plan.isPopular">Popular</div>
            <template #header>
              <div class="plan-header">
                <h3>{{ plan.name }}</h3>
                <div class="price">
                  <span v-if="plan.price === 0">Free</span>
                  <template v-else>₹{{ plan.price }}<span>/{{ plan.interval }}</span></template>
                </div>
              </div>
            </template>
            <ul class="feature-list">
              <li v-for="(feature, index) in plan.features" :key="index">
                <i class="bi bi-check-circle"></i> {{ feature }}
              </li>
            </ul>
            <el-button 
              type="primary" 
              class="subscribe-btn"
              @click="handleSubscribe(plan.id)"
              :disabled="currentSubscription?.plan === plan.id"
            >
              {{ getButtonText(plan.id) }}
            </el-button>
          </el-card>
        </el-col>
      </el-row>
    </template>

    <!-- Payment Dialog -->
    <el-dialog
      v-model="showPaymentDialog"
      title="Complete Payment"
      width="400px"
    >
      <div class="payment-form">
        <el-form :model="paymentDetails" label-position="top">
          <el-form-item label="Card Number">
            <el-input v-model="paymentDetails.cardNumber" placeholder="1234 5678 9012 3456" />
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Expiry">
                <el-input v-model="paymentDetails.expiry" placeholder="MM/YY" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="CVV">
                <el-input v-model="paymentDetails.cvv" type="password" placeholder="123" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div class="payment-summary">
          <h4>Payment Summary</h4>
          <div class="summary-row">
            <span>Plan:</span>
            <span>{{ selectedPlanDetails?.name }}</span>
          </div>
          <div class="summary-row">
            <span>Amount:</span>
            <span>₹{{ selectedPlanDetails?.price || 0 }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPaymentDialog = false">Cancel</el-button>
          <el-button type="primary" @click="processPayment" :loading="processing">
            Pay Now
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import Skeletons from '@/components/ui/Skeletons.vue';
import { subscriptionApi } from '@/utils/api';

// Types
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  isPopular: boolean;
  isCurrent: boolean;
}

interface Subscription {
  plan: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface UsageData {
  expenses: {
    used: number;
    limit: number;
    resetDate: string;
  };
  features: {
    [key: string]: boolean;
  };
}

// State
const loading = ref(true);
const currentSubscription = ref<Subscription | null>(null);
const plans = ref<SubscriptionPlan[]>([]);
const usageData = ref<UsageData | null>(null);
const showPaymentDialog = ref(false);
const selectedPlan = ref<string | null>(null);
const processing = ref(false);
const paymentDetails = ref({
  cardNumber: "",
  expiry: "",
  cvv: ""
});

// Computed
const daysRemaining = computed(() => {
  if (!currentSubscription.value?.currentPeriodEnd) return 0;
  const end = new Date(currentSubscription.value.currentPeriodEnd);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
});

const selectedPlanDetails = computed(() => {
  if (!selectedPlan.value) return null;
  return plans.value.find(p => p.id === selectedPlan.value);
});

// Methods
const fetchSubscriptionData = async () => {
  loading.value = true;
  try {
    // Fetch data in parallel
    const [plansResponse, currentSubResponse, usageResponse] = await Promise.all([
      subscriptionApi.getPlans(),
      subscriptionApi.getCurrentSubscription(),
      subscriptionApi.getUsageAndLimits()
    ]);
    
    plans.value = plansResponse;
    currentSubscription.value = currentSubResponse;
    usageData.value = usageResponse;
  } catch (error) {
    console.error('Error fetching subscription data:', error);
    ElMessage.error('Failed to load subscription information. Please try again later.');
  } finally {
    loading.value = false;
  }
};

const getStatusType = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'success';
    case 'cancelled':
    case 'canceled':
      return 'danger';
    case 'trialing':
      return 'warning';
    default:
      return 'info';
  }
};

const getPlanName = (planId: string): string => {
  const plan = plans.value.find(p => p.id === planId);
  return plan ? plan.name : planId.charAt(0).toUpperCase() + planId.slice(1);
};

const formatDate = (dateString: string | number | Date): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Invalid date format:', dateString);
    return 'Invalid date';
  }
};

const format = (percentage: number) => {
  return `${percentage}%`;
};

const formatFeatureName = (key: string | number): string => {
  const keyStr = String(key);
  return keyStr
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/([a-z])([A-Z])/g, '$1 $2');
};

const getButtonText = (planId: string): string => {
  if (currentSubscription.value?.plan === planId) {
    return 'Current Plan';
  }
  
  if (planId === 'free') {
    return 'Downgrade to Free';
  }
  
  return 'Subscribe';
};

const handleSubscribe = (planId: string) => {
  selectedPlan.value = planId;
  
  if (planId === 'free') {
    ElMessageBox.confirm(
      'Are you sure you want to downgrade to the Free plan? You will lose access to premium features.',
      'Downgrade to Free',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    ).then(() => {
      // Handle downgrade logic
      processDowngrade();
    }).catch(() => {
      selectedPlan.value = null;
    });
  } else {
    showPaymentDialog.value = true;
  }
};

const processDowngrade = async () => {
  processing.value = true;
  try {
    if (currentSubscription.value) {
      await subscriptionApi.cancelSubscription(currentSubscription.value.plan);
      ElMessage.success('Successfully downgraded to Free plan');
      await fetchSubscriptionData();
    }
  } catch (error) {
    console.error('Error downgrading plan:', error);
    ElMessage.error('Failed to downgrade plan. Please try again later.');
  } finally {
    processing.value = false;
    selectedPlan.value = null;
  }
};

const handleCancelSubscription = () => {
  ElMessageBox.confirm(
    'Are you sure you want to cancel your subscription? You will still have access until the end of your current billing period.',
    'Cancel Subscription',
    {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'No',
      type: 'warning'
    }
  ).then(async () => {
    try {
      if (currentSubscription.value) {
        await subscriptionApi.cancelSubscription(currentSubscription.value.plan);
        ElMessage.success('Your subscription has been cancelled');
        await fetchSubscriptionData();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      ElMessage.error('Failed to cancel subscription. Please try again later.');
    }
  }).catch(() => {
    // User cancelled the cancellation
  });
};

const handleResumeSubscription = async () => {
  try {
    if (currentSubscription.value) {
      await subscriptionApi.resumeSubscription(currentSubscription.value.plan);
      ElMessage.success('Your subscription has been resumed');
      await fetchSubscriptionData();
    }
  } catch (error) {
    console.error('Error resuming subscription:', error);
    ElMessage.error('Failed to resume subscription. Please try again later.');
  }
};

const processPayment = async () => {
  if (!selectedPlan.value) return;
  
  processing.value = true;
  
  // Simulate payment processing delay
  setTimeout(async () => {
    try {
      const paymentMethodId = 'pm_' + Math.random().toString(36).substr(2, 9);
      await subscriptionApi.subscribeToPlan(selectedPlan.value!, paymentMethodId);
      
      ElMessage.success('Subscription successful!');
      showPaymentDialog.value = false;
      selectedPlan.value = null;
      paymentDetails.value = { cardNumber: '', expiry: '', cvv: '' };
      
      // Refresh subscription data
      await fetchSubscriptionData();
    } catch (error) {
      console.error('Error processing payment:', error);
      ElMessage.error('Payment failed. Please check your details and try again.');
    } finally {
      processing.value = false;
    }
  }, 1500);
};

// Lifecycle Hooks
onMounted(() => {
  fetchSubscriptionData();
});
</script>

<style scoped>
.subscription-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.subscription-header {
  text-align: center;
  margin-bottom: 32px;
}

.subscription-header h2 {
  font-size: 2rem;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subscription-header p {
  color: #666;
  font-size: 1.1rem;
}

.current-plan {
  margin-bottom: 32px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.plan-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-info h4 {
  margin-top: 0;
  font-size: 1.1rem;
  color: #333;
}

.plan-info p {
  margin: 8px 0;
  color: #666;
}

.cancellation-notice {
  color: #f56c6c;
  font-style: italic;
}

.usage-card {
  margin-bottom: 32px;
}

.usage-details {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
}

.usage-expense {
  flex: 1;
  min-width: 250px;
}

.usage-expense h4,
.feature-access h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
}

.usage-text {
  margin: 8px 0;
  color: #666;
}

.reset-text {
  color: #999;
  font-size: 0.9rem;
  font-style: italic;
}

.feature-access {
  flex: 1;
  min-width: 250px;
}

.feature-access-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-access-list li {
  padding: 8px 0;
  color: #666;
  display: flex;
  align-items: center;
}

.feature-access-list li i {
  margin-right: 8px;
}

.feature-access-list li.enabled i {
  color: #67c23a;
}

.feature-access-list li:not(.enabled) i {
  color: #f56c6c;
}

.subscription-plans {
  margin-bottom: 32px;
}

.plan-card {
  height: 100%;
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.plan-card.current {
  border: 2px solid #67c23a;
}

.plan-card.popular {
  border: 2px solid #00c4cc;
}

.popular-badge {
  position: absolute;
  top: 0;
  right: 20px;
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  color: white;
  padding: 4px 12px;
  border-radius: 0 0 8px 8px;
  font-size: 0.8rem;
  font-weight: bold;
}

.plan-header {
  text-align: center;
}

.plan-header h3 {
  margin: 0 0 8px 0;
  font-size: 1.3rem;
}

.price {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

.price span {
  font-size: 1rem;
  font-weight: normal;
  color: #999;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 24px 0;
}

.feature-list li {
  padding: 8px 0;
  color: #666;
  display: flex;
  align-items: flex-start;
}

.feature-list li i {
  color: #67c23a;
  margin-right: 8px;
  margin-top: 3px;
}

.subscribe-btn {
  width: 100%;
  height: 42px;
  border-radius: 8px;
  font-weight: 600;
}

.payment-form {
  margin-bottom: 16px;
}

.payment-summary {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  margin-top: 24px;
}

.payment-summary h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
  font-size: 1.1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .plan-details {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .plan-actions {
    margin-top: 16px;
    width: 100%;
  }
  
  .el-col {
    margin-bottom: 16px;
  }
}
</style> 