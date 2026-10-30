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
      key: t(option?.key || ""),
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
    <div class="pt-1">
      <div class="dialog-intro">
        <div class="dialog-intro-icon" aria-hidden="true">
          <i class="pi pi-list"></i>
        </div>
        <p class="dialog-intro-text">
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
                      ? 'var(--danger)'
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
              <InputIcon class="pi pi-pencil" style="color: var(--text-subtle)" />
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
          <div class="smart-filters">
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
            role="group"
            :class="{ 'has-error': fieldErrors.privacity?.length }"
          >
            <button
              v-for="(option, key) in localizedPrivacyConfig"
              :key="key"
              type="button"
              class="privacy-btn"
              :class="[option.class, { active: $field.value === option.value }]"
              :aria-pressed="$field.value === option.value"
              @click="
                () => {
                  $field.props.onChange({ target: { value: option.value } });
                  clearError('privacity');
                }
              "
            >
              <i :class="option.icon" />
              {{ option.key }}
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
.dialog-intro {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.dialog-intro-icon {
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-soft);
  color: var(--text-subtle);
  font-size: 1.125rem;
}

.dialog-intro-text {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.45;
  color: var(--text-muted);
}

.smart-filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--radius-lg);
  background: var(--surface-2);
  border: 1px solid var(--border);
}

:deep(.p-inputtext) {
  background-color: var(--surface) !important;
  color: var(--text) !important;
  border-color: var(--border-strong) !important;
  font-size: 1rem !important;
  padding: 0.75rem !important;
  border-radius: var(--radius-md) !important;
}

:deep(.p-inputtext:focus) {
  border-color: var(--primary) !important;
  box-shadow: var(--focus-ring) !important;
}

:deep(.p-floatlabel label) {
  color: var(--text-subtle);
}

:deep(.p-inputtext.p-invalid),
:deep(.p-invalid .p-inputtext) {
  border-color: var(--danger) !important;
}

:deep(.p-button) {
  background-color: var(--primary) !important;
  border-color: var(--primary) !important;
  color: var(--on-primary) !important;
  padding: 0.75rem !important;
  font-weight: 500;
  border-radius: var(--radius-md) !important;
}

:deep(.p-button:hover) {
  background-color: var(--primary-hover) !important;
  border-color: var(--primary-hover) !important;
}

.cancel-btn {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.75rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
  text-align: center;
}

.cancel-btn:hover {
  background: var(--surface-hover);
  color: var(--text);
}

.field-error {
  font-size: 0.8125rem;
  color: var(--danger);
  font-weight: 500;
}

.server-errors {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  background: var(--danger-soft);
  border: 1px solid color-mix(in srgb, var(--danger) 35%, transparent);
  color: var(--danger);
  font-size: 0.875rem;
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
  gap: 0.25rem;
}

.privacy-toggle {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: var(--radius-md);
  background: var(--surface-2);
  border: 1px solid var(--border);
}

.privacy-toggle.has-error {
  border-color: var(--danger);
}

.privacy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.5rem;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.15s,
    border-color 0.15s,
    color 0.15s;
  font-family: inherit;
  white-space: nowrap;
  min-width: 0;
  overflow: hidden;
}

/* Inactivo: neutro y legible; activo: color semántico (badge-*) */
.privacy-btn:not(.active) {
  background: transparent !important;
  color: var(--text-muted) !important;
}

.privacy-btn:not(.active):hover {
  background: var(--surface-hover) !important;
  color: var(--text) !important;
}

.privacy-btn.active {
  border-color: currentColor;
  box-shadow: var(--shadow-sm);
}
</style>
