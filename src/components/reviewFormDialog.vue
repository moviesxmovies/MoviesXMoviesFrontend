<script lang="ts" setup>
import { Dialog, Skeleton } from 'primevue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
    visible: boolean;
    header: string;
    loading?: boolean;
    loadingFetch?: boolean;
    serverErrors?: string[];
    fieldErrors?: Record<string, string[]>;
    saveLabel?: string;
    reset?: boolean;
}>();

const emit = defineEmits<{
    'update:visible': [value: boolean];
    'submit': [];
    'clearError': [field: string];
    'reset': [];
}>();

const { t } = useI18n();

const form = defineModel<{ title: string; content: string; isPositive: boolean }>('form', { required: true });
</script>

<template>
    <Dialog :visible="visible" @update:visible="emit('update:visible', $event)" modal :draggable="false"
        :dismissableMask="true" :header="header" :style="{ width: '90vw', maxWidth: '480px' }" :pt="{
            root: { class: 'rounded-[2rem] border-none shadow-2xl bg-[var(--background)] overflow-hidden' },
            header: { class: 'bg-[var(--background)] pb-0' },
            title: { class: 'text-xl font-bold text-[var(--primary)]' },
            content: { class: 'bg-[var(--background)]' },
            footer: { class: 'bg-[var(--background)] border-t border-[var(--secondary)]' },
            closeButton: { class: 'hover:bg-[var(--secondary)]/20 transition-colors' },
        }">

        <!-- SKELETON -->
        <div v-if="loadingFetch" class="form">
            <div class="fields">
                <div class="field">
                    <Skeleton width="70px" height="11px" border-radius="4px" />
                    <div class="sentiment-toggle">
                        <Skeleton width="100%" height="40px" border-radius="0.75rem" />
                        <Skeleton width="100%" height="40px" border-radius="0.75rem" />
                    </div>
                </div>
                <div class="field">
                    <Skeleton width="50px" height="11px" border-radius="4px" />
                    <Skeleton width="100%" height="40px" border-radius="0.75rem" />
                </div>
                <div class="field">
                    <Skeleton width="65px" height="11px" border-radius="4px" />
                    <Skeleton width="100%" height="120px" border-radius="0.75rem" />
                </div>
            </div>
        </div>

        <!-- FORM -->
        <div v-else class="form">
            <div v-if="serverErrors?.length" class="server-errors">
                <i class="pi pi-exclamation-circle" />
                <ul>
                    <li v-for="(err, i) in serverErrors" :key="i">{{ err }}</li>
                </ul>
            </div>

            <div class="fields">
                <!-- SENTIMENT -->
                <div class="field">
                    <label for="review-sentiment">{{ t('review.sentiment') }}</label>
                    <div class="sentiment-toggle">
                        <button type="button" class="sentiment-btn"
                            :class="{ active: form.isPositive, positive: form.isPositive }"
                            @click="form.isPositive = true">
                            <i class="pi pi-thumbs-up" />
                            {{ t('review.positive') }}
                        </button>
                        <button type="button" class="sentiment-btn"
                            :class="{ active: !form.isPositive, negative: !form.isPositive }"
                            @click="form.isPositive = false">
                            <i class="pi pi-thumbs-down" />
                            {{ t('review.negative') }}
                        </button>
                    </div>
                </div>

                <!-- TITLE -->
                <div class="field">
                    <label for="review-title">{{ t('review.title') }}</label>
                    <input id="review-title" v-model="form.title" type="text" class="input"
                        :class="{ 'input-error': fieldErrors?.title?.length }"
                        :placeholder="t('review.titlePlaceholder')" @input="emit('clearError', 'title')" />
                    <span v-if="fieldErrors?.title?.length" class="field-error">
                        {{ fieldErrors.title[0] }}
                    </span>
                </div>

                <!-- CONTENT -->
                <div class="field">
                    <label for="review-content">{{ t('review.content') }}</label>
                    <textarea id="review-content" v-model="form.content" class="input textarea" rows="5"
                        :class="{ 'input-error': fieldErrors?.content?.length }"
                        :placeholder="t('review.contentPlaceholder')" @input="emit('clearError', 'content')" />
                    <span v-if="fieldErrors?.content?.length" class="field-error">
                        {{ fieldErrors.content[0] }}
                    </span>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="footer-actions">
                <button class="btn-cancel" :disabled="loadingFetch" @click="emit('update:visible', false)">
                    {{ t('common.cancel') }}
                </button>
                <button v-if="reset" class="btn-reset" :disabled="loadingFetch || loading" @click="emit('reset')">
                    {{ t('common.reset') }}
                </button>
                <button class="btn-save" :disabled="loadingFetch || loading" @click="emit('submit')">
                    <i v-if="loading" class="pi pi-spin pi-spinner" />
                    <span>{{ saveLabel ?? t('common.submit') }}</span>
                </button>
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 0.5rem 0;
}

