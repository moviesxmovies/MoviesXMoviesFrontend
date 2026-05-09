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
    display: flex;
    align-items: center;
    gap: 0.3rem;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--gray);
    opacity: 0.7;
    transition: opacity 0.2s, color 0.2s;
    align-self: flex-start;
    margin-top: 0.15rem;
}

.translate-btn:hover:not(:disabled) {
    opacity: 1;
    color: var(--primary);
}

.translate-btn--active {
    color: var(--primary);
    opacity: 1;
}

.translate-btn--loading {
    opacity: 0.5;
    cursor: not-allowed;
}

.translate-btn i {
    font-size: 0.68rem;
}

.translate-error {
    font-size: 0.68rem;
    color: var(--danger, #e74c3c);
    margin-top: 0.1rem;
}
</style>