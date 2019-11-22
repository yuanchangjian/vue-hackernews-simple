<template>
  <div id="app">
    <ww-header></ww-header>
    
    {{ activeRoute }}

    <transition name="fade" mode="out-in">
      <router-view class="view"></router-view>
    </transition>

  </div>
</template>

<script>
import WwHeader from '@/components/header.vue'
export default {
    components: {
      WwHeader
    },
    computed: {
      products () {
        return this.$store.state.products;
      },
      activeRoute () { 
        return this.$route.path
      }
    },
    asyncData({ route, store }) {
      
    },
}
</script>