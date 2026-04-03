<script setup lang="ts">
const page = defineModel<number>({ required: true })

const props = defineProps<{
  totalPages: number
}>()
</script>

<template>
  <div class="pagination card">
    <button class="button secondary" :disabled="page <= 1" @click="page = page - 1">Previous</button>
    <p>Page {{ page }} / {{ props.totalPages }}</p>
    <button class="button secondary" :disabled="page >= props.totalPages" @click="page = page + 1">
      Next
    </button>
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
