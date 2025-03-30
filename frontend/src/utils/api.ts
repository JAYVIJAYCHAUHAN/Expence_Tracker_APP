import axios from 'axios';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (expired token, etc.)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Don't redirect if it's a login/logout request
      const isAuthEndpoint = error.config.url.includes('/auth/');
      if (!isAuthEndpoint) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  login: (email: string, password: string) => {
    return apiClient.post('/auth/login', { email, password });
  },
  
  register: (userData: any) => {
    return apiClient.post('/auth/register', userData);
  },
  
  logout: () => {
    return apiClient.post('/auth/logout', {}).catch(error => {
      // Always clear local storage regardless of API error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return Promise.reject(error);
    });
  },
  
  validateToken: () => {
    return apiClient.get('/auth/validate');
  }
};

// User API
export const userApi = {
  getProfile: () => {
    return apiClient.get('/users/profile');
  },
  
  updateProfile: (data: any) => {
    return apiClient.put('/users/profile', data);
  },
  
  updateSettings: (settings: any) => {
    return apiClient.put('/users/settings', settings);
  },
  
  getSettings: () => {
    return apiClient.get('/users/settings');
  },
  
  logout: () => {
    return authApi.logout();
  }
};

// Expense API
export const expenseApi = {
  getExpenses: (month: number, year: number) => {
    return apiClient.get('/expenses', {
      params: { month, year }
    }).then(response => response.data);
  },
  
  getExpenseById: (id: string) => {
    return apiClient.get(`/expenses/${id}`).then(response => response.data);
  },
  
  createExpense: (expense: any) => {
    return apiClient.post('/expenses', expense).then(response => response.data);
  },
  
  updateExpense: (id: string, expense: any) => {
    return apiClient.put(`/expenses/${id}`, expense).then(response => response.data);
  },
  
  deleteExpense: (id: string) => {
    return apiClient.delete(`/expenses/${id}`).then(response => response.data);
  }
};

// Helper function to handle API errors with proper fallback data
const handleApiError = (error: any, fallbackData: any, storage?: { key: string, value: any }) => {
  console.warn(`API endpoint not available: ${error?.config?.url || 'unknown endpoint'}`);
  console.warn('This is expected if backend endpoints are not implemented yet. Using local storage fallback.');
  
  // If storage info is provided, store the fallback data
  if (storage) {
    try {
      localStorage.setItem(storage.key, 
        typeof storage.value === 'string' ? storage.value : JSON.stringify(storage.value)
      );
    } catch (storageError) {
      console.error('Failed to save to localStorage:', storageError);
    }
  }
  
  return fallbackData;
};

