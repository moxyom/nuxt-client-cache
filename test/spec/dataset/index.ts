/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, afterEach, vi, type Mock } from "vitest"
import type { CacheCollectionDefinition, CacheCollectionStore } from "~/src/runtime/types/inner"
import { createCollectionStoreFrom } from "~/src/runtime/core/collection/clone"

export interface DataSet<Collections, Mockable extends Record<string, Mock<any>>> {
    definitions: Record<string, CacheCollectionDefinition<unknown>>,
    collections: Collections
    mocked: Mockable
}

// a mock state use for vite 
// to have a ref to current cache
const mockState: {
    cache: Record<string, CacheCollectionStore<unknown>>
} = { cache: {} }

// mock cache provider
// according to mockState 
vi.mock("~/src/runtime/core/cache-provider", () => {
    return {
        default: () => {
            return {
                cache: mockState.cache,
                runWithContext: (callBack: () => unknown) => callBack()
            }
        }
    }
})

type Procedure = (...args: any[]) => any

export const useDataset = <
    Collections, 
    Mockable extends Record<string, Mock<Procedure>>
>(
    fixture: DataSet<Collections, Mockable>
) => {

    const mockedFunctions: Mock<Procedure>[] = []

    beforeEach(() => {
        // clone collection definition aka create a cache
        const clonedCache: Record<string, CacheCollectionStore<unknown>> = {}
        for (const [name, definition] of Object.entries(fixture.definitions)) {
            clonedCache[name] = createCollectionStoreFrom(definition)
        }

        // register it for cache-provider to be mocked
        mockState.cache = clonedCache
    })

    afterEach(() => {
        // clean mockedFunctions
        for (let k = mockedFunctions.length - 1; k >= 0; k --) {
            mockedFunctions.pop()!.mockRestore()
        }
    })

    return { 
        ...fixture.collections,
        mock: <
            Name extends keyof Mockable,
            FnMocked = Mockable[Name] extends Mock<infer T> ? T : never
        >(
            name: Name,
            impl?: FnMocked
        ) => {
            const spy = vi.spyOn(fixture.mocked, name as never) as Mock<Mockable[Name] & Procedure>
            if (impl) { spy.mockImplementation(impl as any) }
            mockedFunctions.push(spy)

            return spy
        }
    }
}
