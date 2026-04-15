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
                <img src="/favicon.svg" alt="Logo" />
            </span>
            <span class="logo-text">Movies<span class="logo-x">×</span>Movies</span>
        </div>

        <div class="nav-right desktop-only">
            <LangComponent />
            <ThemeComponent />
            <button class="btn-ghost" @click="router.push('/profile')" v-if="authStore.isAuthenticated">
                <span class="pi pi-user"></span>
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
                    <div class="mobile-controls-row">
                        <div class="theme-wrapper">
                            <ThemeComponent />
                        </div>
                        <LangComponent />
                    </div>

                    <button class="btn-ghost" @click="navigate('/profile')" v-if="authStore.isAuthenticated">
                        <span class="pi pi-user" style="margin-right: 8px;"></span>
                        {{ $t("home.profile") || "Mi Perfil" }}
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

.nav-right {
    display: flex;
    align-items: center;
    gap: 10px;
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
</style>