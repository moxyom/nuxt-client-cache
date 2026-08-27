import { useNuxtApp } from "#app"
import { InternalError } from "../../types/errors"

/**
 * get the cache object within the nuxt contexte
 * if called outside of this contexte, this
 * function will throw
 * @returns mox client cache object
 * @throws Error
 */
export const getCache = () => {
    try {
        const nuxtApp = useNuxtApp()
        return {
            store: nuxtApp.$moxClientCache,
            runWithContext: nuxtApp.runWithContext,
        }
    } catch {
        throw new InternalError(
            "Unable to get nuxt app context.\n" +
                "It may be due to using a collection inside nested async functions",
        )
    }
}
