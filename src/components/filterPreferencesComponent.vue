<script lang="ts" setup>
import { ToggleSwitch } from "primevue";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const marked_unseen = ref<boolean>(false);
const reviewed = ref<boolean>(false);

watch(
  () => [route.query.marked_unseen, route.query.reviewed],
  () => {
    if (route.query.marked_unseen) {
      marked_unseen.value = route.query.marked_unseen === "true";
    }
    if (route.query.reviewed) {
      reviewed.value = route.query.reviewed === "true";
    }
  },
  { immediate: true },
);

const emit = defineEmits(["filterUnseen", "filterReviewed"]);
</script>

<template>
  <label for="unseen">Show unseen movies</label>
  <ToggleSwitch
    v-model="marked_unseen"
    input-id="unseen"
    @change="emit('filterUnseen', String(marked_unseen))"
  />
  <label for="reviewed" class="text-text">Show reviewed movies</label>
  <ToggleSwitch
    v-model="reviewed"
    input-id="reviewed"
    @change="emit('filterReviewed', String(reviewed))"
  />
</template>