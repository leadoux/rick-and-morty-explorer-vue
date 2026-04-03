import { ref, watch, type Ref } from 'vue'

export const useDebouncedValue = <T>(source: Ref<T>, delayMs = 300) => {
  const debounced = ref(source.value) as Ref<T>
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  watch(
    source,
    (nextValue) => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        debounced.value = nextValue
      }, delayMs)
    },
    { immediate: true },
  )

  return debounced
}
