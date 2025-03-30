<template>
  <div class="notification-center">
    <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
      <el-button class="notification-button" @click="toggleNotifications">
        <i class="bi bi-bell"></i>
      </el-button>
    </el-badge>
    
    <div class="notification-panel" v-if="showNotifications">
      <div class="notification-header">
        <h3>Notifications</h3>
        <div class="header-actions">
          <el-button 
            v-if="unreadCount > 0" 
            type="text" 
            size="small" 
            @click="markAllAsRead"
          >
            Mark all as read
          </el-button>
          <el-button 
            type="text" 
            size="small" 
            @click="clearAllNotifications"
            v-if="notifications.length > 0"
          >
            Clear all
          </el-button>
        </div>
      </div>
      
      <div class="notification-body">
        <div v-if="notifications.length === 0" class="no-notifications">
          <i class="bi bi-bell-slash"></i>
          <p>No notifications yet</p>
        </div>
        
        <transition-group name="notification-list" tag="div" class="notification-list">
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon">
              <i :class="notification.iconClass || 'bi bi-bell'"></i>
            </div>
            <div class="notification-content">
              <h4>{{ notification.title }}</h4>
              <p>{{ notification.message }}</p>
              <div class="notification-meta">
                <span class="timestamp">{{ formatTime(notification.timestamp) }}</span>
              </div>
            </div>
            <div class="notification-actions">
              <el-button 
                type="text" 
                size="small" 
                @click.stop="deleteNotification(notification.id)"
              >
                <i class="bi bi-x"></i>
              </el-button>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useNotifications, type AppNotification } from '@/utils/notification';
import { useRouter } from 'vue-router';

const router = useRouter();
const {
  notifications: notificationsRef,
  unreadCount: unreadCountRef,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  loadNotifications
} = useNotifications();

const showNotifications = ref(false);
const notifications = computed(() => notificationsRef.value);
const unreadCount = computed(() => unreadCountRef.value);

// Check if user is logged in
const isLoggedIn = computed(() => !!localStorage.getItem('token'));

// Close panel when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (showNotifications.value) {
    const panel = document.querySelector('.notification-center');
    if (panel && !panel.contains(target)) {
      showNotifications.value = false;
    }
  }
};

// Toggle notification panel
const toggleNotifications = () => {
  // Only show notifications if logged in
  if (!isLoggedIn.value) {
    return;
  }
  showNotifications.value = !showNotifications.value;
};

// Format timestamp to relative time
const formatTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  // Less than a minute
  if (diff < 60 * 1000) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  
  // Less than a day
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  // Less than a week
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  
  // Format as date
  const date = new Date(timestamp);
  return date.toLocaleDateString();
};

// Handle notification click
const handleNotificationClick = (notification: AppNotification) => {
  markAsRead(notification.id);
  
  if (notification.actionUrl) {
    router.push(notification.actionUrl);
  }
  
  showNotifications.value = false;
};

onMounted(() => {
  // Load saved notifications only if logged in
  if (isLoggedIn.value) {
    loadNotifications();
  }
  
  // Add click outside listener
  document.addEventListener('click', handleClickOutside);
});

// Watch for login state changes
watch(() => isLoggedIn.value, (newValue) => {
  if (newValue) {
    loadNotifications();
  } else {
    // Hide notifications panel if shown
    showNotifications.value = false;
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.notification-center {
  position: relative;
  display: inline-block;
}

.notification-badge {
  margin-right: 10px;
}

.notification-button {
  padding: 8px;
  font-size: 1.2rem;
  background: transparent;
  border: none;
  color: #555;
  cursor: pointer;
  transition: color 0.3s;
}

.notification-button:hover {
  color: #00c4cc;
}

.notification-panel {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  width: 320px;
  max-height: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideDown 0.2s ease-out;
}

.notification-header {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(to right, #f9f9f9, #fff);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.notification-body {
  flex: 1;
  overflow-y: auto;
  max-height: 350px;
}

.no-notifications {
  padding: 30px 20px;
  text-align: center;
  color: #999;
}

.no-notifications i {
  font-size: 2rem;
  margin-bottom: 10px;
  opacity: 0.5;
}

.notification-list {
  padding: 8px 0;
}

.notification-item {
  padding: 12px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: #f9f9f9;
}

.notification-item.unread {
  background-color: rgba(0, 196, 204, 0.05);
}

.notification-item.unread::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #00c4cc, #7209b7);
}

.notification-icon {
  font-size: 1.2rem;
  color: #00c4cc;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-content h4 {
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-content p {
  margin: 0 0 8px 0;
  font-size: 0.85rem;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notification-meta {
  font-size: 0.8rem;
  color: #999;
}

.notification-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

/* Animations */
.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.3s;
}

.notification-list-enter-from,
.notification-list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes slideDown {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .notification-panel {
    width: 300px;
    right: -120px;
  }
  
  .notification-panel::before {
    content: '';
    position: absolute;
    top: -8px;
    right: 130px;
    width: 16px;
    height: 16px;
    background: white;
    transform: rotate(45deg);
    box-shadow: -2px -2px 5px rgba(0, 0, 0, 0.04);
  }
}

@media (max-width: 480px) {
  .notification-panel {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-height: 80vh;
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.15);
    animation: slideUp 0.3s ease-out;
    z-index: 2000; /* Higher z-index to ensure it appears above other elements */
  }
  
  .notification-panel::before {
    display: none;
  }
  
  .notification-header {
    padding: 16px;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
  }
  
  .notification-body {
    max-height: calc(80vh - 60px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .notification-item {
    padding: 16px;
  }
  
  .notification-actions {
    opacity: 1; /* Always show delete button on mobile */
  }
  
  .no-notifications {
    padding: 40px 20px;
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
}
</style> 