<template>
  <div class="settings-container">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>Settings</el-breadcrumb-item>
    </el-breadcrumb>
    
    <h1 class="settings-title">Settings</h1>
    
    <!-- Show skeleton loaders while loading -->
    <template v-if="isLoading">
      <Skeletons name="settings" />
    </template>
    
    <!-- Actual content when data is loaded -->
    <template v-else>
      <el-card class="settings-section">
        <template #header>
          <div class="section-header">
            <h2>Features</h2>
            <span class="section-description">Customize your experience by enabling or disabling features</span>
          </div>
        </template>
        
        <div class="features-list">
          <div v-for="feature in allFeatures" :key="feature.id" class="feature-item">
            <div class="feature-info">
              <h3>{{ feature.name }}</h3>
              <p>{{ feature.description }}</p>
              <el-tag v-if="feature.beta" type="warning" size="small" class="feature-tag">Beta</el-tag>
            </div>
            <el-switch
              v-model="featureStates[feature.id]"
              @change="(val: boolean) => handleFeatureToggle(feature.id, val)"
              active-color="#00c4cc"
            />
          </div>
        </div>
      </el-card>
      
      <el-card class="settings-section" v-if="isAchievementsEnabled">
        <template #header>
          <div class="section-header">
            <h2>Your Progress</h2>
            <span class="section-description">Your achievements and stats</span>
          </div>
        </template>
        
        <div class="progress-section">
          <div class="progress-stats">
            <div class="stat-item">
              <div class="stat-value">{{ gamificationProgress.level }}</div>
              <div class="stat-label">Level</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ gamificationProgress.points }}</div>
              <div class="stat-label">Points</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ gamificationProgress.streak }}</div>
              <div class="stat-label">Day Streak</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ gamificationProgress.achievements.length }}</div>
              <div class="stat-label">Achievements</div>
            </div>
          </div>
          
          <el-progress
            :percentage="levelProgress"
            :format="formatLevelProgress"
            :stroke-width="10"
            status="success"
            class="level-progress"
          />
          
          <div class="achievements-section" v-if="gamificationProgress.achievements.length > 0">
            <h3>Your Achievements</h3>
            <div class="achievements-list">
              <div 
                v-for="achievement in gamificationProgress.achievements" 
                :key="achievement.id"
                class="achievement-item"
              >
                <div class="achievement-icon">
                  <i :class="achievement.icon"></i>
                </div>
                <div class="achievement-info">
                  <h4>{{ achievement.title }}</h4>
                  <p>{{ achievement.description }}</p>
                  <div class="achievement-meta">
                    <span class="achievement-date">{{ formatDate(achievement.earnedAt) }}</span>
                    <span class="achievement-points">+{{ achievement.points }} pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="no-achievements" v-else>
            <i class="bi bi-trophy"></i>
            <p>You haven't earned any achievements yet. Start tracking your expenses to earn your first achievement!</p>
          </div>
        </div>
      </el-card>
      
      <el-card class="settings-section">
        <template #header>
          <div class="section-header">
            <h2>Appearance</h2>
            <span class="section-description">Customize how the app looks</span>
          </div>
        </template>
        
        <div class="appearance-settings">
          <div class="setting-item">
            <div class="setting-info">
              <h3>Compact View</h3>
              <p>Use a more compact layout to fit more content on screen</p>
            </div>
            <el-switch
              v-model="compactView"
              @change="toggleCompactView"
              active-color="#00c4cc"
            />
          </div>
        </div>
      </el-card>
      
      <el-card class="settings-section">
        <template #header>
          <div class="section-header">
            <h2>Notifications</h2>
            <span class="section-description">Manage what notifications you receive</span>
          </div>
        </template>
        
        <div class="notification-settings" v-if="isNotificationsEnabled">
          <div class="setting-item">
            <div class="setting-info">
              <h3>Budget Alerts</h3>
              <p>Get notified when you're approaching your budget limits</p>
            </div>
            <el-switch
              v-model="notificationSettings.budgetAlerts"
              @change="saveNotificationSettings"
              active-color="#00c4cc"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3>Achievement Notifications</h3>
              <p>Get notified when you earn new achievements</p>
            </div>
            <el-switch
              v-model="notificationSettings.achievements"
              @change="saveNotificationSettings"
              active-color="#00c4cc"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3>Feature Tips</h3>
              <p>Receive occasional tips about app features</p>
            </div>
            <el-switch
              v-model="notificationSettings.featureTips"
              @change="saveNotificationSettings"
              active-color="#00c4cc"
            />
          </div>
        </div>
        
        <div class="notifications-disabled" v-else>
          <el-alert
            title="Notifications are disabled"
            type="info"
            description="Enable the Notifications feature to configure notification preferences."
            :closable="false"
            show-icon
          />
        </div>
      </el-card>
      
      <el-card class="settings-section">
        <template #header>
          <div class="section-header">
            <h2>App Information</h2>
            <span class="section-description">About this app</span>
          </div>
        </template>
        
        <div class="app-info">
          <div class="info-item">
            <div class="info-label">Version</div>
            <div class="info-value">{{ appVersion }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Last Updated</div>
            <div class="info-value">{{ formatDate(Date.now()) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Developer</div>
            <div class="info-value">Jayvijay Chauhan</div>
          </div>
          
          <div class="action-buttons">
            <router-link to="/about">
              <el-button type="primary" plain>About Page</el-button>
            </router-link>
            <el-button type="success" plain @click="clearCache">Clear Cache</el-button>
          </div>
        </div>
      </el-card>
      
      <el-card class="settings-section" v-if="isFeatureEnabled(Feature.SAVINGS_GOALS)">
        <template #header>
          <div class="section-header">
            <h2>Savings Goals</h2>
            <span class="section-description">Set and track your financial goals</span>
          </div>
        </template>
        
        <SavingsGoals />
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Feature, useFeatureFlags } from '@/utils/featureFlags';
import { useGamification } from '@/utils/gamification';
import SavingsGoals from '@/components/SavingsGoals.vue';
import { settingsApi } from '@/utils/api';
import Skeletons from '@/components/ui/Skeletons.vue';

// Get app version
const instance = getCurrentInstance();
const appVersion = computed(() => instance?.appContext.config.globalProperties.$appVersion || '2.0.0');

// Loading state
const isLoading = ref(true);

// Feature flags
const { getAllFeatures, isFeatureEnabled, setFeatureEnabled } = useFeatureFlags();
const allFeatures = computed(() => getAllFeatures.value);
const featureStates = ref<Record<string, boolean>>({});

// Track enabled state of specific features
const isAchievementsEnabled = computed(() => isFeatureEnabled(Feature.ACHIEVEMENTS));
const isNotificationsEnabled = computed(() => isFeatureEnabled(Feature.NOTIFICATIONS));

// Get gamification progress from the gamification service
const { progress: gamificationProgress } = useGamification();

// Level progress calculation
const levelProgress = computed(() => {
  const currentPoints = gamificationProgress.value.points;
  const currentLevel = gamificationProgress.value.level;
  const pointsForNextLevel = currentLevel * 100;
  const pointsInCurrentLevel = currentPoints - ((currentLevel - 1) * 100);
  return Math.min(100, Math.round((pointsInCurrentLevel / 100) * 100));
});

// Format level progress for display
const formatLevelProgress = (percentage: number) => {
  return `${gamificationProgress.value.points} / ${gamificationProgress.value.level * 100} points`;
};

// Appearance settings - only compact view is kept
const compactView = ref(localStorage.getItem('compact_view') === 'true');

// Notification settings
const notificationSettings = ref({
  budgetAlerts: true,
  achievements: true,
  featureTips: true
});

// State management for feature flags
const features = ref({
  savingsGoals: false,
  budgetTips: false,
  dataExport: false,
  progressTracking: true
});

// Notification settings
const notifications = ref({
  budgetAlerts: true,
  achievementNotifications: true,
  featureTips: true
});

// App information
const appInfo = ref({
  version: '2.0.0',
  lastUpdated: '2023-08-15',
  developer: 'Expense Tracker Team'
});

// Notification permission status
const notificationsEnabled = ref(
  'Notification' in window && Notification.permission === 'granted'
);

// Format date for display
const formatDate = (timestamp: number | null): string => {
  if (!timestamp) return 'N/A';
  
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Handle feature toggle with proper type for val parameter
const handleFeatureToggle = (featureId: string, val: boolean) => {
  setFeatureEnabled(featureId as Feature, val);
  
  // Show appropriate message
  ElMessage.success(`${featureId} ${val ? 'enabled' : 'disabled'}`);
};

// Toggle compact view
const toggleCompactView = (value: boolean) => {
  compactView.value = value;
  localStorage.setItem('compact_view', value.toString());
  
  if (value) {
    document.documentElement.classList.add('compact-view');
  } else {
    document.documentElement.classList.remove('compact-view');
  }
  
  ElMessage.success(`Compact view ${value ? 'enabled' : 'disabled'}`);
};

// Load settings from backend with localStorage fallback
const loadSettings = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      loadFromLocalStorage();
      return;
    }
    
    // Load feature settings
    const featureSettings = await settingsApi.getFeatureSettings();
    if (featureSettings) {
      features.value.savingsGoals = featureSettings.savingsGoals || false;
      features.value.budgetTips = featureSettings.budgetTips || false;
      features.value.dataExport = featureSettings.dataExport || false;
      features.value.progressTracking = featureSettings.progressTracking !== false;
    }
    
    // Load notification settings
    const notificationSettingsData = await settingsApi.getNotificationSettings();
    if (notificationSettingsData) {
      notifications.value.budgetAlerts = notificationSettingsData.budgetAlerts !== false;
      notifications.value.achievementNotifications = notificationSettingsData.achievementNotifications !== false;
      notifications.value.featureTips = notificationSettingsData.featureTips !== false;
    }
    
    // User progress is now handled by the gamification service
    // No need to set userProgress here, as it's managed by the gamification service
    
    // Save to localStorage as backup
    saveToLocalStorage();
  } catch (error) {
    console.error('Failed to load settings from backend:', error);
    loadFromLocalStorage();
  }
};

