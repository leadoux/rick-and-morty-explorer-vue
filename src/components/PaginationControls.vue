<script setup lang="ts">
import AppButton from './AppButton.vue'

const page = defineModel<number>({ required: true })

const props = defineProps<{
  totalPages: number
}>()
</script>

<template>
  <div class="pagination card">
    <AppButton variant="secondary" :disabled="page <= 1" @click="page = page - 1">Previous</AppButton>
    <p>Page {{ page }} / {{ props.totalPages }}</p>
    <AppButton variant="secondary" :disabled="page >= props.totalPages" @click="page = page + 1">Next</AppButton>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
}

p {
  margin: 0;
  color: var(--text-secondary);
}
</style>
