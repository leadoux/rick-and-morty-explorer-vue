# Rick and Morty Explorer

[![CI](https://github.com/leadoux/rick-and-morty-explorer-vue/actions/workflows/ci.yml/badge.svg)](https://github.com/leadoux/rick-and-morty-explorer-vue/actions/workflows/ci.yml)
[![Live](https://img.shields.io/website?url=https%3A%2F%2Frm-vue.leadoux.dev&label=live%20site)](https://rm-vue.leadoux.dev)

A Vue 3 + TypeScript project that demonstrates:

- Vue fundamentals (components, composition API, routing, state management)
- GraphQL API integration against the [Rick and Morty API](https://rickandmortyapi.com/graphql)
- UX polish (responsive layouts, loading/error/empty states, dark mode)
- Basic testing quality with Cypress smoke scenarios.

Live app: [https://rm-vue.leadoux.dev](https://rm-vue.leadoux.dev)

## Feature Map

- **Global search** across characters, episodes, and locations.
- **Explorer pages** with URL-synced filters and pagination:
  - Characters (`status`, `species`, `gender`, `name`)
  - Episodes (`name`, `season`)
  - Locations (`name`, `type`, `dimension`)
- **Detail pages** for each entity with relationship navigation.
- **Favorites** persisted in `localStorage`.
- **Compare workspace** for side-by-side character/episode comparison.
- **Dark mode** with persisted preference.

## Architecture Snapshot

- `src/router` contains route-based application flow.
- `src/stores` contains Pinia stores for favorites, compare state, and theme preferences.
- `src/lib/queries.ts` centralizes GraphQL operations.
- `src/lib/graphqlCache.ts` adds IndexedDB response caching with TTL and stale fallback on API rate limits.
- `src/views` provides page-level feature modules.
- `src/components` contains reusable UI elements (header, global search, pagination).

The app intentionally keeps API querying at the view level through composables from `@urql/vue`, while centralized stores manage cross-page state (theme, favorites, compare).

## Local Setup

```sh
pnpm install
```

## Development

```sh
pnpm dev
```

The dev server proxies GraphQL requests through `/graphql` to avoid browser CORS issues during local development.
For deployed environments, you can optionally set `VITE_GRAPHQL_URL` to route through your own backend/proxy endpoint.

## Quality Checks

```sh
pnpm lint
pnpm build
pnpm test:unit -- --run
pnpm test:e2e
```

## Cypress Smoke Coverage

- Global search returns grouped results.
- Character filter updates URL query params.
- Favorites persist through page reload.
- Compare flow works with selected characters.
- Theme preference persists after reload.

## Deployment

This project is configured for Netlify via `netlify.toml`.

- Production deploys from `main`
- Deploy previews for pull requests
- SPA route handling via Netlify redirect fallback (`/* -> /index.html`)

You can still deploy the static output anywhere using `dist/` after:

```sh
pnpm build
```
