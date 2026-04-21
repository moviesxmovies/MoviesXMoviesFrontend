<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed, onMounted, ref, watch } from "vue";
import LangComponent from "./langComponent.vue";
import ThemeComponent from "./themeComponent.vue";
import { useAuthStore } from "@/stores/authStore";
import { getUserProfile } from "@/repositories/userRepository";
import Menu from "primevue/menu";
import { useI18n } from "vue-i18n";
import { useThemeStore } from "@/stores/themeStore";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const menuOpen = ref(false);
const profilePicture = ref<string | null>(null);

const loadProfilePicture = async () => {
  if (!authStore.isAuthenticated) {
    profilePicture.value = null;
    return;
  }
  try {
    const profile = await getUserProfile();
    profilePicture.value = profile?.picture ?? null;
  } catch {
    profilePicture.value = null;
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
    command: () => router.push("/profile"),
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

onMounted(loadProfilePicture);

watch(() => authStore.isAuthenticated, loadProfilePicture);
</script>

<template>
  <nav class="nav">
    <div class="nav-logo" @click="router.push('/')" style="cursor: pointer">
      <span class="logo-icon">
        <img src="/favicon.svg" alt="Logo" />
      </span>
      <span class="logo-text">Movies<span class="logo-x">×</span>Movies</span>
    </div>

    <div class="nav-right desktop-only">
      <button
        id="search-btn"
        class="search-trigger"
        @click="router.push('/search')"
      >
        <div class="search-content">
          <i
            class="pi pi-search"
            :style="{
              color:
                themeStore.theme === 'dark'
                  ? 'var(--accent)'
                  : 'var(--primary)',
            }"
          />
          <span class="search-text">{{ $t("home.search") }}</span>
        </div>
      </button>
      <LangComponent />
      <ThemeComponent />
      <template v-if="authStore.isAuthenticated">
        <button class="btn-profile" @click="(e) => profileMenu.toggle(e)">
          <img :src="profilePicture ?? ''" :alt="$t('home.profile')" />
        </button>
        <Menu
          ref="profileMenu"
          :model="menuItems"
          popup
          class="profile-menu"
          appendTo="self"
        />
      </template>
      <button class="btn-ghost" @click="router.push('/login')" v-else>
        {{ $t("home.login") }}
      </button>
    </div>

    <button
      class="hamburger mobile-only"
      @click="toggleMenu"
      :class="{ open: menuOpen }"
      :aria-label="menuOpen ? $t('navbar.closeMenu') : $t('navbar.openMenu')"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <Transition name="slide">
      <div class="mobile-menu" v-if="menuOpen">
        <div class="mobile-menu-items">
          <button
            id="search-btn-mobile"
            class="btn-ghost"
            @click="navigate('/search')"
          >
            <i class="pi pi-search" />
            {{ $t("home.search") }}
          </button>

          <div class="mobile-controls-row">
            <div class="theme-wrapper">
              <ThemeComponent />
            </div>
            <LangComponent />
          </div>

          <button
            id="profile-btn-mobile"
            class="btn-ghost"
            @click="navigate('/profile')"
            v-if="authStore.isAuthenticated"
          >
            <img
              :src="profilePicture ?? ''"
              :alt="$t('home.profile')"
              class="btn-profile-img"
            />
            {{ $t("home.profile") }}
          </button>
          <button
            id="profile-btn-mobile"
            class="btn-ghost"
            @click="navigate('/login')"
            v-else
          >
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
@import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap");

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3rem 2rem;
  position: fixed;
  top: 0;
  z-index: 10;
  width: 100%;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-grow: 1;
  justify-content: flex-end;
}

.btn-ghost {
  background: color-mix(in srgb, var(--text) 8%, transparent);
  border: 0.5px solid rgba(47, 39, 206, 0.15);
  height: 2.5rem;
  padding: 0 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-profile {
  background: color-mix(in srgb, var(--text) 8%, transparent);
  border: 0.5px solid rgba(47, 39, 206, 0.15);
  border-radius: 8px;
  height: 2.5rem;
  width: 2.5rem;
  padding: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-profile:hover {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--text) 12%, transparent);
}

.btn-profile img,
.btn-profile-img {
  width: 100%;
  height: 100%;
  border-radius: 100%;
  object-fit: cover;
}
.btn-profile-img {
  margin-right: 8px;
  height: 1.5rem;
  width: 1.5rem;
}

