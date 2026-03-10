import { defineNuxtPlugin } from '#app'
import { collectionDefinitions } from './runtime/core/collection'
import { createCollectionStoreFrom } from './runtime/core/collection/clone'
import type { CacheCollectionStore } from './runtime/types/inner'

export default defineNuxtPlugin(() => {
    const useCache: Record<string, CacheCollectionStore<unknown>> = {}
    
    // once nuxt instance is available, 
    // clone collection definition into
    // a request specific scope (nuxt app)
    for (const [name, definition] of Object.entries(collectionDefinitions)) {
        useCache[name] = createCollectionStoreFrom(definition)
    }

    return {
        provide: {
            moxClientCache: useCache
        }
    }
})

declare module '#app' {
    interface NuxtApp {
        $moxClientCache: Record<string, CacheCollectionStore<unknown>>
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $moxClientCache: Record<string, CacheCollectionStore<unknown>>
    }
}
