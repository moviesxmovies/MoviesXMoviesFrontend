<script setup lang="ts">
import type { Pagination, User } from "@/types";
import { useToast } from "primevue";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { userSearching } from "@/repositories/userRepository";
import debounce from "@/utils/debounce";
import MultiSelectPeopleComponent from "./multiSelectPeopleComponent.vue";

const { t } = useI18n();
const toast = useToast();
const isLoading = ref(false);
const selectedUsers = ref<User[]>([]);
const users = ref<Pagination<User>>({} as Pagination<User>);
const props = defineProps<{ modelValue?: string[] }>();
const emit = defineEmits(["update:modelValue", "filterUsers"]);

const withoutSelected = (list: User[]) =>
  list.filter((u) => !selectedUsers.value.some((s) => s.id === u.id));

const fetchUsers = async (search = "") => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    const data = await userSearching({ name: search });
    users.value = {
      ...data,
      results: [...selectedUsers.value, ...withoutSelected(data.results)],
    };
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
  <MultiSelectPeopleComponent
    :message="t('components.searchUsers.users')"
    :isLoading="isLoading"
    :items="users.results as User[]"
    v-model="selectedUsers as User[]"
    @filter="debouncedFetch($event.value)"
    @change="onSelectionChange(selectedUsers)"
  />
</template>
