import { isRef, type Ref } from "vue"
import { createCacheContext, type CacheContext } from "."
import type { CacheError } from "../../types/errors"
import { asyncWatchEffect } from "../utils/async-reactivity"
import { anyToCacheError, type ErrorMultiplexer } from "../utils/errors"
import type { getCache } from "../utils/cache-provider"

export const createWatchFunction = (
    cache: ReturnType<typeof getCache>,
    multiplexer: ErrorMultiplexer,
    cleanFunctions: (() => void)[],
) => {
    return async <T>(
        ref: Ref<T> | T,
        onchange: (value: T, subContext: CacheContext) => Promise<void>,
    ) => {
        // create sub cache context passed to onchange callback
        const subContext = createCacheContext(cache, multiplexer)

        // error catched at prev iteration of the watch effect
        let prevError: CacheError | null = null
        const watchHandle = asyncWatchEffect(async () => {
            // remove prev watch iteration artefacts
            // which are prevError and child sub errors and watches
            subContext.clean()
            if (prevError) multiplexer.unregister(prevError)

            const refValue = isRef(ref) ? ref.value : ref

            try {
                await onchange(refValue, subContext)
            } catch (e: unknown) {
                prevError = anyToCacheError(e)
                multiplexer.register(prevError)
            }
        })

        // clearing this watch is removing prevError if
        // it exist, remove child errors and watches and
        // unwatch actual watchEffect
        cleanFunctions.push(() => {
            watchHandle.stop()
            subContext.clean()
            if (prevError) multiplexer.unregister(prevError)
        })

        await watchHandle.firstRun
    }
}