.server-errors {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: color-mix(in srgb, var(--red) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--red) 30%, transparent);
    color: var(--red);
    font-size: 0.82rem;
}

.server-errors i {
    margin-top: 2px;
    flex-shrink: 0;
}

.server-errors ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

label {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text);
    opacity: 0.6;
}

/* SENTIMENT TOGGLE */
.sentiment-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
}

.sentiment-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    border-radius: 0.75rem;
    border: 1px solid color-mix(in srgb, var(--secondary) 50%, transparent);
    background: color-mix(in srgb, var(--text) 5%, transparent);
    color: var(--text);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
    font-family: inherit;
    opacity: 0.5;
}

.sentiment-btn.active {
    opacity: 1;
}

.sentiment-btn.positive {
    border-color: color-mix(in srgb, var(--green, #22c55e) 60%, transparent);
    background: color-mix(in srgb, var(--green, #22c55e) 12%, transparent);
    color: var(--green, #22c55e);
}

.sentiment-btn.negative {
    border-color: color-mix(in srgb, var(--red) 60%, transparent);
    background: color-mix(in srgb, var(--red) 12%, transparent);
    color: var(--red);
}

.sentiment-btn:not(.active):hover {
    opacity: 0.75;
    background: color-mix(in srgb, var(--text) 8%, transparent);
}

/* INPUTS */
.input {
    background: color-mix(in srgb, var(--text) 5%, transparent);
    border: 1px solid color-mix(in srgb, var(--secondary) 50%, transparent);
    border-radius: 0.75rem;
    padding: 0.6rem 0.9rem;
    font-size: 0.9rem;
    color: var(--text);
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;
    width: 100%;
    box-sizing: border-box;
}

.input:focus {
    border-color: var(--primary);
}

.input-error {
    border-color: var(--red) !important;
}

.textarea {
    resize: vertical;
    min-height: 120px;
}

.field-error {
    font-size: 0.75rem;
    color: var(--red);
    font-weight: 500;
}

/* FOOTER */
.footer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 0.5rem;
    width: 100%;
}

.btn-cancel {
    padding: 0.5rem 1.2rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--secondary) 60%, transparent);
    background: transparent;
    color: var(--text);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    font-family: inherit;
}

.btn-cancel:hover {
    background: color-mix(in srgb, var(--secondary) 15%, transparent);
}

.btn-save {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1.4rem;
    border-radius: 999px;
    border: none;
    background: var(--primary);
    color: var(--background);
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.2s;
    font-family: inherit;
}

.btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-save:hover:not(:disabled) {
    opacity: 0.85;
}

.btn-reset {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1.4rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--orange) 60%, transparent);
    background: transparent;
    color: var(--text);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
}

.btn-reset:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-reset:hover:not(:disabled) {
    background: color-mix(in srgb, var(--orange) 15%, transparent);
    border-color: color-mix(in srgb, var(--orange) 80%, transparent);
}
</style>