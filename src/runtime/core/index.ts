import { useNuxtApp } from "#app"
import type { Collection } from "../types"
import type { CollectionBuilder } from "../types/builder"
import type { WithForeignParams, MakeForeign } from "../types/foreign"
import type { CacheCollectionEntry } from "../types/store"
import type { Subset, WithSubsetParams } from "../types/subset"
import { createCollection } from "./collection"

export function useCollectionBuilder<
    Schema,
    SearchParams = {},
    Foreign = {},
    Subsets extends Subset = never
>(
    collectionName: string,
    fetch: (id: string) => Promise<Schema | null>
) {

    const collectionEntry: CacheCollectionEntry<Schema> = {
        fetch,
        store: new Map(),
        idField: "id",
        foreignIdFields: {},
        foreignIdListFields: {},
        subsets: {}
    }

    const builder: CollectionBuilder<Schema, SearchParams, Foreign, Subsets> = {

        setIdField: (field: string) => {
            collectionEntry.idField = field
            return builder
        },

        withForeign: <
            const FieldName extends keyof Schema & string,
            Params extends WithForeignParams<any, SearchParams>,
            ForeignSchema = Params extends WithForeignParams<infer T, SearchParams> ? T : never
        >(
            field: FieldName,
            params: Params
        ) => {
            const record = params.list ?
                collectionEntry.foreignIdListFields :
                collectionEntry.foreignIdFields

            record[field] = { collection: params.collection }

            return builder as CollectionBuilder<Schema, Foreign & MakeForeign<Field, Params, ForeignSchema>, Subsets>
        },

        withSubset: <
            const SubsetName extends string,
            const Params extends WithSubsetParams<Schema>
        >(
            name: SubsetName,
            params: Params
        ) => {

            collectionEntry.subsets[name] = {
                store: new Map(),
                ...params
            }

            return builder as CollectionBuilder<Schema, Foreign, Subsets | WithSubsetParamsToSubset<SubsetName, Params>>
        },

        build: (): Collection<Schema, Foreign, Subsets> => {
            const { $moxClientCache } = useNuxtApp()

            // register collection
            $moxClientCache[collectionName] = collectionEntry

            return createCollection<Schema, Foreign, Subsets>(
                $moxClientCache, collectionEntry, collectionName
            )
        }
    }

    return builder
}

