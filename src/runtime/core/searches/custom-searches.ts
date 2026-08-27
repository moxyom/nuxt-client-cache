import { shallowRef } from "vue"
import { store } from "../storage"
import { handleProvides } from "../storage/provides"
import { stableStringify } from "../utils"
import { safeExecuteProvidedFunction } from "../utils/errors"
import { NotFoundError } from "../../types/errors"
import type { CacheContext } from "../context"

/**
 * find the id of the record search by the *search method*
 * @param ctx cache context
 * @param collectionName the collection name
 * @param searchMethod the search method name
 * @param searchParams an object consisting of the search params
 * @param extras an object with *withified* vfields key representing the associations needed at the end
 * @returns the id of the record
 * @throws CacheError if something went wrong
 */
export const getIdFor = async (
    ctx: CacheContext,
    collectionName: string,
    searchMethod: string,
    searchParams: object,
    extras: object,
) => {
    const { collectionStore, searchStore } = ctx.getSearchStore(
        collectionName,
        searchMethod,
    )

    // get a string representation of the search
    // params, to be able to cache the result
    const paramsKey = stableStringify(searchParams)

    // if search params already exists
    // in cache, return the cached id
    const result = searchStore.index.get(paramsKey)
    if (result) {
        return result
    }

    // call provided search function
    const ress = await safeExecuteProvidedFunction(
        ctx,
        collectionName,
        `search by ${searchMethod}`,
        () => searchStore.search(searchParams, extras),
    )

    if (!ress)
        throw new NotFoundError(
            `unable to find ${collectionName} record (searching by ${searchMethod})`,
        )

    // store returned records
    if (ress.provides) handleProvides(ctx, ress.provides)
    store(ctx, collectionName, ress.record)

    // store params to id association
    const searchedRecordId = (ress.record as Record<string, string>)[
        collectionStore.idField
    ]!
    const idRef = shallowRef<string | null>(searchedRecordId)
    searchStore.index.set(paramsKey, idRef)
    return idRef
}
