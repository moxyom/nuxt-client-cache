import {
    defineNuxtModule,
    createResolver,
    addPlugin,
    addImportsDir,
    addImports,
    addPluginTemplate,
} from "@nuxt/kit"
import { existsSync, readdirSync } from "node:fs"
import { resolve } from "node:path"

export default defineNuxtModule({
    meta: { name: "mox-client-cache", configKey: "moxClientCache" },
    defaults: {},
    setup(_, nuxt) {
        const resolver = createResolver(import.meta.url)

        // read collection dir
        const moduleFolder = resolve(nuxt.options.srcDir, "cache-collections")
        if (!existsSync(moduleFolder)) return

        const files = readdirSync(moduleFolder).filter(
            (f) => f.endsWith(".ts") || f.endsWith(".js"),
        )

        // generate a build file that
        // import all of collection files
        addPluginTemplate({
            filename: "mox-client-cache.mjs",
            write: true,
            getContents: () => {
                const imports = files
                    .map((f, i) => {
                        return `import * as f${i} from '${resolve(moduleFolder, f)}'`
                    })
                    .join("\n")

                return `${imports}\n\nexport default defineNuxtPlugin(() => {})`
            },
        })

        // permit auto import
        addImportsDir(moduleFolder)

        // include main plugin
        // in charge of orchestrating
        addPlugin(resolver.resolve("./plugin"))

        // auto import defineCollection function
        addImports({
            name: "defineCollection",
            from: resolver.resolve("./runtime/builder"),
        })

        addImports({
            name: "shallowCollection",
            from: resolver.resolve("./runtime/builder"),
        })
    },
})
