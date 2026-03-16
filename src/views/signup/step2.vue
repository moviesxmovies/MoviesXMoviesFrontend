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

const props = defineProps<{
  modelValue: RegisterPayload;
}>();

const resolver = zodResolver(step2Schema);

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, any>): void;
  (e: "next"): void;
  (e: "back"): void;
}>();

const onFormSubmit = ({ valid }: FormSubmitEvent<Record<string, any>>) => {
  if (valid) {
    emit("next");
  }
};

const triggerUpload = () =>
  fileUploadRef.value?.$el.querySelector('input[type="file"]').click();

const onFileSelect = (event: FileUploadSelectEvent) => {
  const file = Array.isArray(event.files) ? event.files[0] : event.files;
  imagePreview.value = URL.createObjectURL(file);
  emit("update:modelValue", { ...props.modelValue, image: file as Blob });
};
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="text-center">
      <h2 class="text-xl font-semibold" style="color: var(--text)">
        {{ $t("signup.profileTitle") }}
      </h2>
      <p class="text-sm mt-1" style="color: var(--text); opacity: 0.5">
        {{ $t("signup.step2Subtitle") }}
      </p>
    </div>

    <div class="flex justify-center">
      <div
        class="relative w-32 h-32 group cursor-pointer"
        @click="triggerUpload"
      >
        <div
          v-if="!imagePreview"
          class="w-24 h-24 rounded-full flex flex-col items-center justify-center border-2 border-dashed transition-colors"
          style="
            border-color: var(--secondary);
            background-color: var(--background);
          "
        >
          <i class="pi pi-camera text-xl" style="color: var(--primary)" />
          <span class="text-xs mt-1" style="color: var(--text); opacity: 0.5">
            {{ $t("signup.uploadPhoto") }}
          </span>
        </div>

        <img
          v-else
          :src="imagePreview"
          alt="Avatar"
          class="w-24 h-24 rounded-full object-cover border-2 m-auto"
          style="border-color: var(--primary)"
        />

        <div
          v-if="imagePreview"
          class="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style="background-color: rgba(0, 0, 0, 0.4)"
        >
          <i class="pi pi-pencil text-white text-lg" />
        </div>
      </div>

      <FileUpload
        ref="fileUploadRef"
        mode="basic"
        :auto="true"
        chooseLabel=""
        accept="image/png, image/jpeg"
        :maxFileSize="1000000"
        :multiple="false"
        @select="onFileSelect"
        class="!hidden"
      />
    </div>

    <Form
      :resolver="resolver"
      @submit="onFormSubmit"
      class="flex flex-col gap-4 w-full"
    >
      <div class="flex gap-3">
        <FormField
          v-slot="$field"
          name="first_name"
          initialValue=""
          class="flex flex-col gap-1 flex-1"
        >
          <FloatLabel variant="over">
            <IconField>
              <InputText
                v-bind="$field"
                id="first_name"
                type="text"
                fluid
                :class="{
                  'p-invalid': $field?.invalid,
                  'p-valid': $field?.dirty && !$field?.invalid,
                }"
              />
              <InputIcon
                v-if="$field?.dirty"
                :class="
                  $field?.invalid ? 'pi pi-times-circle' : 'pi pi-check-circle'
                "
                :style="{ color: $field?.invalid ? '#ef4444' : '#22c55e' }"
              />
            </IconField>
            <label for="first_name">{{ $t("signup.firstName") }}</label>
          </FloatLabel>
          <FieldMsg :field="$field" />
        </FormField>

        <FormField
          v-slot="$field"
          name="last_name"
          initialValue=""
          class="flex flex-col gap-1 flex-1"
        >
          <FloatLabel variant="over">
            <IconField>
              <InputText
                v-bind="$field"
                id="last_name"
                type="text"
                fluid
                :class="{
                  'p-invalid': $field?.invalid,
                  'p-valid': $field?.dirty && !$field?.invalid,
                }"
              />
              <InputIcon
                v-if="$field?.dirty"
                :class="
                  $field?.invalid ? 'pi pi-times-circle' : 'pi pi-check-circle'
                "
                :style="{ color: $field?.invalid ? '#ef4444' : '#22c55e' }"
              />
            </IconField>
            <label for="last_name">{{ $t("signup.lastName") }}</label>
          </FloatLabel>
          <FieldMsg :field="$field" />
        </FormField>
      </div>

      <div class="flex gap-3 mt-2">
        <Button
          type="button"
          :label="$t('signup.back')"
          fluid
          outlined
          @click="emit('back')"
        />
        <Button type="submit" :label="$t('signup.signUp')" fluid />
      </div>
    </Form>
  </div>
</template>
