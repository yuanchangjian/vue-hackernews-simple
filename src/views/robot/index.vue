<template> 
    <robot-product></robot-product>
</template>

<script>
import RobotProduct from '@/components/robot-product/robot-product.vue'
export default {
    components: {
        RobotProduct
    },
    computed: {
        url () {
            return this.$store.state.path
        }
    },
    asyncData ({ store, route }) {
        return store.dispatch('setPath', route.path)
    }
}
</script>