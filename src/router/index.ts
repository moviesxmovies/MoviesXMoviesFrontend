import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useAuthStore } from "../stores/authStore";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/accounts/google/login/callback/",
    component: () => import("../views/OauthCallbackView.vue"),
    name: "oauth-callback",
    meta: { forbiddenWhenAuthenticated: true },
  },
  {
    path: "/onboarding",
    component: () => import("../views/OnBoardingView.vue"),
    name: "onboarding",
    meta: { requiresAuth: true },
  },
  {
    path: "/verify-email",
    component: () => import("../views/VerifyEmailView.vue"),
    name: "verify-email",
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    component: () => import("../views/LoginView.vue"),
    name: "login",
    meta: { forbiddenWhenAuthenticated: true },
  },
  {
    path: "/signup",
    component: () => import("../views/SignupView.vue"),
    name: "signup",
    meta: { forbiddenWhenAuthenticated: true },
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: () => import("../views/ForgotPasswordView.vue"),
  },
  {
    path: "/reset-password",
    component: () => import("../views/ResetPasswordView.vue"),
    name: "reset-password",
  },
  {
    path: "/check-email",
    component: () => import("../views/CheckEmailView.vue"),
    name: "check-email",
  },
  {
    path: "/home",
    component: () => import("../views/HomeView.vue"),
    name: "home",
    meta: { requiresAuth: true },
  },
  {
    path: "/",
    component: () => import("../views/WelcomeView.vue"),
    name: "welcome",
    meta: { forbiddenWhenAuthenticated: true },
  },
  {
    path: "/profiles/:slug",
    component: () => import("../views/CelebrityView.vue"),
    name: "celebrity",
    meta: { requiresAuth: true },
  },
  {
    path: "/users/:slug",
    component: () => import("../views/UserProfileView.vue"),
    name: "user-profile",
    meta: { requiresAuth: true },
  },
  {
    path: "/users",
    component: () => import("../views/UserProfileView.vue"),
    name: "self-profile",
    meta: { requiresAuth: true },
  },
  {
    path: "/search",
    component: () => import("../views/SearchView.vue"),
    name: "search",
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
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

  if (to.meta.forbiddenWhenAuthenticated && authStore.isAuthenticated) {
    return next("/home");
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
