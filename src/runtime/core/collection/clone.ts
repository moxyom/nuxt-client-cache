import { shallowRef } from "vue";
import type { CacheCollectionDefinition, CacheCollectionStore, CacheForeignDefinition, CacheForeignStore, CacheSearchDefinition, CacheSearchStore, CacheSubsetDefinition, CacheSubsetStore } from "../../types/inner";

const createSearchStoreFrom = (
    definition: CacheSearchDefinition<unknown>
):  CacheSearchStore<unknown> => {
    return {
        index: new Map(),
        method: definition.method,
        toParams: definition.toParams
    }
}

const createForeignStoreFrom = (
    definition: CacheForeignDefinition<unknown, unknown>
): CacheForeignStore<unknown, unknown> => {

    const collectionName = definition.collection()
    const searchBy = definition.searchBy == undefined
            ? undefined
            : { 
                name: definition.searchBy.name,
                transform: definition.searchBy.transform
            }

    return {
       collection: () => collectionName,
       isList: definition.isList,
       searchBy
    }
}

const createSubsetStoreFrom = (
    definition: CacheSubsetDefinition<unknown>
): CacheSubsetStore<unknown> => {
    return {
        ids: shallowRef([]),
        status: "empty",

        isIncluded: definition.isIncluded,
        fetchRange: definition.fetchRange,
        fetchAll: definition.fetchAll,
    }
}

export const createCollectionStoreFrom = (
    definition: CacheCollectionDefinition<unknown>
): CacheCollectionStore<unknown> => {

    const searches: Record<string, CacheSearchStore<unknown>> = {}
    for (const [name, searchDefinition] of Object.entries(definition.searches)) {
        searches[name] = createSearchStoreFrom(searchDefinition)
    }

    const foreigns: Record<string, CacheForeignStore<unknown, unknown>> = {}
    for (const [name, foreignDefinition] of Object.entries(definition.foreigns)) {
        foreigns[name] = createForeignStoreFrom(foreignDefinition)
    }

    const subsets: Record<string, CacheSubsetStore<unknown>> = {}
    for (const [name, subsetDefinition] of Object.entries(definition.subsets)) {
        subsets[name] = createSubsetStoreFrom(subsetDefinition)
    }

    return {
        fetch: definition.fetch,
        idField: definition.idField,
        index: new Map(),

        searches,
        foreigns,
        subsets
    }
}
