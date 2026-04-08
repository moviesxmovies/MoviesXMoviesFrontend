<script setup lang="ts">
import { Button, useToast } from 'primevue';
import HomeView from './HomeView.vue';
import { ref } from 'vue';
import { completeBoarding } from '@/repositories/boardingRepository';
import { useRouter } from 'vue-router';

const currentStep = ref(0);
const router = useRouter();
const toast = useToast();
let previousAnimationElement: HTMLElement | null = null;

const handleFinish = () => {
    completeBoarding().then(() => {
        console.log('Onboarding completed successfully');
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
    console.log('Animating element with ID:', targetId, 'Found element:', targetElement);
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
    { id: 'step1', positionClass: 'pos-bottom-left', targetId: 'welcome' },
    { id: 'step2', positionClass: 'pos-top-left', targetId: 'stars' },
    { id: 'step3', positionClass: 'pos-top-center', targetId: 'add-to-list-button' },
    { id: 'step4', positionClass: 'pos-top-right', targetId: 'unseen-button' },
    { id: 'step5', positionClass: 'pos-bottom-right', targetId: 'mainSwipe' },
];
</script>

<template>
    <div class="relative w-full h-screen overflow-hidden">
        <div class="onboarding-overlay">
            <button @click="handleFinish" class="skip-button">
                {{ $t("onboarding.skip") }} <span class="pi pi-step-forward"></span>
            </button>

            <div v-for="(step, index) in steps" :key="step.id" :class="[
                'step-card',
                step.positionClass,
                currentStep >= index ? 'visible-boarding' : 'hidden-boarding',
                currentStep === index ? 'current-step' : ''
            ]">
                <div class="card-inner" :class="currentStep === index ? 'card-active' : 'card-past'">
                    <p class="card-text">{{ $t(`onboarding.step${index + 1}`) }}</p>
                    <div class="button-wrapper" :class="currentStep === index ? 'btn-visible' : 'btn-hidden'">
                        <div class="step-indicator">
                            <span v-for="(s, i) in steps" :key="i"
                                :class="['step-dot', i === index ? 'dot-active' : i < index ? 'dot-past' : 'dot-future']">
                            </span>
                        </div>
                        <Button
                            
                            :label="currentStep === steps.length - 1 ? $t('onboarding.finish') : $t('onboarding.continue')"
                            class="pointer-events-auto" @click="handleContinue" />
                    </div>
                </div>
            </div>
        </div>

        <div class="absolute inset-0 bg-black/50 z-[999] pointer-events-none"></div>
        <div class="no-cursor-interactions h-full w-full grayscale-[0.5] blur-[2px]">
            <HomeView />
        </div>
    </div>
</template>
<style scoped>
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

.skip-button {
    position: absolute;
    top: 3rem;
    right: 2rem;
    color: var(--primary);
    pointer-events: auto;
    background-color: var(--background);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: color 0.2s;
}

.skip-button:hover {
    color: var(--accent);

}

/* ── Cards ── */
.step-card {
    position: absolute;
    pointer-events: none;
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.pos-top-left {
    top: 4rem;
    left: 16.66%;
    transform: translateX(-50%);
}

.pos-top-center {
    top: 2rem;
    left: 50%;
    transform: translateX(-50%);
}

.pos-top-right {
    top: 4rem;
    left: 83.33%;
    transform: translateX(-50%);
}

.pos-bottom-left {
    bottom: 4rem;
    left: 16.66%;
    transform: translateX(-50%);
}

.pos-bottom-right {
    bottom: 4rem;
    left: 83.33%;
    transform: translateX(-50%);
}

/* ── Transition ── */
.step-card.visible-boarding {
    opacity: 1;
    pointer-events: auto;
}

.step-card.hidden-boarding {
    opacity: 0;
    pointer-events: none;
}


/* ── Card UI ── */
.card-inner {
    background: color-mix(in srgb, var(--background) 80%, transparent);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 0.5px solid color-mix(in srgb, var(--secondary) 40%, transparent);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    max-width: 300px;
}

.card-text {
    color: var(--text);
    font-size: 0.95rem;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0.01em;

    padding: 10px;
}

/* ── Card size animation ── */
.card-active {
    padding: 1.25rem 1.25rem 1.1rem;
    transition: max-height 0.4s ease, padding 0.4s ease;
}

.card-past {
    padding: 0.9rem 1.25rem;
    transition: max-height 0.4s ease, padding 0.4s ease;
}

/* ── Button wrapper ── */
.button-wrapper {
    overflow: hidden;
    transition: max-height 0.4s ease, opacity 0.3s ease 0.1s;
}


/* ── Botón personalizado ── */
.button-wrapper :deep(.p-button) {
    background: var(--primary) !important;
    border: 0.5px solid color-mix(in srgb, var(--primary) 60%, var(--accent)) !important;
    border-radius: 10px !important;
    padding: 0.5rem 1.4rem !important;
    font-size: 0.875rem !important;
    font-weight: 500 !important;
    letter-spacing: 0.02em !important;
    color: var(--background) !important;
    transition: background 0.2s ease, transform 0.15s ease !important;
    width: 100%;
}

.button-wrapper :deep(.p-button:hover) {
    background: color-mix(in srgb, var(--primary) 85%, var(--accent)) !important;
    transform: translateY(-1px);
}

.button-wrapper :deep(.p-button:active) {
    transform: translateY(0px) scale(0.98);
}


.btn-visible {
    min-height: 65px;

    max-height: 65px;
    max-width: 150px;
    opacity: 1;
}

.btn-hidden {
    max-height: 0;
    max-width: 0;
    opacity: 0;
}

/* ── Mobile: todos abajo al centro ── */
@media (max-width: 768px) {

    .pos-top-left,
    .pos-top-center,
    .pos-top-right,
    .pos-bottom-left,
    .pos-bottom-right {
        top: auto;
        bottom: 4rem;
        left: 50%;
        right: auto;
    }

    /* En mobile solo mostramos el paso actual, no los anteriores */
    .step-card.visible-boarding {
        opacity: 0;
        pointer-events: none;
    }

    .step-card.visible-boarding.current-step {
        opacity: 1;
        pointer-events: auto;
    }
}

@media (max-width: 768px) {
    .card-past {
        max-height: 0;
        padding: 0;
        border: none;
    }
}

/* ── Step dots ── */
.step-indicator {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-bottom: 0.85rem;
}

.step-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-top: 5px;
    transition: background 0.3s ease, transform 0.3s ease;
}

.dot-active {
    background: var(--primary);
    transform: scale(1.3);

}

.dot-past {
    background: var(--secondary);

}

.dot-future {
    background: color-mix(in srgb, var(--secondary) 40%, transparent);
}
</style>