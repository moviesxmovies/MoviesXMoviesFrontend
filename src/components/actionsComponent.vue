<script lang="ts" setup>
import { setAsNotSeen } from "@/repositories/movieRepository";
const props = defineProps<{
  movieSlug: string;
  loading: boolean;
}>();

const emit = defineEmits(["showNextMovie"]);

const markAsNotSeen = async () => {
  await setAsNotSeen(props.movieSlug);
  emit("showNextMovie");
};
</script>

<template>
  <div class="flex justify-center">
    <div
      class="inline-flex w-full max-w-sm overflow-hidden rounded-b-2xl"
    >
      <button
        id="more-info"
        class="flex-1 h-16 bg-accent cursor-pointer hover:brightness-120 flex items-center justify-center border-r border-white/10 transition-all active:bg-accent/80"
      >
        <i class="pi pi-info-circle text-2xl text-white" />
      </button>

      <button
        id="unseen-button"
        class="flex-1 h-16 bg-gray-600 cursor-pointer hover:bg-gray-500 flex items-center justify-center border-r border-white/10 transition-all active:bg-gray-700"
        @click="markAsNotSeen"
      >
        <i class="pi pi-eye-slash text-2xl text-white" />
      </button>

      <button
        id="add-to-list-button"
        class="flex-1 h-16 bg-primary cursor-pointer hover:brightness-120 flex items-center justify-center transition-all active:bg-primary/80"
      >
        <i class="pi pi-plus-circle text-2xl text-white" />
      </button>
    </div>
  </div>
</template>
