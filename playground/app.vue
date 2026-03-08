<template>
    <div>
        Nuxt module playground!
        <p>{{ JSON.stringify(user1) }}</p>
    </div>
</template>

<script setup>

const user1 = await userCollection({
    id: "u1"
})

</script>
