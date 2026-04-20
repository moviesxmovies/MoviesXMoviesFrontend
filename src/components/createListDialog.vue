<script lang="ts" setup>
import { FieldMsg } from "@/repositories/auth/authRepository";
import { privacityConfig } from "@/repositories/listRepository";
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

const handleSubmit = async ({
  valid,
  values,
}: FormSubmitEvent<Record<string, any>>) => {
  if (!valid) return;
  console.log(values);
  // try {
  //   const status = await createList(values.listName);
  //   toast.add({
  //     severity: "success",
  //     summary: t("toast.success"),
  //     detail: status,
  //     life: 3000,
  //   });
  //   visible.value = false;
  // } catch (error: any) {
  //   toast.add({
  //     severity: "error",
  //     summary: t("toast.error"),
  //     detail: error.response?.data?.message || t("createList.toast.error"),
  //     life: 3000,
  //   });
  // }
};
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :dismissableMask="true"
    class="rounded-2xl border shadow-sm overflow-hidden w-full max-w-md"
    style="background-color: var(--background); border-color: var(--secondary)"
    :header="t('components.createList.header')"
  >
    <div class="p-4">
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
        class="flex flex-col gap-5 w-full"
      >
        <FormField
          v-slot="$field"
          name="listName"
          initialValue=""
          class="flex flex-col gap-1"
        >
          <FloatLabel variant="over">
            <IconField>
              <InputText
                v-bind="$field"
                id="listName"
                fluid
                :class="{
                  'p-invalid': $field?.invalid,
                  'p-valid': $field?.dirty && !$field?.invalid,
                }"
              />
              <InputIcon
                v-if="$field?.dirty"
                :class="$field?.invalid ? 'pi pi-times-circle' : 'pi pi-pencil'"
                :style="{
                  color: $field?.invalid ? '#ef4444' : 'var(--primary)',
                }"
              />
            </IconField>
            <label for="listName">{{
              $t("components.createList.listName")
            }}</label>
          </FloatLabel>
          <FieldMsg :field="$field" />
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
          <div
            class="flex justify-evenly gap-4 p-4 bg-white/5 rounded-2xl border border-secondary/20"
          >
            <div
              v-for="(option, key) in privacityConfig"
              :key="key"
              class="flex items-center gap-2"
            >
              <RadioButton
                v-bind="$field"
                :inputId="`privacity-${key}`"
                name="privacity"
                :value="option.value"
              />
              <label
                :for="`privacity-${key}`"
                class="text-sm font-medium cursor-pointer text-text"
              >
                <i :class="option.icon" class="text-xs opacity-70"></i>
                <span class="ml-2">{{ t(`components.lists.${key}`) }}</span>
              </label>
            </div>
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
}

:deep(.p-invalid .p-inputtext) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 1px #ef4444 !important;
}

.field-msg {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  animation: fadeIn 0.15s ease;
}

.field-msg.error {
  color: #ef4444;
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
</style>
