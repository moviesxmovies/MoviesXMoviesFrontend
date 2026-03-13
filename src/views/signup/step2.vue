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

const file = ref(null);

const props = defineProps<{
  modelValue: RegisterPayload;
}>();

const resolver = zodResolver(step2Schema);

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, any>): void;
  (e: "next"): void;
  (e: "back"): void;
}>();

const onFormSubmit = ({
  valid,
  values,
}: FormSubmitEvent<Record<string, any>>) => {
  if (valid) {
    emit("update:modelValue", {
      ...props.modelValue,
      ...values,
      image: file.value,
    });
    emit("next");
  }
};

function onFileSelect(event: FileUploadSelectEvent) {
  file.value = event.files[0];
}
</script>

<template>
  <Form
    :resolver="resolver"
    @submit="onFormSubmit"
    class="flex flex-col gap-6 w-full sm:w-80"
  >
    <FormField
      v-slot="$field"
      name="first_name"
      initialValue=""
      class="flex flex-col gap-1"
    >
      <FloatLabel variant="over">
        <IconField>
          <InputText
            v-bind="$field"
            id="first_name"
            type="text"
            fluid
            :class="{
              'p-invalid': $field.invalid,
              'p-valid': $field.dirty && !$field.invalid,
            }"
          />
          <InputIcon
            v-if="$field.dirty"
            :class="
              $field.invalid
                ? 'pi pi-times-circle text-red-500'
                : 'pi pi-check-circle text-green-500'
            "
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
      class="flex flex-col gap-1"
    >
      <FloatLabel variant="over">
        <IconField>
          <InputText
            v-bind="$field"
            id="last_name"
            type="text"
            fluid
            :class="{
              'p-invalid': $field.invalid,
              'p-valid': $field.dirty && !$field.invalid,
            }"
          />
          <InputIcon
            v-if="$field.dirty"
            :class="
              $field.invalid
                ? 'pi pi-times-circle text-red-500'
                : 'pi pi-check-circle text-green-500'
            "
          />
        </IconField>
        <label for="last_name">{{ $t("signup.lastName") }}</label>
      </FloatLabel>
      <FieldMsg :field="$field" />
    </FormField>

    <FileUpload
      mode="basic"
      accept="image/png, image/jpeg"
      :maxFileSize="1000000"
      :multiple="false"
      @select="onFileSelect"
    />

    <Button type="submit">Sign up</Button>
  </Form>
  <Button @click="emit('back')">Back</Button>
</template>

<style scoped>
.field-msg {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  animation: fadeIn 0.15s ease;
}
.field-msg.error {
  color: #ef4444;
}
.field-msg.success {
  color: #22c55e;
}

.msg-icon {
  font-size: 0.85rem;
  flex-shrink: 0;
}
</style>
