/* eslint-disable @typescript-eslint/no-empty-object-type */
import { shallowRef } from "vue"
import type { CollectionBuilder, Collection, ForeignEntry, ShallowCollectionParams, SubsetEntry, SearchEntry } from "../types"
import type { CacheCollectionEntry } from "../types/inner"
import { createMoxCacheCollection } from "./collection"

const createBuilder = <
    Schema extends Record<string, unknown>,
    Search = { id: string },
    Foreign = {},
    Subset = object,
    IdField extends string = "id",
>(
    collectionName: string,
    fetch: (id: string) => Promise<Schema | null>
) => {

    const collectionEntry: CacheCollectionEntry<Schema> = {
        fetch,
        store: new Map(),
        idField: "id",
        searchEntries: {},
        foreignFields: {},
        subsets: {}
    }

    const builder: CollectionBuilder<
        Schema, 
        Search, 
        Foreign, 
        Subset,
        IdField
    > = {

        withIdField: (idField: keyof Schema & string) => {
            collectionEntry.idField = idField
            return builder
        },

        withSearch: <
            const Name extends keyof Schema & string,
        >(
            name: Name,
            searchFn: (field: Schema[Name]) => Promise<Schema | string | null>
        ) => {
            collectionEntry.searchEntries[name] = {
                index: new Map(),
                method: (o: unknown) => searchFn((o as Schema)[name]),
                toParams: (o: Schema) => { return { [name]: o[name] } }
            }

            return builder as CollectionBuilder<
                Schema,
                Search & { [k in Name]: SearchEntry<Schema, { [k in Name]: Schema[Name] }> },
                Foreign,
                Subset,
                IdField
            >
        },

        withCustomSearch: <
            const Name extends string,
            const Params extends object
        >(
            name: Name,
            searchFn: (p: Params) => Promise<Schema | string | null>,
            toParams: (o: Schema) => Params | null
        ) => {
            collectionEntry.searchEntries[name] = {
                index: new Map(),
                method: searchFn as (p: unknown) => Promise<Schema | string | null>,
                toParams,
            }

            return builder as CollectionBuilder<
                Schema,
                Search & { [k in Name]: SearchEntry<Schema, Params> },
                Foreign,
                Subset,
                IdField
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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fCollection = (opt.collection as any).store == undefined
                ? (opt.collection as () => Collection<FSchema, object, FForeign, object, string>)
                : () => opt.collection as Collection<FSchema, object, FForeign, object, string>

            let searchBy: { 
                name: string, 
                transform: (o: Schema, index: number | undefined) => unknown 
            } | undefined = typeof opt.searchBy == "object" 
                // ts don't like List extends true ? number: undefined
                ? opt.searchBy as unknown as undefined 
                : undefined
            
            if (typeof opt.searchBy == "string") {
                const searchStr = opt.searchBy

                searchBy = {
                    name: searchStr,
                    transform: (o: Schema, i: number | undefined) => {
                        const field = (o as Record<string, unknown>)[searchStr] 
                        return {
                            searchBy: searchStr,
                            [searchStr]: opt.list === true 
                                ? (field as unknown[])[i!]
                                : field
                        }
                    }
                }
            }

            collectionEntry.foreignFields[name] = { 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                collection: () => (fCollection() as any)._collectionName,
                isList: opt.list === true,
                searchBy
            }

            return builder as CollectionBuilder<
                Schema,
                Search,
                Foreign & { [k in Name]: ForeignEntry<Schema, FSchema, FForeign, List, FSearch> },
                Subset,
                IdField
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

            let searchBy: { 
                name: string, 
                transform: (o: Schema) => unknown 
            } | undefined = typeof opt.searchBy == "object" 
                ? opt.searchBy
                : undefined
            
            if (typeof opt.searchBy == "string") {
                const searchStr = opt.searchBy

                searchBy = {
                    name: searchStr,
                    transform: (o: Schema) => (o as Record<string, unknown>)[searchStr] 
                }
            }
 

            collectionEntry.foreignFields[name] = { 
                collection: () => opt.collection.name,
                isList: opt.list === true,
                searchBy
            }

            return builder as CollectionBuilder<
                Schema,
                Search,
                Foreign & { [k in Name]: ForeignEntry<Schema, FSchema, FSchema, List, object> },
                Subset,
                IdField
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
                store: shallowRef([]),
                status: "empty",
                ...opt
            }

            return builder as CollectionBuilder<
                Schema,
                Search,
                Foreign,
                Subset & { [k in Name]: SubsetEntry<Schema, FetchAll, FetchRange> },
                IdField
            >
        },

        build: (): Collection<Schema, Search, Foreign, Subset, IdField> => {
            return createMoxCacheCollection<Schema, Search, Foreign, Subset, IdField>(
                collectionEntry, collectionName
            )
        }
    }

    return builder
}

// redecrare type of defineMoxCacheCollection, because 
// of type convenience for Schema into Record<string, unknown> 
export const defineMoxCacheCollection = createBuilder as <Schema>(
    name: string,
    fetch: (id: string) => Promise<Schema | null>
) => CollectionBuilder<Schema>
