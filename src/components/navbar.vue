<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref } from "vue";
import LangComponent from "./langComponent.vue";
import ThemeComponent from "./themeComponent.vue";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const authStore = useAuthStore();
const menuOpen = ref(false);

const toggleMenu = () => {
    menuOpen.value = !menuOpen.value;
};

const navigate = (path: string) => {
    router.push(path);
    menuOpen.value = false;
};
</script>

<template>
    <nav class="nav">
        <div class="nav-logo" @click="router.push('/')" style="cursor: pointer;">
            <span class="logo-icon">
                <img src="/favicon.svg" alt="Logo"/>
            </span>
            <span class="logo-text">Movies<span class="logo-x">×</span>Movies</span>
        </div>

        <div class="nav-right desktop-only">
            <LangComponent />
            <ThemeComponent />
            <button class="btn-ghost" @click="router.push('/profile')" v-if="authStore.isAuthenticated">
                {{ $t("home.profile") }}
            </button>
            <button class="btn-ghost" @click="router.push('/login')" v-else>
                {{ $t("home.login") }}
            </button>
        </div>

        <button class="hamburger mobile-only" @click="toggleMenu" :class="{ open: menuOpen }"
            :aria-label="menuOpen ? 'Cerrar menú' : 'Abrir menú'">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <Transition name="slide">
            <div class="mobile-menu" v-if="menuOpen">
                <div class="mobile-menu-items">
                    <div class="theme-wrapper">
                        <ThemeComponent />
                    </div>
                    <LangComponent />
                    <button class="btn-ghost" @click="navigate('/profile')" v-if="authStore.isAuthenticated">
                        {{ $t("home.profile") }}
                    </button>
                    <button class="btn-ghost" @click="navigate('/login')" v-else>
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
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

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
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.45rem;
    letter-spacing: 0.04em;
    color: var(--text);
    line-height: 1;
}

.logo-x {
    color: var(--accent);
    margin: 0 1px;
}

.nav-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-grow: 1;
    justify-content: flex-end;
}

.btn-ghost {
    background: color-mix(in srgb, var(--text) 15%, transparent);
    border: 0.5px solid rgba(47, 39, 206, 0.2);
    color: var(--text);
    padding: 0.45rem 1.1rem;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    height: 2.5rem;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.btn-ghost:hover {
    border-color: var(--primary);
}

.theme-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Hamburger button */
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
    transition: transform 0.25s ease, opacity 0.25s ease, width 0.25s ease;
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

/* Mobile menu dropdown */
.mobile-menu {
    position: fixed;
    top: 0;
    right: 0;
    width: min(280px, 85vw);
    height: 100dvh;
    background: var(--background, #fff);
    border-left: 0.5px solid rgba(47, 39, 206, 0.15);
    z-index: 100;
    padding: 5rem 1.5rem 2rem;
    box-sizing: border-box;
}

.mobile-menu-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

.mobile-menu-items button {
    width: 100%;
    justify-content: center;
}

/* Overlay */
.overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 99;
}

/* Transitions */
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

/* Responsive breakpoints */
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
</style>