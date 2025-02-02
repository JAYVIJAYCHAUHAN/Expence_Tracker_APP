import SignUp  from '@/components/SignUp.vue';
import { createRouter, createWebHistory } from "vue-router";
import Home from "@/Views/Home.vue";
import Summery from "@/Views/Summery.vue";
import Report from "@/Views/Report.vue";
import Expence from "@/Views/Expence.vue";
import AppLayout from "../Views/layouts/AppLayout.vue";
import Login from '@/components/Login.vue';
const routes = [
  {
    path: "/",
    name: "AppLayout",
    component: AppLayout,
    children: [
      {
        path: "/",
        name: "Home",
        component: Home,
      },
    ],
  },
  {
    path: "/summery",
    name: "Summery",
    component: Summery,
  },
  {
    path: "/report",
    name: "Report",
    component: Report,
  },
  {
    path: "/expence",
    name: "Expence",
    component: Expence,
  },
  {
    path:"/signup",
    name:"SignUp",
    component:SignUp,

  },
  {
    path:"/login",
    name:"Login",
    component:Login,

  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