// Load settings from localStorage
const loadFromLocalStorage = () => {
  try {
    // Load feature flags
    features.value.savingsGoals = localStorage.getItem('feature_savings_goals') === 'true';
    features.value.budgetTips = localStorage.getItem('feature_budget_tips') === 'true';
    features.value.dataExport = localStorage.getItem('feature_data_export') === 'true';
    features.value.progressTracking = localStorage.getItem('feature_progress_tracking') !== 'false';
    
    // Load notification settings
    const savedNotifications = localStorage.getItem('notification_settings');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      notifications.value.budgetAlerts = parsed.budgetAlerts !== false;
      notifications.value.achievementNotifications = parsed.achievementNotifications !== false;
      notifications.value.featureTips = parsed.featureTips !== false;
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
  }
};

// Save settings to localStorage
const saveToLocalStorage = () => {
  try {
    // Save feature flags
    localStorage.setItem('feature_savings_goals', features.value.savingsGoals.toString());
    localStorage.setItem('feature_budget_tips', features.value.budgetTips.toString());
    localStorage.setItem('feature_data_export', features.value.dataExport.toString());
    localStorage.setItem('feature_progress_tracking', features.value.progressTracking.toString());
    
    // Save notification settings
    localStorage.setItem('notification_settings', JSON.stringify(notifications.value));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
  }
};

