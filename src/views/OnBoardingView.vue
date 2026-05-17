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
                <span class="pi pi-step-forward" style="font-size:10px; opacity:0.6"></span>
            </button>

            <div class="step-card pos-top-left">
                <div class="card-inner">
                    <div class="card-header">
                        <div class="card-badge">
                            <span class="badge-dot" />
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

/* ── Animaciones de Transición ── */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from {
    opacity: 0;
    transform: translateY(4px);
}

.fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

/* ── Layout ── */
.no-cursor-interactions {
    pointer-events: none;
    user-select: none;
}

.onboarding-overlay {
    position: absolute;
    inset: 0;
    z-index: 1000;
    pointer-events: auto;
}

/* ── Skip button (Base Light) ── */
.skip-button {
    position: absolute;
    top: calc(28px + 1.5rem);
    right: 3.5rem;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 20;
    background: var(--ob-card-bg);
    border: 1px solid var(--ob-card-border);
    color: var(--ob-text-muted);
}

.skip-button:hover {
    border-color: var(--primary);
    color: #000;
}

/* ── Card position ── */
.step-card {
    position: absolute;
    pointer-events: none;
    z-index: 15;
    transition: top 0.4s cubic-bezier(0.25, 0.8, 0.25, 1),
        left 0.4s cubic-bezier(0.25, 0.8, 0.25, 1),
        transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.pos-top-left {
    top: 30%;
    left: 20%;
    transform: translate(-50%, -50%);
}

/* ── Card inner (Base Light) ── */
.card-inner {
    background: var(--ob-card-bg);
    border: 1px solid var(--ob-card-border);
    border-radius: 16px;
    padding: 1.5rem 1.7rem 1.3rem;
    width: 340px;
    max-width: 90vw;
    box-shadow: var(--ob-card-shadow);
    display: flex;
    flex-direction: column;
    pointer-events: auto;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    overflow: hidden;
}

/* ── Elementos internos (Base Light) ── */
.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.card-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--ob-badge-bg);
    color: var(--primary);
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.badge-dot {
    width: 5px;
    height: 5px;
    background: var(--accent);
    border-radius: 50%;
    animation: pulse 2.2s ease-in-out infinite;
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
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ob-text-muted);
}

.card-text {
    font-family: 'DM Sans', sans-serif;
    font-size: 14.5px;
    font-weight: 400;
    color: var(--ob-text-color);
    line-height: 1.65;
    margin-bottom: 1.4rem;
}

/* ── Dots (Base Light) ── */
.step-indicator {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-bottom: 1rem;
}

.step-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    transition: background 0.3s, transform 0.3s;
}

.dot-active {
    background: var(--primary);
    transform: scale(1.4);
}

.dot-past {
    background: rgba(47, 39, 206, 0.3);
}

.dot-future {
    background: var(--ob-dot-future);
}

.card-hint {
    font-family: 'DM Sans', sans-serif;
    font-size: 11.5px;
    color: var(--ob-text-muted);
    text-align: center;
    margin-top: 0.85rem;
}



/* ── Button ── */
:deep(.p-button) {
    background: var(--primary) !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 0.65rem 1.3rem !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 13.5px !important;
    font-weight: 600 !important;
    color: #fff !important;
    width: 100% !important;
}

@media (max-width: 640px) {
    .pos-top-left {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
}
</style>