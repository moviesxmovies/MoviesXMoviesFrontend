<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed, onMounted, ref, watch } from "vue";
import LangComponent from "./langComponent.vue";
import ThemeComponent from "./themeComponent.vue";
import { useAuthStore } from "@/stores/authStore";
import { getFriendsRequests, getSelfUserProfile } from "@/repositories/userRepository";
import Menu from "primevue/menu";
import { useI18n } from "vue-i18n";
import { useNotificationsStore } from "@/stores/notificationStore";
import { Skeleton } from "primevue";
import { useProfileStore } from "@/stores/profileStore";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const menuOpen = ref(false);
const profilePicture = ref<string | null>(null);
const notificationsStore = useNotificationsStore();
const profileImageLoaded = ref(false);
const loadingProfile = ref(true);
const profileImageLoadedMobile = ref(false);
const profileStore = useProfileStore();
const loadProfilePicture = async () => {
  if (!authStore.isAuthenticated) {
    profilePicture.value = null;
    return;
  }
  try {
    loadingProfile.value = true;
    const profile = await getSelfUserProfile();
    profilePicture.value = profile?.picture ?? null;
  } catch {
    profilePicture.value = null;
  } finally {
    loadingProfile.value = false;
  }
};

const loadPendingFriendsRequests = async () => {
  if (!authStore.isAuthenticated) {
    notificationsStore.set(0);
    return;
  }
  try {
    const response = await getFriendsRequests();
    notificationsStore.set(response.count);
  } catch {
    notificationsStore.set(0);
  }
};

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const navigate = (path: string) => {
  router.push(path);
  menuOpen.value = false;
};

const profileMenu = ref();
const menuItems = computed(() => [
  {
    label: t("components.navbar.profile"),
    icon: "pi pi-user",
    command: () => router.push("/users"),
  },
  {
    separator: true,
  },
  {
    label: t("components.navbar.logout"),
    icon: "pi pi-sign-out",
    command: () => {
      authStore.logout();
      router.push("/");
    },
  },
]);

onMounted(() => {
  loadProfilePicture();
  loadPendingFriendsRequests();
});

watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    loadProfilePicture();
    loadPendingFriendsRequests();
  } else {
    profilePicture.value = null;
    notificationsStore.set(0);
  }
});

watch(() => profileStore.refreshKey, () => {
  profileImageLoaded.value = false;
  profileImageLoadedMobile.value = false;
  loadProfilePicture();
});
</script>

<template>
  <nav class="nav">
    <a class="nav-logo" href="/" @click.prevent="router.push('/')" aria-label="MoviesXMovies">
      <span class="logo-icon">
        <img src="/favicon.svg" alt="" />
      </span>
      <span class="logo-text">Movies<span class="logo-x">×</span>Movies</span>
    </a>

    <div class="nav-right desktop-only">
      <button id="search-btn" class="search-trigger" @click="router.push('/search')">
        <div class="search-content">
          <i class="pi pi-search search-icon" aria-hidden="true" />
          <span class="search-text">{{ $t("home.search") }}</span>
        </div>
      </button>
      <LangComponent />
      <ThemeComponent />
      <template v-if="authStore.isAuthenticated">
        <button class="btn-profile" @click="(e) => profileMenu.toggle(e)" :aria-label="$t('home.profile')" aria-haspopup="true">
          <div class="profile-wrapper">
            <Skeleton v-if="loadingProfile || !profileImageLoaded" shape="circle" width="2.5rem" height="2.5rem" />
            <img :src="profilePicture ?? ''" :alt="$t('home.profile')"
              :style="{ display: loadingProfile || !profileImageLoaded ? 'none' : 'block' }" class="btn-profile-img"
              @load="profileImageLoaded = true" />
            <span v-if="notificationsStore.pendingFriendRequests > 0" class="notification-badge">
              {{ notificationsStore.pendingFriendRequests >= 6 ? '5+' : notificationsStore.pendingFriendRequests }}
            </span>
          </div>
        </button>
        <Menu ref="profileMenu" :model="menuItems" popup class="profile-menu" appendTo="self" />
      </template>
      <button class="btn-ghost btn-login" @click="router.push('/login')" v-else>
        {{ $t("home.login") }}
      </button>
    </div>

    <button class="hamburger mobile-only" @click="toggleMenu" :class="{ open: menuOpen }"
      :aria-label="menuOpen ? $t('navbar.closeMenu') : $t('navbar.openMenu')">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <Transition name="slide">
      <div class="mobile-menu" v-if="menuOpen">
        <div class="mobile-menu-items">
          <button id="search-btn-mobile" class="btn-ghost" @click="navigate('/search')">
            <i class="pi pi-search" />
            {{ $t("home.search") }}
          </button>

          <div class="mobile-controls-row">
            <div class="theme-wrapper">
              <ThemeComponent />
            </div>
            <LangComponent />
          </div>

          <button id="profile-btn-mobile" class="btn-ghost" @click="navigate('/users')"
            v-if="authStore.isAuthenticated">
            <div class="profile-wrapper">
              <Skeleton v-if="loadingProfile || !profileImageLoadedMobile" shape="circle" width="1.5rem"
                height="1.5rem" />
              <img :src="profilePicture ?? ''" :alt="$t('home.profile')" class="btn-profile-img"
                :style="{ display: loadingProfile || !profileImageLoadedMobile ? 'none' : 'block' }"
                @load="profileImageLoadedMobile = true" />
              <span v-if="notificationsStore.pendingFriendRequests > 0"
                class="notification-badge notification-badge--sm">
                {{ notificationsStore.pendingFriendRequests >= 6 ? '5+' : notificationsStore.pendingFriendRequests }}
              </span>
            </div>
            {{ $t("home.profile") }}
          </button>
          <button id="profile-btn-mobile" class="btn-ghost btn-login" @click="navigate('/login')" v-else>
            {{ $t("home.login") }}
          </button>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div class="overlay" v-if="menuOpen" @click="menuOpen = false" />
    </Transition>
  </nav>
