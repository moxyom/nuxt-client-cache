import { CacheError } from "../../types/errors";
import type { CacheCollectionEntry } from "../../types/inner";
import { storeUnsafe } from "../collection/store";
import { stableStringify } from "../utils";

/**
 * retrieve the id corresponding to search params
 * from cache if present. If not fetch the record, 
 * store it if an object is return to avoid fetching it again, 
 * and return the id
 * 
 * @param searchMethod the name of the search methode used
 * @param params the params to include in the search function
 * @param collectionEntry current collection entry
 * @returns the id corresponding to the search params, or an error
 */
export const idFor = async <Schema>(
    searchMethod: string,
    params: unknown,
    collectionEntry: CacheCollectionEntry<Schema>
) => {
    const searchEntry = collectionEntry.searchEntries[searchMethod]
    if (!searchEntry) {
        throw new Error(`Unknown search method : ${searchMethod}`)
    }

    // get a string representation of the search
    // params, to be able to cache the result
    const paramsKey = stableStringify(params)
    
    // if search params already exists 
    // in cache, return the cached id
    const result = searchEntry.index.get(paramsKey)
    if (result) { return result }

    // else fetch 
    let ress

    try {
        // fetch the entity
        ress = await searchEntry.method(params)
    }catch(err) {
        return new CacheError(
            "self", 
            `error while searching by ${searchMethod} : ${err}`
        )
    }

    if (ress == null) {
        return new CacheError(
            "self", 
            `searching by ${searchMethod} returned null`
        )
    }

    // if the fetch only return an id
    // store it for later, and return the id
    if (typeof ress == "string") {
        searchEntry.index.set(paramsKey, ress)
        return ress
    }

    if (typeof ress != "object" || Array.isArray(ress)) {
        return new CacheError(
            "self", 
            `searching by ${searchMethod} returned a`
            + ` non-record value (${ress})`
        )
    }

    // make sure to use correct idField, 
    // and that it exist on ress
    const idFieldName = collectionEntry.idField
    if (!(idFieldName in ress)) {
        return new CacheError(
            "self", 
            `searching by ${searchMethod} returned an object with no "`
            + `${idFieldName}" field (${ress})`
        )
    }

    const id = (ress as Record<string, unknown>)[idFieldName]
    if (typeof id != "string") {
        return new CacheError(
            "self", 
            `searching by "${searchMethod}" returned an object with `
            + `an invalid "${idFieldName}" type. Expected a string `
            + `but received: ${typeof id} (${id})`
        )
    }

    // store record into cache, not to fetch it again
    // unsafe because we already checked and cutomized errors 
    storeUnsafe<Schema>(collectionEntry, ress, id)

    return id
}
