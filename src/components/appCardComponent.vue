<template>
  <div class="app-card">
    <slot />
  </div>
</template>

<style scoped>
.app-card {
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  border-radius: var(--radius-xl);
  padding: 2rem;
  width: 100%;
}
</style>