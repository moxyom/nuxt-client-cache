<template>
    <div>
        <pre>{{ JSON.stringify(user, null, 4) }}</pre>
    </div>
</template>

<script setup>
const user = await userCollection({ 
    id: "u1",
    withPosts: {
        withComments: true
    }
})

let age = 0
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
import.meta.client && setInterval(() => {
    
    age += 10
    userCollection.store({
        id: "u1",
        slug: "alex-dev",
        age: age,
        posts: ["p6", "p1456"]
    })
}, 2000)
</script>
