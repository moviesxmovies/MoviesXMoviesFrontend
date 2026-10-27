<script lang="ts" setup>
defineProps<{
    isTranslated: boolean;
    isLoading: boolean;
    error?: string | null;
}>();

defineEmits<{
    translate: [];
}>();
</script>

<template>
    <button class="translate-btn"
        :class="{ 'translate-btn--active': isTranslated, 'translate-btn--loading': isLoading }" :disabled="isLoading"
        @click="$emit('translate')">
        <i v-if="isLoading" class="pi pi-spin pi-spinner" />
        <i v-else-if="isTranslated" class="pi pi-times-circle" />
        <i v-else class="pi pi-language" />
        <span>
            {{ isLoading ? $t('translation.loading') : isTranslated ? $t('translation.showOriginal') :
                $t('translation.translate') }}
        </span>
    </button>
    <span v-if="error" class="translate-error">{{ error }}</span>
</template>

<style scoped>
.translate-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: none;
    border: none;
    padding: 0.2rem 0;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-subtle);
    transition: color 0.15s;
    align-self: flex-start;
    margin-top: 0.15rem;
}

.translate-btn:hover:not(:disabled) {
    color: var(--primary);
}

.translate-btn--active {
    color: var(--primary);
}

.translate-btn--loading {
    cursor: progress;
}

.translate-btn i {
    font-size: 0.8125rem;
}

.translate-error {
    font-size: 0.8125rem;
    color: var(--danger);
    margin-top: 0.1rem;
}
</style>
