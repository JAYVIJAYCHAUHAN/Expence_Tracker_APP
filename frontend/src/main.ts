import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle";
import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";
import "./assets/theme.scss";
import "element-plus/dist/index.css";
import * as ElementPlus from "element-plus";
import "bootstrap-icons/font/bootstrap-icons.css";

const app = createApp(App);

app.use(ElementPlus);
app.use(router);
app.mount("#app");
