<script lang="ts" setup>
import { createList } from "@/repositories/listRepository";
import { defaultListSchema } from "@/schemas/listSchema";
import { Form, FormField, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import {
  Button,
  Dialog,
  FloatLabel,
  IconField,
  InputIcon,
  InputText,
  RadioButton,
  useToast,
} from "primevue";
import { useI18n } from "vue-i18n";
const visible = defineModel<boolean>("visible", { default: false });

const toast = useToast();
const { t } = useI18n();
const resolver = zodResolver(defaultListSchema);

const privacity = [
  {
    label: t("components.createList.public"),
    value: "P",
  },
  {
    label: t("components.createList.private"),
    value: "R",
  },
  {
    label: t("components.createList.friends"),
    value: "F",
  },
];

const handleSubmit = async ({
  valid,
  values,
}: FormSubmitEvent<Record<string, any>>) => {
  if (!valid) return;
  try {
    const status = await createList(values.listName);
    toast.add({
      severity: "success",
      summary: t("toast.success"),
      detail: status,
      life: 3000,
    });
    visible.value = false;
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: t("toast.error"),
      detail: error.response?.data?.message || t("createList.toast.error"),
      life: 3000,
    });
  }
};
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :dismissableMask="true"
    class="rounded-2xl border shadow-sm overflow-hidden w-full max-w-md mx-4"
    style="background-color: var(--background); border-color: var(--secondary)"
    :header="t('components.createList.header')"
  >
    <div class="p-6 sm:p-8">
      <div class="text-center mb-8">
        <div
          class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center m-auto mb-4"
        >
          <i class="pi pi-list text-2xl" style="color: var(--primary)"></i>
        </div>
        <p
          class="text-xs sm:text-sm mt-2 px-2"
          style="color: var(--text); opacity: 0.6"
        >
          {{ t("components.createList.description") }}
        </p>
      </div>

      <Form
        :resolver="resolver"
        @submit="handleSubmit"
        class="flex flex-col gap-6 w-full"
      >
        <FormField
          v-slot="$field"
          name="listName"
          initialValue=""
          class="flex flex-col gap-1"
        >
          <FloatLabel variant="over">
            <IconField>
              <InputText id="listName" v-bind="$field" fluid />
              <InputIcon
                class="pi pi-pencil"
                style="color: var(--primary); opacity: 0.5"
              />
            </IconField>
            <label for="listName">{{
              t("components.createList.listName")
            }}</label>
          </FloatLabel>
        </FormField>

        <FormField
          v-slot="$field"
          name="description"
          initialValue=""
          class="flex flex-col gap-1"
        >
          <FloatLabel variant="over">
            <IconField>
              <InputText id="description" v-bind="$field" fluid />
              <InputIcon
                class="pi pi-pencil"
                style="color: var(--primary); opacity: 0.5"
              />
            </IconField>
            <label for="description">{{
              t("components.createList.description")
            }}</label>
          </FloatLabel>
        </FormField>

        <FormField v-slot="$field" name="privacity" class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <FloatLabel
              v-for="option in privacity"
              :key="option.value"
              variant="over"
            >
              <RadioButton v-bind="$field" :value="option.value" fluid />
              <label for="privacity">{{
                t("components.createList.privacity")
              }}</label>
            </FloatLabel>
          </div>
        </FormField>

        <div class="flex flex-col gap-3 pt-2">
          <Button type="submit" label="Create List" fluid class="py-3.5" />
          <Button
            type="button"
            label="Cancel"
            variant="text"
            fluid
            class="p-button-secondary"
            @click="visible = false"
          />
        </div>
      </Form>
    </div>
  </Dialog>
</template>

<style scoped>
:deep(.p-dialog-content) {
  background-color: var(--background) !important;
  border-radius: 1.5rem;
  padding: 0; /* Controlamos el padding internamente */
}

:deep(.p-inputtext) {
  background-color: var(--background) !important;
  color: var(--text) !important;
  border-color: var(--secondary) !important;
  font-size: 16px !important;
  padding: 0.75rem !important;
}

:deep(.p-inputtext:focus) {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 1px var(--primary) !important;
}

:deep(.p-float-label label) {
  color: var(--text);
  opacity: 0.6;
}

:deep(.p-button) {
  background-color: var(--primary) !important;
  border-color: var(--primary) !important;
  color: #fff !important;
  padding: 0.85rem !important;
  font-weight: 700;
  border-radius: 0.75rem;
}

:deep(.p-button.p-button-secondary) {
  background-color: transparent !important;
  border-color: transparent !important;
  color: var(--primary) !important;
  opacity: 0.8;
}

:deep(.p-button.p-button-secondary:hover) {
  opacity: 1;
  text-decoration: underline;
}
</style>
