import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../App.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
]

const router = new VueRouter({
  routes
})

router.beforeEach(async (to, from, next) => {
  if(to !== from){
    await Vue.prototype.$ninetailed.page(() => {
      console.log('Page()')
    })
  }
  next();
})

export default router