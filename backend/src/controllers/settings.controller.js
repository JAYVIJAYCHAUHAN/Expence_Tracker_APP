const UserSettings = require('../models/UserSettings');
const mongoose = require('mongoose');

/**
 * Ensure user settings exist for the current user
 */
const ensureUserSettings = async (userId) => {
  try {
    let settings = await UserSettings.findOne({ userId });
    
    if (!settings) {
      settings = new UserSettings({
        userId,
        features: {
          savingsGoals: false,
          budgetTips: false,
          dataExport: false,
          progressTracking: true
        },
        notifications: {
          budgetAlerts: true,
          achievementNotifications: true,
          featureTips: true
        },
        progress: {
          level: 1,
          points: 0,
          streak: 0,
          achievements: []
        },
        appearance: {
          compactView: false
        }
      });
      
      await settings.save();
    }
    
    return settings;
  } catch (error) {
    console.error('Error ensuring user settings:', error);
    throw error;
  }
};

/**
 * Get feature settings for the current user
 */
const getFeatureSettings = async (req, res) => {
  try {
    const settings = await ensureUserSettings(req.user.userId);
    
    return res.status(200).json({
      savingsGoals: settings.features.savingsGoals,
      budgetTips: settings.features.budgetTips,
      dataExport: settings.features.dataExport,
      progressTracking: settings.features.progressTracking
    });
  } catch (error) {
    console.error('Error fetching feature settings:', error);
    return res.status(500).json({ message: 'Failed to fetch feature settings' });
  }
};

/**
 * Save feature settings for the current user
 */
const saveFeatureSettings = async (req, res) => {
  try {
    const { savingsGoals, budgetTips, dataExport, progressTracking } = req.body;
    
    // Get or create settings
    const settings = await ensureUserSettings(req.user.userId);
    
    // Update feature settings
    settings.features.savingsGoals = savingsGoals !== undefined ? savingsGoals : settings.features.savingsGoals;
    settings.features.budgetTips = budgetTips !== undefined ? budgetTips : settings.features.budgetTips;
    settings.features.dataExport = dataExport !== undefined ? dataExport : settings.features.dataExport;
    settings.features.progressTracking = progressTracking !== undefined ? progressTracking : settings.features.progressTracking;
    
    await settings.save();
    
    return res.status(200).json({
      savingsGoals: settings.features.savingsGoals,
      budgetTips: settings.features.budgetTips,
      dataExport: settings.features.dataExport,
      progressTracking: settings.features.progressTracking
    });
  } catch (error) {
    console.error('Error saving feature settings:', error);
    return res.status(500).json({ message: 'Failed to save feature settings' });
  }
};

/**
 * Toggle a specific feature for the current user
 */
const toggleFeature = async (req, res) => {
  try {
    const { feature } = req.params;
    const { enabled } = req.body;
    
    // Validate feature name
    const validFeatures = ['savingsGoals', 'budgetTips', 'dataExport', 'progressTracking'];
    
    if (!validFeatures.includes(feature)) {
      return res.status(400).json({ message: 'Invalid feature name' });
    }
    
    // Get or create settings
    const settings = await ensureUserSettings(req.user.userId);
    
    // Update feature
    settings.features[feature] = enabled;
    
    await settings.save();
    
    return res.status(200).json({
      feature,
      enabled: settings.features[feature]
    });
  } catch (error) {
    console.error('Error toggling feature:', error);
    return res.status(500).json({ message: 'Failed to toggle feature' });
  }
};

/**
 * Get notification settings for the current user
 */
const getNotificationSettings = async (req, res) => {
  try {
    const settings = await ensureUserSettings(req.user.userId);
    
    return res.status(200).json({
      budgetAlerts: settings.notifications.budgetAlerts,
      achievementNotifications: settings.notifications.achievementNotifications,
      featureTips: settings.notifications.featureTips
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return res.status(500).json({ message: 'Failed to fetch notification settings' });
  }
};

/**
 * Save notification settings for the current user
 */
const saveNotificationSettings = async (req, res) => {
  try {
    const { budgetAlerts, achievementNotifications, featureTips } = req.body;
    
    // Get or create settings
    const settings = await ensureUserSettings(req.user.userId);
    
    // Update notification settings
    settings.notifications.budgetAlerts = budgetAlerts !== undefined ? budgetAlerts : settings.notifications.budgetAlerts;
    settings.notifications.achievementNotifications = achievementNotifications !== undefined ? achievementNotifications : settings.notifications.achievementNotifications;
    settings.notifications.featureTips = featureTips !== undefined ? featureTips : settings.notifications.featureTips;
    
    await settings.save();
    
    return res.status(200).json({
      budgetAlerts: settings.notifications.budgetAlerts,
      achievementNotifications: settings.notifications.achievementNotifications,
      featureTips: settings.notifications.featureTips
    });
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return res.status(500).json({ message: 'Failed to save notification settings' });
  }
};

/**
 * Get user progress for the current user
 */
const getUserProgress = async (req, res) => {
  try {
    const settings = await ensureUserSettings(req.user.userId);
    
    // Format achievements to match frontend expectations
    const achievements = settings.progress.achievements.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      icon: a.icon,
      points: a.points,
      earnedAt: a.earnedAt.getTime()
    }));
    
    return res.status(200).json({
      level: settings.progress.level,
      points: settings.progress.points,
      streak: settings.progress.streak,
      achievements,
      nextLevelPoints: settings.progress.nextLevelPoints
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return res.status(500).json({ message: 'Failed to fetch user progress' });
  }
};

/**
 * Update user progress for the current user
 */
const updateUserProgress = async (req, res) => {
  try {
    const { level, points, streak, achievements, nextLevelPoints } = req.body;
    
    // Get or create settings
    const settings = await ensureUserSettings(req.user.userId);
    
    // Update progress
    if (level !== undefined) settings.progress.level = level;
    if (points !== undefined) settings.progress.points = points;
    if (streak !== undefined) settings.progress.streak = streak;
    if (nextLevelPoints !== undefined) settings.progress.nextLevelPoints = nextLevelPoints;
    
    // Update achievements if provided
    if (achievements && Array.isArray(achievements)) {
      // Convert achievements to the format expected by the model
      settings.progress.achievements = achievements.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        icon: a.icon || 'bi-trophy',
        points: a.points || 10,
        earnedAt: a.earnedAt ? new Date(a.earnedAt) : new Date()
      }));
    }
    
    await settings.save();
    
    // Format achievements for response
    const formattedAchievements = settings.progress.achievements.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      icon: a.icon,
      points: a.points,
      earnedAt: a.earnedAt.getTime()
    }));
    
    return res.status(200).json({
      level: settings.progress.level,
      points: settings.progress.points,
      streak: settings.progress.streak,
      achievements: formattedAchievements,
      nextLevelPoints: settings.progress.nextLevelPoints
    });
  } catch (error) {
    console.error('Error updating user progress:', error);
    return res.status(500).json({ message: 'Failed to update user progress' });
  }
};

/**
 * Clear user cache (dummy implementation for now)
 */
const clearUserCache = async (req, res) => {
  try {
    // In a real implementation, this would clear any server-side caches
    // For now, it's just a dummy response
    
    return res.status(200).json({
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return res.status(500).json({ message: 'Failed to clear cache' });
  }
};

module.exports = {
  getFeatureSettings,
  saveFeatureSettings,
  toggleFeature,
  getNotificationSettings,
  saveNotificationSettings,
  getUserProgress,
  updateUserProgress,
  clearUserCache
}; 