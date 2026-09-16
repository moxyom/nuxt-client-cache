import { defineNuxtPlugin } from "#app"
import { createStoreFromDefinitions } from "./definitions"
import type { CacheCollectionStore } from "./types/store"

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
