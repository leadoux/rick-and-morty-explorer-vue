<script setup lang="ts">
import AppButton from '@/components/AppButton.vue'
</script>

<template>
  <section class="card">
    <h1>Page Not Found</h1>
    <p class="hint">The route does not exist. Return to the main explorer pages.</p>
    <div class="row">
      <AppButton to="/characters">Characters</AppButton>
      <AppButton variant="secondary" to="/episodes">Episodes</AppButton>
      <AppButton variant="secondary" to="/locations">Locations</AppButton>
    </div>
  </section>
</template>

<style scoped>
.row {
  margin-top: 0.7rem;
  display: flex;
  gap: 0.5rem;
}
</style>
