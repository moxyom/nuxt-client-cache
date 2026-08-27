import {
    findCommentById,
    wherePost,
    whereWriter,
    type Comment,
} from "~/shared/comment-factory"
import type { Post } from "~/shared/post-factory"
import type { User } from "~/shared/user-factory"

export const commentCollection = defineCollection<Comment>(
    "comment",
    findCommentById,
)
    .withVirtualField("writer", {
        from: shallowCollection<User>("user"),
        searchBy: "slug",
        with: (c: Comment) => ({ slug: c.writerSlug }),
        nullable: false,
    })
    .withVirtualField("post", {
        from: shallowCollection<Post>("post"),
        searchBy: "slug",
        with: (c) => ({ slug: c.postSlug }),
        nullable: false,
    })
    .withScope("whereWriter", {
        isIncluded: (record, params) => record.writerSlug == params.writerSlug,
        fetchAll: whereWriter,
    })
    .withScope("wherePost", {
        isIncluded: (record, params) => record.postSlug == params.postSlug,
        fetchAll: wherePost,
    })
    .build()
