import { get } from "./get"
import { store } from "./store"
import { remove } from "./remove"
import { refetch } from "./refetch"
import { createSubset } from "../subset"
import type { Collection, SearchParams } from "../../types"
import type { CacheCollectionDefinition } from "../../types/inner"
import { getCache, getCollectionStore } from "../utils"

// collection definission is global on serveur 
// and on the client. Before each new request, 
// this object is cloned, only functions  
// with no context like toParams are keeped
export const collectionDefinitions: Record<string, CacheCollectionDefinition<unknown>> = {}

export const createMoxCacheCollection = <
    Schema extends Record<string, unknown>, 
    Search, 
    Foreign, 
    Subset,
    IdField extends string
>(
    collectionDefinition: CacheCollectionDefinition<Schema>,
    collectionName: string,
): Collection<Schema, Search, Foreign, Subset, IdField> => {

    // collection definition is an empty cache, 
    // on the serveur 
    collectionDefinitions[collectionName] = collectionDefinition as CacheCollectionDefinition<unknown>
    const collectionStore = () => getCollectionStore<Schema>(collectionName).collectionStore

    const fn = async <const Params extends SearchParams<Search, Foreign, IdField>>(
        params: Params
    ) => {
        return get<Schema, Search, Foreign, IdField, Params>(
            getCache().cache,
            collectionName, 
            params,
        )
    }

    Object.assign(fn, {
        store: (object: Schema) => store<Schema>(collectionStore(), object),
        remove: (id: string) => remove(collectionStore(), id),
        reftech: async (id: string) => refetch<Schema>(collectionStore(), id),
        _collectionName: collectionName,
    })

    for (const [subsetName, subset] of Object.entries(collectionDefinition.subsets)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (fn as any)[subsetName] = createSubset(
            collectionName,
            subset,
            subsetName
        )
    }

    return fn as Collection<Schema, Search, Foreign, Subset, IdField>
}

export default {
    createMoxCacheCollection
}
