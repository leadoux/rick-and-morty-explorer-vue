<template>
  <section class="card">
    <h1>Page Not Found</h1>
    <p class="hint">The route does not exist. Return to the main explorer pages.</p>
    <div class="row">
      <RouterLink class="button" to="/characters">Characters</RouterLink>
      <RouterLink class="button secondary" to="/episodes">Episodes</RouterLink>
      <RouterLink class="button secondary" to="/locations">Locations</RouterLink>
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
