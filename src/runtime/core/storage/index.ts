import { triggerRef, unref } from "vue"
import { CacheError, ValidationError } from "../../types/errors"
import { stableParse, stableStringify } from "../utils"
import {
    createErrorMultiplexer,
    safeExecuteProvidedFunction,
} from "../utils/errors"
import { createCacheContext, type CacheContext } from "../context"
import { getCache } from "../utils/cache-provider"

export const store = <Schema>(
    ctx: CacheContext,
    collectionName: string,
    recordUnchecked: unknown,
) => {
    // unref recordUnchecked just in case
    recordUnchecked = unref(recordUnchecked)

    const { collectionStore } = ctx.getCollectionStore<Schema>(collectionName)

    const errors = safeExecuteProvidedFunction(
        ctx,
        collectionName,
        "validate",
        () => collectionStore.validationFunction(recordUnchecked),
    )

    if (errors !== null) throw new ValidationError(errors)
    const record = recordUnchecked as Schema

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recordId = (record as any)[collectionStore.idField] as string

    // store record in index
    const recordRef = collectionStore.index.setValue(recordId, record)

    // store params to id in searches store
    for (const searchStore of Object.values(collectionStore.searches)) {
        const params = searchStore.toParams(record)
        if (params !== null)
            searchStore.index.setValue(stableStringify(params), recordId)
    }

    // store scopes
    for (const scopeStore of Object.values(collectionStore.scopes)) {
        // for each dynamic params
        for (const [paramsStr, scopeData] of scopeStore.perParams.entries()) {
            // get an exemple params from string representation
            const params = stableParse(paramsStr)
            if (scopeStore.isIncluded(record, params) !== true) continue

            // TODO: add possibility to have sorted scopes and do a binary search
            if (scopeData.ids.value.includes(recordId)) continue

            // add record and trigger shallowRef scope ref
            scopeData.ids.value.push(recordId)
            triggerRef(scopeData.ids)
        }
    }

    return recordRef
}

export const unstore = (
    ctx: CacheContext,
    collectionName: string,
    recordId: string,
) => {
    const { collectionStore } = ctx.getCollectionStore(collectionName)

    // instore record in scopes
    for (const scopeStore of Object.values(collectionStore.scopes)) {
        // for each dynamic params
        for (const scopeData of scopeStore.perParams.values()) {
            const index = scopeData.ids.value.indexOf(recordId)
            if (index == -1) continue

            scopeData.ids.value.splice(index, 1)
            triggerRef(scopeData.ids)
        }
    }

    // unstore in search
    for (const searchStore of Object.values(collectionStore.searches)) {
        for (const [key, ref] of searchStore.index.entries()) {
            if (ref.value == recordId) searchStore.index.delete(key)
        }
    }

    // unstore in main data store
    collectionStore.index.delete(recordId)
}

export const createStoreFunction = <Schema>(collectionName: string) => {
    return (record: Schema) => {
        try {
            const cache = getCache()
            const errorMultiplexer = createErrorMultiplexer()
            const ctx = createCacheContext(cache, errorMultiplexer)
            store(ctx, collectionName, record)
        } catch (e) {
            if (e instanceof CacheError) return e
            throw e
        }
    }
}

export const createUnstoreFunction = (collectionName: string) => {
    return (recordId: string) => {
        try {
            const errorMultiplexer = createErrorMultiplexer()
            const cache = getCache()
            const ctx = createCacheContext(cache, errorMultiplexer)
            unstore(ctx, collectionName, recordId)
        } catch (e) {
            if (e instanceof CacheError) return e
            throw e
        }
    }
}
