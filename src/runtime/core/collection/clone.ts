import { shallowRef } from "vue";
import type { CacheCollectionEntry, CacheForeignEntry, CacheSearchEntry, CacheSubsetEntry } from "../../types/inner";

const cloneSearchEntry = (
    searchEntry: CacheSearchEntry<unknown>
): CacheSearchEntry<unknown> => {
    return {
        index: new Map(),
        method: searchEntry.method,
        toParams: searchEntry.toParams
    }
}

const cloneSubsetEntry = (
    subsetEntry: CacheSubsetEntry<unknown>
): CacheSubsetEntry<unknown> => {
    return {
        store: shallowRef([]),
        status: "empty",

        isIncluded: subsetEntry.isIncluded,
        fetchRange: subsetEntry.fetchRange,
        fetchAll: subsetEntry.fetchAll,
    }
}

const cloneForeignEntry = (
    subsetEntry: CacheForeignEntry<unknown, unknown>
): CacheForeignEntry<unknown, unknown> => {

    const collectionName = subsetEntry.collection()
    const searchBy = subsetEntry.searchBy == undefined
            ? undefined
            : { 
                name: subsetEntry.searchBy.name,
                transform: subsetEntry.searchBy.transform
            }

    return {
       collection: () => collectionName,
       isList: subsetEntry.isList,
       searchBy
    }
}

export const cloneCollection = (
    collectionEntry: CacheCollectionEntry<unknown>
): CacheCollectionEntry<unknown> => {

    const searchEntries: Record<string, CacheSearchEntry<unknown>> = {}
    for (const [name, entry] of Object.entries(collectionEntry.searchEntries)) {
        searchEntries[name] = cloneSearchEntry(entry)
    }

    const foreignFields: Record<string, CacheForeignEntry<unknown, unknown>> = {}
    for (const [name, entry] of Object.entries(collectionEntry.foreignFields)) {
        foreignFields[name] = cloneForeignEntry(entry)
    }

    const subsets: Record<string, CacheSubsetEntry<unknown>> = {}
    for (const [name, entry] of Object.entries(collectionEntry.subsets)) {
        subsets[name] = cloneSubsetEntry(entry)
    }

    return {
        fetch: collectionEntry.fetch,
        store: new Map(),
        idField: collectionEntry.idField,
        searchEntries,
        foreignFields,
        subsets
    }
}
