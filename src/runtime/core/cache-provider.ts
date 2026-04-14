import { useNuxtApp } from "#app"

// provide cache and runWithContext
export default () => {
    const nuxtApp = useNuxtApp()
    return { 
        cache: nuxtApp.$moxClientCache,
        runWithContext: nuxtApp.runWithContext
    }
}
