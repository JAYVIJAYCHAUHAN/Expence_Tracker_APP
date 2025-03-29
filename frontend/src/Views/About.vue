<template>
  <div class="about-container">
    <div class="about-header">
      <h1>About Expense Tracker</h1>
      <p class="version-tag">Version {{ appVersion }}</p>
    </div>

    <el-card class="about-card">
      <template #header>
        <div class="card-header">
          <h2>Overview</h2>
        </div>
      </template>
      <p>
        Expense Tracker is a powerful Progressive Web App (PWA) designed to help you manage your finances,
        track expenses, and gain insights into your spending habits. Our goal is to provide a secure,
        intuitive tool that makes financial management accessible to everyone.
      </p>
    </el-card>

    <el-card class="about-card">
      <template #header>
        <div class="card-header">
          <h2>Key Features</h2>
        </div>
      </template>
      <div class="features-grid">
        <div class="feature" v-for="(feature, index) in features" :key="index">
          <div class="feature-icon">
            <i :class="feature.icon"></i>
          </div>
          <div class="feature-text">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="about-card">
      <template #header>
        <div class="card-header">
          <h2>Security & Privacy</h2>
        </div>
      </template>
      <div class="security-content">
        <p>
          Expense Tracker is built with security and privacy as core principles. 
          We implement multiple layers of protection to keep your financial data safe:
        </p>
        <ul class="security-features">
          <li>
            <i class="bi bi-shield-check"></i>
            <span>End-to-end data encryption</span>
          </li>
          <li>
            <i class="bi bi-fingerprint"></i>
            <span>Secure authentication system</span>
          </li>
          <li>
            <i class="bi bi-eye-slash"></i>
            <span>Sensitive data redaction in logs</span>
          </li>
          <li>
            <i class="bi bi-box-arrow-right"></i>
            <span>Automatic session expiration</span>
          </li>
          <li>
            <i class="bi bi-hdd-network"></i>
            <span>Regular security audits</span>
          </li>
          <li>
            <i class="bi bi-globe"></i>
            <span>GDPR compliant data handling</span>
          </li>
        </ul>
      </div>
    </el-card>

    <el-card class="about-card">
      <template #header>
        <div class="card-header">
          <h2>Technical Information</h2>
        </div>
      </template>
      <div class="tech-info">
        <div class="tech-item">
          <strong>App Version:</strong> {{ appVersion }}
        </div>
        <div class="tech-item">
          <strong>Framework:</strong> Vue.js 3 with TypeScript
        </div>
        <div class="tech-item">
          <strong>UI Library:</strong> Element Plus
        </div>
        <div class="tech-item">
          <strong>Backend:</strong> Node.js with Express
        </div>
        <div class="tech-item">
          <strong>Database:</strong> MongoDB
        </div>
        <div class="tech-item">
          <strong>PWA Support:</strong> <span class="badge">Enabled</span>
        </div>
        <div class="tech-item">
          <strong>Offline Capability:</strong> <span class="badge">Available</span>
        </div>
        <div class="tech-item">
          <strong>Last Updated:</strong> {{ formattedDate }}
        </div>
      </div>
    </el-card>

    <el-card class="about-card">
      <template #header>
        <div class="card-header">
          <h2>Development Team</h2>
        </div>
      </template>
      <div class="team-section">
        <div class="team-member">
          <img src="@/assets/images/logo.jpeg" alt="Developer" class="team-avatar" />
          <div class="team-info">
            <h3>Jayvijay Chauhan</h3>
            <p>Lead Developer</p>
            <div class="social-links">
              <a href="https://github.com/JAYVIJAYCHAUHAN" target="_blank" class="social-link">
                <i class="bi bi-github"></i>
              </a>
              <a href="https://www.linkedin.com/in/jayvijay-chauhan" target="_blank" class="social-link">
                <i class="bi bi-linkedin"></i>
              </a>
              <a href="https://x.com/jvchauhan8874" target="_blank" class="social-link">
                <i class="bi bi-twitter-x"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <div class="about-actions">
      <el-button type="primary" @click="router.push('/')">
        Back to Dashboard
      </el-button>
      <el-button type="success" @click="reportIssue">
        Report an Issue
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const instance = getCurrentInstance();
const appVersion = computed(() => instance?.appContext.config.globalProperties.$appVersion || '2.0.0');

// Format current date for "Last Updated"
const formattedDate = computed(() => {
  const date = new Date();
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
});

// Features list
const features = [
  {
    icon: 'bi bi-graph-up',
    title: 'Expense Analytics',
    description: 'Visualize your spending patterns with interactive charts and graphs.'
  },
  {
    icon: 'bi bi-calendar-check',
    title: 'Budget Planning',
    description: 'Set monthly budgets by category and track your progress.'
  },
  {
    icon: 'bi bi-file-earmark-pdf',
    title: 'Report Generation',
    description: 'Generate detailed PDF reports of your expenses for any time period.'
  },
  {
    icon: 'bi bi-wifi-off',
    title: 'Offline Support',
    description: 'Continue using the app even when you\'re offline.'
  },
  {
    icon: 'bi bi-bell',
    title: 'Notifications',
    description: 'Get alerts for approaching budget limits and payment reminders.'
  },
  {
    icon: 'bi bi-shield-lock',
    title: 'Data Security',
    description: 'Your financial data is encrypted and protected with industry-standard security.'
  }
];

// Function to report an issue
const reportIssue = () => {
  window.open('https://github.com/JAYVIJAYCHAUHAN/Expence_Tracker_APP/issues/new', '_blank');
};
</script>

<style scoped>
.about-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.about-header {
  text-align: center;
  margin-bottom: 30px;
}

.about-header h1 {
  margin-bottom: 10px;
  background-image: linear-gradient(135deg, #00c4cc, #7209b7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: bold;
}

.version-tag {
  display: inline-block;
  background: linear-gradient(135deg, #00c4cc20, #7209b720);
  color: #7209b7;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-top: 10px;
}

.about-card {
  margin-bottom: 25px;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.about-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 1.3rem;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 10px;
}

.feature {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.feature-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #00c4cc20, #7209b720);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7209b7;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.feature-text h3 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
  color: #333;
}

.feature-text p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.security-features {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 15px;
}

.security-features li {
  display: flex;
  align-items: center;
  gap: 10px;
}

.security-features i {
  color: #00c4cc;
  font-size: 1.1rem;
}

.tech-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.badge {
  display: inline-block;
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.team-section {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  border-radius: 8px;
  background: linear-gradient(135deg, #00c4cc10, #7209b710);
  max-width: 400px;
}

.team-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.team-info h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.team-info p {
  margin: 0 0 10px 0;
  color: #666;
  font-style: italic;
}

.social-links {
  display: flex;
  gap: 10px;
}

.social-link {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00c4cc20, #7209b720);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7209b7;
  transition: all 0.3s ease;
}

.social-link:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, #00c4cc, #7209b7);
  color: white;
}

.about-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .features-grid,
  .security-features,
  .tech-info {
    grid-template-columns: 1fr;
  }
  
  .team-member {
    flex-direction: column;
    text-align: center;
  }
  
  .social-links {
    justify-content: center;
  }
}
</style> 