<script lang="ts" setup>
import { Dialog, Skeleton } from 'primevue';
import { useI18n } from 'vue-i18n';
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

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
                    <span id="review-sentiment" class="field-label">{{ t('review.sentiment') }}</span>
                    <div class="sentiment-toggle" role="radiogroup" aria-labelledby="review-sentiment">
                        <button type="button" class="sentiment-btn"
                            role="radio" :aria-checked="form.isPositive"
                            :class="{ active: form.isPositive, positive: form.isPositive }"
                            @click="form.isPositive = true">
                            <i class="pi pi-thumbs-up" />
                            {{ t('review.positive') }}
                        </button>
                        <button type="button" class="sentiment-btn"
                            role="radio" :aria-checked="!form.isPositive"
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
                    <MdEditor v-model="form.content" language="en-US" :preview="false"
                        :toolbars="['bold', 'italic', 'strikeThrough', 'title', 'unorderedList', 'orderedList', 'code', 'link', 'preview']"
                        :class="fieldErrors?.content?.length ? 'input-error' : ''"
                        @onChange="emit('clearError', 'content')" />
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
    gap: 1.25rem;
    padding: 0.25rem 0;
}

.fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

/* ── Formulario (patrón compartido, ver guía de estilos) ── */
label,
.field-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text);
}

.input,
.textarea {
    background: var(--surface);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-md);
    padding: 0.75rem 1rem;
    font-size: 0.9375rem;
    color: var(--text);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    font-family: inherit;
    width: 100%;
    box-sizing: border-box;
}

.input:hover,
.textarea:hover {
    border-color: var(--text-subtle);
}

.input:focus,
.textarea:focus {
    border-color: var(--primary);
    box-shadow: var(--focus-ring);
}

.input-error {
    border-color: var(--danger) !important;
}

.textarea {
    resize: vertical;
    min-height: 120px;
}

.field-error {
    font-size: 0.8125rem;
    color: var(--danger);
    font-weight: 500;
}

.server-errors {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    background: var(--danger-soft);
    border: 1px solid color-mix(in srgb, var(--danger) 35%, transparent);
    color: var(--danger);
    font-size: 0.875rem;
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
    gap: 0.25rem;
}

/* ── Botones del pie ── */
.footer-actions {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding-top: 0.75rem;
    width: 100%;
}

.btn-cancel,
.btn-reset,
.btn-save {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 2.5rem;
    padding: 0.5rem 1.25rem;
    border-radius: var(--radius-md);
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    transition: background-color 0.15s, border-color 0.15s, color 0.15s;
}

.btn-cancel {
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-muted);
}

.btn-cancel:hover:not(:disabled) {
    background: var(--surface-hover);
    color: var(--text);
}

.btn-reset {
    border: 1px solid var(--border-strong);
    background: transparent;
    color: var(--text);
}

.btn-reset:hover:not(:disabled) {
    background: var(--surface-hover);
}

.btn-save {
    border: 1px solid transparent;
    background: var(--primary);
    color: var(--on-primary);
    font-weight: 500;
}

.btn-save:hover:not(:disabled) {
    background: var(--primary-hover);
}

.btn-cancel:disabled,
.btn-reset:disabled,
.btn-save:disabled {
    opacity: 0.55;
    cursor: not-allowed;
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
    min-height: 2.75rem;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text-muted);
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s, border-color 0.15s, color 0.15s;
    font-family: inherit;
}

.sentiment-btn:not(.active):hover {
    border-color: var(--border-strong);
    color: var(--text);
}

.sentiment-btn.positive {
    border-color: var(--success);
    background: var(--success-soft);
    color: var(--success);
}

.sentiment-btn.negative {
    border-color: var(--danger);
    background: var(--danger-soft);
    color: var(--danger);
}

/* MD EDITOR */
:deep(.md-editor) {
    border-radius: var(--radius-md);
    border: 1px solid var(--border-strong);
    --md-color: var(--text) !important;
    --md-hover-color: var(--primary) !important;
    --md-bk-color: var(--surface) !important;
    --md-bk-color-outstand: var(--surface-2) !important;
    --md-bk-hover-color: var(--surface-hover) !important;
    --md-border-color: var(--border) !important;
    --md-color-disable: var(--text-subtle) !important;
}

:deep(.md-editor:focus-within) {
    border-color: var(--primary);
    box-shadow: var(--focus-ring);
}

:deep(.md-editor-toolbar-wrapper) {
    background: var(--surface-2) !important;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
}

:deep(.md-editor-content) {
    background: transparent !important;
}

:deep(.md-editor-input-wrapper),
:deep(.md-editor-input) {
    background: transparent !important;
    color: var(--text) !important;
    font-family: inherit !important;
}

:deep(.md-editor-custom-scrollbar__track) {
    background: transparent !important;
}

:deep(.md-editor-custom-scrollbar__thumb) {
    background: color-mix(in srgb, var(--text-subtle) 45%, transparent) !important;
    border-radius: var(--radius-md);
}
</style>
