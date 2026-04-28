<script setup lang="ts">
import { Dialog } from 'primevue';
import CreateListDialog from './createListDialog.vue';
import { ref } from 'vue';
const visible = defineModel<boolean>('visible', { default: false });
const normalListModalVisible = ref(false);
const intelligentListModalVisible = ref(false);
const emit = defineEmits(['reload-lists']);
const handleNormal = () => {
    normalListModalVisible.value = true;
};

const handleIntelligent = () => {
    intelligentListModalVisible.value = true;
};

const closeAllModals = () => {
    normalListModalVisible.value = false;
    intelligentListModalVisible.value = false;
    visible.value = false;
    emit('reload-lists');
}
</script>

<template>
    <CreateListDialog v-model:visible="normalListModalVisible" @reload-lists="closeAllModals"/>
    <Dialog v-model:visible="visible" :header="$t('user.chooseMoviesListType')" :modal="true" :closable="true"
        :dismissableMask="true" :draggable="false" :style="{ width: '90vw', maxWidth: '600px' }" :pt="{
            root: {
                class: 'rounded-[2rem] border-none shadow-2xl bg-[var(--background)] overflow-hidden',
            },
            header: { class: 'bg-[var(--background)]' },
            title: { class: 'text-2xl font-display font-bold text-[var(--primary)]' },
            content: { class: 'bg-[var(--background)]' },
            closeButton: {
                class: 'hover:bg-[var(--secondary)]/20 transition-colors',
            },
        }">
        <div class="choice-movie-list-type-modal">
            <button class="list-type-btn" @click="handleNormal">
                <div class="list-type-btn__icon">
                    <i class="pi pi-plus" />
                </div>
                <span class="list-type-btn__label">{{ $t('user.createNormalList') }}</span>
            </button>
            <button class="list-type-btn" @click="handleIntelligent">
                <div class="list-type-btn__icon list-type-btn__icon--accent">
                    <i class="pi pi-star" />
                </div>
                <span class="list-type-btn__label">{{ $t('user.createIntelligentList') }}</span>
            </button>
        </div>
    </Dialog>
</template>

<style scoped>
.choice-movie-list-type-modal {
    display: flex;
    flex-direction: row;
    gap: 1.25rem;
    padding: 0.5rem 0 1rem;
}

@media (max-width: 480px) {
    .choice-movie-list-type-modal {
        flex-direction: column;
    }
}

.list-type-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
    padding: 2.5rem 1.5rem;
    border-radius: 1.25rem;
    border: 1.5px solid var(--secondary);
    background: transparent;
    color: var(--text);
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
}

.list-type-btn:hover {
    background: color-mix(in srgb, var(--secondary) 30%, transparent);
    border-color: var(--primary);
    transform: translateY(-2px);
}

@media (max-width: 480px) {
    .list-type-btn {
        flex-direction: row;
        justify-content: flex-start;
        padding: 1.5rem;
        gap: 1.25rem;
    }

    .list-type-btn:hover {
        transform: translateX(2px);
    }
}

.list-type-btn__icon {
    width: 4rem;
    height: 4rem;
    flex-shrink: 0;
    border-radius: 1rem;
    background: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    color: var(--background);
    transition: filter 0.2s;
}

.list-type-btn__icon--accent {
    background: var(--accent);
}

.list-type-btn:hover .list-type-btn__icon {
    filter: brightness(1.15);
}

.list-type-btn__label {
    font-size: 0.65rem;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    opacity: 0.75;
    text-align: center;
    line-height: 1.4;
}

@media (max-width: 480px) {
    .list-type-btn__label {
        text-align: left;
        font-size: 0.7rem;
    }
}
</style>