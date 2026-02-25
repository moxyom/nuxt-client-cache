import { defineNuxtPlugin } from '#app'
import type { CacheCollectionEntry } from '../types/store'

export default defineNuxtPlugin(() => {
  const moxClientCache: Record<string, CacheCollectionEntry<any>> = {}

  return {
    provide: {
      moxClientCache: moxClientCache
    }
  }
})

declare module '#app' {
  interface NuxtApp {
    $moxClientCache: Record<string, CacheCollectionEntry<any>>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $moxClientCache: Record<string, CacheCollectionEntry<any>>
  }
}
