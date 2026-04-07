<script setup lang="ts">
import AppButton from './AppButton.vue'

const page = defineModel<number>({ required: true })

const props = defineProps<{
  totalPages: number
}>()
</script>

<template>
  <nav class="pagination card" aria-label="Pagination">
    <AppButton
      variant="secondary"
      type="button"
      aria-label="Go to previous page"
      :disabled="page <= 1"
      @click="page = page - 1"
    >
      Previous
    </AppButton>
    <p role="status" aria-live="polite" aria-atomic="true" class="page-status">
      Page {{ page }} of {{ props.totalPages }}
    </p>
    <AppButton
      variant="secondary"
      type="button"
      aria-label="Go to next page"
      :disabled="page >= props.totalPages"
      @click="page = page + 1"
    >
      Next
    </AppButton>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
}

.page-status {
  margin: 0;
  color: var(--text-secondary);
}
</style>
