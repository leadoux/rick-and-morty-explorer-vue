import type { CombinedError } from '@urql/core'

export const isNoResultsError = (error: CombinedError | undefined) => {
  if (!error) return false
  return error.graphQLErrors.some((item) => item.message.toLowerCase().includes('there is nothing here'))
}