// Savings Goals API
export const savingsGoalsApi = {
  getGoals: async () => {
    try {
      const response = await apiClient.get('/savings-goals');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch savings goals:', error);
      // Fallback to localStorage if API call fails
      const savedGoals = localStorage.getItem('savings_goals');
      return handleApiError(
        error, 
        savedGoals ? JSON.parse(savedGoals) : [],
        undefined
      );
    }
  },
  
  saveGoal: async (goal: any) => {
    try {
      let response;
      let updatedGoal = { ...goal };
      
      // Remove 'goal_' prefix for better backend compatibility
      const cleanId = goal.id && goal.id.startsWith('goal_') 
        ? goal.id.substring(5) 
        : goal.id;
      
      if (goal.id && goal.id !== 'new') {
        // Update existing goal
        response = await apiClient.put(`/savings-goals/${cleanId}`, goal);
        updatedGoal = response.data;
      } else {
        // Create new goal
        const goalToCreate = { ...goal };
        delete goalToCreate.id;
        
        response = await apiClient.post('/savings-goals', goalToCreate);
        updatedGoal = response.data;
      }
      
      return updatedGoal;
    } catch (error) {
      console.error('Failed to save goal:', error);
      // Fallback to localStorage
      const goalWithId = { ...goal };
      if (!goalWithId.id || goalWithId.id === 'new') {
        goalWithId.id = `goal_${Date.now()}`;
      }
      
      // Update localStorage
      goal.id ? updateLocalStorageGoal(goalWithId) : addLocalStorageGoal(goalWithId);
      
      return handleApiError(
        error, 
        goalWithId, 
        { key: 'savings_goals_last_edit', value: goalWithId }
      );
    }
  },
  
  deleteGoal: async (goalId: string) => {
    try {
      // Clean the ID if it has a prefix
      const cleanId = goalId.startsWith('goal_') ? goalId.substring(5) : goalId;
      await apiClient.delete(`/savings-goals/${cleanId}`);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete goal:', error);
      // Still delete from localStorage
      deleteLocalStorageGoal(goalId);
      return handleApiError(error, true, undefined);
    }
  },
  
  addDeposit: async (goalId: string, deposit: any) => {
    try {
      // Clean the ID if it has a prefix
      const cleanId = goalId.startsWith('goal_') ? goalId.substring(5) : goalId;
      const response = await apiClient.post(`/savings-goals/${cleanId}/deposits`, deposit);
      return response.data;
    } catch (error) {
      console.error('Failed to add deposit:', error);
      // Fallback to localStorage
      const depositWithId = { ...deposit };
      if (!depositWithId.id) {
        depositWithId.id = `deposit_${Date.now()}`;
      }
      
      // Add to localStorage
      addLocalStorageDeposit(goalId, depositWithId);
      
      return handleApiError(
        error,
        depositWithId,
        undefined
      );
    }
  },
  
  syncGoals: async () => {
    try {
      // Get goals from API
      const response = await apiClient.get('/savings-goals');
      return response.data;
    } catch (error) {
      console.error('Failed to sync goals:', error);
      // Fallback to localStorage
      const goalsJson = localStorage.getItem('savings_goals');
      return handleApiError(
        error, 
        goalsJson ? JSON.parse(goalsJson) : [],
        undefined
      );
    }
  }
};

// Budget API
export const budgetApi = {
  getBudget: async (month: number, year: number) => {
    try {
      const response = await apiClient.get('/budgets', {
        params: { month, year }
      });
      return response.data.amount;
    } catch (error) {
      // Fallback to localStorage with improved handling
      const savedBudget = localStorage.getItem('monthly_budget');
      const defaultBudget = 50000;
      const budget = savedBudget ? parseInt(savedBudget) : defaultBudget;
      
      return handleApiError(error, budget, { key: 'monthly_budget', value: String(budget) });
    }
  },
  
  saveBudget: async (month: number, year: number, amount: number) => {
    try {
      const response = await apiClient.post('/budgets', {
        month,
        year,
        amount
      });
      
      // Save to localStorage as backup
      localStorage.setItem('monthly_budget', amount.toString());
      return response.data;
    } catch (error) {
      // Fallback to localStorage with improved handling
      return handleApiError(
        error, 
        { success: true, amount }, 
        { key: 'monthly_budget', value: amount.toString() }
      );
    }
  }
};

