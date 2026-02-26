import type { ShallowRef } from "vue"
import type { FilterForeignParams, ForeignToParams } from "./foreign"
import type { CacheError } from "./errors"

export type Subset = { name: string, range: boolean, all: boolean }

// --- Builder ---

export type WithSubsetParams<Schema> = { isIncluded: (object: Schema) => boolean } & (
    // can be both
    { fetchRange: (start: number, end: number) => Promise<string[] | null> } |
    { fetchAll: () => Promise<string[] | null> }
)

export type MakeSubset<Name, Params> = {
    name: Name,
    range: Params extends { fetchRange: any } ? true : false,
    all: Params extends { fetchAll: any } ? true : false,
}

// --- Runtime ---

export type SubsetIterator<Schema, Foreign, Params> = {
    items: Readonly<ShallowRef<(Schema & FilterForeignParams<Params, Foreign>)[] | CacheError>>
    next(): void
}

export type IteratorSubsetBuilded<Schema, Foreign> = {
    createIterator<const Params extends ForeignToParams<Foreign>>(
        params?: Partial<{ from: number, to: number, step: number }> & Params
    ): Promise<SubsetIterator<Schema, Foreign, Params>>
}

export type AllSubsetBuilded<Schema, Foreign> = <const Params extends ForeignToParams<Foreign>>(
    params?: Params
) => Promise<Readonly<ShallowRef<(Schema & FilterForeignParams<Foreign, Params>)[] | CacheError>>>

export type SubsetBuilded<Subset, Schema, Foreign> =
    (Subset extends { range: any } ? IteratorSubsetBuilded<Schema, Foreign> : never) &
    (Subset extends { all: any } ? AllSubsetBuilded<Schema, Foreign> : never)
