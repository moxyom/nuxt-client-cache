import type { SubsetAccessEntry } from "../../types"
import type { CacheSubsetEntry } from "../../types/inner"
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
    collectionIdField: string,
    subsetEntry: CacheSubsetEntry<Schema>
): SubsetAccessEntry<Schema, Search, Foreign, IdField, SEntry> {

    const result = subsetEntry.fetchAll 
        ? createAllFunction(
            collectionName,
            collectionIdField,
            subsetEntry, 
            subsetEntry.fetchAll
        )
        : {}

    if (subsetEntry.fetchRange) {
        Object.assign(
            result, 
            { 
                createIterator: createIteratorFunction(
                    collectionName,
                    collectionIdField,
                    subsetEntry, 
                    subsetEntry.fetchRange
                ) 
            }
            
        )
    }

    return result as SubsetAccessEntry<Schema, Search, Foreign, IdField, SEntry>
}
