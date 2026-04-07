# Rick and Morty Explorer

[![CI](https://github.com/leadoux/rick-and-morty-explorer-vue/actions/workflows/ci.yml/badge.svg)](https://github.com/leadoux/rick-and-morty-explorer-vue/actions/workflows/ci.yml)
[![Live](https://img.shields.io/website?url=https%3A%2F%2Frm-vue.leadoux.dev&label=live%20site)](https://rm-vue.leadoux.dev)

A Vue 3 + TypeScript project that demonstrates:

- Vue fundamentals (components, composition API, routing, state management)
- GraphQL API integration against the [Rick and Morty API](https://rickandmortyapi.com/graphql)
- UX polish (responsive layouts, loading/error/empty states, dark mode)
- Basic testing quality with Cypress smoke scenarios.

> Project status: this repository is approximately **70% complete**.

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

### Content Security Policy (Netlify)

The site sends a **`Content-Security-Policy`** via [`public/_headers`](public/_headers) (copied into `dist/` on build). Netlify applies it from the publish root.

- **GraphQL origin:** `connect-src` allows `https://rickandmortyapi.com` (see [`src/main.ts`](src/main.ts)). If you set **`VITE_GRAPHQL_URL`** in Netlify to a different origin (your own proxy), **add that origin’s scheme and host** to `connect-src` in `public/_headers` or API calls will be blocked by the browser.
- **Optional rollout:** you can temporarily deploy the same policy as **`Content-Security-Policy-Report-Only`** (and a reporting endpoint) to log violations before enforcing; keep a single source of truth so you do not ship duplicate conflicting CSP headers.

**After deploy, verify manually:** open DevTools → Network → document response → confirm `Content-Security-Policy`. Exercise list pages, detail pages, global search, pagination, images, and theme toggle. Repeat on a deploy preview if you use PR previews.

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

This project is configured for Netlify via `netlify.toml` and security headers via `public/_headers` (see [Content Security Policy](#content-security-policy-netlify) above).

- Production deploys from `main`
- Deploy previews for pull requests
- SPA route handling via Netlify redirect fallback (`/* -> /index.html`)

You can still deploy the static output anywhere using `dist/` after:

```sh
pnpm build
```
