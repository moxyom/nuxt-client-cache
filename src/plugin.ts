import { defineNuxtPlugin } from '#app'
import { collectionDefinitions } from './runtime/core/collection'
import { cloneCollection } from './runtime/core/collection/clone'
import type { CacheCollectionEntry } from './runtime/types/inner'

export default defineNuxtPlugin(() => {
    const moxClientCache: Record<string, CacheCollectionEntry<unknown>> = {}
    
    // once nuxt instance is available, 
    // clone collection definition into
    // a request specific scope (nuxt app)
    for (const [name, collection] of Object.entries(collectionDefinitions)) {
        moxClientCache[name] = cloneCollection(collection)
    }

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
