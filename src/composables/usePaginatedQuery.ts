import { computed, type ComputedRef, type MaybeRefOrGetter, toValue } from 'vue'
import { useQuery } from '@urql/vue'

type PaginatedSelection<TItem> = {
  results: TItem[]
  pages: number
  count: number
}

type PaginatedQueryOptions<TData, TVariables, TItem> = {
  query: string
  variables: ComputedRef<TVariables>
  pause?: MaybeRefOrGetter<boolean>
  select: (data: TData | undefined) => PaginatedSelection<TItem>
}

export const usePaginatedQuery = <TData, TVariables extends Record<string, unknown>, TItem>(
  options: PaginatedQueryOptions<TData, TVariables, TItem>,
) => {
  const { data, fetching, error } = useQuery<TData, TVariables>({
    query: options.query,
    variables: options.variables,
    pause: computed(() => Boolean(toValue(options.pause))),
  })

  const selection = computed(() => options.select(data.value))

  const items = computed(() => selection.value.results)
  const totalPages = computed(() => selection.value.pages)
  const totalCount = computed(() => selection.value.count)

  return {
    data,
    fetching,
    error,
    items,
    totalPages,
    totalCount,
  }
}
