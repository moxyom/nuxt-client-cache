import { shallowRef, triggerRef } from "vue";
import { CacheError } from "../../types/errors";
import type { CacheCollectionEntry } from "../../types/inner";
import { stableStringify } from "../utils";

/**
 * store an objet in the cache, 
 * without checking his validity
 * 
 * @param collectionEntry current collection entry
 * @param object the object to store
 * @param id the object's id
 */
export function storeUnsafe<Schema>(
    collectionEntry: CacheCollectionEntry<Schema>,
    object: Schema,
    id: string
) {

    // fill search indexes
    for (const [_, searchEntry] of Object.entries(collectionEntry.searchEntries)) {
        const key = searchEntry.toParams(object)
        if (key == null) { continue }

        searchEntry.index.set(stableStringify(key), id)
    }

    // fill subsets
    for (const [_, subset] of Object.entries(collectionEntry.subsets)) {
        if (!subset.isIncluded(object)) { continue }

        if (subset.status != "empty" && !subset.store.value.includes(id)) {
            subset.store.value.push(id)

            // only trigger ref if object is new 
            triggerRef(subset.store)
        }
    }

    collectionEntry.store.set(id, shallowRef(object))
}

/**
 * store an objet in the cache
 * 
 * @param collectionEntry current collection entry
 * @param object object to store
 */
export function store<Schema>(
    collectionEntry: CacheCollectionEntry<Schema>,
    object: unknown
) {

    if (object == null || typeof object != "object") {
        return new CacheError(
            "self", 
            `object to store must be a record (${object})`
        )
    }

    const idFieldName = collectionEntry.idField
    if (!(idFieldName in object)) {
        return new CacheError(
            `self`,
            `storing an object with no ${idFieldName} field (${object})`
        )
    }
    
    const id = (object as Record<string, unknown>)[idFieldName]
    if (typeof id != "string") {
        return new CacheError(
            "self", 
            `storing an object with an invalid "${idFieldName}" type. `
            + `Expected a string but received: ${typeof id} (${id})`
        )
    }

    storeUnsafe(
        collectionEntry,
        object as Schema,
        id
    )
}
