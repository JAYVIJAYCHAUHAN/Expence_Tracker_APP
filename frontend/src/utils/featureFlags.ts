/**
 * Feature flags for Expense Tracker v2.0.0
 * Allows enabling/disabling features for specific users or environments
 */

import { ref, computed, readonly } from 'vue';
import { useNotifications, NotificationType } from './notification';

// Define available features
export enum Feature {
  ACHIEVEMENTS = 'achievements',
  DARK_MODE = 'dark_mode',
  SAVINGS_GOALS = 'savings_goals',
  BUDGET_INSIGHTS = 'budget_insights',
  EXPENSE_PREDICTION = 'expense_prediction',
  EXPORT_OPTIONS = 'export_options',
  NOTIFICATIONS = 'notifications'
}

// Feature configuration
interface FeatureConfig {
  id: Feature;
  name: string;
  description: string;
  enabled: boolean;
  beta?: boolean;
  adminOnly?: boolean;
}

// Default feature configuration
const defaultFeatures: Record<Feature, FeatureConfig> = {
  [Feature.ACHIEVEMENTS]: {
    id: Feature.ACHIEVEMENTS,
    name: 'Achievements & Rewards',
    description: 'Earn points and achievements as you track expenses',
    enabled: true
  },
  // [Feature.DARK_MODE]: {
  //   id: Feature.DARK_MODE,
  //   name: 'Dark Mode',
  //   description: 'Switch between light and dark themes',
  //   enabled: true
  // },
  [Feature.SAVINGS_GOALS]: {
    id: Feature.SAVINGS_GOALS,
    name: 'Savings Goals',
    description: 'Set and track savings goals',
    enabled: false,
    beta: true
  },
  [Feature.BUDGET_INSIGHTS]: {
    id: Feature.BUDGET_INSIGHTS,
    name: 'AI Budget Insights',
    description: 'Get AI-powered insights about your spending habits',
    enabled: false,
    beta: true
  },
  [Feature.EXPENSE_PREDICTION]: {
    id: Feature.EXPENSE_PREDICTION,
    name: 'Expense Prediction',
    description: 'Predict future expenses based on past spending',
    enabled: false,
    beta: true
  },
  [Feature.EXPORT_OPTIONS]: {
    id: Feature.EXPORT_OPTIONS,
    name: 'Advanced Export Options',
    description: 'Export your data in various formats',
    enabled: true
  },
  [Feature.NOTIFICATIONS]: {
    id: Feature.NOTIFICATIONS,
    name: 'Smart Notifications',
    description: 'Get notifications about budgets, bills, and insights',
    enabled: true
  }
};

// Internal state
const features = ref<Record<Feature, FeatureConfig>>({ ...defaultFeatures });
const isAdmin = ref(false);

/**
 * Check if a feature is enabled
 * @param featureId Feature to check
 * @returns Whether the feature is enabled
 */
const isFeatureEnabled = (featureId: Feature): boolean => {
  const feature = features.value[featureId];
  
  if (!feature) {
    console.warn(`Feature ${featureId} not found`);
    return false;
  }
  
  // Check if feature requires admin access
  if (feature.adminOnly && !isAdmin.value) {
    return false;
  }
  
  return feature.enabled;
};

/**
 * Get all available features
 * @returns List of all features
 */
const getAllFeatures = computed((): FeatureConfig[] => {
  return Object.values(features.value).filter(feature => {
    // Filter out admin-only features for non-admins
    if (feature.adminOnly && !isAdmin.value) {
      return false;
    }
    return true;
  });
});

/**
 * Get enabled features
 * @returns List of enabled features
 */
const getEnabledFeatures = computed((): FeatureConfig[] => {
  return getAllFeatures.value.filter(feature => feature.enabled);
});

/**
 * Toggle a feature on/off
 * @param featureId Feature to toggle
 * @returns New state of the feature
 */
const toggleFeature = (featureId: Feature): boolean => {
  if (!features.value[featureId]) {
    console.warn(`Feature ${featureId} not found`);
    return false;
  }
  
  features.value[featureId].enabled = !features.value[featureId].enabled;
  saveFeatureSettings();
  
  // If enabling a beta feature, show notification
  if (features.value[featureId].enabled && features.value[featureId].beta) {
    const { addNotification } = useNotifications();
    addNotification(
      NotificationType.FEATURE_TIP,
      `${features.value[featureId].name} Enabled`,
      `You've enabled ${features.value[featureId].name}. This is a beta feature and may have some rough edges.`
    );
  }
  
  return features.value[featureId].enabled;
};

/**
 * Set a feature's enabled state
 * @param featureId Feature to update
 * @param enabled New state
 */
const setFeatureEnabled = (featureId: Feature, enabled: boolean): void => {
  if (!features.value[featureId]) {
    console.warn(`Feature ${featureId} not found`);
    return;
  }
  
  features.value[featureId].enabled = enabled;
  saveFeatureSettings();
};

/**
 * Save feature settings to localStorage
 */
const saveFeatureSettings = (): void => {
  try {
    // Create a map of just the enabled state
    const enabledMap: Record<string, boolean> = {};
    for (const [id, feature] of Object.entries(features.value)) {
      enabledMap[id] = feature.enabled;
    }
    
    localStorage.setItem('feature_flags', JSON.stringify(enabledMap));
  } catch (error) {
    console.error('Failed to save feature settings:', error);
  }
};

/**
 * Load feature settings from localStorage
 */
const loadFeatureSettings = (): void => {
  try {
    const saved = localStorage.getItem('feature_flags');
    if (saved) {
      const enabledMap = JSON.parse(saved) as Record<string, boolean>;
      
      // Apply saved settings
      for (const [id, enabled] of Object.entries(enabledMap)) {
        if (features.value[id as Feature]) {
          features.value[id as Feature].enabled = enabled;
        }
      }
    }
    
    // Check if user is admin
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        isAdmin.value = user.isAdmin === true;
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  } catch (error) {
    console.error('Failed to load feature settings:', error);
  }
};

/**
 * Initialize the feature flags
 */
const initialize = (): void => {
  loadFeatureSettings();
};

// Export the feature flags API
export const useFeatureFlags = () => {
  initialize();
  
  return {
    features: readonly(features),
    isFeatureEnabled,
    toggleFeature,
    setFeatureEnabled,
    getAllFeatures,
    getEnabledFeatures
  };
}; 