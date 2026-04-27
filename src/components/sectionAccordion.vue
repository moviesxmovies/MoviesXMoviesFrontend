<script lang="ts" setup>
import {
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    ScrollPanel,
} from 'primevue';

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



const handleSentinelRef = (el: HTMLElement | null) => {
    emit('update:sentinelRef', el);
};
</script>

<template>
    <Accordion :value="defaultOpen === false ? null : (isEmpty ? 'empty' : 'open')">
        <AccordionPanel value="open" v-if="!isEmpty" class="section">
            <AccordionHeader class="section-header">
                <i :class="[icon, iconClass]" />
                <h2 class="section-title">{{ title }}</h2>
                <Button v-if="dialogOptions" class="dialog-button" :class="dialogOptions.icon"
                    label="{{ dialogOptions.label }}" @click.stop="dialogOptions.onClick" />
            </AccordionHeader>
            <AccordionContent class="section-body">
                <ScrollPanel :style="`width: 100%; height: ${props.panelHeight || '350px'}`">
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
                <i :class="[icon, iconClass]" />
                <h2 class="section-title">{{ title }}</h2>
            </AccordionHeader>
            <AccordionContent
                class="bg-secondary/5 rounded-[2rem] p-10 md:p-20 border-2 border-dashed border-secondary/40">
                <div class="flex flex-col items-center justify-center text-center">
                    <div class="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                        <i :class="[(emptyIcon || icon), 'text-3xl text-secondary']" />
                    </div>
                    <h3 class="text-xl font-semibold opacity-70">{{ emptyTitle }}</h3>
                    <p class="text-sm opacity-50 max-w-xs mx-auto">{{ emptyDescription }}</p>
                </div>
            </AccordionContent>
        </AccordionPanel>
    </Accordion>
</template>

<style scoped>
:deep(.p-accordionheader) {
    color: var(--text);
}

:deep(.p-accordioncontent-content) {
    all: unset;
}

.section {
    border-radius: 1.5rem;
    border: 1px solid var(--secondary);
    background: var(--background);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.section-header {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--secondary);
    background: rgba(255, 255, 255, 0.05);
}

.section-title {
    font-weight: 900;
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    opacity: 0.7;
    margin: 0;
}

.section-body {
    padding: 1.5rem;
}

.dialog-button {
    position: absolute;
    right: 3rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.75rem;
    padding: 0.35rem 0.85rem;
    border-radius: 999px;
    font-weight: 600;
    letter-spacing: 0.05em;
    border: 1px solid var(--accent);
    background: transparent;
    color: var(--text);
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
    white-space: nowrap;
}

.accent-icon {
    color: var(--accent);
}

.primary-icon {
    color: var(--primary);
}

.scroll-container {
    max-height: 350px;
    overflow-y: auto;
    padding-right: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.scroll-container::-webkit-scrollbar {
    width: 4px;
}

.scroll-container::-webkit-scrollbar-track {
    background: transparent;
}

.scroll-container::-webkit-scrollbar-thumb {
    background: var(--secondary);
    border-radius: 999px;
}

.loading-footer {
    display: flex;
    justify-content: center;
    padding: 1rem;
}

.scroll-inner {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-right: 0.5rem;
}

.sentinel {
    height: 1px;
}

:deep(.p-scrollpanel-bar) {
    background: var(--secondary);
    border-radius: 999px;
    width: 4px;
    opacity: 1;
}

:deep(.p-scrollpanel-bar-y) {
    width: 4px;
}

:deep(.p-scrollpanel-bar:hover) {
    background: var(--primary);
}

:deep(.p-accordionheader[aria-expanded="true"]) .dialog-button i,
:deep(.p-accordionheader[aria-expanded="true"]) .dialog-button::before,
:deep(.p-accordionheader:hover) .dialog-button i,
:deep(.p-accordionheader:hover) .dialog-button::before {
    color: #000;
}



.dialog-button:hover {
    background: var(--accent);
    border-color: var(--accent);
}
.dialog-button:hover i,
.dialog-button:hover::before {
    color: white !important;
}
</style>