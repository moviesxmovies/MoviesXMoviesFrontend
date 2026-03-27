import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useAuthStore } from "../stores/authStore";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/accounts/google/login/callback/",
    component: () => import("../views/OauthCallbackView.vue"),
  },
  {
    path: "/onboarding",
    component: () => import("../views/OnBoardingView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/verify-email",
    component: () => import("../views/VerifyEmailView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    component: () => import("../views/LoginView.vue"),
    name: "login",
  },
  {
    path: "/signup",
    component: () => import("../views/SignupView.vue"),
  },
  {
    path: "/home",
    component: () => import("../views/HomeView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/",
    component: () => import("../views/WelcomeView.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("../views/NotFoundView.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const user = authStore.user;

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ path: "/login" });
  }

  if (user) {
    if (!user.verified && to.path !== "/verify-email") {
      return next("/verify-email");
    }
    if (user.verified && !user.boarded && to.path !== "/onboarding") {
      return next("/onboarding");
    }
    if (
      user.verified &&
      user.boarded &&
      (to.path === "/login" ||
        to.path === "/signup" ||
        to.path === "/verify-email" ||
        to.path === "/onboarding")
    ) {
      return next("/");
    }
  }

  next();
});
