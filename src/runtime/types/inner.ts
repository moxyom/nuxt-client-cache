import type { ShallowRef } from "vue"

// search 
export interface CacheSearchDefinition<Schema> {
    method: (opt: unknown) => Promise<Schema | string | null>,
    toParams: (o: Schema) => object | null
}

export type CacheSearchStore<Schema> = CacheSearchDefinition<Schema> & {
    index: Map<string, string>
}

// foreign
export interface CacheForeignDefinition<Schema, SearchParams> {
    collection: () => string,
    isList: boolean,
    searchBy?: { name: string, transform: (obj: Schema, index?: number) => SearchParams }
}

export type CacheForeignStore<Schema, SearchParams> = CacheForeignDefinition<Schema, SearchParams>

// subset
export interface CacheSubsetDefinition<Schema> {
    isIncluded: (object: Schema) => boolean
    fetchRange?: (start: number, end: number) => Promise<string[] | null>
    fetchAll?: () => Promise<string[] | null> 
}

export type CacheSubsetStore<Schema> = CacheSubsetDefinition<Schema> & {
    ids: ShallowRef<string[]>
    status: "empty" | "partial" | "all"
}

// collections
export interface CacheCollectionDefinition<Schema> {
    fetch: (id: string) => Promise<Schema | null>,
    idField: string,

    searches: Record<string, CacheSearchDefinition<Schema>>,
    foreigns: Record<string, CacheForeignDefinition<Schema, unknown>>,
    subsets: Record<string, CacheSubsetDefinition<Schema>>,
}

export interface CacheCollectionStore<Schema> {
    fetch: (id: string) => Promise<Schema | null>,
    idField: string,
    index: Map<string, ShallowRef<Schema | null>>

    searches: Record<string, CacheSearchStore<Schema>>,
    foreigns: Record<string, CacheForeignStore<Schema, unknown>>,
    subsets: Record<string, CacheSubsetStore<Schema>>,
}

