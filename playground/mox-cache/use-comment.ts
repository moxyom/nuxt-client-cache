import { findCommentById, type Comment } from "~/shared/comment-factory"
import { shallowCollectionFor } from "../../src/runtime/types"
import type { User } from "~/shared/user-factory"

export const commentCollection = defineMoxCacheCollection<Comment>("comment", findCommentById)
    .withShallowForeign("writerSlug", { 
        collection: shallowCollectionFor<User>("user"), 
        list: true,
        searchBy: {
            name: "slug",
            transform: (c: Comment) => { return { searchBy: "slug", slug: c.writerSlug } }
        }
    })
    .build()
