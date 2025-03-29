/**
 * Gamification utilities for Expense Tracker v2.0.0
 * Makes the app more engaging with achievements, streaks, and points
 */

import { ref, readonly } from 'vue';
import { addAchievement } from './notification';
import { settingsApi } from './api';

// Types of achievements
export enum AchievementType {
  FIRST_EXPENSE = 'first_expense',
  EXPENSE_STREAK = 'expense_streak',
  BUDGET_MASTER = 'budget_master',
  CATEGORY_DIVERSITY = 'category_diversity',
  SAVINGS_MILESTONE = 'savings_milestone',
  APP_USAGE = 'app_usage',
  REPORT_GENERATED = 'report_generated',
  PROFILE_COMPLETE = 'profile_complete'
}

// Interfaces
export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  earnedAt: number | null;
  level: number;
  points: number;
}

export interface UserProgress {
  points: number;
  level: number;
  streak: number;
  lastActivity: number;
  achievements: Achievement[];
}

// Initial progress state
const DEFAULT_PROGRESS: UserProgress = {
  points: 0,
  level: 1,
  streak: 0,
  lastActivity: 0,
  achievements: []
};

// Available achievements
const ACHIEVEMENTS: Record<AchievementType, Achievement[]> = {
  [AchievementType.FIRST_EXPENSE]: [
    {
      id: 'first_expense',
      type: AchievementType.FIRST_EXPENSE,
      title: 'First Steps',
      description: 'Added your first expense',
      icon: 'bi bi-receipt',
      earnedAt: null,
      level: 1,
      points: 10
    }
  ],
  [AchievementType.EXPENSE_STREAK]: [
    {
      id: 'streak_3',
      type: AchievementType.EXPENSE_STREAK,
      title: 'Habit Forming',
      description: 'Log expenses for 3 days in a row',
      icon: 'bi bi-calendar2-check',
      earnedAt: null,
      level: 1,
      points: 25
    },
    {
      id: 'streak_7',
      type: AchievementType.EXPENSE_STREAK,
      title: 'Consistent Tracker',
      description: 'Log expenses for 7 days in a row',
      icon: 'bi bi-calendar2-check',
      earnedAt: null,
      level: 2,
      points: 50
    },
    {
      id: 'streak_30',
      type: AchievementType.EXPENSE_STREAK,
      title: 'Financial Guru',
      description: 'Log expenses for 30 days in a row',
      icon: 'bi bi-calendar2-check',
      earnedAt: null,
      level: 3,
      points: 150
    }
  ],
  [AchievementType.BUDGET_MASTER]: [
    {
      id: 'under_budget_first',
      type: AchievementType.BUDGET_MASTER,
      title: 'Budget Conscious',
      description: 'Stay under budget for the first time',
      icon: 'bi bi-piggy-bank',
      earnedAt: null,
      level: 1,
      points: 30
    },
    {
      id: 'under_budget_3_months',
      type: AchievementType.BUDGET_MASTER,
      title: 'Budget Master',
      description: 'Stay under budget for 3 consecutive months',
      icon: 'bi bi-piggy-bank',
      earnedAt: null,
      level: 2,
      points: 100
    }
  ],
  [AchievementType.CATEGORY_DIVERSITY]: [
    {
      id: 'five_categories',
      type: AchievementType.CATEGORY_DIVERSITY,
      title: 'Diversified Spender',
      description: 'Track expenses across 5 different categories',
      icon: 'bi bi-tags',
      earnedAt: null,
      level: 1,
      points: 20
    },
    {
      id: 'ten_categories',
      type: AchievementType.CATEGORY_DIVERSITY,
      title: 'Category Expert',
      description: 'Track expenses across 10 different categories',
      icon: 'bi bi-tags',
      earnedAt: null,
      level: 2,
      points: 50
    }
  ],
  [AchievementType.SAVINGS_MILESTONE]: [
    {
      id: 'savings_1000',
      type: AchievementType.SAVINGS_MILESTONE,
      title: 'Saver Starter',
      description: 'Save your first 1,000',
      icon: 'bi bi-cash-coin',
      earnedAt: null,
      level: 1,
      points: 50
    },
    {
      id: 'savings_10000',
      type: AchievementType.SAVINGS_MILESTONE,
      title: 'Serious Saver',
      description: 'Save 10,000',
      icon: 'bi bi-cash-coin',
      earnedAt: null,
      level: 2,
      points: 100
    }
  ],
  [AchievementType.APP_USAGE]: [
    {
      id: 'app_usage_10',
      type: AchievementType.APP_USAGE,
      title: 'Regular User',
      description: 'Use the app 10 times',
      icon: 'bi bi-graph-up',
      earnedAt: null,
      level: 1,
      points: 15
    },
    {
      id: 'app_usage_30',
      type: AchievementType.APP_USAGE,
      title: 'Devoted User',
      description: 'Use the app 30 times',
      icon: 'bi bi-graph-up',
      earnedAt: null,
      level: 2,
      points: 40
    },
    {
      id: 'app_usage_100',
      type: AchievementType.APP_USAGE,
      title: 'Expense Tracking Pro',
      description: 'Use the app 100 times',
      icon: 'bi bi-graph-up',
      earnedAt: null,
      level: 3,
      points: 100
    }
  ],
  [AchievementType.REPORT_GENERATED]: [
    {
      id: 'first_report',
      type: AchievementType.REPORT_GENERATED,
      title: 'Report Rookie',
      description: 'Generate your first expense report',
      icon: 'bi bi-file-earmark-text',
      earnedAt: null,
      level: 1,
      points: 20
    },
    {
      id: 'ten_reports',
      type: AchievementType.REPORT_GENERATED,
      title: 'Report Expert',
      description: 'Generate 10 expense reports',
      icon: 'bi bi-file-earmark-text',
      earnedAt: null,
      level: 2,
      points: 50
    }
  ],
  [AchievementType.PROFILE_COMPLETE]: [
    {
      id: 'profile_complete',
      type: AchievementType.PROFILE_COMPLETE,
      title: 'Identity Established',
      description: 'Complete your user profile',
      icon: 'bi bi-person-badge',
      earnedAt: null,
      level: 1,
      points: 15
    }
  ]
};

