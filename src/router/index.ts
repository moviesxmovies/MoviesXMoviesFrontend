import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useAuthStore } from "../stores/authStore";
const authRequiredRoutes = [
  { path: "/onboarding", name: "onboarding", view: "OnBoardingView" },
  { path: "/verify-email", name: "verify-email", view: "VerifyEmailView" },
  { path: "/home", name: "home", view: "HomeView" },
  { path: "/profiles/:slug", name: "celebrity", view: "CelebrityView" },
  { path: "/users/:slug", name: "user-profile", view: "UserProfileView" },
  { path: "/users", name: "self-profile", view: "UserProfileView" },
  { path: "/movies/:slug", name: "movie-detail", view: "MovieDetailView" },
  { path: "/movie-list/:user/:slug", name: "movie-list", view: "MovieListDetailView" },
  { path: "/search", name: "search", view: "SearchView" },
];

const guestOnlyRoutes = [
  { path: "/", name: "welcome", view: "WelcomeView" },
  { path: "/login", name: "login", view: "LoginView" },
  { path: "/signup", name: "signup", view: "SignupView" },
  { path: "/accounts/google/login/callback/", name: "oauth-callback", view: "OauthCallbackView" },
];
const routes: Array<RouteRecordRaw> = [
  ...authRequiredRoutes.map(r => ({
    path: r.path,
    name: r.name,
    component: () => import(`../views/${r.view}.vue`),
    meta: { requiresAuth: true }
  })),
  ...guestOnlyRoutes.map(r => ({
    path: r.path,
    name: r.name,
    component: () => import(`../views/${r.view}.vue`),
    meta: { forbiddenWhenAuthenticated: true }
  })),
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
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../views/NotFoundView.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

const ONBOARDING_PATHS = ["/login", "/signup", "/verify-email", "/onboarding"];

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const user = authStore.user;

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next("/login");
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
    if (user.verified && user.boarded && ONBOARDING_PATHS.includes(to.path)) {
      return next("/");
    }
  }

  next();
});