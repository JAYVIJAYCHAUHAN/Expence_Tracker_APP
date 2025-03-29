import { createRouter, createWebHistory } from "vue-router";
import Home from "@/Views/Home.vue";
import Summery from "@/Views/Summery.vue";
import Report from "@/Views/Report.vue";
import AppLayout from "@/Views/layouts/AppLayout.vue";
import Login from '@/components/Login.vue';
import SignUp from '@/components/SignUp.vue';
import Dashboard from '@/Views/Dashboard.vue';
import Profile from '@/components/Profile.vue';
import Expence from "@/Views/Expence.vue";
import About from "@/Views/About.vue";
import Settings from "@/Views/Settings.vue";

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
      {
        path: "dashboard",
        name: "Dashboard",
        component: Dashboard,
        meta: { requiresAuth: true }
      },
      {
        path: "summery",
        name: "Summery",
        component: Summery,
        meta: { requiresAuth: true }
      },
      {
        path: "report",
        name: "Report",
        component: Report,
        meta: { requiresAuth: true }
      },
      {
        path: "expence",
        name: "Expence",
        component: Expence,
        meta: { requiresAuth: true }
      },
      {
        path: "profile",
        name: "Profile",
        component: Profile,
        meta: { requiresAuth: true }
      },
      {
        path: "about",
        name: "About",
        component: About,
        meta: { title: 'About Expense Tracker' }
      },
      {
        path: "settings",
        name: "Settings",
        component: Settings,
        meta: { requiresAuth: true, title: 'Settings' }
      }
    ],
  },
  {
    path: "/signup",
    name: "SignUp",
    component: SignUp,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: '/subscription',
    name: 'Subscription',
    component: () => import('@/Views/Subscription.vue'),
    meta: {
      requiresAuth: true,
      title: 'Subscription Plans'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global login modal state management
import { useLoginModal } from '@/composables/useLoginModal';

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  // Set document title based on route meta
  if (to.meta.title) {
    document.title = `${to.meta.title} | Expense Tracker`;
  } else {
    document.title = 'Expense Tracker';
  }
  
  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      // For programmatic navigation, use the global login modal instead of redirecting
      if (from.name) {
        // Only if we're navigating from another page (not initial load)
        const { openLoginModal } = useLoginModal();
        openLoginModal(to.fullPath);
        next(false); // Abort the navigation
      } else {
        // On initial app load or direct URL access, redirect to login
        next('/login');
      }
    } else {
      next(); // Authenticated, proceed
    }
  } else {
    next(); // No auth required, proceed
  }
});

export default router;