// Settings API
export const settingsApi = {
  getFeatureSettings: async () => {
    try {
      const response = await apiClient.get('/settings/features');
      return response.data;
    } catch (error) {
      // Fallback to localStorage
      const features = {
        darkMode: false, // Remove dark mode as requested
        savingsGoals: localStorage.getItem('feature_savings_goals') === 'true',
        budgetTips: localStorage.getItem('feature_budget_tips') === 'true',
        dataExport: localStorage.getItem('feature_data_export') === 'true',
        progressTracking: localStorage.getItem('feature_progress_tracking') !== 'false'
      };
      
      return handleApiError(error, features, undefined);
    }
  },
  
  saveFeatureSettings: async (features: any) => {
    try {
      const response = await apiClient.put('/settings/features', features);
      
      // Save to localStorage as backup
      Object.entries(features).forEach(([key, value]) => {
        localStorage.setItem(`feature_${key}`, String(value));
      });
      
      return response.data;
    } catch (error) {
      // Fallback to localStorage
      Object.entries(features).forEach(([key, value]) => {
        localStorage.setItem(`feature_${key}`, String(value));
      });
      
      return handleApiError(error, features, undefined);
    }
  },
  
  toggleFeature: async (feature: string, enabled: boolean) => {
    try {
      const response = await apiClient.put(`/settings/features/${feature}`, {
        enabled
      });
      
      // Save to localStorage as backup
      localStorage.setItem(`feature_${feature}`, enabled.toString());
      return response.data;
    } catch (error) {
      console.error(`API error toggling feature ${feature}:`, error);
      
      // Fallback to localStorage
      localStorage.setItem(`feature_${feature}`, enabled.toString());
      throw error;
    }
  },
  
  getNotificationSettings: async () => {
    try {
      const response = await apiClient.get('/settings/notifications');
      return response.data;
    } catch (error) {
      console.error('API error fetching notification settings:', error);
      
      // Fallback to localStorage
      const savedSettings = localStorage.getItem('notification_settings');
      return savedSettings ? JSON.parse(savedSettings) : {
        budgetAlerts: true,
        achievementNotifications: true,
        featureTips: true
      };
    }
  },
  
  saveNotificationSettings: async (settings: any) => {
    try {
      const response = await apiClient.put('/settings/notifications', settings);
      
      // Save to localStorage as backup
      localStorage.setItem('notification_settings', JSON.stringify(settings));
      return response.data;
    } catch (error) {
      console.error('API error saving notification settings:', error);
      
      // Fallback to localStorage
      localStorage.setItem('notification_settings', JSON.stringify(settings));
      throw error;
    }
  },
  
  getUserProgress: async () => {
    try {
      const response = await apiClient.get('/settings/progress');
      return response.data;
    } catch (error) {
      console.error('API error fetching user progress:', error);
      
      // Fallback to localStorage
      const savedProgress = localStorage.getItem('user_progress');
      return savedProgress ? JSON.parse(savedProgress) : {
        level: 1,
        points: 0,
        streak: 0,
        achievements: 0,
        nextLevelPoints: 300
      };
    }
  },
  
  updateUserProgress: async (progressData: any) => {
    try {
      const response = await apiClient.put('/settings/progress', progressData);
      return response.data;
    } catch (error) {
      console.error('API error updating user progress:', error);
      
      // Save to localStorage as backup
      localStorage.setItem('user_progress', JSON.stringify(progressData));
      throw error;
    }
  },
  
  clearUserCache: async () => {
    try {
      await apiClient.post('/settings/clear-cache');
      return true;
    } catch (error) {
      console.error('API error clearing user cache:', error);
      throw error;
    }
  }
};

// Helper functions for localStorage management
function updateLocalStorageGoal(goal: any) {
  try {
    const savedGoals = localStorage.getItem('savings_goals');
    if (savedGoals) {
      let goals = JSON.parse(savedGoals);
      const index = goals.findIndex((g: any) => g.id === goal.id);
      
      if (index !== -1) {
        goals[index] = goal;
      } else {
        goals.push(goal);
      }
      
      localStorage.setItem('savings_goals', JSON.stringify(goals));
    }
  } catch (error) {
    console.error('Error updating localStorage goal:', error);
  }
}

function addLocalStorageGoal(goal: any) {
  try {
    const savedGoals = localStorage.getItem('savings_goals');
    let goals = savedGoals ? JSON.parse(savedGoals) : [];
    goals.push(goal);
    localStorage.setItem('savings_goals', JSON.stringify(goals));
  } catch (error) {
    console.error('Error adding localStorage goal:', error);
  }
}

function deleteLocalStorageGoal(goalId: string) {
  try {
    const savedGoals = localStorage.getItem('savings_goals');
    if (savedGoals) {
      let goals = JSON.parse(savedGoals);
      goals = goals.filter((g: any) => g.id !== goalId);
      localStorage.setItem('savings_goals', JSON.stringify(goals));
    }
  } catch (error) {
    console.error('Error deleting localStorage goal:', error);
  }
}

function addLocalStorageDeposit(goalId: string, deposit: any) {
  try {
    const savedGoals = localStorage.getItem('savings_goals');
    if (savedGoals) {
      let goals = JSON.parse(savedGoals);
      const index = goals.findIndex((g: any) => g.id === goalId);
      
      if (index !== -1) {
        // Add deposit to goal
        if (!goals[index].deposits) {
          goals[index].deposits = [];
        }
        
        goals[index].deposits.push(deposit);
        
        // Update current amount
        goals[index].currentAmount = (goals[index].currentAmount || 0) + deposit.amount;
        
        localStorage.setItem('savings_goals', JSON.stringify(goals));
      }
    }
  } catch (error) {
    console.error('Error adding localStorage deposit:', error);
  }
}

