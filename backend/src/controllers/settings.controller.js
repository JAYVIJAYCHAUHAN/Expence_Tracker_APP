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
    
    // Create update object with only defined fields
    const updateObj = {};
    if (level !== undefined) updateObj['progress.level'] = level;
    if (points !== undefined) updateObj['progress.points'] = points; 
    if (streak !== undefined) updateObj['progress.streak'] = streak;
    if (nextLevelPoints !== undefined) updateObj['progress.nextLevelPoints'] = nextLevelPoints;

    // Update achievements if provided
    if (achievements && Array.isArray(achievements)) {
      updateObj['progress.achievements'] = achievements.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        icon: a.icon || 'bi-trophy',
        points: a.points || 10,
        earnedAt: a.earnedAt ? new Date(a.earnedAt) : new Date()
      }));
    }

    // Use findOneAndUpdate to avoid version conflicts
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updateObj },
      { new: true }
    );

    if (!updatedSettings) {
      return res.status(404).json({ message: 'User settings not found' });
    }

    // Format achievements for response
    const formattedAchievements = updatedSettings.progress.achievements.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      icon: a.icon,
      points: a.points,
      earnedAt: a.earnedAt.getTime()
    }));

    return res.status(200).json({
      level: updatedSettings.progress.level,
      points: updatedSettings.progress.points,
      streak: updatedSettings.progress.streak,
      achievements: formattedAchievements,
      nextLevelPoints: updatedSettings.progress.nextLevelPoints
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
  
    // Get user ID from authenticated request
    const userId = req.user.id;

    // Clear any cached settings from memory/cache store
    // This is where you would clear Redis/Memcached if implemented
    
    // Clear user's local settings in database
    const settings = await UserSettings.findOne({ userId });
    if (settings) {
      // Reset volatile settings to defaults
      settings.lastSyncTime = null;
      settings.temporaryPreferences = {};
      settings.cachedData = {};
      await settings.save();
    }

    // Send success response
    return res.status(200).json({ 
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
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