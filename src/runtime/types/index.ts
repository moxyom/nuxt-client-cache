/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ShallowRef } from "vue"
import type { CacheError } from "./errors"

// ============= Type de return =============

type Overwrite<T, U> = Omit<T, keyof U> & U;

// Ce type transforme le schéma original en schéma "étendu" selon les paramètres 'with'
export type ReturnTypeFor<Schema, Foreign, Params, Depth extends any[] = []> =
    Depth["length"] extends 6
        ? Schema // pour la récurcivité, limiter à 6 déjà c'est beaucoup
        : Overwrite<Schema, {
            [K in keyof Foreign as `with${Capitalize<K & string>}` extends keyof Params
                ? (Params[`with${Capitalize<K & string>}` & keyof Params] extends false ? never : K)
                : never // on trie les clé de Foreign, on garde que celles qui existe dans Params (avec le with)
            ]: Foreign[K] extends ForeignEntry<any, infer FSchema, infer FForeign, infer IsList, unknown>
                ? `with${Capitalize<K & string>}` extends keyof Params // nécéssaire pour que TS explose pas
                    ? (
                        Params[`with${Capitalize<K & string>}` & keyof Params] extends true
                            ? FSchema // si c'est juste true, alors ça sera le foreign schema RAW
                             // sinon ça sera le foreign schema, repassé dans ce type
                            : ReturnTypeFor<FSchema, FForeign, Params[`with${Capitalize<K & string>}`], [...Depth, any]>
                    ) extends infer Result
                        ? IsList extends true ? Result[] : Result
                        : never
                    : never
                : never
        }
>;

// ============= Type de paramètre =============

// lié à la tentative de modélisation actuelle
// autocompletion du paramètre de la fonction (ex useUser(p) p est ParamsFor<Foreign> )
export type ParamsFor<Foreign> = {
    [K in keyof Foreign as `with${Capitalize<K & string>}`]?: 
        | boolean 
        | (
            Foreign[K] extends ForeignEntry<any, any, infer FForeign, any, any>
                ? ParamsFor<FForeign>
                : Foreign[K]
        )
}

// soit on recherche par id
// soit on va rechercher par un type de search
// et on ajoute tous les paramètres pour les foreigns
export type SearchParams<Search, Foreign, IdField extends string> = (
    | { [k in IdField]: string }
    | { [K in keyof Search]: 
        { searchBy: K } & 
        (Search[K] extends (p: infer SearchParams) => any
            ? SearchParams
            : never
        )
    }[keyof Search]
) & ParamsFor<Foreign>;

export type SearchFunction<Schema, Search, Foreign, IdField extends string> =
    <const Params extends SearchParams<Search, Foreign, IdField>>(
        p: Params
    ) => Promise<ShallowRef<ReturnTypeFor<Schema, Foreign, Params> | CacheError>>


// ============= Type de Collection =============

// On définit un type "Atome" pour une collection pour briser la récursion
export interface AnyCollection {
    store(object: any): void;
    [key: string]: any; // Permet l'accès aux subsets et à l'appel de fonction
}

export interface ForeignEntry<Schema, FSchema, FForeign, List, FSearch>{
    collection: Collection<FSchema, object, FForeign, object, string> | (() => Collection<FSchema, object, FForeign, object, string>);
    list?: List;
    searchBy?:
        | keyof FSearch & string
        | (
            FSearch extends Record<string, any>
                ? { 
                    [K in keyof FSearch]: { 
                        name: K & string, 
                        transform: (o: Schema, index: List extends true ? number : never) => FSearch[K] 
                    } 
                }[keyof FSearch]
                : never
        )
}

export type SearchEntry<Schema, SearchParams> = (params: SearchParams) => Promise<Schema | string | null>

export type SubsetEntry<Schema, FetchAll, FetchRange> = {
    isIncluded: (object: Schema) => boolean
} & (
    FetchAll extends true
        ? { fetchAll: () => Promise<string[] | null> }
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        : {}
) & (
    FetchRange extends true 
        ? {fetchRange: (start: number, end: number) => Promise<string[] | null> }
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        : {}
)


