import Vue from 'vue'
import Router from 'vue-router'
import Webview from '@/pages/webview'
import errorPage404 from '@/pages/404/404.vue'
import initParams from '@/pages/initParams/initParams.vue'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'webview',
      component: Webview
    },
    {
      path: '/initParams',
      name: 'initParams',
      component: initParams
    },
    {
      path: '/404',
      name: '404',
      component: errorPage404
    }
  ]
})
