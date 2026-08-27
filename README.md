# Mox client cache

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A nuxt module to manage store and create reactive objects coming from the backend

- [🏀 Online playground](https://stackblitz.com/github/moxyom/nuxt-client-cache?file=playground%2Fapp.vue)

## Features

- reuse cached records and scopes
- guaranteed reactivity across the entire app
- works with SSR

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxt module add @moxyom/nuxt-client-cache
```

You can now create the directory `cache-collections` and 

That's it! You can now configure your collections

## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@moxyom/nuxt-client-cache/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/@moxyom/nuxt-client-cache

[npm-downloads-src]: https://img.shields.io/npm/dm/@moxyom/nuxt-client-cache.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/@moxyom/nuxt-client-cache

[license-src]: https://img.shields.io/npm/l/@moxyom/nuxt-client-cache.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@moxyom/nuxt-client-cache

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
