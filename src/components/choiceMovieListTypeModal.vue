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
    <CreateListDialog v-model:visible="intelligentListModalVisible" :intelligent="true" @reload-lists="closeAllModals"/>
    <Dialog v-model:visible="visible" :header="$t('user.chooseMoviesListType')" :modal="true" :closable="true"
        :dismissableMask="true" :draggable="false" :style="{ width: '90vw', maxWidth: '600px' }" :pt="{
            root: { class: 'mxm-dialog' },
            title: { class: 'mxm-dialog-title' },
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
    gap: 1rem;
    padding: 0.25rem 0 0.5rem;
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
    gap: 1rem;
    padding: 2rem 1.25rem;
    border-radius: var(--radius-lg);
    border: 1.5px solid var(--border);
    background: var(--surface-2);
    color: var(--text);
    cursor: pointer;
    transition: background-color 0.15s, border-color 0.15s, transform 0.15s;
}

.list-type-btn:hover {
    background: var(--primary-soft);
    border-color: var(--border-strong);
}

@media (max-width: 480px) {
    .list-type-btn {
        flex-direction: row;
        justify-content: flex-start;
        padding: 1.25rem;
    }

    .list-type-btn:hover {
        transform: translateX(2px);
    }
}

.list-type-btn__icon {
    width: 3.5rem;
    height: 3.5rem;
    flex-shrink: 0;
    border-radius: var(--radius-md);
    background: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: var(--on-primary);
}

.list-type-btn__icon--accent {
    background: var(--accent);
    color: var(--on-accent);
}

.list-type-btn__label {
    font-size: 1rem;
    font-weight: 500;
    text-align: center;
    line-height: 1.35;
    color: var(--text);
}

@media (max-width: 480px) {
    .list-type-btn__label {
        text-align: left;
    }
}
</style>
