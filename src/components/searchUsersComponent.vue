<script setup lang="ts">
import type { Pagination, User } from "@/types";
import { useToast } from "primevue";
import { nextTick, onMounted, ref } from "vue";
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

const loadMore = async () => {
  if (!users.value.has_next || isLoading.value) return;
  await fetchUsers(
    props.modelValue?.join(" ") || "",
    users.value.current_page + 1,
  );
};

const loadPrevious = async () => {
  if (!users.value.has_previous || isLoading.value) return;

  // Guardar altura antes de añadir elementos arriba
  const panel = document.querySelector(
    ".p-multiselect-list-container",
  ) as HTMLElement;
  const prevHeight = panel?.scrollHeight ?? 0;

  await fetchUsers(
    props.modelValue?.join(" ") || "",
    users.value.current_page - 1,
  );

  // Restaurar posición para que no salte
  await nextTick();
  if (panel) {
    panel.scrollTop = panel.scrollHeight - prevHeight;
  }
};

const withoutSelected = (list: User[]) =>
  list.filter((u) => !selectedUsers.value.some((s) => s.id === u.id));

const fetchUsers = async (search = "", page?: number) => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    const data = await userSearching({ name: search, page });
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
    :optionLabel="'username'"
    @loadmore="loadMore"
    @loadprevious="loadPrevious"
  />
</template>
