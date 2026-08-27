import { findUserById, findUserBySlug, type User } from "~/shared/user-factory"

export const userCollection = defineCollection<User>("user", findUserById)
    .withSearch("slug", findUserBySlug, (u) => ({ slug: u.slug }))
    .withVirtualField("posts", {
        from: postCollection,
        scope: "whereWriter",
        with: (u: User) => ({ writerId: u.id }),
    })
    .build()
