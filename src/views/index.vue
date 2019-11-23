<template>
    <div class="visit">
        Hello World, 你访问的路由为： {{ path }} 
    </div>
</template>

<script>
export default {
    computed: {
        path () {
            return this.$store.state.path
        }
    },
    asyncData ( { route, store } ) {
        return store.dispatch('SET_PATH', route.path)
    }
}
</script>

<style lang="scss">
    .visit {
        border: 1px solid red
    }

</style>