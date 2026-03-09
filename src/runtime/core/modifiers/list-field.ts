import type { Modifier } from ".";
import type { SearchParams } from "../../types";
import { CacheError } from "../../types/errors";
import { get } from "../collection/get";
import { createItemListModifier } from "./list";

export function createItemListFieldMofifier<
    Schema extends Record<string, unknown>,
    Field extends keyof Schema & string,
    FSchema extends Record<string, unknown>,
    FIdField extends string,
    FSearch,
    FForeign,
    FParams extends SearchParams<FSearch, FForeign, FIdField>
>(
    currentCollection: string,
    fieldName: Field,
    foreignCollection: string,
    triggerUpdate: (err?: CacheError) => void,
    toParams: (o: Schema, index: number) => FParams
): Modifier<Schema> {

    let currentObject: Schema
    const listModifier = createItemListModifier(
        `${currentCollection}.${fieldName}`,
        triggerUpdate,
        (k: number) => get<FSchema, FSearch, FForeign, FIdField, FParams>(
            foreignCollection,
            toParams(currentObject, k)
        )        
    )
    
    return async (object: Schema) => {

        // check itemList's type
        const itemList = object[fieldName]
        if (!Array.isArray(itemList)) {
            return triggerUpdate(new CacheError(
                `${currentCollection}.${fieldName}`,
                "must be an array"
            ))
        }

        // remember object for toParams function
        currentObject = object

        // call list modifier that will 
        // transform ids into actuals objects
        return await listModifier(itemList)
    }
}
