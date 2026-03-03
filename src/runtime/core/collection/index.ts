import { get } from "./get"
import { store } from "./store"
import { remove } from "./remove"
import { refetch } from "./refetch"
import { createSubset } from "../subset"
import type { Collection, SearchParams } from "../../types"
import type { CacheCollectionEntry } from "../../types/inner"

export const createMoxCacheCollection = <
    Schema, 
    Search, 
    Foreign, 
    Subset
>(
    collectionCache: Record<string, CacheCollectionEntry<unknown>>,
    collectionEntry: CacheCollectionEntry<Schema>,
    collectionName: string,
): Collection<Schema, Search, Foreign, Subset> => {

    const fn = async <const Params extends SearchParams<Search, Foreign>>(
        params: Params
    ) => {
        return get<Schema, Foreign, Params>(collectionCache, collectionName, params)
    }

    Object.assign(fn, {
        store: (object: Schema) => store(object),
        remove: (id: string) => remove(id),
        reftech: async (id: string) => refetch(id)
    })

    for (const [subsetName, entry] of Object.entries(collectionEntry.subsets)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (fn as any)[subsetName] = createSubset(entry)
    }

    return fn as Collection<Schema, Search, Foreign, Subset>
}

export default {
    createMoxCacheCollection
}
