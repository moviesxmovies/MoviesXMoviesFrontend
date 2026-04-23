<script lang="ts" setup>
defineProps<{
    value: string;
    icon: string;
    title: string;
    isEmpty: boolean;
    emptyIcon?: string;
    emptyTitle: string;
    emptyDescription: string;
    loading?: boolean;
}>();
</script>

<template>
    <Accordion :value="isEmpty ? 'empty' : value">
        <AccordionPanel :value="value" v-if="!isEmpty" class="section">
            <AccordionHeader class="section-header">
                <i :class="[icon, 'primary-icon']" />
                <h2 class="section-title">{{ title }}</h2>
            </AccordionHeader>
            <AccordionContent class="section-body">
                <div class="scroll-container">
                    <slot />
                    <div v-if="loading" class="loading-footer">
                        <i class="pi pi-spin pi-spinner" />
                    </div>
                </div>
            </AccordionContent>
        </AccordionPanel>

        <AccordionPanel value="empty" v-else class="section">
            <AccordionHeader class="section-header">
                <i :class="[icon, 'primary-icon']" />
                <h2 class="section-title">{{ title }}</h2>
            </AccordionHeader>
            <AccordionContent
                class="bg-secondary/5 rounded-[2rem] p-10 md:p-20 border-2 border-dashed border-secondary/40">
                <div class="flex flex-col items-center justify-center text-center">
                    <div class="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                        <i :class="[emptyIcon || icon, 'text-3xl text-secondary']" />
                    </div>
                    <h3 class="text-xl font-semibold opacity-70">{{ emptyTitle }}</h3>
                    <p class="text-sm opacity-50 max-w-xs mx-auto">{{ emptyDescription }}</p>
                </div>
            </AccordionContent>
        </AccordionPanel>
    </Accordion>
</template>