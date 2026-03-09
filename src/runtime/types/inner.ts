import type { ShallowRef } from "vue"

export interface CacheForeignEntry<Schema, SearchParams> {
    collection: () => string,
    isList: boolean,
    searchBy?: { name: string, transform: (obj: Schema, index?: number) => SearchParams }
}

export interface CacheSubsetEntry<Schema> {
    store: ShallowRef<string[]>
    status: "empty" | "partial" | "all"
    isIncluded: (object: Schema) => boolean
    fetchRange?: (start: number, end: number) => Promise<string[] | null>
    fetchAll?: () => Promise<string[] | null> 
}

export interface CacheSearchEntry<Schema> {
    method: (opt: unknown) => Promise<Schema | string | null>,
    toParams: (o: Schema) => object | null
    index: Map<string, string>
}

export interface CacheCollectionEntry<Schema> {
    fetch: (id: string) => Promise<Schema | null>,
    store: Map<string, ShallowRef<Schema | null>>

    idField: string,
    searchEntries: Record<string, CacheSearchEntry<Schema>>
    foreignFields: Record<string, CacheForeignEntry<Schema, unknown>>
    subsets: Record<string, CacheSubsetEntry<Schema>>
}
