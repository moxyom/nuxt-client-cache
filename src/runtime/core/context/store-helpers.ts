import { ConfigurationError } from "../../types/errors"
import type {
    CacheCollectionStore,
    CacheScopeStore,
    CacheSearchStore,
    CacheVFieldStore,
} from "../../types/store"
import type { getCache } from "../utils/cache-provider"

const getCollectionStore = <Schema>(
    cache: ReturnType<typeof getCache>,
    name: string,
) => {
    if (name in cache.store) {
        return {
            collectionStore: cache.store[name] as CacheCollectionStore<Schema>,
        }
    }

    throw new ConfigurationError(name, `collection not found`)
}

export const createGetCollectionStoreFunction =
    (cache: ReturnType<typeof getCache>) =>
    <Schema>(name: string) =>
        getCollectionStore<Schema>(cache, name)

export const createGetScopeStoreFunction =
    (cache: ReturnType<typeof getCache>) =>
    <Schema>(collectionName: string, scopeName: string) => {
        const ress = getCollectionStore<Schema>(cache, collectionName)
        if (scopeName in ress.collectionStore.scopes) {
            return {
                ...ress,
                scopeStore: ress.collectionStore.scopes[
                    scopeName
                ] as CacheScopeStore<Schema>,
            }
        }

        throw new ConfigurationError(
            collectionName,
            `scope ${scopeName} not found`,
        )
    }

export const createGetSearchStoreFunction =
    (cache: ReturnType<typeof getCache>) =>
    <Schema>(collectionName: string, searchName: string) => {
        const ress = getCollectionStore<Schema>(cache, collectionName)
        if (searchName in ress.collectionStore.searches) {
            return {
                ...ress,
                searchStore: ress.collectionStore.searches[
                    searchName
                ] as CacheSearchStore<Schema>,
            }
        }

        throw new ConfigurationError(
            collectionName,
            `search ${searchName} not found`,
        )
    }

export const createGetVFieldStoreFunction = (
    cache: ReturnType<typeof getCache>,
) => {
    return <Schema>(collectionName: string, vFieldName: string) => {
        const ress = getCollectionStore<Schema>(cache, collectionName)
        if (vFieldName in ress.collectionStore.vFields) {
            return {
                ...ress,
                vFieldStore: ress.collectionStore.vFields[
                    vFieldName
                ] as CacheVFieldStore<Schema>,
            }
        }

        throw new ConfigurationError(
            collectionName,
            `virtual field ${vFieldName} not found`,
        )
    }
}
