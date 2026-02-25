import { defineNuxtModule, createResolver, addImports } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions { 
    verbose?: boolean
}

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: 'mox-client-cache',
        configKey: 'moxClientCache',
    },
    // Default configuration options of the Nuxt module
    defaults: {},
    setup(_options, _nuxt) {
        const resolver = createResolver(import.meta.url)

        addImports({
            name: 'defineMoxCacheCollection',
            as: 'defineMoxCacheCollection',
            from: resolver.resolve('./runtime/composables/defineMoxCacheCollection')
        })
    },
})
