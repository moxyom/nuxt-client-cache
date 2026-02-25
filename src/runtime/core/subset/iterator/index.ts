import type { ShallowRef } from "vue";
import type { IteratorSubsetBuilded, SubsetIterator, ToParams } from "~/src/runtime/types/public";

export function createIteratorFunction<Schema, Foreign>(
    store: Map<string, ShallowRef<string[]>>,
    fetchRange: (start: number, end: number) => Promise<string[] | null>
): IteratorSubsetBuilded<Schema, Foreign>["createIterator"] {
    
    return async <const Params extends ToParams<Foreign>>(
        params?: Partial<{ from: number, to: number, step: number }> & Params
    ): Promise<SubsetIterator<Schema, Foreign, Params>> => {

        throw ''

    }
}
