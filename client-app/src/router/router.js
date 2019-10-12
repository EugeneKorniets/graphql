import Vue from 'vue'
import Router from 'vue-router'

import MainPage from '../pages/main-page.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'main-page',
      component: MainPage
    }
  ]
})
