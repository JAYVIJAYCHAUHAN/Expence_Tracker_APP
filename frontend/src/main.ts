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

const app = createApp(App);

app.use(ElementPlus);
app.use(router);

app.mount("#app");
