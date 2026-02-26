import type { ShallowRef } from "vue"
import type { FilterForeignParams, ForeignToParams } from "./foreign"
import type { Subset, SubsetBuilded } from "./subset"
import type { CacheError } from "./errors"

export type Overwrite<Base, Overrides> = Omit<Base, keyof Overrides> & Overrides

export type GetReturn<Schema, Foreign, Params> = Promise<Readonly<ShallowRef<
    Overwrite<Schema, FilterForeignParams<Params, Foreign>> | CacheError
>>>

export type Collection<Schema, SearchParams, Foreign, Subsets extends Subset> = {

    store(object: Schema): void
    remove(id: string): void
    reftech(id: string): Promise<void>

} & {
    [Subset in Subsets as Subset['name']]: SubsetBuilded<Subset, Schema, Foreign>
} & (<const Params extends SearchParams & ForeignToParams<Foreign>>(params: Params) => GetReturn<Schema, Foreign, Params>)
