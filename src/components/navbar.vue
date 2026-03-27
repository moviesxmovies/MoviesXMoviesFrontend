<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import LangComponent from "./langComponent.vue";
import ThemeComponent from "./themeComponent.vue";
import { useAuthStore } from "@/stores/authStore";
const router = useRouter();
const authStore = useAuthStore();
const route = useRoute();
</script>

<template>
    <nav class="nav">
        <div class="nav-logo">
            <span class="logo-icon">

                <img src="/favicon.svg" alt="logo"></img>

            </span>
            <span class="logo-text">Movies<span class="logo-x">×</span>Movies</span>
        </div>

        <div class="nav-right">
            <LangComponent />
            <ThemeComponent />
            <button class="btn-ghost" @click="router.push('/profile')" v-if="authStore.isAuthenticated">
                {{ $t("home.profile") }}
            </button>
            <button class="btn-ghost" @click="router.push('/login')" v-else-if="route.name !== 'login'">
                {{ $t("home.login") }}
            </button>

        </div>
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
</style>