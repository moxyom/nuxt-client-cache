import { watchEffect } from "vue"
import type { CacheCollectionStore, CacheSubsetStore } from "../types/inner"
import getCacheCtx from "./cache-provider"

/**
 * get the cache object within the nuxt contexte 
 * if called outside of this contexte, this
 * function will throw
 * @returns mox client cache object
 * @throws Error 
 */
export const getCache = getCacheCtx

/**
 * get the collection from the cache, throw if not exist
 * @param name the name of the collection desired
 * @returns the collection
 */
export const getCollectionStore = <Schema>(
    name: string,
) => {
    const ress = getCache()
    if (name in ress.cache) {
        return {
            ...ress,
            collectionStore: ress.cache[name] as CacheCollectionStore<Schema>
        }
    }

    throw new Error("No mox cache collection named " + name)
}

/**
 * get the cache, collection store and the subset,
 * throw if one of those doesn't exist
 * @param collectionName the subset's collection's name
 * @param subsetName the subset's name
 * @returns the cache, collection store and the subset
 */
export const getSubsetStore = <Schema>(
    collectionName: string,
    subsetName: string,
) => {
    const ress = getCollectionStore<Schema>(collectionName)
    if (subsetName in ress.collectionStore.subsets) {
        return {
            ...ress,
            subset: ress.collectionStore.subsets[subsetName] as CacheSubsetStore<Schema>
        }
    }

    throw new Error(`No subset named ${subsetName} for collection ${collectionName}`)
}

/**
 * stringify with keys sorted, to compare serialization
 * @param obj the object to serialize
 * @returns a string representation of the object
 */
export const stableStringify = (obj: unknown): string => {
    if (typeof obj == "string") { return obj }

    if (obj === null || typeof obj !== "object") {
        return JSON.stringify(obj)
    }

    if (Array.isArray(obj)) {
        return `[${obj.map(stableStringify).join(",")}]`
    }

    const keys = Object.keys(obj).sort()
    return `{${keys
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map(k => `${JSON.stringify(k)}:${stableStringify((obj as any)[k])}`)
        .join(",")}}`
}

/**
 * performe a watchEffect and wait for the
 *  first run of action to be effective
 * @param callback the function passed to watchEffect
 */
export const watchEffectAndWaitForFirstRun = async (
    callback: () => Promise<void>,
) => {
    // create a promise to wait for first 
    // action to be finished
    let resolveFirstRun: () => void
    const firstRunPromise = new Promise((r) => {
        resolveFirstRun = r as () => void
    })

    watchEffect(() => callback().then(resolveFirstRun))

    // wait for the first run of 
    // action to be effectif
    await firstRunPromise
}
