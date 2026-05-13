<script lang="ts" setup>
import { FieldMsg } from "@/repositories/auth/authRepository";
import {
  addMovieToList,
  createList,
  privacityConfig,
  updateList,
} from "@/repositories/listRepository";
import { defaultListSchema } from "@/schemas/listSchema";
import { useAuthStore } from "@/stores/authStore";
import type { CreateList, Movie, MovieList } from "@/types";
import { Form, FormField, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { useForm } from "@primevue/forms/useform";
import {
  Button,
  Dialog,
  FloatLabel,
  IconField,
  InputIcon,
  InputText,
  useToast,
} from "primevue";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import SearchGenresComponent from "./searchGenresComponent.vue";
import SearchPersonComponent from "./searchPersonComponent.vue";
import SearchUsersComponent from "./searchUsersComponent.vue";
import { handleApiError } from "@/utils/handleApiError";
import { goToMovieList } from "@/utils/goTo";

const visible = defineModel<boolean>("visible", { default: false });
const authStore = useAuthStore();
const toast = useToast();
const { t } = useI18n();
const resolver = zodResolver(defaultListSchema);
const form = useForm({ resolver: zodResolver(defaultListSchema) });
const props = defineProps<{
  movieList?: MovieList;
  movie?: Movie;
  intelligent?: boolean;
}>();

const emit = defineEmits(["reloadLists", "reloadMovieList"]);

const selectedCelebrities = ref<string[]>([]);
const selectedFriends = ref<string[]>([]);
const selectedGenres = ref<string[]>([]);

// ── Field errors ────────────────────────────────────────────────────────────
const fieldErrors = ref<Record<string, string[]>>({});
const serverErrors = ref<string[]>([]);

const clearError = (field: string) => {
  if (fieldErrors.value[field]) {
    fieldErrors.value[field] = [];
  }
};

const clearAllErrors = () => {
  fieldErrors.value = {};
  serverErrors.value = [];
};

const localizedPrivacyConfig = computed(() => {
  return Object.keys(privacityConfig).reduce((acc, key) => {
    const option = privacityConfig[key as keyof typeof privacityConfig];
    acc[key] = {
      ...option,
      text: t(option?.key || ""),
    };
    return acc;
  }, {} as any);
});

// ── Submit ───────────────────────────────────────────────────────────────────
const handleSubmit = async ({
  valid,
  values,
}: FormSubmitEvent<Record<string, any>>) => {
  if (!valid) return;
  clearAllErrors();
  try {
    if (props.movieList) {
      const { data } = await updateList(
        authStore.user?.username || "",
        props.movieList.slug,
        values as CreateList,
      );
      emit("reloadMovieList", data.slug);
    } else {
      const data = await createList(values as CreateList, props.intelligent, {
        celebrities: selectedCelebrities.value || undefined,
        friends: selectedFriends.value || undefined,
        genres: selectedGenres.value || undefined,
      });

      if (props.movie) {
        await addToList(data.data.slug, props.movie);
      } else {
        goToMovieList(authStore.user?.username, data.data.slug);
      }
    }

    emit("reloadLists");
    visible.value = false;
  } catch (error: any) {
    fieldErrors.value = {};
    serverErrors.value = [];
    handleApiError(error, fieldErrors, serverErrors, toast, t);
  }
};

const addToList = async (listSlug: string, movie: Movie) => {
  try {
    await addMovieToList(authStore.user?.username || "", listSlug, movie.slug);
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail:
        error.response?.data?.message ||
        t("components.addToList.addToListError", [movie.title, listSlug]),
      life: 3000,
    });
  }
};

