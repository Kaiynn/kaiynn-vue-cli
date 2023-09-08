<template>
    <div>
        <h1 class="title">hello app</h1>
        <router-link to="/home">home</router-link>
        <router-link to="/about">about</router-link>
        <div>=====================</div>
        <router-view />
    </div>
</template>

<script>

export default {
    name: 'App',
}
</script>

<style scoped>
.title{
    color: red;
}
</style>
