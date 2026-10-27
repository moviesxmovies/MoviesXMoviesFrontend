<script lang="ts" setup>
import { ToggleSwitch } from "primevue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const route = useRoute();
const marked_unseen = ref<boolean>(false);
const reviewed = ref<boolean>(false);
const { t } = useI18n();

watch(
  () => [route.query.marked_unseen, route.query.reviewed],
  () => {
    marked_unseen.value = route.query.marked_unseen
      ? route.query.marked_unseen === "true"
      : false;
    reviewed.value = route.query.reviewed
      ? route.query.reviewed === "true"
      : false;
  },
  { immediate: true },
);

const emit = defineEmits(["filterUnseen", "filterReviewed"]);
</script>

<template>
  <div class="preferences-list">
    <div class="preference-item">
      <label for="unseen" class="preference-info">
        <i class="pi pi-eye preference-icon" />
        <span class="preference-label">{{
          t("components.filter.unseen")
        }}</span>
      </label>
      <ToggleSwitch
        v-model="marked_unseen"
        input-id="unseen"
        @change="emit('filterUnseen', String(marked_unseen))"
      />
    </div>

    <div class="preference-item">
      <label for="reviewed" class="preference-info">
        <i class="pi pi-star preference-icon" />
        <span class="preference-label">{{
          t("components.filter.reviewed")
        }}</span>
      </label>
      <ToggleSwitch
        v-model="reviewed"
        input-id="reviewed"
        @change="emit('filterReviewed', String(reviewed))"
      />
    </div>
  </div>
</template>

<style scoped>
.preferences-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preference-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface-2);
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.preference-item:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.preference-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.preference-icon {
  font-size: 0.95rem;
  color: var(--primary);
}

.preference-label {
  font-size: 0.875rem;
  line-height: 1.3;
  font-weight: 500;
  color: var(--text);
}

/* ToggleSwitch */
:deep(.p-toggleswitch-slider) {
  background: var(--border-strong) !important;
  border-radius: 2rem !important;
  transition: background 0.2s ease !important;
}

:deep(.p-toggleswitch-handle) {
  background: #ffffff !important;
}

:deep(.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider) {
  background: var(--primary) !important;
}

:deep(.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-handle) {
  background: var(--on-primary) !important;
}
</style>
