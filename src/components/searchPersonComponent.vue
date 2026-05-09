<script setup lang="ts">
import type { Pagination, Person } from "@/types";
import { useToast } from "primevue";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import debounce from "@/utils/debounce";
import MultiSelectPeopleComponent from "./multiSelectPeopleComponent.vue";
import { celebritySearching } from "@/repositories/personRepository";

const { t } = useI18n();
const toast = useToast();
const isLoading = ref(false);
const selectedPersons = ref<Person[]>([]);
const persons = ref<Pagination<Person>>({} as Pagination<Person>);
const props = defineProps<{ modelValue?: string[] }>();
const emit = defineEmits(["update:modelValue", "filterPersons"]);

const fetchPersons = async (search = "") => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    persons.value = await celebritySearching(search);
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail:
        error.response?.data?.message ||
        t("search.searchCelebritiesError"),
    });
  } finally {
    isLoading.value = false;
  }
};

const debouncedFetch = debounce(fetchPersons, 300);

onMounted(() => fetchPersons());

const onSelectionChange = (selected: Person[]) => {
  selectedPersons.value = selected;
  const slugs = selected.map((u) => u.slug);
  emit("update:modelValue", slugs);
  emit("filterPersons", slugs);
};
</script>

<template>
  <MultiSelectPeopleComponent
    :message="t('search.celebrities')"
    :isLoading="isLoading"
    :items="persons.results as Person[]"
    v-model="selectedPersons as Person[]"
    @filter="debouncedFetch($event.value)"
    @change="onSelectionChange(selectedPersons)"
    :type="'person'"
  />
</template>
