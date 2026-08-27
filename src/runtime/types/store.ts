import { shallowRef, type Ref, type ShallowRef } from "vue"
import type {
    CacheCollectionDefinition,
    CacheScopeDefinition,
    CacheSearchDefinition,
    CacheVFieldDefinition,
} from "./definitions"

export class DataStore<V> extends Map<string, ShallowRef<V | null>> {
    override delete(key: string) {
        const ref = this.get(key)
        if (!ref) return false

        ref.value = null
        return super.delete(key)
    }

    setValue(key: string, value: V) {
        const ref = this.get(key)
        if (ref) {
            ref.value = value
            return ref
        } else {
            const newRef = shallowRef(value)
            this.set(key, newRef)
            return newRef as ShallowRef<V | null>
        }
    }
}

export type CacheSearchStore<Schema> = CacheSearchDefinition<Schema> & {
    index: DataStore<string>
}

export type CacheVFieldStore<Schema> = CacheVFieldDefinition<Schema>

export type CacheScopeStore<Schema> = CacheScopeDefinition<Schema> & {
    perParams: Map<
        string,
        {
            ids: ShallowRef<string[]>
            status: Ref<"incomplete" | "loading" | "complete" | "not-found">
        }
    >
}

export type CacheCollectionStore<Schema> = Omit<
    CacheCollectionDefinition<Schema>,
    "searches" | "vFields" | "scopes"
> & {
    index: DataStore<Schema>

    searches: Record<string, CacheSearchStore<Schema>>
    vFields: Record<string, CacheVFieldStore<Schema>>
    scopes: Record<string, CacheScopeStore<Schema>>
}
