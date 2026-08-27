import { watchEffect, type Ref } from "vue"
import { createCacheContext, type CacheContext } from "."
import { asyncWatchEffect } from "../utils/async-reactivity"
import { anyToCacheError, type ErrorMultiplexer } from "../utils/errors"
import { CacheError } from "../../types/errors"
import { stableStringify } from "../utils"
import type { getCache } from "../utils/cache-provider"

export interface WatchListParams<From, To> {
    from: Ref<From[]>
    onDone(newList: To[]): void
    map(item: From, subContext: CacheContext): Promise<Ref<To>>
}

interface State<To> {
    list: To[]
    cache: Map<
        string,
        {
            unwatch: () => void
            indexInList: number
            content: Ref<To> | CacheError
        }
    >
}

const clearCacheObject = (
    cache: State<unknown>["cache"],
    multiplexer: ErrorMultiplexer,
) => {
    for (const entry of cache.values()) {
        entry.unwatch()
        if (entry.content instanceof CacheError)
            multiplexer.unregister(entry.content)
    }
}

export const createWatchListFunction = (
    cache: ReturnType<typeof getCache>,
    multiplexer: ErrorMultiplexer,
    cleanFunctions: (() => void)[],
) => {
    return async <From, To>(params: WatchListParams<From, To>) => {
        const state: State<To> = {
            list: [],
            cache: new Map(),
        }

        const watchHandle = asyncWatchEffect(async () => {
            const items = params.from.value

            const newCache: State<To>["cache"] = new Map()
            const promises: Promise<void>[] = []

            state.list = []
            for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
                const item = items[itemIndex]!
                const itemStr = stableStringify(item)

                const entry = state.cache.get(itemStr)
                if (entry) {
                    // reuse entry
                    newCache.set(itemStr, entry)
                    state.cache.delete(itemStr)

                    // update list index for watch setters
                    entry.indexInList = itemIndex

                    // fill list with old value
                    // if prev entry has throw an error,
                    // the error is still in multiplexer, nothing to do
                    if (!(entry.content instanceof CacheError))
                        state.list[itemIndex] = entry.content.value

                    continue
                }

                promises.push(
                    (async () => {
                        const subContext = createCacheContext(
                            cache,
                            multiplexer,
                        )

                        let valueRef: Ref<To>
                        try {
                            valueRef = await params.map(item, subContext)
                        } catch (e: unknown) {
                            // prefix errors with the item
                            const cacheError = anyToCacheError(e).prefixWith(
                                String(item),
                            )
                            multiplexer.register(cacheError)
                            newCache.set(itemStr, {
                                unwatch: subContext.clean,
                                indexInList: itemIndex,
                                content: cacheError,
                            })

                            return
                        }

                        // watch the ref returned by the map function
                        const unwatchSetter = watchEffect(() => {
                            const value = valueRef.value

                            // if there is no entry yet, this is the first time the
                            // value is constructed, so itemIndex is still correct
                            // otherwise it can have change, so get it from the entry
                            const entry = state.cache.get(itemStr)
                            const index = entry ? entry.indexInList : itemIndex

                            state.list[index] = value
                        })

                        newCache.set(itemStr, {
                            unwatch: () => {
                                unwatchSetter()
                                subContext.clean()
                            },
                            indexInList: itemIndex,
                            content: valueRef,
                        })
                    })(),
                )
            }

            await Promise.all(promises)

            // clear old items and set new cache
            clearCacheObject(state.cache, multiplexer)
            state.cache = newCache

            params.onDone(state.list)
        })

        cleanFunctions.push(() => {
            watchHandle.stop()
            clearCacheObject(state.cache, multiplexer)
        })

        await watchHandle.firstRun
    }
}