/* MENU */
:deep(.profile-menu.p-menu) {
  background: var(--background);
  border: 0.5px solid rgba(47, 39, 206, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  padding: 6px;
  margin-top: 8px;
  min-width: 180px;
  font-family: "DM Sans", sans-serif;
}

:deep(.profile-menu .p-menu-item-link) {
  padding: 0.6rem 1rem;
  border-radius: 8px;
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.1s ease;
  gap: 10px;
}

:deep(.profile-menu .p-menu-item-link:hover) {
  background: var(--secondary);
  color: var(--primary);
}

:deep(.profile-menu .p-menu-item-content:focus),
:deep(.profile-menu .p-menu-item-content:focus-visible),
:deep(.profile-menu .p-menu-item-link:focus),
:deep(.profile-menu .p-menu-item-link:focus-visible),
:deep(.profile-menu .p-menu-item[data-p-focused="true"] .p-menu-item-content) {
  background: transparent !important;
  outline: none !important;
  box-shadow: none !important;
}

:deep(.profile-menu .p-menu-item[data-p-active="true"] .p-menu-item-content),
:deep(.profile-menu .p-menu-item-link:active .p-menu-item-content),
:deep(.profile-menu .p-menu-item-content:active) {
  background: color-mix(in srgb, var(--primary) 15%, transparent) !important;
}

:deep(.profile-menu .p-menu-item[data-p-active="true"] .p-menu-item-link),
:deep(.profile-menu .p-menu-item-link:active) {
  color: var(--primary) !important;
}

:deep(.profile-menu .p-menu-item-link .p-menu-item-icon) {
  color: inherit;
  font-size: 0.85rem;
}

:deep(.profile-menu .p-menuitem-separator) {
  border-color: rgba(47, 39, 206, 0.1);
  margin: 4px 0;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: var(--secondary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 3px;
}

.logo-text {
  font-family: "Bebas Neue", sans-serif;
  font-size: 1.45rem;
  letter-spacing: 0.04em;
  color: var(--text);
  line-height: 1;
}

.logo-x {
  color: var(--accent);
  margin: 0 1px;
}

.btn-ghost:hover {
  border-color: var(--primary);
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
  width: 2.5rem;
  height: 2.5rem;
  background: color-mix(in srgb, var(--text) 15%, transparent);
  border: 0.5px solid rgba(47, 39, 206, 0.2);
  border-radius: 8px;
  cursor: pointer;
  padding: 0.45rem;
  flex-shrink: 0;
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
  width: min(300px, 90vw);
  height: 100dvh;
  background: color-mix(in srgb, var(--background) 95%, black);
  backdrop-filter: blur(10px);
  border-left: 1px solid rgba(47, 39, 206, 0.1);
  z-index: 100;
  padding: 6rem 1.5rem 2rem;
  display: flex;
  flex-direction: column;
}

.mobile-menu-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.mobile-controls-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 8px;
}

.mobile-menu-items button,
.mobile-menu-items :deep(.lang-select) {
  width: 100% !important;
  justify-content: center;
  background: color-mix(in srgb, var(--text) 5%, transparent) !important;
  border: 1px solid rgba(47, 39, 206, 0.1) !important;
  font-size: 0.9rem;
  letter-spacing: 0.02em;
}

.mobile-menu-items .btn-ghost {
  font-weight: 600;
  height: 3rem;
  color: var(--primary);
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
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
    padding: 0.3rem 1rem;
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
  background: color-mix(in srgb, var(--text) 5%, transparent);
  border: 0.5px solid rgba(47, 39, 206, 0.15);
  border-radius: 10px;
  height: 2.5rem;
  padding: 0 0.8rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 140px; /* Le da cuerpo de input */
  gap: 12px;
}

.search-trigger:hover {
  background: color-mix(in srgb, var(--text) 8%, transparent);
  border-color: var(--primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.search-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-text {
  font-family: "DM Sans", sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: color-mix(in srgb, var(--text) 60%, transparent);
}

.search-shortcut {
  background: color-mix(in srgb, var(--text) 10%, transparent);
  border: 1px solid rgba(47, 39, 206, 0.1);
  border-radius: 4px;
  padding: 2px 5px;
  font-size: 0.7rem;
  font-family: sans-serif;
  color: color-mix(in srgb, var(--text) 40%, transparent);
  font-weight: 600;
}
</style>
