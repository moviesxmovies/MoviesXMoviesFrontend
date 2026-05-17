<script setup lang="ts">
import { ref, computed } from "vue";
const draggableWrapper = ref<HTMLElement | null>(null);
const props = defineProps({
  swipeThreshold: {
    type: Number,
    default: 150, // Minimum distance to trigger a swipe
  },
  maxDragDistance: {
    type: Number,
    default: 500, // Maximum visual movement
  },
});

const emit = defineEmits<{
  (e: "left"): void;
  (e: "right"): void;
  (e: "up"): void;
  (e: "down"): void;
}>();

const direction = defineModel<string>("direction", { default: "" });

// --- Drag and Swipe Logic ---
const isDragging = defineModel<boolean>("isDragging", { default: false });
const startX = ref(0);
const currentX = ref(0);
const startY = ref(0);
const currentY = ref(0);

// Calculate the current horizontal offset
const offsetX = computed(() => {
  let distance = currentX.value - startX.value;

  if (distance > props.maxDragDistance) distance = props.maxDragDistance;
  if (distance < -props.maxDragDistance) distance = -props.maxDragDistance;

  return distance;
});

// Calculate the current vertical offset
const offsetY = computed(() => {
  let distance = currentY.value - startY.value;

  if (distance > props.maxDragDistance) distance = props.maxDragDistance;
  if (distance < -props.maxDragDistance) distance = -props.maxDragDistance;

  return distance;
});

// As actualValue approaches MAX_TRAVEL, the increment gets smaller
const getResistedValue = (actualValue: number) => {
  const RESISTANCE = 0.25;

  return (
    props.maxDragDistance *
    Math.tanh(actualValue / (props.maxDragDistance / RESISTANCE))
  );
};

// Dynamic styles to move the card
const cardStyle = computed(() => {
  const visualX = getResistedValue(offsetX.value);
  const visualY = getResistedValue(offsetY.value);

  return {
    transform: `
      translateX(${visualX}px) 
      translateY(${visualY}px) 
    `,
    transition: isDragging.value
      ? "none"
      : "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
    cursor: isDragging.value ? "grabbing" : "grab",
    transformOrigin: "center center",
  };
});

// Event Handlers
const startDrag = (event: MouseEvent | TouchEvent) => {
  isDragging.value = true;

  const point = "touches" in event ? event.touches[0] : event;
  if (point) {
    startX.value = point.clientX;
    startY.value = point.clientY;
    currentX.value = startX.value;
    currentY.value = startY.value;
  }
};

const onDrag = (event: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return;
  const point = "touches" in event ? event.touches[0] : event;
  if (point) {
    currentX.value = point.clientX;
    currentY.value = point.clientY;
    checkSwipe((value: string) => {
      if (value !== direction.value) {
        direction.value = value;
      }
    });
  }

  if (draggableWrapper.value) {
    const visualX = getResistedValue(offsetX.value);
    const visualY = getResistedValue(offsetY.value);
    draggableWrapper.value.style.transform = `translate3d(${visualX}px, ${visualY}px, 0)`;
  }
};

const endDrag = () => {
  if (!isDragging.value) return;
  isDragging.value = false;

  checkSwipe(emit);
  direction.value = "";

  currentX.value = startX.value;
  currentY.value = startY.value;
};

const checkSwipe = (func: Function) => {
  if (offsetX.value > props.swipeThreshold) {
    func("right");
  } else if (offsetX.value < -props.swipeThreshold) {
    func("left");
  } else if (offsetY.value < -props.swipeThreshold) {
    func("up");
  } else if (offsetY.value > props.swipeThreshold) {
    func("down");
  } else {
    func("");
  }
};
</script>

<template>
  <div class="draggable-container select-none relative w-full h-full" @mousedown="startDrag" @mousemove="onDrag"
    @mouseup="endDrag" @mouseleave="endDrag" @touchstart="startDrag" @touchmove.prevent="onDrag" @touchend="endDrag">
    <div v-if="isDragging" class="fixed inset-0 z-11 cursor-grabbing"></div>

    <div :style="[cardStyle, isDragging ? { willChange: 'transform' } : { willChange: 'auto' }]"
      class="draggable-wrapper z-10 relative">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.select-none {
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.min-h-screen {
  min-height: 100vh;
  min-height: -webkit-fill-available;
}

</style>
