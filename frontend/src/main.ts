import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";
import "./assets/theme.scss";
import { registerSW } from 'virtual:pwa-register'
import axios from 'axios';
import { setupSecureLogging, sanitizeRequestData, clearSensitiveData } from './utils/security';
import { loadNotifications } from './utils/notification';
import { Feature, useFeatureFlags } from './utils/featureFlags';
import { useGamification } from './utils/gamification';

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Dispatch custom event for the PWA update component
    window.dispatchEvent(new CustomEvent('sw-updated'));
  },
  onOfflineReady() {
    console.log('App is ready for offline use');
  },
})

// Expose the updateSW function globally
// This allows our PWA components to trigger updates
;(window as any).__updateSW = updateSW;

// App version - make it easily accessible throughout the app
const APP_VERSION = '2.0.0';
console.info(`Expense Tracker v${APP_VERSION} - Starting application`);

// Setup secure logging to prevent sensitive data exposure
setupSecureLogging();

// Initialize features
const { isFeatureEnabled } = useFeatureFlags();

// Initialize gamification if enabled and user is authenticated
if (isFeatureEnabled(Feature.ACHIEVEMENTS)) {
  // Only initialize gamification if user is authenticated
  const token = localStorage.getItem('token');
  if (token) {
    useGamification();
  }
}

// Initialize notifications if enabled
if (isFeatureEnabled(Feature.NOTIFICATIONS)) {
  loadNotifications();
}

// Configure axios for security
axios.interceptors.request.use(
  (config) => {
    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add version header
    config.headers['X-App-Version'] = APP_VERSION;
    
    // Log sanitized request (no sensitive data)
    console.info('API Request:', sanitizeRequestData(config));
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Handle response errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - clear credentials and redirect to login
    if (error.response && error.response.status === 401) {
      clearSensitiveData();
      router.push('/login');
    }
    
    // Handle 403 Forbidden - access denied
    if (error.response && error.response.status === 403) {
      console.warn('Access denied to resource');
    }
    
    return Promise.reject(error);
  }
);

const app = createApp(App);

// Make version available globally
app.config.globalProperties.$appVersion = APP_VERSION;

app.use(ElementPlus);
app.use(router);

app.mount("#app");
