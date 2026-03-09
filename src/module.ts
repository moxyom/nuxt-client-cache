import { defineNuxtModule, createResolver, addPlugin, addImportsDir, addImports, addPluginTemplate } from '@nuxt/kit'
import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

interface Config {
    verbose?: boolean
}

export default defineNuxtModule<Config>({
    meta: {
        name: 'mox-client-cache',
        configKey: 'moxClientCache',
    },
    defaults: {},
    setup(_options, nuxt) {
        const resolver = createResolver(import.meta.url)

        // read collection dir
        const moduleFolder = resolve(nuxt.options.srcDir, 'mox-cache')
        if (existsSync(moduleFolder)) {
            const files = readdirSync(moduleFolder).filter(f => f.endsWith('.ts') || f.endsWith('.js'))

            // generate a build file that 
            // import all of collection files
            addPluginTemplate({
                filename: 'mox-client-cache.mjs',
                write: true,
                getContents: () => {
                    const imports = files
                        .map((f, i) => `import * as f${i} from '${resolve(moduleFolder, f)}'`)
                        .join('\n')
                    
                    return `${imports}\n\nexport default defineNuxtPlugin(() => {})`
                }
            })

            // permit auto import
            addImportsDir(moduleFolder)

            // include main plugin 
            // in charge of orchestrating
            addPlugin(resolver.resolve('./plugin'))

            // auto import defineMoxCacheCollection function
            addImports({
                name: 'defineMoxCacheCollection',
                from: resolver.resolve('./runtime/composables/define-mox-cache-collection')
            })
        }
    },
})
