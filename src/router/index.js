import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export function createRouter () {
  return new Router({
    mode: 'history',
    fallback: false,
    scrollBehavior: () => ({ y: 0 }),
    routes: [
      { path: '/', components: require('../views/home.vue') },
      { path: '/robot', components: require('../views/robot/index.vue') }
    ]
  })
}