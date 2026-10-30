<script setup lang="ts">
import { Button, useToast } from 'primevue';
import HomeView from './HomeView.vue';
import { ref } from 'vue';
import { completeBoarding } from '@/repositories/boardingRepository';
import { useRouter } from 'vue-router';

const currentStep = ref(0);
const router = useRouter();
const toast = useToast();
const stepCard = ref<HTMLElement | null>(null);
let previousAnimationElement: HTMLElement | null = null;

const handleFinish = () => {
    completeBoarding().then(() => {
        router.push('/');
    }).catch((error) => {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.detail || 'An error occurred while completing onboarding.',
            life: 5000,
        });
    });
};

const handleAnimation = (targetId: string) => {
    if (previousAnimationElement) {
        previousAnimationElement.classList.remove('animate-boarding');
    }
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.classList.add('animate-boarding');
        previousAnimationElement = targetElement;
    }
};

const handleContinue = () => {
    if (currentStep.value < steps.length - 1) {
        currentStep.value++;
        const currentStepData = steps[currentStep.value];
        if (!currentStepData) return;
        const currentTargetId = currentStepData.targetId;
        handleAnimation(currentTargetId);
    } else {
        handleFinish();
    }
};

const steps = [
    { id: 'step1', targetId: 'welcome' },
    { id: 'step2', targetId: 'stars' },
    { id: 'step3', targetId: 'add-to-list-button' },
    { id: 'step4', targetId: 'unseen-button' },
    { id: 'step5', targetId: 'more-info' },
    { id: 'step6', targetId: 'mainSwipe' },
];
</script>

<template>
    <div class="relative w-full h-screen overflow-hidden">
        <div class="onboarding-overlay">

            <button @click="handleFinish" class="skip-button">
                {{ $t("onboarding.skip") }}
                <span class="pi pi-step-forward" aria-hidden="true"></span>
            </button>

            <div class="step-card pos-top-left">
                <div class="card-inner">
                    <div class="card-header">
                        <div class="card-badge">
                            <span class="badge-dot" aria-hidden="true" />
                            <Transition name="fade" mode="out-in">
                                <span :key="currentStep">{{ $t(`onboarding.step${currentStep + 1}Label`) || "Onboarding"
                                }}</span>
                            </Transition>
                        </div>
                        <span class="card-eyebrow">
                            <Transition name="fade" mode="out-in">
                                <span id="step-span" :key="currentStep">{{ currentStep + 1 }} / {{ steps.length
                                    }}</span>
                            </Transition>
                        </span>
                    </div>

                    <Transition name="fade" mode="out-in">
                        <p :key="currentStep" class="card-text">{{ $t(`onboarding.step${currentStep + 1}`) }}</p>
                    </Transition>

                    <div class="step-indicator">
                        <span v-for="(s, i) in steps" :key="i" :class="['step-dot',
                            i === currentStep ? 'dot-active' :
                                i < currentStep ? 'dot-past' : 'dot-future']" />
                    </div>

                    <Button id="continue-button" :label="currentStep === steps.length - 1
                        ? $t('onboarding.finish')
                        : $t('onboarding.continue')" class="pointer-events-auto" @click="handleContinue" />

                    <p class="card-hint">{{ $t("onboarding.hint") }}</p>
                </div>
            </div>

        </div>

        <div class="no-cursor-interactions h-full w-full">
            <HomeView />
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s var(--ease), transform 0.25s var(--ease);
}

.fade-enter-from {
    opacity: 0;
    transform: translateY(4px);
}

.fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

.no-cursor-interactions {
    pointer-events: none;
    user-select: none;
}

.onboarding-overlay {
    position: absolute;
    inset: 0;
    z-index: 1000;
    pointer-events: auto;
    background: color-mix(in srgb, var(--background) 35%, transparent);
}

.skip-button {
    position: absolute;
    top: 5rem;
    right: 2rem;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
    z-index: 20;
    background: var(--surface);
    border: 1px solid var(--border-strong);
    color: var(--text-muted);
    box-shadow: var(--shadow-md);
}

.skip-button .pi {
    font-size: 0.75rem;
}

.skip-button:hover {
    border-color: var(--border-strong);
    color: var(--primary);
}

.step-card {
    position: absolute;
    pointer-events: none;
    z-index: 15;
    transition: top 0.4s var(--var(--ease)),
        left 0.4s cubic-bezier(0.25, 0.8, 0.25, 1),
        transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.pos-top-left {
    top: 30%;
    left: 20%;
    transform: translate(-50%, -50%);
}

.card-inner {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    padding: 1.5rem 1.5rem 1.25rem;
    width: 360px;
    max-width: 90vw;
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
    pointer-events: auto;
    transition: opacity 0.4s var(--var(--ease));
    overflow: hidden;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.card-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--primary-soft);
    color: var(--primary);
    border-radius: var(--radius-md);
    padding: 4px 12px;
    font-size: 0.8125rem;
    font-weight: 500;
}

.badge-dot {
    width: 7px;
    height: 7px;
    background: var(--primary);
    border-radius: 50%;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.4;
        transform: scale(0.6);
    }
}

.card-eyebrow {
    font-family: var(--font-sans);
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--text-subtle);
}

.card-text {
    font-family: var(--font-sans);
    font-size: 1rem;
    font-weight: 400;
    color: var(--text);
    line-height: 1.6;
    margin-bottom: 1.25rem;
}

.step-indicator {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 1rem;
}

.step-dot {
    height: 6px;
    border-radius: 999px;
    transition: background 0.3s, width 0.3s;
    width: 6px;
}

.dot-active {
    background: var(--primary);
    width: 20px;
}

.dot-past {
    background: color-mix(in srgb, var(--primary) 45%, transparent);
}

.dot-future {
    background: var(--border);
}

.card-hint {
    font-family: var(--font-sans);
    font-size: 0.8125rem;
    color: var(--text-subtle);
    text-align: center;
    margin-top: 0.75rem;
    margin-bottom: 0;
}

:deep(.p-button) {
    background: var(--primary) !important;
    border: none !important;
    border-radius: var(--radius-md) !important;
    min-height: 2.75rem;
    padding: 0.75rem 1.25rem !important;
    font-family: var(--font-sans) !important;
    font-size: 0.9375rem !important;
    font-weight: 500 !important;
    color: var(--on-primary) !important;
    width: 100% !important;
}

:deep(.p-button:hover) {
    background: var(--primary-hover) !important;
}

@media (max-width: 640px) {
    .pos-top-left {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .skip-button {
        right: 1rem;
    }
}
</style>
