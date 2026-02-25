import type { ShallowRef } from "vue";

export function createAllFunction<Schema, Params>(
    store: Map<string, ShallowRef<string[]>>,
    fetchAll: () => Promise<string[] | null>
) {
    return (
        params: Params
    ) => {
        
    }
}
