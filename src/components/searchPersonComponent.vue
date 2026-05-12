<script setup lang="ts">
import type { Pagination, Person } from "@/types";
import { useToast } from "primevue";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import debounce from "@/utils/debounce";
import MultiSelectPeopleComponent from "./multiSelectPeopleComponent.vue";
import { celebritySearching } from "@/repositories/personRepository";
import { useRoute } from "vue-router";
import { getPersonProfile } from "@/repositories/userRepository";

const { t } = useI18n();
const toast = useToast();
const route = useRoute();
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
        error.response?.data?.message || t("search.searchCelebritiesError"),
    });
  } finally {
    isLoading.value = false;
  }
};

const debouncedFetch = debounce(fetchPersons, 300);

const onSelectionChange = (selected: Person[]) => {
  selectedPersons.value = selected;
  const slugs = selected.map((u) => u.slug);
  emit("update:modelValue", slugs);
  emit("filterPersons", slugs);
};

watch(
  () => route.query.celebrities,
  async (newCelebrities) => {
    const slugsInQuery = [newCelebrities].flat().filter(Boolean) as string[];
    const slugsInState = selectedPersons.value.map(p => p.slug);

    const isSynced = slugsInQuery.length === slugsInState.length && 
                     slugsInQuery.every(s => slugsInState.includes(s));

    if (isSynced && persons.value.results) return;

    if (!persons.value.results) {
      await fetchPersons();
    }

    if (!isSynced) {
      const newSelected: Person[] = [];
      for (const slug of slugsInQuery) {
        const existing = persons.value.results?.find(p => p.slug === slug);
        if (existing) {
          newSelected.push(existing);
        } else {
          const person = await getPersonProfile(slug);
          if (person) newSelected.push(person);
        }
      }
      selectedPersons.value = newSelected;
    }
  },
  { immediate: true },
);
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
