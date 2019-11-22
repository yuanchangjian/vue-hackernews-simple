<template> 
    <section>
        首页
    </section>
</template>

<script>

import WwHeader from '@/components/header.vue'
export default {
    components: {
        WwHeader
    },
    computed: {
        // url () {
        //     return this.$store.state.path
        // }
    },
    asyncData ({ store, route }) {
        return store.dispatch('setPath', route.path)
    }
}
</script>