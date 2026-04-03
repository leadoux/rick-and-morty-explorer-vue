import { computed, type WritableComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type FilterMap = Record<string, string>

type SyncedFilters<TFilters extends FilterMap> = {
  [K in keyof TFilters]: WritableComputedRef<string>
}

export const useUrlSyncedFilters = <TFilters extends FilterMap>(defaults: TFilters) => {
  const route = useRoute()
  const router = useRouter()

  const page = computed({
    get: () => {
      const rawValue = Number(route.query.page ?? 1)
      return Number.isFinite(rawValue) && rawValue > 0 ? rawValue : 1
    },
    set: (value: number) => {
      void router.replace({
        query: {
          ...route.query,
          page: String(value),
        },
      })
    },
  })

  const syncedFilters = {} as SyncedFilters<TFilters>

  const keys = Object.keys(defaults) as Array<keyof TFilters>
  for (const key of keys) {
    syncedFilters[key] = computed({
      get: () => String(route.query[key as string] ?? defaults[key]),
      set: (value: string) => {
        void router.replace({
          query: {
            ...route.query,
            page: '1',
            [key]: value || undefined,
          },
        })
      },
    })
  }

  const resetFilters = () => {
    void router.replace({ query: { page: '1' } })
  }

  return {
    page,
    filters: syncedFilters,
    resetFilters,
  }
}
