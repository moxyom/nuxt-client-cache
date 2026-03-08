import { get } from "./get"
import { store } from "./store"
import { remove } from "./remove"
import { refetch } from "./refetch"
import { createSubset } from "../subset"
import type { Collection, SearchParams } from "../../types"
import type { CacheCollectionEntry } from "../../types/inner"
import { useNuxtApp } from "#app"

// buffer, add collections in this list, so that 
// when contexte of nuxtApp is set, all collections 
// can be pushed and visible across all the application 
const pendingCollections: Record<string, CacheCollectionEntry<unknown>> = {}

export const createMoxCacheCollection = <
    Schema extends Record<string, unknown>, 
    Search, 
    Foreign, 
    Subset,
    IdField extends string
>(
    collectionEntry: CacheCollectionEntry<Schema>,
    collectionName: string,
): Collection<Schema, Search, Foreign, Subset, IdField> => {

    const fn = async <const Params extends SearchParams<Search, Foreign, IdField>>(
        params: Params
    ) => {
        return get<Schema, Search, Foreign, IdField, Params>(
            useNuxtApp().$moxClientCache, 
            collectionName, 
            params
        )
    }

    Object.assign(fn, {
        store: (object: Schema) => store<Schema>(collectionEntry, object),
        remove: (id: string) => remove(collectionEntry, id),
        reftech: async (id: string) => refetch<Schema>(collectionEntry, id)
    })

    for (const [subsetName, entry] of Object.entries(collectionEntry.subsets)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (fn as any)[subsetName] = createSubset(
            useNuxtApp().$moxClientCache,
            collectionName,
            collectionEntry.idField,
            entry
        )
    }

    return fn as Collection<Schema, Search, Foreign, Subset, IdField>
}

export default {
    createMoxCacheCollection
}
