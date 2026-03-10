<template>
    <div>
        <!-- <pre>{{ JSON.stringify(user, null, 4) }}</pre> -->
        <pre>{{ JSON.stringify(comment, null, 4) }}</pre>
        <pre>{{ JSON.stringify(user, null, 4) }}</pre>
    </div>
</template>

<script setup>
const user = await userCollection({
    searchBy: "slug",
    slug: "alex-dev",
    withPosts: {
        withComments: true
    }
})

const comment = await commentCollection({
    id: "c1",
    withWriterSlug: true
})

setTimeout(() => {
    userCollection.store({
        "id": "u1",
        "slug": "alex-dev",
        "age": 3000,
        "posts": ["p6"]
    })
}, 2000)
</script>
