<template>
  <div class="subscription-container">
    <div class="subscription-header">
      <h2>Subscription Plans</h2>
      <p>Choose the plan that best fits your needs</p>
    </div>

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
          <h4>{{ currentSubscription.plan.toUpperCase() }} Plan</h4>
          <p>Valid until: {{ formatDate(currentSubscription.endDate) }}</p>
          <p>Days remaining: {{ daysRemaining }}</p>
        </div>
        <div class="plan-actions">
          <el-button 
            v-if="currentSubscription.status === 'active'"
            type="danger" 
            @click="handleCancelSubscription"
          >
            Cancel Subscription
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- Subscription Plans -->
    <el-row :gutter="20" class="subscription-plans">
      <!-- Basic Plan -->
      <el-col :xs="24" :sm="24" :md="8">
        <el-card class="plan-card" :class="{ 'current': currentSubscription?.plan === 'basic' }">
          <template #header>
            <div class="plan-header">
              <h3>Basic</h3>
              <div class="price">₹499<span>/month</span></div>
            </div>
          </template>
          <ul class="feature-list">
            <li><i class="bi bi-check-circle"></i> Export Reports</li>
            <li><i class="bi bi-check-circle"></i> Bill Reminders</li>
            <li><i class="bi bi-check-circle"></i> Budget Alerts</li>
            <li><i class="bi bi-check-circle"></i> Email Support</li>
          </ul>
          <el-button 
            type="primary" 
            class="subscribe-btn"
            @click="handleSubscribe('basic')"
            :disabled="currentSubscription?.plan === 'basic'"
          >
            {{ getButtonText('basic') }}
          </el-button>
        </el-card>
      </el-col>

      <!-- Premium Plan -->
      <el-col :xs="24" :sm="24" :md="8">
        <el-card class="plan-card premium" :class="{ 'current': currentSubscription?.plan === 'premium' }">
          <template #header>
            <div class="plan-header">
              <h3>Premium</h3>
              <div class="price">₹999<span>/month</span></div>
            </div>
          </template>
          <ul class="feature-list">
            <li><i class="bi bi-check-circle"></i> All Basic Features</li>
            <li><i class="bi bi-check-circle"></i> Advanced Analytics</li>
            <li><i class="bi bi-check-circle"></i> Investment Tracking</li>
            <li><i class="bi bi-check-circle"></i> Multi-currency Support</li>
            <li><i class="bi bi-check-circle"></i> Custom Categories</li>
            <li><i class="bi bi-check-circle"></i> Priority Support</li>
          </ul>
          <el-button 
            type="primary" 
            class="subscribe-btn"
            @click="handleSubscribe('premium')"
            :disabled="currentSubscription?.plan === 'premium'"
          >
            {{ getButtonText('premium') }}
          </el-button>
        </el-card>
      </el-col>

      <!-- Enterprise Plan -->
      <el-col :xs="24" :sm="24" :md="8">
        <el-card class="plan-card enterprise" :class="{ 'current': currentSubscription?.plan === 'enterprise' }">
          <template #header>
            <div class="plan-header">
              <h3>Enterprise</h3>
              <div class="price">₹1999<span>/month</span></div>
            </div>
          </template>
          <ul class="feature-list">
            <li><i class="bi bi-check-circle"></i> All Premium Features</li>
            <li><i class="bi bi-check-circle"></i> AI-powered Insights</li>
            <li><i class="bi bi-check-circle"></i> Unlimited History</li>
            <li><i class="bi bi-check-circle"></i> Family Sharing</li>
            <li><i class="bi bi-check-circle"></i> Receipt Scanning</li>
            <li><i class="bi bi-check-circle"></i> 24/7 Support</li>
          </ul>
          <el-button 
            type="primary" 
            class="subscribe-btn"
            @click="handleSubscribe('enterprise')"
            :disabled="currentSubscription?.plan === 'enterprise'"
          >
            {{ getButtonText('enterprise') }}
          </el-button>
        </el-card>
      </el-col>
    </el-row>

    <!-- Subscription History -->
    <el-card class="subscription-history" v-if="subscriptionHistory.length">
      <template #header>
        <div class="card-header">
          <h3>Subscription History</h3>
        </div>
      </template>
      <el-table :data="subscriptionHistory" style="width: 100%">
        <el-table-column prop="plan" label="Plan" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.plan.toUpperCase() }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="Start Date" width="150">
          <template #default="{ row }">
            {{ formatDate(row.startDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="endDate" label="End Date" width="150">
          <template #default="{ row }">
            {{ formatDate(row.endDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status.toUpperCase() }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Amount" width="120" align="right">
          <template #default="{ row }">
            ₹{{ row.paymentHistory[0]?.amount || 0 }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

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
            <span>{{ selectedPlan?.toUpperCase() }}</span>
          </div>
          <div class="summary-row">
            <span>Amount:</span>
            <span>₹{{ getPlanPrice(selectedPlan) }}</span>
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
import axios from 'axios';
import { Subscription } from '@/type/types';

// State
const currentSubscription = ref<Subscription | null>(null);
const subscriptionHistory = ref<Subscription[]>([]);
const showPaymentDialog = ref(false);
const selectedPlan = ref<string | null>(null);
const processing = ref(false);
const paymentDetails = ref({
  cardNumber: "",
  expiry: "",
  cvv: ""
});

// API URL
const API_URL = import.meta.env.VITE_API_URL;

// Computed
const daysRemaining = computed(() => {
  if (!currentSubscription.value?.endDate) return 0;
  const end = new Date(currentSubscription.value.endDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
});

// Methods
const fetchCurrentSubscription = async () => {
  try {
    const response = await axios.get(`${API_URL}/subscription/current`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    currentSubscription.value = response.data;
  } catch (error) {
    ElMessage.error('Failed to fetch subscription details');
  }
};

const fetchSubscriptionHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/subscription/history`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    subscriptionHistory.value = response.data;
  } catch (error) {
    ElMessage.error('Failed to fetch subscription history');
  }
};

const handleSubscribe = (plan: string) => {
  selectedPlan.value = plan;
  showPaymentDialog.value = true;
};

const processPayment = async () => {
  try {
    processing.value = true;
    
    // Here you would typically integrate with a payment gateway
    // For now, we'll simulate a payment
    const paymentInfo = {
      amount: getPlanPrice(selectedPlan.value),
      cardNumber: paymentDetails.value.cardNumber,
      expiry: paymentDetails.value.expiry
    };

    const response = await axios.post(
      `${API_URL}/subscription/subscribe`,
      {
        plan: selectedPlan.value,
        paymentDetails: paymentInfo
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    showPaymentDialog.value = false;
    ElMessage.success('Subscription updated successfully');
    await fetchCurrentSubscription();
    await fetchSubscriptionHistory();
  } catch (error) {
    ElMessage.error('Failed to process payment');
  } finally {
    processing.value = false;
  }
};

const handleCancelSubscription = async () => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
      'Cancel Subscription',
      {
        confirmButtonText: 'Yes, Cancel',
        cancelButtonText: 'No, Keep It',
        type: 'warning'
      }
    );

    await axios.post(
      `${API_URL}/subscription/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    ElMessage.success('Subscription cancelled successfully');
    await fetchCurrentSubscription();
    await fetchSubscriptionHistory();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to cancel subscription');
    }
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    'active': 'success',
    'cancelled': 'danger',
    'expired': 'info'
  };
  return types[status] || 'default';
};

const getPlanPrice = (plan: string | null) => {
  const prices: Record<string, number> = {
    'basic': 499,
    'premium': 999,
    'enterprise': 1999
  };
  return prices[plan || ''] || 0;
};

const getButtonText = (plan: string) => {
  if (currentSubscription.value?.plan === plan) {
    return 'Current Plan';
  }
  if (currentSubscription.value?.plan === 'free') {
    return 'Subscribe';
  }
  return 'Upgrade';
};

// Initialize
onMounted(() => {
  fetchCurrentSubscription();
  fetchSubscriptionHistory();
});
</script>

<style scoped>
.subscription-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.subscription-header {
  text-align: center;
  margin-bottom: 32px;
}

.subscription-header h2 {
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 2rem;
  margin-bottom: 8px;
}

.current-plan {
  margin-bottom: 32px;
}

.plan-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subscription-plans {
  margin-bottom: 32px;
}

.plan-card {
  height: 100%;
  transition: transform 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-5px);
}

.plan-card.current {
  border: 2px solid #409eff;
}

.plan-header {
  text-align: center;
}

.price {
  font-size: 2rem;
  font-weight: bold;
  color: #409eff;
}

.price span {
  font-size: 1rem;
  color: #666;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 24px 0;
}

.feature-list li {
  margin: 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.feature-list i {
  color: #67c23a;
}

.subscribe-btn {
  width: 100%;
}

.subscription-history {
  margin-top: 32px;
}

.payment-form {
  padding: 16px;
}

.payment-summary {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

@media (max-width: 768px) {
  .subscription-container {
    padding: 16px;
  }

  .subscription-plans {
    row-gap: 20px;
  }

  .plan-details {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style> 