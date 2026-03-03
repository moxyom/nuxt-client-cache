import type { ShallowRef } from "vue"

export interface CacheForeignIdFieldEntry<Schema, SearchParams> {
    collection: () => string,
    searchBy?: string | { name: string, transform: (obj: Schema) => SearchParams }
}

export interface CacheForeignIdListFieldEntry<Schema, SearchParams> {
    collection: () => string,
    searchBy?: string | { name: string, transform: (obj: Schema, index?: number) => SearchParams }
}

export interface CacheSubsetEntry<Schema> {
    store: Map<string, ShallowRef<string[]>>
    isIncluded: (object: Schema) => boolean
    fetchRange?: (start: number, end: number) => Promise<string[] | null>
    fetchAll?: () => Promise<string[] | null> 
}
    

export interface CacheCollectionEntry<Schema> {
    fetch: (id: string) => Promise<Schema | null>,
    store: Map<string, ShallowRef<Schema | null>>

    idField: string,
    searchMethodes: Record<string, (opt: unknown) => Promise<Schema | string | null>>
    foreignIdFields: Record<string, CacheForeignIdFieldEntry<Schema, unknown>>
    foreignIdListFields: Record<string, CacheForeignIdListFieldEntry<Schema, unknown>>
    subsets: Record<string, CacheSubsetEntry<Schema>>
}
