/**
 * Notification utilities for Expense Tracker v2.0.0
 * Provides app-wide notification functionality
 */

import { ref, readonly } from 'vue';
import { ElNotification } from 'element-plus';

// Types of app notifications
export enum NotificationType {
  EXPENSE_DUE = 'expense_due',
  BUDGET_ALERT = 'budget_alert',
  REPORT_READY = 'report_ready',
  APP_UPDATE = 'app_update',
  FEATURE_TIP = 'feature_tip',
  ACHIEVEMENT = 'achievement'
}

// Notification interface
export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  actionUrl?: string;
  iconClass?: string;
}

// Internal state
const notifications = ref<AppNotification[]>([]);
const unreadCount = ref(0);

/**
 * Add a new notification
 * @param type Notification type
 * @param title Notification title
 * @param message Notification message
 * @param options Additional options
 * @returns The newly created notification
 */
export function addNotification(
  type: NotificationType,
  title: string,
  message: string,
  options: {
    actionUrl?: string;
    showToast?: boolean;
    iconClass?: string;
  } = {}
): AppNotification {
  // Generate unique ID
  const id = `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  // Create notification object
  const notification: AppNotification = {
    id,
    type,
    title,
    message,
    read: false,
    timestamp: Date.now(),
    actionUrl: options.actionUrl,
    iconClass: options.iconClass || getIconForType(type)
  };
  
  // Add to list
  notifications.value.unshift(notification);
  unreadCount.value++;
  
  // Save to local storage for persistence
  saveNotifications();
  
  // Show toast if requested
  if (options.showToast !== false) {
    showNotificationToast(notification);
  }
  
  return notification;
}

/**
 * Mark a notification as read
 * @param id Notification ID
 */
export function markAsRead(id: string): void {
  const notification = notifications.value.find(n => n.id === id);
  if (notification && !notification.read) {
    notification.read = true;
    unreadCount.value = Math.max(0, unreadCount.value - 1);
    saveNotifications();
  }
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(): void {
  notifications.value.forEach(n => {
    n.read = true;
  });
  unreadCount.value = 0;
  saveNotifications();
}

/**
 * Delete a notification
 * @param id Notification ID
 */
export function deleteNotification(id: string): void {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index !== -1) {
    const isUnread = !notifications.value[index].read;
    notifications.value.splice(index, 1);
    if (isUnread) {
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }
    saveNotifications();
  }
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): void {
  notifications.value = [];
  unreadCount.value = 0;
  saveNotifications();
}

/**
 * Load notifications from local storage
 */
export function loadNotifications(): void {
  try {
    const saved = localStorage.getItem('app_notifications');
    if (saved) {
      const parsed = JSON.parse(saved) as AppNotification[];
      notifications.value = parsed;
      unreadCount.value = parsed.filter(n => !n.read).length;
    }
  } catch (error) {
    console.error('Failed to load notifications:', error);
  }
}

/**
 * Add an achievement notification
 * @param title Achievement title
 * @param message Achievement description
 * @returns The notification object
 */
export function addAchievement(title: string, message: string): AppNotification {
  return addNotification(
    NotificationType.ACHIEVEMENT,
    `🏆 ${title}`,
    message,
    {
      showToast: true,
      iconClass: 'bi bi-trophy'
    }
  );
}

/**
 * Add a budget alert notification
 * @param category Budget category
 * @param percentUsed Percentage of budget used
 * @returns The notification object
 */
export function addBudgetAlert(category: string, percentUsed: number): AppNotification {
  return addNotification(
    NotificationType.BUDGET_ALERT,
    `Budget Alert: ${category}`,
    `You've used ${percentUsed}% of your ${category} budget this month.`,
    {
      actionUrl: '/summery',
      iconClass: 'bi bi-exclamation-triangle'
    }
  );
}

/**
 * Add a feature tip notification
 * @param feature Feature name
 * @param tip Tip about the feature
 * @param actionUrl URL to learn more or try the feature
 * @returns The notification object
 */
export function addFeatureTip(feature: string, tip: string, actionUrl?: string): AppNotification {
  return addNotification(
    NotificationType.FEATURE_TIP,
    `✨ Try ${feature}`,
    tip,
    {
      actionUrl,
      iconClass: 'bi bi-lightbulb'
    }
  );
}

// Private helper functions

function saveNotifications(): void {
  try {
    // Limit to 50 latest notifications to prevent storage bloat
    const toSave = notifications.value.slice(0, 50);
    localStorage.setItem('app_notifications', JSON.stringify(toSave));
  } catch (error) {
    console.error('Failed to save notifications:', error);
  }
}

function showNotificationToast(notification: AppNotification): void {
  ElNotification({
    title: notification.title,
    message: notification.message,
    type: getNotificationType(notification.type),
    duration: 4500,
    onClick: () => {
      markAsRead(notification.id);
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
    }
  });
}

function getIconForType(type: NotificationType): string {
  switch (type) {
    case NotificationType.EXPENSE_DUE:
      return 'bi bi-calendar-check';
    case NotificationType.BUDGET_ALERT:
      return 'bi bi-exclamation-triangle';
    case NotificationType.REPORT_READY:
      return 'bi bi-file-earmark-text';
    case NotificationType.APP_UPDATE:
      return 'bi bi-arrow-clockwise';
    case NotificationType.FEATURE_TIP:
      return 'bi bi-lightbulb';
    case NotificationType.ACHIEVEMENT:
      return 'bi bi-trophy';
    default:
      return 'bi bi-bell';
  }
}

function getNotificationType(type: NotificationType): 'success' | 'warning' | 'info' | 'error' {
  switch (type) {
    case NotificationType.ACHIEVEMENT:
      return 'success';
    case NotificationType.BUDGET_ALERT:
      return 'warning';
    case NotificationType.APP_UPDATE:
      return 'info';
    case NotificationType.EXPENSE_DUE:
      return 'error';
    default:
      return 'info';
  }
}

// Export the state as readonly to prevent external modification
export const useNotifications = () => {
  return {
    notifications: readonly(notifications),
    unreadCount: readonly(unreadCount),
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    loadNotifications,
    addAchievement,
    addBudgetAlert,
    addFeatureTip
  };
}; 