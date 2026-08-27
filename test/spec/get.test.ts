import { describe, expect, it } from "vitest"
import { useDataset } from "./dataset"
import { usersPostsCommentsDataset } from "./dataset/users-posts-comments"
import { NotFoundError } from "~/src/runtime/types/errors"

describe("search", () => {
    const { userCollection } = useDataset(usersPostsCommentsDataset)

    it("when id exist", async () => {
        const user = await userCollection.search({ id: "usr_001" })

        expect(user.value).toMatchObject({
            id: "usr_001",
            slug: "alice-martin",
            age: 28,
        })
    })

    it("return the right user", async () => {
        const user = await userCollection.search({ id: "__INVALID__" })

        expect(user.value).toBeInstanceOf(NotFoundError)
    })
})
