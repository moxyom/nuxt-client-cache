import type { Modifier } from ".";
import { CacheError } from "../../types/errors";
import type { CacheCollectionEntry } from "../../types/inner";
import { createIdsModifier } from "./list";

export function createIdsFieldMofifier(
    collectionCache: Record<string, CacheCollectionEntry<any>>,
    currentCollection: string,
    fieldName: string,
    foreignCollection: string,
    triggerUpdate: (err?: CacheError) => void
): Modifier {

    const listModifier = createIdsModifier(
        collectionCache, 
        foreignCollection, 
        `${currentCollection}.${fieldName}`,
        triggerUpdate
    )
    
    return async (object: any) => {
        
        // check that field exist and get the id
        if (fieldName! in object) {
            return new CacheError(
                `${currentCollection}.${fieldName}`,
                `field not found`
            )
        }

        // check id's type
        const ids = object[fieldName]
        if (!Array.isArray(ids)) {
            return new CacheError(
                `${currentCollection}.${fieldName}`,
                `must be an array`
            )
        }

        // call list modifier that will 
        // transform ids into actuals objects
        return listModifier(ids)
    }
}
