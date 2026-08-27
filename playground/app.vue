<template>
    <div>
        <pre>{{ JSON.stringify(user, null, 4) }}</pre>
    </div>
</template>

<script setup>
const user = await userCollection.search({
    id: "u1",
    withPosts: {
        withComments: true,
    },
})

let age = 0
if (import.meta.client) {
    setInterval(() => {
        age += 10
        userCollection.store({
            id: "u1",
            slug: "alex-dev",
            age,
        })

        postCollection.store({
            id: "p3",
            slug: "post3",
            writer: "u1",
            title: "Le futur de React",
            tags: ["react", "web"],
            img: { alt: "React atom", filename: "react.png" },
        })

        postCollection.unstore("p1")
    }, 2000)
}
</script>
