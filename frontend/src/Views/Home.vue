<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          Smart Money Management
          <span class="gradient-text">Made Simple</span>
        </h1>
        <p class="hero-subtitle">
          Track expenses, analyze spending patterns, and achieve your financial goals with our intuitive expense tracking solution.
        </p>
        <div class="hero-cta">
          <el-button type="primary" size="large" class="get-started-btn" @click="router.push('/signup')" v-if="!isAuthenticated">
            Get Started Free
          </el-button>
          <el-button size="large" class="demo-btn" @click="viewDemo">
            {{ isAuthenticated ? 'View Dashboard' : 'Try Demo' }}
          </el-button>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <h3>{{ totalUsers }}+</h3>
            <p>Active Users</p>
          </div>
          <div class="stat-item">
            <h3>{{ formatNumber(totalExpenses) }}+</h3>
            <p>Expenses Tracked</p>
          </div>
          <div class="stat-item">
            <h3>98%</h3>
            <p>Satisfaction Rate</p>
          </div>
        </div>
      </div>
      <div class="hero-image">
        <img src="@/assets/images/expencetracker.jpeg" alt="Expense Tracker Dashboard" />
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <h2 class="section-title">Why Choose Our Expense Tracker?</h2>
      <div class="features-grid">
        <div class="feature-card" v-for="(feature, index) in features" :key="index">
          <div class="feature-icon">
            <i :class="feature.icon"></i>
          </div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how-it-works">
      <h2 class="section-title">How It Works</h2>
      <div class="steps-container">
        <div class="step" v-for="(step, index) in steps" :key="index">
          <div class="step-number">{{ index + 1 }}</div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="cta-section" v-if="!isAuthenticated">
      <div class="cta-content">
        <h2>Ready to Take Control of Your Finances?</h2>
        <p>Join {{ totalUsers }}+ users who have transformed their financial habits with our expense tracker.</p>
        <el-button type="primary" size="large" class="get-started-btn" @click="router.push('/signup')">
          Start Tracking Now
        </el-button>
      </div>
    </section>

    <!-- Demo Modal -->
    <el-dialog
      v-model="showDemoModal"
      title="Try Demo Account"
      width="400px"
    >
      <div class="demo-content">
        <p>Experience our expense tracker with a demo account:</p>
        <div class="demo-credentials">
          <p><strong>Email:</strong> demo@example.com</p>
          <p><strong>Password:</strong> demo123</p>
        </div>
        <p class="demo-note">Note: Demo account data resets every 24 hours.</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDemoModal = false">Cancel</el-button>
          <el-button type="primary" @click="loginWithDemo">
            Try Demo
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from 'axios';
import { ElMessage } from 'element-plus';

const router = useRouter();
const showDemoModal = ref(false);
const totalUsers = ref(0);
const totalExpenses = ref(0);
const isAuthenticated = ref(false);

const API_URL = import.meta.env.VITE_API_URL;

// Fetch stats
const fetchStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats`);
    totalUsers.value = response.data.userCount + 100; // Add 100 to actual user count
    totalExpenses.value = response.data.expenseCount || 10000;
  } catch (error) {
    // Fallback values if API fails
    totalUsers.value = 1100;
    totalExpenses.value = 10000;
  }
};

// Format large numbers
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Check authentication
const checkAuth = () => {
  const token = localStorage.getItem('token');
  isAuthenticated.value = !!token;
};

// View demo
const viewDemo = () => {
  if (isAuthenticated.value) {
    router.push('/dashboard');
  } else {
    showDemoModal.value = true;
  }
};

// Login with demo account
const loginWithDemo = async () => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      email: 'demo@example.com',
      password: 'demo123'
    });

    localStorage.setItem('token', response.data.token);
    showDemoModal.value = false;
    ElMessage.success('Logged in with demo account');
    router.push('/dashboard');
  } catch (error) {
    ElMessage.error('Failed to login with demo account. Please ensure the demo account exists.');
  }
};

const features = [
  {
    icon: "bi bi-graph-up",
    title: "Smart Analytics",
    description: "Get detailed insights into your spending patterns with interactive charts and reports."
  },
  {
    icon: "bi bi-shield-check",
    title: "Secure & Private",
    description: "Your financial data is protected with bank-level security and encryption."
  },
  {
    icon: "bi bi-lightning",
    title: "Real-time Tracking",
    description: "Record and categorize expenses instantly, anywhere and anytime."
  },
  {
    icon: "bi bi-bell",
    title: "Smart Alerts",
    description: "Set budgets and receive notifications when you're approaching your limits."
  },
  {
    icon: "bi bi-phone",
    title: "Mobile Friendly",
    description: "Access your expenses on any device with our responsive design."
  },
  {
    icon: "bi bi-cloud-arrow-up",
    title: "Cloud Sync",
    description: "Your data is automatically synced across all your devices."
  }
];

const steps = [
  {
    title: 'Create an Account',
    description: 'Sign up in seconds with just your email address.'
  },
  {
    title: 'Add Your Expenses',
    description: 'Easily record your daily expenses and categorize them.'
  },
  {
    title: 'Track & Analyze',
    description: 'View detailed reports and insights about your spending habits.'
  }
];

onMounted(() => {
  fetchStats();
  checkAuth();
});
</script>

<style scoped>
.home-container {
  max-width: 100%;
  overflow-x: hidden;
}

.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  line-height: 1.2;
  margin-bottom: 20px;
}

.gradient-text {
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: block;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 30px;
  line-height: 1.6;
}

.hero-cta {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
}

.get-started-btn {
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  border: none;
  padding: 12px 32px;
  font-weight: 600;
}

.demo-btn {
  border: 2px solid #00c4cc;
  color: #00c4cc;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 40px;
}

.stat-item {
  text-align: center;
}

.stat-item h3 {
  font-size: 2rem;
  color: #00c4cc;
  margin-bottom: 5px;
}

.stat-item p {
  color: #666;
}

.hero-image {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
  transition: transform 0.3s ease;
}

.hero-image:hover img {
  transform: scale(1.02);
}

.features-section {
  padding: 80px 20px;
  background: linear-gradient(to bottom, #f8f9fa, #ffffff);
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 60px;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
}

.feature-icon {
  font-size: 2rem;
  color: #00c4cc;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.how-it-works {
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.steps-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-top: 40px;
}

.step {
  text-align: center;
  padding: 30px;
}

.step-number {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 auto 20px;
}

.cta-section {
  background: linear-gradient(135deg, #00c4cc20, #7209b720);
  padding: 80px 20px;
  text-align: center;
  margin-top: 40px;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
}

.cta-content h2 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #333;
}

.cta-content p {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 30px;
}

.demo-content {
  text-align: center;
  padding: 20px;
}

.demo-credentials {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin: 20px 0;
}

.demo-note {
  color: #666;
  font-size: 0.9rem;
  margin-top: 15px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

@media (max-width: 992px) {
  .hero-section {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 40px 20px;
  }

  .hero-cta {
    justify-content: center;
  }

  .hero-stats {
    justify-content: center;
  }

  .hero-image {
    order: -1;
  }

  .steps-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .stat-item h3 {
    font-size: 1.5rem;
  }
}
</style>

