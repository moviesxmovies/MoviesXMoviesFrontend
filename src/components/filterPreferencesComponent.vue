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
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--secondary) 20%, transparent);
  background: color-mix(in srgb, var(--background) 95%, var(--text));
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.preference-item:hover {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 5%, var(--background));
  transform: translateY(-1px);
}

.preference-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.preference-icon {
  font-size: 0.9rem;
  color: var(--primary);
  opacity: 0.8;
}

.preference-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--text);
}

/* ToggleSwitch */
:deep(.p-toggleswitch-slider) {
  background: var(--secondary) !important;
  border-radius: 2rem !important;
  transition: background 0.2s ease !important;
}

:deep(.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider) {
  background: var(--primary) !important;
}
</style>