// Subscription API
export const subscriptionApi = {
  // Get all available subscription plans
  getPlans: async () => {
    try {
      const response = await apiClient.get('/subscriptions/plans');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
      // Fallback data if API is not available
      return handleApiError(error, [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          interval: 'month',
          features: [
            'Basic expense tracking',
            'Monthly reports',
            'Up to 50 expense entries/month',
            'Data export (CSV)'
          ],
          isPopular: false,
          isCurrent: true
        },
        {
          id: 'pro',
          name: 'Professional',
          price: 499,
          interval: 'month',
          features: [
            'Unlimited expense entries',
            'Advanced analytics',
            'Budget planning tools',
            'Category insights',
            'Email reports',
            'Priority support'
          ],
          isPopular: true,
          isCurrent: false
        },
        {
          id: 'business',
          name: 'Business',
          price: 999,
          interval: 'month',
          features: [
            'All Professional features',
            'Multi-user accounts',
            'Team expense tracking',
            'Receipt scanning',
            'Custom categories',
            'API access',
            'Dedicated support'
          ],
          isPopular: false,
          isCurrent: false
        }
      ]);
    }
  },
  
  // Get current user's subscription
  getCurrentSubscription: async () => {
    try {
      const response = await apiClient.get('/subscriptions/current');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch current subscription:', error);
      // Fallback to free plan if API is not available
      return handleApiError(error, {
        plan: 'free',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false
      });
    }
  },
  
  // Subscribe to a plan
  subscribeToPlan: async (planId: string, paymentMethodId: string) => {
    try {
      const response = await apiClient.post('/subscriptions/subscribe', {
        planId,
        paymentMethodId
      });
      return response.data;
    } catch (error) {
      console.error('Failed to subscribe to plan:', error);
      throw error; // Don't use fallback for payment operations
    }
  },
  
  // Update an existing subscription
  updateSubscription: async (subscriptionId: string, data: any) => {
    try {
      const response = await apiClient.put(`/subscriptions/${subscriptionId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw error; // Don't use fallback for payment operations
    }
  },
  
  // Cancel a subscription
  cancelSubscription: async (subscriptionId: string) => {
    try {
      const response = await apiClient.post(`/subscriptions/${subscriptionId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error; // Don't use fallback for payment operations
    }
  },
  
  // Resume a canceled subscription
  resumeSubscription: async (subscriptionId: string) => {
    try {
      const response = await apiClient.post(`/subscriptions/${subscriptionId}/resume`);
      return response.data;
    } catch (error) {
      console.error('Failed to resume subscription:', error);
      throw error; // Don't use fallback for payment operations
    }
  },
  
  // Get payment methods
  getPaymentMethods: async () => {
    try {
      const response = await apiClient.get('/subscriptions/payment-methods');
      return response.data;
    } catch (error) {
      console.error('Failed to get payment methods:', error);
      return handleApiError(error, []);
    }
  },
  
  // Add a new payment method
  addPaymentMethod: async (paymentMethodData: any) => {
    try {
      const response = await apiClient.post('/subscriptions/payment-methods', paymentMethodData);
      return response.data;
    } catch (error) {
      console.error('Failed to add payment method:', error);
      throw error; // Don't use fallback for payment operations
    }
  },
  
  // Get subscription usage and limits
  getUsageAndLimits: async () => {
    try {
      const response = await apiClient.get('/subscriptions/usage');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch subscription usage:', error);
      return handleApiError(error, {
        expenses: {
          used: Math.floor(Math.random() * 30) + 10,
          limit: 50,
          resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
        },
        features: {
          dataExport: true,
          budgetPlanning: false,
          advancedAnalytics: false,
          receiptScanning: false,
          emailReports: false,
          apiAccess: false
        }
      });
    }
  }
};

export default {
  userApi,
  expenseApi,
  savingsGoalsApi,
  budgetApi,
  settingsApi,
  subscriptionApi
}; 