// Save settings to backend
const saveSettings = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      saveToLocalStorage();
      return;
    }
    
    // Save feature settings
    await settingsApi.saveFeatureSettings(features.value);
    
    // Save notification settings
    await settingsApi.saveNotificationSettings(notifications.value);
    
    // Save to localStorage as backup
    saveToLocalStorage();
    
    ElMessage.success('Settings saved successfully');
  } catch (error) {
    console.error('Failed to save settings to backend:', error);
    
    // Still save to localStorage as backup
    saveToLocalStorage();
    
    ElMessage.warning('Settings saved locally only');
  }
};

// Toggle feature and save changes
const toggleFeatureApi = async (feature: string) => {
  try {
    // Update backend
    await settingsApi.toggleFeature(feature, (features.value as any)[feature]);
    
    // Update localStorage
    localStorage.setItem(`feature_${feature}`, (features.value as any)[feature].toString());
    
    ElMessage.success(`${feature} feature ${(features.value as any)[feature] ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error(`Failed to toggle ${feature} feature:`, error);
    
    // Still update localStorage
    localStorage.setItem(`feature_${feature}`, (features.value as any)[feature].toString());
    
    ElMessage.warning(`${feature} setting saved locally only`);
  }
};

// Save notification settings
const saveNotificationSettings = async () => {
  try {
    // Update backend
    await settingsApi.saveNotificationSettings(notifications.value);
    
    // Update localStorage
    localStorage.setItem('notification_settings', JSON.stringify(notifications.value));
    
    ElMessage.success('Notification settings saved');
  } catch (error) {
    console.error('Failed to save notification settings:', error);
    
    // Still update localStorage
    localStorage.setItem('notification_settings', JSON.stringify(notifications.value));
    
    ElMessage.warning('Notification settings saved locally only');
  }
};

// Clear app cache
const clearCache = async () => {
  try {
    await settingsApi.clearUserCache();
    ElMessage.success('App cache cleared successfully');
  } catch (error) {
    console.error('Failed to clear cache:', error);
    ElMessage.error('Failed to clear cache');
  }
};

// Watch for authentication changes
const token = ref(localStorage.getItem('token'));

watch(() => localStorage.getItem('token'), (newToken) => {
  token.value = newToken;
  if (newToken) {
    loadSettings();
  } else {
    // Reset settings to defaults when logging out
    features.value.savingsGoals = false;
    features.value.budgetTips = false;
    features.value.dataExport = false;
    features.value.progressTracking = true;
  }
});

// Initialize
onMounted(async () => {
  try {
    isLoading.value = true;
    
    // Load feature states
    allFeatures.value.forEach(feature => {
      featureStates.value[feature.id] = isFeatureEnabled(feature.id as Feature);
    });
    
    if (token.value) {
      await loadSettings();
    } else {
      loadFromLocalStorage();
    }
    
    // Apply compact view if enabled
    if (compactView.value) {
      document.documentElement.classList.add('compact-view');
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    ElMessage.error('Failed to load settings');
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.el-breadcrumb {
  margin-bottom: 20px;
  padding: 10px 0;
  font-size: 0.95rem;
}

:deep(.el-breadcrumb__item) {
  color: #666;
}

:deep(.el-breadcrumb__inner a) {
  color: #336ad7;
  font-weight: normal;
  transition: color 0.2s;
}

:deep(.el-breadcrumb__inner a:hover) {
  color: #00c4cc;
}

.settings-title {
  font-size: 2rem;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
  background-image: linear-gradient(135deg, #00c4cc, #7209b7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.settings-section {
  margin-bottom: 30px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.settings-section:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  flex-direction: column;
}

.section-header h2 {
  margin: 0;
  font-size: 1.3rem;
  color: #333;
}

.section-description {
  font-size: 0.9rem;
  color: #666;
  margin-top: 4px;
}

/* Features section */
.features-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #f5f5f5;
}

.feature-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.feature-info {
  padding-right: 20px;
}

.feature-info h3 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
  color: #333;
}

.feature-info p {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  color: #666;
}

.feature-tag {
  margin-right: 5px;
}

/* Progress section */
.progress-section {
  padding: 10px 0;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 20px;
  gap: 15px;
}

.stat-item {
  text-align: center;
  flex: 1;
  min-width: 80px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #00c4cc;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.level-progress {
  margin-bottom: 30px;
}

.achievements-section h3 {
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  color: #333;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.achievement-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: linear-gradient(135deg, #00c4cc10, #7209b710);
  border-radius: 8px;
}

.achievement-icon {
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

.achievement-info {
  flex: 1;
}

.achievement-info h4 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
  color: #333;
}

.achievement-info p {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  color: #666;
}

.achievement-meta {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 0.8rem;
  color: #999;
}

.achievement-points {
  color: #00c4cc;
  font-weight: bold;
}

.no-achievements {
  text-align: center;
  padding: 30px 0;
  color: #999;
}

.no-achievements i {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.3;
}

/* Appearance and Notification settings */
.appearance-settings,
.notification-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #f5f5f5;
}

.setting-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.setting-info {
  padding-right: 20px;
}

.setting-info h3 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
  color: #333;
}

.setting-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.notifications-disabled {
  padding: 10px 0;
}

/* App info section */
.app-info {
  padding: 10px 0;
}

.info-item {
  display: flex;
  margin-bottom: 15px;
}

.info-label {
  width: 120px;
  font-weight: bold;
  color: #333;
}

.info-value {
  flex: 1;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .feature-item,
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .feature-info,
  .setting-info {
    padding-right: 0;
    margin-bottom: 10px;
  }
  
  .progress-stats {
    justify-content: center;
  }
  
  .stat-item {
    width: calc(50% - 15px);
    flex: none;
    margin-bottom: 10px;
  }
  
  .achievement-item {
    flex-direction: column;
    padding: 12px;
  }
  
  .achievement-icon {
    margin-bottom: 10px;
    align-self: center;
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
  
  .achievement-meta {
    justify-content: center;
    margin-top: 8px;
  }
  
  .achievement-date, .achievement-points {
    width: 100%;
    text-align: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .stat-item {
    width: calc(50% - 10px);
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .achievement-info h4 {
    text-align: center;
  }
  
  .achievement-info p {
    text-align: center;
  }
}
</style> 