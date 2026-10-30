<script setup lang="ts">
import { FieldMsg } from "@/repositories/auth/authRepository";
import { step2Schema } from "@/schemas/signUpSchema";
import type { RegisterPayload } from "@/types";
import { Form, FormField, type FormSubmitEvent } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import {
  Button,
  FileUpload,
  FloatLabel,
  IconField,
  InputIcon,
  InputText,
  type FileUploadSelectEvent,
} from "primevue";
import { ref } from "vue";

const fileUploadRef = ref();
const imagePreview = ref<string | null>(null);

const selectedImage = ref<Blob | null>(null);

const props = defineProps<{
  modelValue: RegisterPayload;
  fieldErrors?: Record<string, string[]>;
}>();

const resolver = zodResolver(step2Schema);

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, any>): void;
  (e: "next"): void;
  (e: "back"): void;
}>();

const onFormSubmit = ({ valid, values }: FormSubmitEvent<Record<string, any>>) => {
  if (valid) {
    emit("update:modelValue", { ...props.modelValue, ...values, image: selectedImage.value ?? props.modelValue.image });
    emit("next");
  }
};

const triggerUpload = () =>
  fileUploadRef.value?.$el.querySelector('input[type="file"]').click();

const onFileSelect = (event: FileUploadSelectEvent) => {
  const file = Array.isArray(event.files) ? event.files[0] : event.files;
  imagePreview.value = URL.createObjectURL(file);
  selectedImage.value = file as Blob;
};
</script>

<template>
  <div class="flex flex-col gap-4 sm:gap-6">
    <div class="auth-header !mb-0">
      <h1 class="auth-title">{{ $t("signup.step2.title") }}</h1>
      <p class="auth-subtitle">{{ $t("signup.step2.subtitle") }}</p>
    </div>

    <div class="flex justify-center">
      <div class="avatar-picker group" role="button" tabindex="0" :aria-label="$t('signup.step2.image')"
        @click="triggerUpload" @keydown.enter.prevent="triggerUpload" @keydown.space.prevent="triggerUpload">
        <div v-if="!imagePreview" class="avatar-empty">
          <i class="pi pi-camera text-xl" aria-hidden="true" />
          <span class="avatar-empty__label">{{ $t("signup.step2.image") }}</span>
        </div>

        <img v-else :src="imagePreview" alt="Avatar" class="avatar-preview" />

        <div v-if="imagePreview" class="avatar-edit" aria-hidden="true">
          <i class="pi pi-pencil" />
        </div>
      </div>

      <FileUpload ref="fileUploadRef" mode="basic" :auto="true" chooseLabel="" accept="image/png, image/jpeg"
        :maxFileSize="1000000" :multiple="false" @select="onFileSelect" class="!hidden" />
    </div>

    <Form :resolver="resolver" @submit="onFormSubmit" class="flex flex-col gap-4 w-full">
      <div class="flex gap-3">
        <FormField v-slot="$field" name="first_name" initialValue="" class="flex flex-col gap-1 flex-1">
          <FloatLabel variant="over">
            <IconField>
              <InputText v-bind="$field" id="first_name" type="text" fluid :class="{
                'p-invalid': $field?.invalid,
                'p-valid': $field?.dirty && !$field?.invalid,
              }" />
              <InputIcon v-if="$field?.dirty" :class="$field?.invalid ? 'pi pi-times-circle' : 'pi pi-check-circle'
                " :style="{ color: $field?.invalid ? 'var(--danger)' : 'var(--success)' }" />
            </IconField>
            <label for="first_name">{{ $t("signup.firstName") }}</label>
          </FloatLabel>
          <FieldMsg :field="$field" />
          <div v-for="msg in (fieldErrors?.first_name ?? [])" :key="msg" class="field-msg error">
          <i class="pi pi-times-circle msg-icon" />
            {{ msg }}
          </div>
        </FormField>

        <FormField v-slot="$field" name="last_name" initialValue="" class="flex flex-col gap-1 flex-1">
          <FloatLabel variant="over">
            <IconField>
              <InputText v-bind="$field" id="last_name" type="text" fluid :class="{
                'p-invalid': $field?.invalid,
                'p-valid': $field?.dirty && !$field?.invalid,
              }" />
              <InputIcon v-if="$field?.dirty" :class="$field?.invalid ? 'pi pi-times-circle' : 'pi pi-check-circle'
                " :style="{ color: $field?.invalid ? 'var(--danger)' : 'var(--success)' }" />
            </IconField>
            <label for="last_name">{{ $t("signup.lastName") }}</label>
          </FloatLabel>
          <FieldMsg :field="$field" />
          <div v-for="msg in (fieldErrors?.last_name ?? [])" :key="msg" class="field-msg error">
          <i class="pi pi-times-circle msg-icon" />
            {{ msg }}
          </div>
        </FormField>
      </div>

      <div class="flex gap-3 mt-2">
        <Button type="button" :label="$t('back')" fluid outlined @click="emit('back')" />
        <Button type="submit" :label="$t('signup.title')" fluid />
      </div>
    </Form>
  </div>
</template>

<style scoped>
.avatar-picker {
  position: relative;
  width: 6.5rem;
  height: 6.5rem;
  border-radius: 999px;
  cursor: pointer;
}

.avatar-empty {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  border: 2px dashed var(--border-strong);
  background: var(--surface-2);
  color: var(--primary);
  transition: border-color 0.15s, background-color 0.15s;
}

.avatar-picker:hover .avatar-empty {
  border-color: var(--border-strong);
  background: var(--primary-soft);
}

.avatar-empty__label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-muted);
}

.avatar-preview {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
}

.avatar-edit {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(12, 12, 11, 0.55);
  color: #ffffff;
  opacity: 0;
  transition: opacity 0.15s;
}

.avatar-picker:hover .avatar-edit,
.avatar-picker:focus-visible .avatar-edit {
  opacity: 1;
}
</style>
