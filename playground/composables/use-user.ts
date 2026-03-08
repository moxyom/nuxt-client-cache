import { findMajorUsers, findUserById, findUserBySlug, findUsersWithPosts, type User } from "~/shared/user-factory";

export const userCollection = defineMoxCacheCollection<User>("post", findUserById)
    .withForeign("posts", { collection: postCollection, list: true })
    .withCustomSearch("slug", findUserBySlug, (o) => { return { slug: o.slug } })
    .withSubset("major", { isIncluded: (u) => u.age >= 18, fetchAll: findMajorUsers })
    .withSubset("withPosts", { isIncluded: (u) => u.posts.length > 0, fetchRange: findUsersWithPosts })
    .build()
