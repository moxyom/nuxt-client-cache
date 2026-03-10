import { shallowRef, triggerRef } from "vue";
import { CacheError } from "../../types/errors";
import type { CacheCollectionStore } from "../../types/inner";
import { stableStringify } from "../utils";

/**
 * store an objet in the cache, 
 * without checking his validity
 * @param collectionStore current collection
 * @param object the object to store
 * @param id the object's id
 */
export function storeUnsafe<Schema>(
    collectionStore: CacheCollectionStore<Schema>,
    object: Schema,
    id: string
) {

    // fill search indexes
    for (const [_, search] of Object.entries(collectionStore.searches)) {
        const key = search.toParams(object)
        if (key == null) { continue }

        search.index.set(stableStringify(key), id)
    }

    // fill subsets
    for (const [_, subset] of Object.entries(collectionStore.subsets)) {
        if (!subset.isIncluded(object)) { continue }

        if (subset.status != "empty" && !subset.ids.value.includes(id)) {
            subset.ids.value.push(id)

            // only trigger ref if object is new 
            triggerRef(subset.ids)
        }
    }

    const entry = collectionStore.index.get(id)
    if (entry) {
        entry.value = object
    }else {
        collectionStore.index.set(id, shallowRef(object))
    }
}

/**
 * store an objet in the cache
 * @param collectionStore current collection store
 * @param object object to store
 */
export function store<Schema>(
    collectionStore: CacheCollectionStore<Schema>,
    object: unknown
) {

    if (object == null || typeof object != "object") {
        return new CacheError(
            "self", 
            `object to store must be a record (${object})`
        )
    }

    const idFieldName = collectionStore.idField
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
        collectionStore,
        object as Schema,
        id
    )
}
