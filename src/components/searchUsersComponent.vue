<script setup lang="ts">
import type { User } from "@/types";
import { useToast } from "primevue";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import MultiSelectComponent from "./multiSelectComponent.vue";
import { userSearching } from "@/repositories/userRepository";
import debounce from "@/utils/debounce";

const { t } = useI18n();
const toast = useToast();
const isLoading = ref(false);
const selectedUsers = ref<User[]>([]);
const users = ref<User[]>([]);
const props = defineProps<{ modelValue?: string[] }>();
const emit = defineEmits(["update:modelValue", "filterUsers"]);

const withoutSelected = (list: User[]) =>
  list.filter((u) => !selectedUsers.value.some((s) => s.id === u.id));

const fetchUsers = async (search = "") => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    const { results } = await userSearching({ name: search });
    users.value = [...selectedUsers.value, ...withoutSelected(results)];
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail:
        error.response?.data?.message ||
        t("components.searchUsers.getUsersError"),
    });
  } finally {
    isLoading.value = false;
  }
};

const debouncedFetch = debounce(fetchUsers, 500);

onMounted(() => fetchUsers());

const onSelectionChange = (selected: User[]) => {
  selectedUsers.value = selected;
  const usernames = selected.map((u) => u.username);
  emit("update:modelValue", usernames);
  emit("filterUsers", usernames);
};
</script>

<template>
  <MultiSelectComponent
    :message="t('components.searchUsers.users')"
    :isLoading="isLoading"
    :items="users as User[]"
    v-model="selectedUsers as User[]"
    @filter="debouncedFetch($event.value)"
    @change="onSelectionChange(selectedUsers)"
    :optionLabel="'username'"
  />
</template>
