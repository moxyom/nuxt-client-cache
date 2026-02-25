import type { CacheSubsetEntry } from "../../types/inner";
import type { SubsetBuilded } from "../../types/public";
import { createAllFunction } from "./all";
import { createIteratorFunction } from "./iterator";

export function createSubset<
    Subset, Schema, Foreign
>(
    subsetEntry: CacheSubsetEntry<Schema>
): SubsetBuilded<Subset, Schema, Foreign> {

    const result = "fetchAll" in subsetEntry 
        ? createAllFunction(subsetEntry.store, subsetEntry.fetchAll)
        : {}

    if ("fetchRange" in subsetEntry) {
        Object.assign(result, 
            createIteratorFunction(subsetEntry.store, subsetEntry.fetchRange)
        )
    }

    return result
}
