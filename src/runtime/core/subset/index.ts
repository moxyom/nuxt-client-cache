import type { SubsetAccessEntry } from "../../types"
import type { CacheSubsetDefinition } from "../../types/inner"
import { createAllFunction } from "./all"
import { createIteratorFunction } from "./iterator"

export function createSubset<
    Schema extends Record<string, unknown>, 
    Search, 
    Foreign, 
    IdField extends string, 
    SEntry
>(
    collectionName: string,
    subsetDefinition: CacheSubsetDefinition<Schema>,
    subsetName: string
): SubsetAccessEntry<Schema, Search, Foreign, IdField, SEntry> {

    const result = subsetDefinition.fetchAll
        ? createAllFunction(collectionName, subsetName)
        : {}

    if (subsetDefinition.fetchRange) {
        Object.assign(
            result, 
            { createIterator: createIteratorFunction(collectionName, subsetName) }
        )
    }

    return result as SubsetAccessEntry<Schema, Search, Foreign, IdField, SEntry>
}
