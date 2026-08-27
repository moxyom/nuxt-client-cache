import type { CacheCollectionDefinition } from "../types/definitions"
import { createCreateEditableFunction } from "./editables"
import { createStoreFunction, createUnstoreFunction } from "./storage"
import { createScopeAccessFunction } from "./scopes"
import { createSearchFunction } from "./searches"

export const createCollection = <Schema>(
    name: string,
    definition: CacheCollectionDefinition<Schema>,
) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collection: any = {
        _name: name,
        _idField: definition.idField,
        search: createSearchFunction(name),
        store: createStoreFunction(name),
        unstore: createUnstoreFunction(name),
        createEditable: createCreateEditableFunction(name),
    }

    for (const scopeName of Object.keys(definition.scopes)) {
        collection[scopeName] = createScopeAccessFunction(name, scopeName)
    }

    Object.assign(collection, definition.customFunctions)

    return collection
}