watch(
  () => visible.value,
  (newVal) => {
    if (newVal) {
      clearAllErrors();
      form.reset();
      selectedCelebrities.value = [];
      selectedFriends.value = [];
      selectedGenres.value = [];
    }
  },
);
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :dismissableMask="true"
    :header="
      props.movieList
        ? t('components.createList.headerEdit')
        : t('components.createList.header')
    "
    :style="{ width: '90vw', maxWidth: '400px' }"
    :pt="{
      root: {
        class:
          'rounded-[2rem] border-none shadow-2xl bg-[var(--background)] overflow-hidden',
      },
      header: { class: 'bg-[var(--background)]' },
      title: { class: 'text-2xl font-display font-bold text-[var(--primary)]' },
      content: { class: 'bg-[var(--background)]' },
      closeButton: {
        class: 'hover:bg-[var(--secondary)]/20 transition-colors',
      },
    }"
  >
    <div class="p-2">
      <div class="text-center mb-8">
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center m-auto mb-4"
          style="
            background: color-mix(in srgb, var(--primary) 12%, transparent);
          "
        >
          <i class="pi pi-list text-2xl" style="color: var(--primary)"></i>
        </div>
        <p
          class="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mt-2 px-2"
          style="color: var(--text)"
        >
          {{
            props.movieList
              ? t("components.createList.descriptionUpdate")
              : t("components.createList.description")
          }}
        </p>
      </div>

      <!-- Server-level errors -->
      <div v-if="serverErrors.length" class="server-errors mb-6">
        <i class="pi pi-exclamation-circle" />
        <ul>
          <li v-for="(err, i) in serverErrors" :key="i">{{ err }}</li>
        </ul>
      </div>

      <Form
        :resolver="resolver"
        @submit="handleSubmit"
        class="flex flex-col gap-5 w-full"
      >
        <!-- NAME -->
        <FormField
          v-slot="$field"
          name="name"
          :initialValue="props.movieList?.name || ''"
          class="flex flex-col gap-1"
        >
          <FloatLabel variant="over">
            <IconField>
              <InputText
                v-bind="$field"
                id="name"
                fluid
                :class="{
                  'p-invalid': $field?.invalid || fieldErrors.name?.length,
                  'p-valid':
                    $field?.dirty &&
                    !$field?.invalid &&
                    !fieldErrors.name?.length,
                }"
                @input="clearError('name')"
              />
              <InputIcon
                v-if="$field?.dirty"
                :class="
                  $field?.invalid || fieldErrors.name?.length
                    ? 'pi pi-times-circle'
                    : 'pi pi-pencil'
                "
                :style="{
                  color:
                    $field?.invalid || fieldErrors.name?.length
                      ? '#ef4444'
                      : 'var(--primary)',
                }"
              />
            </IconField>
            <label for="name">{{ t("components.createList.formName") }}</label>
          </FloatLabel>
          <!-- Zod error -->
          <FieldMsg :field="$field" />
          <!-- API field error -->
          <span v-if="fieldErrors.name?.length" class="field-error">
            {{ fieldErrors.name[0] }}
          </span>
        </FormField>

        <!-- DESCRIPTION -->
        <FormField
          v-slot="$field"
          name="description"
          :initialValue="props.movieList?.description || ''"
          class="flex flex-col gap-1"
        >
          <FloatLabel variant="over">
            <IconField>
              <InputText
                id="description"
                v-bind="$field"
                fluid
                :class="{ 'p-invalid': fieldErrors.description?.length }"
                @input="clearError('description')"
              />
              <InputIcon
                class="pi pi-pencil"
                style="color: var(--primary); opacity: 0.5"
              />
            </IconField>
            <label for="description">{{
              t("components.createList.formDescription")
            }}</label>
          </FloatLabel>
          <span v-if="fieldErrors.description?.length" class="field-error">
            {{ fieldErrors.description[0] }}
          </span>
        </FormField>

        <!-- INTELLIGENT filters -->
        <template v-if="intelligent && !props.movieList">
          <div
            class="flex flex-col gap-4 p-4 rounded-2xl"
            style="
              background: color-mix(in srgb, var(--secondary) 10%, transparent);
              border: 1.5px solid
                color-mix(in srgb, var(--secondary) 40%, transparent);
            "
          >
            <SearchGenresComponent
              @filterGenres="(genres: string[]) => (selectedGenres = genres)"
            />
            <SearchPersonComponent v-model="selectedCelebrities" />
            <SearchUsersComponent v-model="selectedFriends" />
          </div>
        </template>

        <FormField
          v-slot="$field"
          name="privacity"
          :initialValue="props.movieList?.privacity || 'P'"
          class="flex flex-col gap-1"
        >
          <div
            class="privacy-toggle"
            :class="{ 'border-red-400': fieldErrors.privacity?.length }"
          >
            <button
              v-for="(option, key) in localizedPrivacyConfig"
              :key="key"
              type="button"
              class="privacy-btn"
              :class="[option.class, { active: $field.value === option.value }]"
              @click="
                () => {
                  $field.props.onChange({ target: { value: option.value } });
                  clearError('privacity');
                }
              "
            >
              <i :class="option.icon" />
              {{ option.text }}
            </button>
          </div>
          <span v-if="fieldErrors.privacity?.length" class="field-error">
            {{ fieldErrors.privacity[0] }}
          </span>
        </FormField>

        <div class="flex flex-col gap-3 pt-2">
          <Button
            data-testid="Form"
            type="submit"
            :label="
              props.movieList
                ? t('components.createList.submitEdit')
                : t('components.createList.submit')
            "
            fluid
          />
          <button type="button" class="cancel-btn" @click="visible = false">
            {{ t("components.createList.cancel") }}
          </button>
        </div>
      </Form>
    </div>
  </Dialog>
