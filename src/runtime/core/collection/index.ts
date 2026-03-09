import { get } from "./get"
import { store } from "./store"
import { remove } from "./remove"
import { refetch } from "./refetch"
import { createSubset } from "../subset"
import type { Collection, SearchParams } from "../../types"
import type { CacheCollectionEntry } from "../../types/inner"
import { getCache } from "../utils"

// collection definission is global on serveur 
// and on the client. Before each new request, 
// this object is cloned, only functions  
// with no context like toParams are keeped
export const collectionDefinitions: Record<string, CacheCollectionEntry<unknown>> = {}

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

    // collection definition is an empty cache, 
    // on the serveur 
    collectionDefinitions[collectionName] = collectionEntry as CacheCollectionEntry<unknown>
    console.log("create definition for " + collectionName)

    const fn = async <const Params extends SearchParams<Search, Foreign, IdField>>(
        params: Params
    ) => {
        return get<Schema, Search, Foreign, IdField, Params>(
            getCache(),
            collectionName, 
            params,
        )
    }

    Object.assign(fn, {
        store: (object: Schema) => store<Schema>(collectionEntry, object),
        remove: (id: string) => remove(collectionEntry, id),
        reftech: async (id: string) => refetch<Schema>(collectionEntry, id),
        _collectionName: collectionName,
    })

    for (const [subsetName, entry] of Object.entries(collectionEntry.subsets)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (fn as any)[subsetName] = createSubset(
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
