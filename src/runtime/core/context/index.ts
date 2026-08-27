import type { Ref } from "vue"
import { createWatchFunction } from "./watch"
import { createWatchListFunction, type WatchListParams } from "./watch-list"
import type {
    CacheCollectionStore,
    CacheScopeStore,
    CacheSearchStore,
    CacheVFieldStore,
} from "../../types/store"
import {
    createGetCollectionStoreFunction,
    createGetScopeStoreFunction,
    createGetSearchStoreFunction,
    createGetVFieldStoreFunction,
} from "./store-helpers"
import type { getCache } from "../utils/cache-provider"
import type { ErrorMultiplexer } from "../utils/errors"

export interface CacheContext {
    /**
     * watches the ref's value, run the `onchange` callback immediatly
     * and waits for it to finish his first run
     *
     * handles **throwed errors** and unwatched on tree node detached
     * @param ref the ref to watch (can be not a ref)
     * @param onchange a callback that will be run at each changes of the ref
     */
    watch<T>(
        ref: Ref<T> | T,
        onchange: (value: T, subCacheContext: CacheContext) => Promise<void>,
    ): Promise<void>

    /**
     * watches the list ref value. Every item is passed to the `map`
     * function of the `WatchListParams`, cached for later list ref updates. And then call
     * the `onDone` function of the `WatchListParams` is called
     *
     * @param params a WatchListParams object
     * @returns a promise that resolve when the first transformation is done
     */
    watchList: <From, To>(params: WatchListParams<From, To>) => Promise<void>

    clean(): void

    getCollectionStore: <Schema>(collectionName: string) => {
        collectionStore: CacheCollectionStore<Schema>
    }

    getScopeStore: <Schema>(
        collectionName: string,
        scopeName: string,
    ) => {
        collectionStore: CacheCollectionStore<Schema>
        scopeStore: CacheScopeStore<Schema>
    }

    getSearchStore: <Schema>(
        collectionName: string,
        searchName: string,
    ) => {
        collectionStore: CacheCollectionStore<Schema>
        searchStore: CacheSearchStore<Schema>
    }

    getVFieldStore: <Schema>(
        collectionName: string,
        vFieldName: string,
    ) => {
        collectionStore: CacheCollectionStore<Schema>
        vFieldStore: CacheVFieldStore<Schema>
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    runWithContext: <T extends () => any>(
        fn: T,
    ) => ReturnType<T> | Promise<Awaited<ReturnType<T>>>
}

/**
 * create a CacheContext
 * @param cache an optional cache object containing the store and a runWithContext function
 * @param multiplexer the error multiplexer used by the tree
 * @returns a Context
 */
export const createCacheContext = (
    cache: ReturnType<typeof getCache>,
    multiplexer: ErrorMultiplexer,
): CacheContext => {
    const cleanFunctions: (() => void)[] = []

    return {
        watch: createWatchFunction(cache, multiplexer, cleanFunctions),
        watchList: createWatchListFunction(cache, multiplexer, cleanFunctions),
        clean: () => {
            cleanFunctions.forEach((cleanFunction) => cleanFunction())
            cleanFunctions.splice(0, cleanFunctions.length)
        },

        getCollectionStore: createGetCollectionStoreFunction(cache),
        getScopeStore: createGetScopeStoreFunction(cache),
        getSearchStore: createGetSearchStoreFunction(cache),
        getVFieldStore: createGetVFieldStoreFunction(cache),

        runWithContext: cache.runWithContext,
    }
}
