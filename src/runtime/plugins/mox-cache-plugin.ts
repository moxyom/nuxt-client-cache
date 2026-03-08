import { defineNuxtPlugin } from '#app'
import type { CacheCollectionEntry } from '../types/inner'

export default defineNuxtPlugin(() => {
    const moxClientCache: Record<string, CacheCollectionEntry<unknown>> = {}
    
    return {
        provide: {
            moxClientCache
        }
    }
})

declare module '#app' {
    interface NuxtApp {
        $moxClientCache: Record<string, CacheCollectionEntry<unknown>>
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $moxClientCache: Record<string, CacheCollectionEntry<unknown>>
    }
}
