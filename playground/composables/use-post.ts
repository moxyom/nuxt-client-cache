import { findPostById, type Post } from "~/shared/post-factory";

export const postCollection = defineMoxCacheCollection<Post>("post", findPostById)
    .withForeign("comments", { collection: commentCollection, list: true })
    .build()
