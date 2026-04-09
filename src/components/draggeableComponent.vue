<script setup lang="ts">
import { ref, computed } from "vue";

// Define props for customizability
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

// Define events that the parent component can listen to
const emit = defineEmits<{
  (e: "left"): void;
  (e: "right"): void;
  (e: "up"): void;
  (e: "down"): void;
}>();

const direction = defineModel<string>("direction", { default: "" });

// --- Drag and Swipe Logic ---

const isDragging = ref(false);
const startX = ref(0);
const currentX = ref(0);
const startY = ref(0);
const currentY = ref(0);

// Calculate the current horizontal offset
const offsetX = computed(() => {
  let distance = currentX.value - startX.value;

  // Apply maximum movement limits
  if (distance > props.maxDragDistance) distance = props.maxDragDistance;
  if (distance < -props.maxDragDistance) distance = -props.maxDragDistance;

  return distance;
});

// Calculate the current vertical offset
const offsetY = computed(() => {
  let distance = currentY.value - startY.value;

  // Apply maximum movement limits
  if (distance > props.maxDragDistance) distance = props.maxDragDistance;
  if (distance < -props.maxDragDistance) distance = -props.maxDragDistance;

  return distance;
});

// Dynamic styles to move and rotate the card
const cardStyle = computed(() => {
  const RESISTANCE = 0.25; // Sensitivity factor (0 to 1)

  // Function to calculate resisted movement
  // formula: movement = limit * tanh(actual / limit)
  const getResistedValue = (actualValue: number) => {
    // We use a simplified version of the rubber-band effect
    // As actualValue approaches MAX_TRAVEL, the increment gets smaller
    return (
      props.maxDragDistance *
      Math.tanh(actualValue / (props.maxDragDistance / RESISTANCE))
    );
  };

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
};

const endDrag = () => {
  if (!isDragging.value) return;
  isDragging.value = false;

  // Emit events based on the drag distance
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
  <div
    class="draggable-container select-none relative w-full h-full"
    @mousedown="startDrag"
    @mousemove="onDrag"
    @mouseup="endDrag"
    @mouseleave="endDrag"
    @touchstart="startDrag"
    @touchmove="onDrag"
    @touchend="endDrag"
  >
    <div :style="cardStyle" class="draggable-wrapper z-10 relative">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.select-none {
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-y;
}

.draggable-wrapper {
  will-change: transform;
}
</style>
