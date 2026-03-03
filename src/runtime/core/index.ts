/* eslint-disable @typescript-eslint/no-empty-object-type */
import { useNuxtApp } from "#app"
import type { CollectionBuilder, Collection, ForeignEntry, ShallowCollectionParams, SubsetEntry, SearchEntry } from "../types"
import { BuilderError } from "../types/errors"
import type { CacheCollectionEntry } from "../types/inner"
import { createMoxCacheCollection } from "./collection"

export function defineMoxCacheCollection<
    Schema,
    Search = { id: string },
    Foreign = {},
    Subset = object
>(
    collectionName: string,
    fetch: (id: string) => Promise<Schema | null>
) {

    const collectionEntry: CacheCollectionEntry<Schema> = {
        fetch,
        store: new Map(),
        idField: "id",
        searchMethodes: {},
        foreignIdFields: {},
        foreignIdListFields: {},
        subsets: {}
    }

    const privateBuilder = {
        _collectionName: collectionName
    }

    const builder: CollectionBuilder<
        Schema, 
        Search, 
        Foreign, 
        Subset
    > = Object.assign(privateBuilder as never, {

        withIdField: (idField: keyof Schema & string) => {
            collectionEntry.idField = idField
            return builder
        },

        withSearch: <
            const Name extends keyof Schema & string,
            const Params extends object,
        >(
            name: Name,
            searchFn: (p: Params) => Promise<Schema | string | null>
        ) => {
            collectionEntry.searchMethodes[name] = searchFn as 
                (p: unknown) => Promise<Schema | string | null>

            return builder as CollectionBuilder<
                Schema,
                Search & { [k in Name]: SearchEntry<Schema, Params> },
                Foreign,
                Subset
            >
        },

        withForeign: <
            const Name extends keyof Schema & string,
            const FSchema,
            const FForeign,
            const List,
            const FSearch,
        >(
            name: Name,
            opt: ForeignEntry<Schema, FSchema, FForeign, List, FSearch>
        ) => {
            if (!("_collectionName" in opt.collection) || typeof opt.collection._collectionName != "string") {
                throw new BuilderError(
                    "object passed is no valid collection, please use the intended builder"
                )
            }

            const foreignCollectionName = opt.collection._collectionName
            const record = opt.list === true ?
                collectionEntry.foreignIdListFields :
                collectionEntry.foreignIdFields

            record[name] = { 
                collection: () => foreignCollectionName,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                searchBy: (opt.searchBy as any)
            }

            return builder as CollectionBuilder<
                Schema,
                Search,
                Foreign & { [k in Name]: ForeignEntry<Schema, FSchema, FForeign, List, FSearch> },
                Subset
            >
        },

        withShallowForeign: <
            const FSchema,
            const Name extends string, 
            const List,
        >(
            name: Name,
            opt: {
                collection: ShallowCollectionParams<FSchema>
                list?: List;
                searchBy?: string | { name: string, transform: (o: Schema) => unknown }
            }
        ) => {
            const record = opt.list === true ?
                collectionEntry.foreignIdListFields :
                collectionEntry.foreignIdFields

            record[name] = { 
                collection: () => opt.collection.name,
                searchBy: opt.searchBy
            }

            return builder as CollectionBuilder<
                Schema,
                Search,
                Foreign & { [k in Name]: ForeignEntry<Schema, FSchema, FSchema, List, object> },
                Subset
            >
        },

        withSubset: <
            const Name extends string,
            const FetchAll extends boolean,
            const FetchRange extends boolean,
        >(
            name: Name,
            opt: SubsetEntry<Schema, FetchAll, FetchRange>
        ) => {

            collectionEntry.subsets[name] = {
                store: new Map(),
                ...opt
            }

            return builder as CollectionBuilder<
                Schema,
                Search,
                Foreign,
                Subset & { [k in Name]: SubsetEntry<Schema, FetchAll, FetchRange> }
            >
        },

        build: (): Collection<Schema, Search, Foreign, Subset> => {
            const { $moxClientCache } = useNuxtApp()

            // register collection
            $moxClientCache[collectionName] = collectionEntry

            return createMoxCacheCollection<Schema, Search, Foreign, Subset>(
                $moxClientCache, collectionEntry, collectionName
            )
        }
    })

    return builder
}
