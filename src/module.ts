import { defineNuxtModule, createResolver, addImports } from '@nuxt/kit'

interface Config {
    verbose?: boolean
}

export default defineNuxtModule<Config>({
    meta: {
        name: 'mox-client-cache',
        configKey: 'moxClientCache',
    },
    defaults: {},
    setup(_options, _nuxt) {
        const resolver = createResolver(import.meta.url)

        addImports({
            name: 'defineMoxCacheCollection',
            from: resolver.resolve('./runtime/composables/define-mox-cache-collection')
        })
    },
})