</template>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  height: 3.75rem;
  padding: 0 2rem;
  position: fixed;
  top: 0;
  z-index: 10;
  width: 100%;
  background: color-mix(in srgb, var(--background) 82%, transparent);
  backdrop-filter: saturate(160%) blur(14px);
  -webkit-backdrop-filter: saturate(160%) blur(14px);
  border-bottom: 1px solid var(--border);
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  cursor: pointer;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-grow: 1;
  justify-content: flex-end;
}

.btn-ghost,
.btn-login {
  height: 2.5rem;
  padding: 0 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.btn-ghost {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-ghost:hover {
  border-color: var(--primary);
  background: var(--surface-hover);
}

.btn-login {
  background: var(--primary);
  color: var(--on-primary);
  border: 1px solid transparent;
}

.btn-login:hover {
  background: var(--primary-hover);
}

.btn-profile {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  height: 2.5rem;
  width: 2.5rem;
  padding: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.btn-profile:hover {
  border-color: var(--primary);
  box-shadow: var(--focus-ring);
}

.btn-profile img,
.btn-profile-img {
  border-radius: 100%;
  object-fit: cover;
}

.btn-profile-img {
  width: 2.25rem;
  aspect-ratio: 1/1;
}

#profile-btn-mobile .btn-profile-img {
  width: 1.75rem;
  aspect-ratio: 1 / 1;
}

/* MENU */
:deep(.profile-menu.p-menu) {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 6px;
  margin-top: 8px;
  min-width: 200px;
  font-family: var(--font-sans);
}

:deep(.profile-menu .p-menu-item-link) {
  padding: 0.65rem 0.9rem;
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 0.9375rem;
  font-weight: 500;
  transition: background-color 0.1s ease, color 0.1s ease;
  gap: 10px;
}

:deep(.profile-menu .p-menu-item-link:hover) {
  background: var(--primary-soft);
  color: var(--primary);
}

:deep(.profile-menu .p-menu-item-content:focus),
:deep(.profile-menu .p-menu-item-content:focus-visible),
:deep(.profile-menu .p-menu-item-link:focus),
:deep(.profile-menu .p-menu-item-link:focus-visible) {
  outline: none !important;
  box-shadow: none !important;
}

:deep(.profile-menu .p-menu-item[data-p-focused="true"] .p-menu-item-content) {
  background: var(--primary-soft) !important;
}

:deep(.profile-menu .p-menu-item[data-p-active="true"] .p-menu-item-link),
:deep(.profile-menu .p-menu-item-link:active) {
  color: var(--primary) !important;
}

:deep(.profile-menu .p-menu-item-link .p-menu-item-icon) {
  color: inherit;
  font-size: 0.9375rem;
}

:deep(.profile-menu .p-menu-separator) {
  border-color: var(--border);
  margin: 4px 0;
}

.logo-icon {
  width: 34px;
  height: 34px;
  background: var(--primary-soft);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 4px;
}

.logo-text {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
  line-height: 1;
}

.logo-x {
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0 2px;
}

.theme-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 2.75rem;
  height: 2.75rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  padding: 0.6rem;
  flex-shrink: 0;
  position: relative;
  z-index: 101;
}

.hamburger span {
  display: block;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
  transform-origin: center;
  transition:
    transform 0.25s ease,
    opacity 0.25s ease,
    width 0.25s ease;
}

.hamburger.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.hamburger.open span:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.hamburger.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: min(320px, 88vw);
  height: 100dvh;
  background: var(--surface);
  border-left: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  padding: 5.5rem 1.25rem 2rem;
  display: flex;
  flex-direction: column;
}

.mobile-menu-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.mobile-controls-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.mobile-menu-items button,
.mobile-menu-items :deep(.lang-select) {
  width: 100% !important;
  justify-content: center;
  font-size: 1rem;
}

.mobile-menu-items .btn-ghost,
.mobile-menu-items .btn-login {
  height: 3rem;
  justify-content: flex-start;
  padding: 0 1rem;
}

.overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay);
  z-index: 99;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .nav {
    padding: 0 1rem;
  }

  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: flex;
  }
}

@media (min-width: 641px) {
  .mobile-only {
    display: none;
  }

  .desktop-only {
    display: flex;
  }
}

.search-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  height: 2.5rem;
  padding: 0 0.875rem;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
  min-width: 200px;
  gap: 12px;
}

.search-trigger:hover {
  background: var(--surface-hover);
  border-color: var(--primary);
}

.search-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-icon {
  color: var(--primary);
}

.search-text {
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-subtle);
}

.profile-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #c42020;
  color: #ffffff;
  font-size: 0.6875rem;
  font-weight: 700;
  font-family: var(--font-sans);
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid var(--background);
  line-height: 1;
}

.notification-badge--sm {
  top: -4px;
  right: -4px;
}
</style>
