<script setup lang="ts">
defineProps<{
  currentStep: number
  totalSteps: number
  stepLabels?: string[]
}>()
</script>

<template>
  <div class="flex items-center w-full mb-8">
    <template v-for="step in totalSteps" :key="step">

      <div class="flex flex-col items-center gap-1.5 z-10">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all duration-400"
          :class="{
            'bg-[var(--primary)] border-[var(--primary)] text-white': step < currentStep,
            'bg-white border-[var(--primary)] text-[var(--primary)] ring-4 ring-[var(--primary)]/15': step === currentStep,
            'bg-[var(--background)] border-[var(--secondary)] text-[var(--text)]/40': step > currentStep,
          }"
        >
          <i v-if="step < currentStep" class="pi pi-check text-xs" />
          <span v-else>{{ step }}</span>
        </div>
        <span
          class="text-[11px] whitespace-nowrap transition-colors duration-300"
          :class="step === currentStep
            ? 'text-[var(--primary)] font-medium'
            : 'text-[var(--text)]/40'"
        >
          {{ stepLabels?.[step - 1] ?? `Step ${step}` }}
        </span>
      </div>

      <div
        v-if="step < totalSteps"
        class="flex-1 h-0.5 mb-5 overflow-hidden rounded-full"
        style="background-color: var(--secondary)"
      >
        <div
          class="h-full rounded-full transition-all duration-500 ease-in-out"
          style="background-color: var(--primary)"
          :style="{ width: step < currentStep ? '100%' : '0%' }"
        />
      </div>

    </template>
  </div>
</template>