// Internal state
const progress = ref<UserProgress>({ ...DEFAULT_PROGRESS });

// Load progress from backend or localStorage
const loadProgress = async (): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      loadFromLocalStorage();
      return;
    }

    // Try to load from backend
    const progressData = await settingsApi.getUserProgress();
    if (progressData) {
      progress.value.level = progressData.level || 1;
      progress.value.points = progressData.points || 0;
      progress.value.streak = progressData.streak || 0;
      progress.value.lastActivity = progressData.lastActivity || 0;
      
      // Parse achievements
      if (progressData.achievements && Array.isArray(progressData.achievements)) {
        progress.value.achievements = progressData.achievements.map((a: any) => ({
          ...a,
          earnedAt: a.earnedAt ? new Date(a.earnedAt).getTime() : null
        }));
      }
      
      // Save to localStorage as backup
      saveToLocalStorage();
    } else {
      loadFromLocalStorage();
    }
  } catch (error) {
    console.error('Failed to load progress from backend:', error);
    loadFromLocalStorage();
  }
};

// Load progress from localStorage
const loadFromLocalStorage = (): void => {
  try {
    const saved = localStorage.getItem('user_progress');
    if (saved) {
      progress.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load user progress from localStorage:', error);
  }
};

// Save progress to backend and localStorage
const saveProgress = async (): Promise<void> => {
  // Always save to localStorage as backup
  saveToLocalStorage();
  
  // Try to save to backend if logged in
  const token = localStorage.getItem('token');
  if (token) {
    try {
      await settingsApi.updateUserProgress({
        level: progress.value.level,
        points: progress.value.points,
        streak: progress.value.streak,
        achievements: progress.value.achievements,
        nextLevelPoints: progress.value.level * 100
      });
    } catch (error) {
      console.error('Failed to save progress to backend:', error);
    }
  }
};

// Save to localStorage only
const saveToLocalStorage = (): void => {
  try {
    localStorage.setItem('user_progress', JSON.stringify(progress.value));
  } catch (error) {
    console.error('Failed to save user progress to localStorage:', error);
  }
};

// Check and update streak
const updateStreak = (): void => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const lastActivity = progress.value.lastActivity;
  
  if (lastActivity === 0) {
    // First activity
    progress.value.streak = 1;
  } else {
    const lastDate = new Date(lastActivity);
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
    
    if (lastActivity === yesterday) {
      // Consecutive day
      progress.value.streak += 1;
    } else if (lastActivity < yesterday) {
      // Streak broken
      progress.value.streak = 1;
    }
    // If same day, don't update streak
  }
  
  progress.value.lastActivity = today;
  
  // Check for streak achievements
  if (progress.value.streak === 3) {
    awardAchievement('streak_3');
  } else if (progress.value.streak === 7) {
    awardAchievement('streak_7');
  } else if (progress.value.streak === 30) {
    awardAchievement('streak_30');
  }
  
  saveProgress();
};

