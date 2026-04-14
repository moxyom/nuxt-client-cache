import { describe, expect, it } from "vitest";
import { useDataset } from "./dataset";
import { usersPostsCommentsDataset } from "./dataset/users-posts-comments";
import { CacheError } from "~/src/runtime/types/errors";
import { nextTick } from "node:process";

describe("search", () => {
    const { 
        userCollection, 
        commentCollection, 
        mock 
    } = useDataset(usersPostsCommentsDataset)

    it("default", async () => {
        const user = await userCollection({ id: "u1" })

        expect(user.value).toEqual({ 
            id: "u1", 
            slug: "alex-dev", 
            age: 15, 
            posts: ["p1", "p2"] 
        })
    })

    it("when error returned by fetch", async () => {
        mock("findUserById", async () => { throw "Some Error" })
        const user = await userCollection({ id: "u1" })

        expect(user.value).toBeInstanceOf(CacheError)
        const error = user.value as CacheError
        expect(error.field).toBe("")
        expect(error.message).toBe("error while fetching resource : Some Error")
    })

    it("with update for reactivity", async () => {
        const user = await userCollection({ id: "u1" })
        const expectedUser = { 
            id: "u1", 
            slug: "alex-dev", 
            age: 15, 
            posts: ["p1", "p2"] 
        }

        expect(user.value).toEqual(expectedUser)

        userCollection.store({ ...expectedUser, age: 20 })
        nextTick(() => {
            expect(user.value).toHaveProperty("age", 20)
        })
    })

    it("with custom id field", async () => {
        const comment = await commentCollection({ customId: "c1" })

        expect(comment.value).toEqual({ 
            customId: "c1", 
            writerSlug: "sophie-q", 
            title: "Super article", 
            content: "Très clair pour commencer avec TS." 
        })
    })

    it("with custom id field when error returned by fetch", async () => {
        mock("findCommentById", () => { throw "Some Error" })
        const comment = await commentCollection({ customId: "c1" })

        expect(comment.value).toBeInstanceOf(CacheError)
        const error = comment.value as CacheError
        expect(error.field).toBe("")
        expect(error.message).toBe("error while fetching resource : Some Error")
    })

    it("with custom id field with update for reactivity", async () => {
        const comment = await commentCollection({ customId: "c1" })
        const expectedComment = { 
            customId: "c1", 
            writerSlug: "sophie-q", 
            title: "Super article", 
            content: "Très clair pour commencer avec TS." 
        }

        expect(comment.value).toEqual(expectedComment)

        commentCollection.store({ ...expectedComment, title: "Un article" })
        nextTick(() => {
            expect(comment.value).toHaveProperty("title", "Un article")
        })
    })

    it("with custom search", async () => {
        const user = await userCollection({ searchBy: "slug", slug: "sophie-q" })

        expect(user.value).toEqual({
            id: "u2", 
            slug: "sophie-q", 
            age: 24, 
            posts: ["p3"]
        })
    })

    it("with custom search when error returned by fetch", async () => {
        mock("findUserBySlug", () => { throw "Some Error" })
        const user = await userCollection({ searchBy: "slug", slug: "sophie-q" })

        expect(user.value).toBeInstanceOf(CacheError)
        const error = user.value as CacheError
        expect(error.field).toBe("")
        expect(error.message).toBe("error while searching by slug : Some Error")
    })

    it("with custom search with update for reactivity", async () => {
        const user = await userCollection({ searchBy: "slug", slug: "sophie-q" })
        const expectedUser = {
            id: "u2", 
            slug: "sophie-q", 
            age: 24, 
            posts: ["p3"]
        }

        expect(user.value).toEqual(expectedUser)

        userCollection.store({ ...expectedUser, age: 20 })
        nextTick(() => {
            expect(user.value).toHaveProperty("age", 20)
        })
    })
})

/*
[],
[
    "when error returned by fetch"
],
[
    "with update for reactivity"
],
[
    "with custom id field"
],
[
    "with custom id field",
    "when error returned by fetch"
],
[
    "with custom id field",
    "with update for reactivity"
],
[
    "with custom search"
],
[
    "with custom search",
    "when error returned by fetch"
],
[
    "with custom search",
    "with update for reactivity"
],
////////////
[
    "with wrong search function configuration",
    "with custom search"
],
[
    "with wrong search function configuration",
    "with custom search",
    "when error returned by fetch"
],
[
    "with wrong search function configuration",
    "with custom search",
    "with update for reactivity"
],
[
    "with foreign"
],
[
    "with foreign",
    "when error returned by fetch"
],
[
    "with foreign",
    "with update for reactivity"
],
[
    "with foreign custom id field",
    "with foreign"
],
[
    "with foreign custom id field",
    "with foreign",
    "when error returned by fetch"
],
[
    "with foreign custom id field",
    "with foreign",
    "with update for reactivity"
],
[
    "with custom search on foreign",
    "with foreign"
],
[
    "with custom search on foreign",
    "with foreign",
    "when error returned by fetch"
],
[
    "with custom search on foreign",
    "with foreign",
    "with update for reactivity"
],
[
    "with recursif foreign"
],
[
    "with recursif foreign",
    "when error returned by fetch"
],
[
    "with recursif foreign",
    "with update for reactivity"
]
*/
