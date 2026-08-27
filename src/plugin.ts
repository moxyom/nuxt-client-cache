import { defineNuxtPlugin } from "#app"
import { createStoreFromDefinitions } from "./runtime/definitions"
import type { CacheCollectionStore } from "./runtime/types/store"

export default defineNuxtPlugin(() => ({
    provide: {
        moxClientCache: createStoreFromDefinitions(),
    },
}))

declare module "#app" {
    interface NuxtApp {
        $moxClientCache: Record<string, CacheCollectionStore<unknown>>
    }
}

declare module "vue" {
    interface ComponentCustomProperties {
        $moxClientCache: Record<string, CacheCollectionStore<unknown>>
    }
}
