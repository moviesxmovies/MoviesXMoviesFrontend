<script setup lang="ts">
import { useToast } from "primevue/usetoast";
import { ref, onMounted } from "vue";

interface ToastMessage {
    id: number;
    severity: "success" | "error" | "warn" | "info";
    summary: string;
    detail?: string;
    life?: number;
}

const toasts = ref<ToastMessage[]>([]);
let idCounter = 0;

const icons: Record<string, string> = {
    success: `<svg width="11" height="11" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    error: `<svg width="11" height="11" viewBox="0 0 10 10" fill="none"><path d="M2.5 2.5L7.5 7.5M7.5 2.5L2.5 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    warn: `<svg width="11" height="11" viewBox="0 0 10 10" fill="none"><path d="M5 2v4M5 7.5v.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    info: `<svg width="11" height="11" viewBox="0 0 10 10" fill="none"><path d="M5 4.5V8M5 2.5v.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
};

const accents: Record<string, string> = {
    success: "var(--success)",
    error: "var(--danger)",
    warn: "var(--warning)",
    info: "var(--primary)",
};

function addToast(msg: Omit<ToastMessage, "id">) {
    const id = ++idCounter;
    toasts.value.push({ ...msg, id });
    const life = msg.life ?? 3500;
    setTimeout(() => removeToast(id), life);
}

function removeToast(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
}

const toastService = useToast();

defineExpose({ addToast });

onMounted(() => {
    toastService.add.bind(toastService);
    toastService.add = (msg: any) => {
        addToast({
            severity: msg.severity ?? "info",
            summary: msg.summary ?? "",
            detail: msg.detail,
            life: msg.life,
        });
    };
});
</script>

<template>
    <Teleport to="body">
        <div class="toast-stack" aria-live="polite" aria-atomic="false">
            <TransitionGroup name="toast">
                <div v-for="toast in toasts" :key="toast.id" class="toast-card"
                    :role="toast.severity === 'error' ? 'alert' : 'status'"
                    :style="{ '--accent-color': accents[toast.severity] }">
                    <!-- Left stripe -->
                    <span class="toast-stripe" />

                    <!-- Icon -->
                    <span class="toast-icon" aria-hidden="true" v-html="icons[toast.severity]" />

                    <!-- Text -->
                    <div class="toast-body">
                        <span class="toast-summary">{{ toast.summary }}</span>
                        <span v-if="toast.detail" class="toast-detail">{{ toast.detail }}</span>
                    </div>

                    <!-- Close -->
                    <button class="toast-close" @click="removeToast(toast.id)" :aria-label="$t('toast.close')">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" stroke-width="1.6"
                                stroke-linecap="round" />
                        </svg>
                    </button>

                    <!-- Progress bar -->
                    <div class="toast-progress">
                        <div class="toast-progress-bar" :style="{ animationDuration: (toast.life ?? 3500) + 'ms' }" />
                    </div>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<style scoped>
/* ── STACK ── */
.toast-stack {
    position: fixed;
    top: 4.5rem;
    right: 1.5rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
    width: 360px;
    max-width: calc(100vw - 2rem);
}

/* ── CARD ── */
.toast-card {
    position: relative;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 1rem 1rem 1.25rem 1rem;
    overflow: hidden;
    pointer-events: all;
    font-family: var(--font-sans);
}

/* ── STRIPE ── */
.toast-stripe {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--accent-color);
}

/* ── ICON ── */
.toast-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--accent-color) 16%, transparent);
    color: var(--accent-color);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

/* ── BODY ── */
.toast-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.toast-summary {
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--text);
    line-height: 1.35;
}

.toast-detail {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--text-muted);
    line-height: 1.5;
    word-break: break-word;
}

/* ── CLOSE ── */
.toast-close {
    background: transparent;
    border: none;
    color: var(--text-subtle);
    cursor: pointer;
    border-radius: var(--radius-sm);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: color 0.15s, background-color 0.15s;
}

.toast-close:hover {
    color: var(--text);
    background: var(--surface-hover);
}

/* ── PROGRESS BAR ── */
.toast-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--surface-2);
    overflow: hidden;
}

.toast-progress-bar {
    height: 100%;
    width: 100%;
    background: var(--accent-color);
    transform-origin: left;
    animation: progress-shrink linear forwards;
    animation-duration: inherit;
}

@keyframes progress-shrink {
    from {
        transform: scaleX(1);
    }

    to {
        transform: scaleX(0);
    }
}

/* ── TRANSITIONS ── */
.toast-enter-active {
    transition: opacity 0.3s var(--var(--ease));
}

.toast-leave-active {
    transition: background-color, border-color, color, opacity, transform 0.2s var(--ease);
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(24px) scale(0.97);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(24px) scale(0.95);
}

/* ── MOBILE ── */
@media (max-width: 480px) {
    .toast-stack {
        top: auto;
        bottom: 1rem;
        right: 1rem;
        left: 1rem;
        width: auto;
    }
}
</style>
