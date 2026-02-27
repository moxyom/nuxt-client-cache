/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ShallowRef } from "vue"
import type { CacheError } from "./errors"

// ============= Type de return =============

type Overwrite<T, U> = Omit<T, keyof U> & U;

// Ce type transforme le schéma original en schéma "étendu" selon les paramètres 'with'
type ReturnTypeFor<Schema, Foreign, Params, Depth extends any[] = []> =
    Depth["length"] extends 6
        ? Schema // pour la récurcivité, limiter à 6 déjà c'est beaucoup
        : Overwrite<Schema, {
            [K in keyof Foreign as `with${Capitalize<K & string>}` extends keyof Params
                ? (Params[`with${Capitalize<K & string>}` & keyof Params] extends false ? never : K)
                : never // on trie les clé de Foreign, on garde que celles qui existe dans Params (avec le with)
            ]: Foreign[K] extends { collection: Collection<infer FSchema, infer FForeign, any, any>, isList: infer IsList }
                ? `with${Capitalize<K & string>}` extends keyof Params // nécéssaire pour que TS explose pas
                    ? (
                        Params[`with${Capitalize<K & string>}`] extends true
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
type RecursiveSelector<Foreign> = Foreign extends { collection: Collection<any, infer FForeign, any, any> }
    ? ParamsFor<FForeign>
    : never

// autocompletion du paramètre de la fonction (ex useUser(p) p est ParamsFor<Foreign> )
export type ParamsFor<Foreign> = {
    [K in keyof Foreign as `with${Capitalize<K & string>}`]?: boolean | RecursiveSelector<Foreign[K]>
}

// on lit le type Search et on renvoie un type d'objet
// pour préciser par quoi on va rechercher
type SearchEntryToParams<Name, Entry> = {
    searchBy: Name,
} & Entry extends (p: infer SearchParams) => any
    ? (SearchParams extends Record<string, any> ? SearchParams : never) 
    : never

// soit on recherche par id
// soit on va rechercher par un type de search
// et on ajoute tous les paramètres pour les foreigns
type SearchParams<Search, Foreign> = (
    | { id: string }
    | { [K in keyof Search]: SearchEntryToParams<K, Search[K]> }[keyof Search]
) & ParamsFor<Foreign>;

type SearchFunction<Schema, Search, Foreign> =
    <const Params extends SearchParams<Search, Foreign>>(
        p: Params
    ) => Promise<ShallowRef<ReturnTypeFor<Schema, Foreign, Params> | CacheError>>

type SubsetSearchFunction<Schema, Search, Foreign> =
    <const Params extends SearchParams<Search, Foreign>>(
        p: Params
    ) => Promise<ShallowRef<ReturnTypeFor<Schema, Foreign, Params>[] | CacheError>>


// ============= Type de Collection =============

// On définit un type "Atome" pour une collection pour briser la récursion
export interface AnyCollection {
    store(object: any): void;
    [key: string]: any; // Permet l'accès aux subsets et à l'appel de fonction
}

export interface ForeignEntry<FSchema, FForeign> {
    collection: Collection<FSchema, FForeign, any, any> | (() => Collection<FSchema, FForeign, any, any>);
    isList?: boolean;
    searchBy?: string | { name: string; transform: (o: FSchema) => FSchema };
}

export interface SearchBase<Schema> {
    [key: string]: (params: any) => Promise<Schema | string | null>;
}

export interface SubsetEntry<Schema> {
    isIncluded: (object: Schema) => boolean;
    fetchAll?: () => Promise<string[] | null>;
    fetchRange?: (start: number, end: number) => Promise<string[] | null>;
}

export type Collection<
    Schema,
    Foreign,
    Search,
    Subset
> = {
    store(object: Schema): void;
    remove(id: string): void;
    refetch(id: string): Promise<void>;
} & {
    [S in keyof Subset]: SubsetSearchFunction<Schema, Search, Foreign>
} & SearchFunction<Schema, Search, Foreign>

export type DefineCollectionFn = <
    Schema, 
    const Foreign = Record<string, ForeignEntry<any, any>>,
    const Search = SearchBase<Schema>, 
    const Subset = Record<string, SubsetEntry<Schema>>
>(
    name: string,
    config: {
        foreign?: Foreign,
        search?: Search
        subset?: Subset
    }
) => Collection<Schema, Foreign, Search, Subset>
