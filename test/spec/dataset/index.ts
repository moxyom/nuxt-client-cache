/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, afterEach, vi, type Mock } from "vitest"
import { createStoreFromDefinitions } from "~/src/runtime/definitions"
import type { CacheCollectionDefinition } from "~/src/runtime/types/definitions"
import type { CacheCollectionStore } from "~/src/runtime/types/store"

export interface DataSet<
    Collections,
    Mockable extends Record<string, Mock<any>>,
> {
    definitions: Record<string, CacheCollectionDefinition<unknown>>
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
vi.mock("~/src/runtime/core/utils/cache-provider", () => {
    return {
        getCache: () => {
            return {
                store: mockState.cache,
                runWithContext: (callBack: () => unknown) => callBack(),
            }
        },
    }
})

type Procedure = (...args: any[]) => any

export const useDataset = <
    Collections,
    Mockable extends Record<string, Mock<Procedure>>,
>(
    fixture: DataSet<Collections, Mockable>,
) => {
    const mockedFunctions: Mock<Procedure>[] = []

    beforeEach(() => {
        // clone collection definition aka create a cache
        const clonedCache = createStoreFromDefinitions(fixture.definitions)

        // register it for cache-provider to be mocked
        mockState.cache = clonedCache
    })

    afterEach(() => {
        // clean mockedFunctions
        for (let k = mockedFunctions.length - 1; k >= 0; k--) {
            mockedFunctions.pop()!.mockRestore()
        }
    })

    return {
        ...fixture.collections,
        mock: <
            Name extends keyof Mockable,
            FnMocked = Mockable[Name] extends Mock<infer T> ? T : never,
        >(
            name: Name,
            impl?: FnMocked,
        ) => {
            const spy: Mock<Mockable[Name] & Procedure> = vi.spyOn(
                fixture.mocked,
                name as never,
            )

            if (impl) spy.mockImplementation(impl as any)
            mockedFunctions.push(spy)

            return spy
        },
    }
}
