import { defineCollection } from "~/src/runtime/builder"
import { postCollection } from "./posts"
import { vi } from "vitest"

export interface User {
    id: string
    slug: string
    age: number
}

const users: User[] = [
    { id: "usr_001", slug: "alice-martin", age: 28 },
    { id: "usr_002", slug: "benjamin-lee", age: 34 },
    { id: "usr_003", slug: "charlotte-smith", age: 25 },
    { id: "usr_004", slug: "daniel-wilson", age: 41 },
    { id: "usr_005", slug: "emma-johnson", age: 31 },
    { id: "usr_006", slug: "felix-brown", age: 22 },
    { id: "usr_007", slug: "grace-davis", age: 37 },
    { id: "usr_008", slug: "henry-miller", age: 29 },
    { id: "usr_009", slug: "isabella-moore", age: 26 },
    { id: "usr_010", slug: "jack-taylor", age: 45 },
]

const findUserById = vi.fn(async (query: { id: string }) => {
    const user = users.find((u) => u.id == query.id)
    return user ? { record: user } : null
})

const findUserBySlug = vi.fn(async (query: { slug: string }) => {
    const user = users.find((u) => u.slug == query.slug)
    return user ? { record: user } : null
})

export const userCollection = defineCollection<User>("user", findUserById)
    .withSearch("slug", findUserBySlug, (u) => ({ slug: u.slug }))
    .withVirtualField("posts", {
        from: postCollection,
        scope: "whereWriter",
        with: (u) => ({ id: u.id }),
    })
    .build()

export const mocked = {
    findUserById,
    findUserBySlug,
}
