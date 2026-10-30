<script lang="ts" setup>
import {
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    ScrollPanel,
} from 'primevue';
import { nextTick, ref, watch } from 'vue';

const emit = defineEmits<{
    'update:sentinelRef': [el: HTMLElement | null];
}>();
const props = defineProps<{
    icon: string;
    title: string;
    isEmpty: boolean;
    emptyIcon?: string;
    emptyTitle: string;
    emptyDescription: string;
    loading?: boolean;
    defaultOpen?: boolean;
    iconClass?: string;
    panelHeight?: string;
    dialogOptions?: {
        icon: string;
        label: string;
        onClick: () => void;
    };
}>();
const getAccordionValue = () => {
    if (props.defaultOpen === false) return null;
    return props.isEmpty ? 'empty' : 'open';
};
const accordionValue = ref(getAccordionValue());
defineExpose({ accordionValue });

const scrollPanelRef = ref();
const handleSentinelRef = (el: HTMLElement | null) => {
    emit('update:sentinelRef', el);
};
const handleAccordionChange = (value: string | string[] | null | undefined) => {
    accordionValue.value = value as string | null;

    if (value === 'open') {
        nextTick(() => {
            setTimeout(() => scrollPanelRef.value?.refresh(), 150);
        });
    }
};

watch(() => [props.isEmpty, props.defaultOpen], () => {
    accordionValue.value = getAccordionValue();
});
</script>

<template>
    <Accordion :value="accordionValue" @update:value="handleAccordionChange">
        <AccordionPanel value="open" v-if="!isEmpty" class="section">
            <AccordionHeader class="section-header">
                <span class="section-icon" aria-hidden="true"><i :class="[icon, iconClass]" /></span>
                <h2 class="section-title">{{ title }}</h2>
                <button v-if="dialogOptions" type="button" class="dialog-button" :title="dialogOptions.label"
                    @click.stop="dialogOptions.onClick" @keydown.enter.stop @keydown.space.stop>
                    <i :class="dialogOptions.icon" aria-hidden="true" />
                    <span class="dialog-button-label">{{ dialogOptions.label }}</span>
                </button>
            </AccordionHeader>
            <AccordionContent class="section-body">
                <ScrollPanel :style="`width: 100%; height: ${props.panelHeight || '350px'}`" ref="scrollPanelRef">
                    <div class="scroll-inner">
                        <slot />
                        <div :ref="(el) => handleSentinelRef(el as HTMLElement | null)" class="sentinel" />
                        <div v-if="loading" class="loading-footer">
                            <i class="pi pi-spin pi-spinner" />
                        </div>
                    </div>
                </ScrollPanel>
            </AccordionContent>
        </AccordionPanel>

        <AccordionPanel value="empty" v-else class="section">
            <AccordionHeader class="section-header">
                <span class="section-icon" aria-hidden="true"><i :class="[icon, iconClass]" /></span>
                <h2 class="section-title">{{ title }}</h2>
                <button v-if="dialogOptions" type="button" class="dialog-button" :title="dialogOptions.label"
                    @click.stop="dialogOptions.onClick" @keydown.enter.stop @keydown.space.stop>
                    <i :class="dialogOptions.icon" aria-hidden="true" />
                    <span class="dialog-button-label">{{ dialogOptions.label }}</span>
                </button>
            </AccordionHeader>
            <AccordionContent class="section-body">
                <div class="empty-state">
                    <div class="empty-icon" aria-hidden="true">
                        <i :class="(emptyIcon || icon)" />
                    </div>
                    <h3 class="empty-title">{{ emptyTitle }}</h3>
                    <p class="empty-description">{{ emptyDescription }}</p>
                </div>
            </AccordionContent>
        </AccordionPanel>
    </Accordion>
</template>

<style scoped>
:deep(.p-accordionheader) {
    color: var(--text);
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
}

:deep(.p-accordionheader:hover) {
    background: var(--surface-2) !important;
}

:deep(.p-accordionheader-toggle-icon) {
    color: var(--text-subtle);
}

:deep(.p-accordionpanel) {
    border: none;
}

:deep(.p-accordioncontent-content) {
    all: unset;
}

.section {
    border-radius: var(--radius-xl);
    border: 1px solid var(--border);
    background: var(--surface);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
}

.section-header {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem !important;
    min-height: 3.5rem;
}

:deep(.p-accordionheader[aria-expanded="true"]) {
    border-bottom: 1px solid var(--border) !important;
}

.section-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
    border-radius: var(--radius-sm);
    background: var(--primary-soft);
    color: var(--text-subtle);
    font-size: 0.9375rem;
}

.section-icon :deep(i),
.section-icon i {
    color: var(--text-subtle) !important;
}

.section-title {
    flex: 1;
    text-align: left;
    font-family: var(--font-sans);
    font-weight: 500;
    font-size: 1rem;
    color: var(--text);
    margin: 0;
}

.section-body {
    padding: 1.25rem;
}

.dialog-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-right: 0.5rem;
    font-family: var(--font-sans);
    font-size: 0.8125rem;
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-md);
    font-weight: 500;
    border: 1px solid transparent;
    background: var(--surface-2);
    color: var(--text);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: background-color 0.15s var(--ease);
    white-space: nowrap;
}

.dialog-button i {
    font-size: 0.75rem;
}

.dialog-button:hover {
    background: var(--surface-hover);
}

@media (max-width: 480px) {
    .dialog-button-label {
        display: none;
    }

    .dialog-button {
        padding: 0.5rem;
    }
}

.accent-icon {
    color: var(--accent);
}

.primary-icon {
    color: var(--text-subtle);
}

.loading-footer {
    display: flex;
    justify-content: center;
    padding: 1rem;
    color: var(--primary);
}

.scroll-inner {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-right: 0.75rem;
}

.sentinel {
    height: 1px;
}

:deep(.p-scrollpanel-bar) {
    background: color-mix(in srgb, var(--text-subtle) 45%, transparent);
    border-radius: var(--radius-md);
    width: 6px;
    opacity: 1;
}

:deep(.p-scrollpanel-bar-y) {
    width: 6px;
}

:deep(.p-scrollpanel-bar:hover) {
    background: var(--primary);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 0.5rem;
    padding: 2.5rem 1rem;
    border: 1.5px dashed var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface-2);
}

.empty-icon {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 999px;
    background: var(--primary-soft);
    color: var(--text-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
}

.empty-title {
    font-size: 1rem;
    font-weight: 500;
    color: var(--text);
    margin: 0;
}

.empty-description {
    font-size: 0.9375rem;
    color: var(--text-muted);
    max-width: 22rem;
    margin: 0;
}
</style>