// Award points to the user
const awardPoints = (points: number): void => {
  progress.value.points += points;
  
  // Check if user has leveled up
  const newLevel = Math.floor(progress.value.points / 100) + 1;
  if (newLevel > progress.value.level) {
    const oldLevel = progress.value.level;
    progress.value.level = newLevel;
    onLevelUp(oldLevel, newLevel);
  }
  
  saveProgress();
};

// Award an achievement to the user
const awardAchievement = (achievementId: string): boolean => {
  // Don't award achievements if user is not logged in
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }
  
  // Find the achievement
  let achievementToAward: Achievement | null = null;
  
  for (const type in ACHIEVEMENTS) {
    const achievements = ACHIEVEMENTS[type as AchievementType];
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement) {
      achievementToAward = { ...achievement };
      break;
    }
  }
  
  if (!achievementToAward) {
    console.error(`Achievement ${achievementId} not found`);
    return false;
  }
  
  // Check if already earned
  const existingIndex = progress.value.achievements.findIndex(a => a.id === achievementId);
  if (existingIndex !== -1) {
    return false; // Already earned
  }
  
  // Award the achievement
  achievementToAward.earnedAt = Date.now();
  progress.value.achievements.push(achievementToAward);
  
  // Award points
  awardPoints(achievementToAward.points);
  
  // Show notification
  addAchievement(
    achievementToAward.title,
    achievementToAward.description
  );
  
  saveProgress();
  return true;
};

// Handle level up
const onLevelUp = (oldLevel: number, newLevel: number): void => {
  addAchievement(
    `Level ${newLevel}`,
    `You've reached level ${newLevel}! Keep up the great work!`
  );
};

// Track expense added
export const trackExpenseAdded = (): void => {
  updateStreak();
  
  // Check for first expense achievement
  const firstExpenseAchievement = ACHIEVEMENTS[AchievementType.FIRST_EXPENSE][0];
  if (!progress.value.achievements.some(a => a.id === firstExpenseAchievement.id)) {
    awardAchievement(firstExpenseAchievement.id);
  }
};

// Track app usage
export const trackAppUsage = (): void => {
  // Check if user is logged in before tracking usage
  const token = localStorage.getItem('token');
  if (!token) {
    return; // Don't track usage for logged out users
  }
  
  // Increment usage count in local storage
  let usageCount = parseInt(localStorage.getItem('app_usage_count') || '0');
  usageCount += 1;
  localStorage.setItem('app_usage_count', usageCount.toString());
  
  // Check for app usage achievements
  if (usageCount === 10) {
    awardAchievement('app_usage_10');
  } else if (usageCount === 30) {
    awardAchievement('app_usage_30');
  } else if (usageCount === 100) {
    awardAchievement('app_usage_100');
  }
};

// Track report generation
export const trackReportGenerated = (): void => {
  // Increment report count in local storage
  let reportCount = parseInt(localStorage.getItem('report_generation_count') || '0');
  reportCount += 1;
  localStorage.setItem('report_generation_count', reportCount.toString());
  
  // Check for report generation achievements
  if (reportCount === 1) {
    awardAchievement('first_report');
  } else if (reportCount === 10) {
    awardAchievement('ten_reports');
  }
};

// Track profile completion
export const trackProfileComplete = (): void => {
  awardAchievement('profile_complete');
};

// Reset progress to default state
export const resetProgress = (): void => {
  progress.value = { ...DEFAULT_PROGRESS };
  localStorage.removeItem('user_progress');
  localStorage.removeItem('app_usage_count');
  
  // Try to update backend
  const token = localStorage.getItem('token');
  if (token) {
    try {
      settingsApi.updateUserProgress({
        level: 1,
        points: 0,
        streak: 0,
        achievements: [],
        nextLevelPoints: 100
      }).catch(() => {
        // Silently catch errors
        console.log('Failed to reset progress on backend');
      });
    } catch (error) {
      console.error('Failed to reset progress on backend:', error);
    }
  }
};

// Initialize
const initialize = (): void => {
  const token = localStorage.getItem('token');
  if (token) {
    loadProgress();
    trackAppUsage();
  }
};

// Export the functions and state
export const useGamification = () => {
  initialize();
  
  return {
    progress: readonly(progress),
    awardPoints,
    awardAchievement,
    trackExpenseAdded,
    trackReportGenerated,
    trackProfileComplete,
    resetProgress
  };
}; 