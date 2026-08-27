/* eslint-disable @typescript-eslint/no-explicit-any */

export type ProvidesRecord = Record<string, object[]>

export interface CacheSearchDefinition<Schema> {
    search: (
        params: any,
        extra: object,
    ) => Promise<{
        record: Schema
        provides?: ProvidesRecord
    } | null>
    toParams: (o: Schema) => any
}

export interface CacheVFieldDefinition<Schema> {
    collection: () => string
    scope?: string
    toParams: (o: Schema) => object
}

export interface CacheScopeDefinition<Schema> {
    isIncluded: (object: Schema, params: any) => boolean | null
    fetchRange?: (
        start: number,
        end: number,
        params: object,
        extra: object,
    ) => Promise<{
        ids: string[]
        provides?: ProvidesRecord
    } | null>
    fetchAll?: (
        params: object,
        extra: object,
    ) => Promise<{
        ids: string[]
        provides?: ProvidesRecord
    } | null>
}

export interface CacheCollectionDefinition<Schema> {
    fetch: (
        query: { id: string },
        extra: object,
    ) => Promise<{
        record: Schema
        provides?: ProvidesRecord
    } | null>
    idField: string

    customFunctions: Record<string, () => any>
    validationFunction: (o: unknown) => any | null

    searches: Record<string, CacheSearchDefinition<Schema>>
    vFields: Record<string, CacheVFieldDefinition<Schema>>
    scopes: Record<string, CacheScopeDefinition<Schema>>
}