export type SubsetAccessEntry<
    Schema,
    Search,
    Foreign,
    IdField extends string,
    SEntry
> = 
    SEntry extends SubsetEntry<Schema, infer FetchAll, infer FetchRange> 
    ? (
        FetchAll extends true 
            ? <const Params extends SearchParams<Search, Foreign, IdField>>(
                p: Params
            ) => Promise<ShallowRef<ReturnTypeFor<Schema, Foreign, Params>[] | CacheError>>
            : never
    ) & (
        FetchRange extends true
            ? { 
                createIterator: <const Params extends SearchParams<Search, Foreign, IdField> & { step: number }>(
                    params: Params
                ) => Promise<{ 
                    value: ShallowRef<ReturnTypeFor<Schema, Foreign, Params>[] | CacheError>,
                    next?: () => Promise<undefined>
                }>
            }
            : never
    )
    : never

export type Collection<
    Schema,
    Search,
    Foreign,
    Subset,
    IdField extends string,
> = {
    store(object: Schema): void
    remove(id: string): void
    refetch(id: string): Promise<void>
} & {
    [K in keyof Subset]: SubsetAccessEntry<Schema, Search, Foreign, IdField, Subset[K]>
} & SearchFunction<Schema, Search, Foreign, IdField>

export interface ShallowCollectionParams<Schema> {
    _type: Schema,
    name: string
}

export const shallowCollectionFor = <A>(collectionName: string) => {
    return { name: collectionName } as ShallowCollectionParams<A>
}

// ============= Builder =============
export interface CollectionBuilder<
    Schema,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Search = {},
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Foreign = {},
    Subset = object,
    IdField extends string = "id",
> {

    withIdField: <
        const NewIdField extends keyof Schema & string
    >(field: NewIdField) => CollectionBuilder<
        Schema, 
        Search, 
        Foreign, 
        Subset,
        NewIdField
    >

    withCustomSearch: <
        const Name extends string,
        const Params extends object
    >(
        name: Name,
        searchFn: (p: Params) => Promise<Schema | string | null>,
        toParams: (o: Schema) => Params | null
    ) => CollectionBuilder<
        Schema,
        Search & { [k in Name]: SearchEntry<Schema, Params> },
        Foreign,
        Subset,
        IdField
    >

    withSearch: <
        const Name extends keyof Schema & string,
    >(
        name: Name,
        searchFn: (field: Schema[Name]) => Promise<Schema | string | null>
    ) => CollectionBuilder<
        Schema,
        Search & { [k in Name]: SearchEntry<Schema, { [k in Name]: Schema[Name] }> },
        Foreign,
        Subset,
        IdField
    >

    withForeign: <
        const Name extends keyof Schema & string,
        const FSchema,
        const FForeign,
        const List,
        const FSearch,
    >(
        name: Name,
        p: ForeignEntry<Schema, FSchema, FForeign, List, FSearch>
    ) => CollectionBuilder<
        Schema,
        Search,
        Foreign & { [k in Name]: ForeignEntry<Schema, FSchema, FForeign, List, FSearch> },
        Subset,
        IdField
    >

    withShallowForeign: <
        const FSchema,
        const Name extends string, 
        const List,
    >(
        name: Name,
        opt: {
            collection: ShallowCollectionParams<FSchema>
            list?: List;
            searchBy?: string | { name: string, transform: (o: Schema) => any }
        }
    ) => CollectionBuilder<
        Schema,
        Search,
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        Foreign & { [k in Name]: ForeignEntry<Schema, FSchema, {}, List, object> },
        Subset,
        IdField
    >

    withSubset: <
        const Name extends string,
        const FetchAll extends boolean,
        const FetchRange extends boolean,
    >(
        name: Name,
        params: SubsetEntry<Schema, FetchAll, FetchRange>
    ) => CollectionBuilder<
        Schema,
        Search,
        Foreign,
        Subset & { [k in Name]: SubsetEntry<Schema, FetchAll, FetchRange> },
        IdField
    >

    build(): Collection<Schema, Search, Foreign, Subset, IdField>
}
