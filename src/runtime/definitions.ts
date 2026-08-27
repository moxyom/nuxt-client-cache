/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
    CacheSearchDefinition,
    CacheVFieldDefinition,
    CacheScopeDefinition,
    CacheCollectionDefinition,
} from "./types/definitions"
import {
    type CacheSearchStore,
    type CacheVFieldStore,
    type CacheScopeStore,
    type CacheCollectionStore,
    DataStore,
} from "./types/store"

// collection definition is global on serveur
// and on the client. Before each new request,
// this object is cloned, only functions
// with no context like toParams are keeped
export const collectionDefinitions: Record<
    string,
    CacheCollectionDefinition<any>
> = {}

const createSearchStoreFrom = (
    definition: CacheSearchDefinition<unknown>,
): CacheSearchStore<unknown> => ({
    index: new DataStore(),
    search: definition.search,
    toParams: definition.toParams,
})

const createVFieldStoreFrom = (
    definition: CacheVFieldDefinition<unknown>,
): CacheVFieldStore<unknown> => {
    const collectionName = definition.collection()
    return {
        ...definition,
        collection: () => collectionName,
    }
}

const createScopeStoreFrom = (
    definition: CacheScopeDefinition<unknown>,
): CacheScopeStore<unknown> => ({
    ...definition,
    perParams: new Map(),
})

const createCollectionStoreFrom = (
    definition: CacheCollectionDefinition<unknown>,
): CacheCollectionStore<unknown> => {
    const searches: Record<string, CacheSearchStore<unknown>> = {}
    for (const [name, searchDefinition] of Object.entries(
        definition.searches,
    )) {
        searches[name] = createSearchStoreFrom(searchDefinition)
    }

    const vFields: Record<string, CacheVFieldStore<unknown>> = {}
    for (const [name, vFieldDefinition] of Object.entries(definition.vFields)) {
        vFields[name] = createVFieldStoreFrom(vFieldDefinition)
    }

    const scopes: Record<string, CacheScopeStore<unknown>> = {}
    for (const [name, scopeDefinition] of Object.entries(definition.scopes)) {
        scopes[name] = createScopeStoreFrom(scopeDefinition)
    }

    return {
        ...definition,
        index: new DataStore(),
        searches,
        vFields,
        scopes,
    }
}

export const registerDefinition = <Schema>(
    name: string,
    definition: CacheCollectionDefinition<Schema>,
) => (collectionDefinitions[name] = definition)

export const createStoreFromDefinitions = (
    definitions?: Record<string, CacheCollectionDefinition<any>>,
) => {
    if (!definitions) definitions = collectionDefinitions

    const newStore: Record<string, CacheCollectionStore<unknown>> = {}
    for (const [name, definition] of Object.entries(definitions)) {
        newStore[name] = createCollectionStoreFrom(definition)
    }

    return newStore
}