</template>

<style scoped>
:deep(.p-inputtext) {
  background-color: var(--background) !important;
  color: var(--text) !important;
  border-color: var(--secondary) !important;
  font-size: 16px !important;
  padding: 0.75rem !important;
  border-radius: 0.75rem !important;
}

:deep(.p-inputtext:focus) {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 1px var(--primary) !important;
}

:deep(.p-float-label label) {
  color: var(--text);
  opacity: 0.6;
}

:deep(.p-invalid .p-inputtext) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 1px #ef4444 !important;
}

:deep(.p-button) {
  background-color: var(--primary) !important;
  border-color: var(--primary) !important;
  color: #fff !important;
  padding: 0.85rem !important;
  font-weight: 700;
  border-radius: 0.75rem !important;
}

.cancel-btn {
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: none;
  color: var(--primary);
  font-size: 0.875rem;
  font-weight: 700;
  opacity: 0.8;
  cursor: pointer;
  transition: opacity 0.2s;
  text-align: center;
}

.cancel-btn:hover {
  opacity: 1;
  text-decoration: underline;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.server-errors {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--red) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--red) 30%, transparent);
  color: var(--red);
  font-size: 0.82rem;
}

.server-errors i {
  margin-top: 2px;
  flex-shrink: 0;
}

.server-errors ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.privacy-toggle {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  padding: 0.4rem;
  border-radius: 1rem;
  background: color-mix(in srgb, var(--secondary) 10%, transparent);
  border: 1.5px solid color-mix(in srgb, var(--secondary) 40%, transparent);
}

.privacy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 0.5rem;
  border-radius: 0.75rem;
  border: 1px solid transparent;
  background: transparent;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s,
    color 0.2s,
    opacity 0.2s;
  font-family: inherit;
  opacity: 0.45;
  white-space: nowrap;
  min-width: 0;
  overflow: hidden;
}

.privacy-btn.active {
  opacity: 1;
}

.privacy-btn:not(.active):hover {
  opacity: 0.7;
  background: color-mix(in srgb, var(--text) 6%, transparent);
}

/* Public */
.privacy-btn.badge-public {
  color: #309153;
}
.privacy-btn.badge-public.active {
  border-color: color-mix(in srgb, #309153 60%, transparent);
  background: rgba(34, 197, 94, 0.12);
}

/* Private */
.privacy-btn.badge-private {
  color: #b73b3b;
}
.privacy-btn.badge-private.active {
  border-color: color-mix(in srgb, #b73b3b 60%, transparent);
  background: rgba(239, 68, 68, 0.12);
}

/* Friends */
.privacy-btn.badge-friends {
  color: #4d57bd;
}
.privacy-btn.badge-friends.active {
  border-color: color-mix(in srgb, #4d57bd 60%, transparent);
  background: rgba(99, 102, 241, 0.12);
}
</style>
