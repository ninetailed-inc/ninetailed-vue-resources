import Vue from 'vue'
import App from './App.vue'
import VueCompositionAPI from '@vue/composition-api'
import router from './router'
import NinetailedPlugin from '@ninetailed/experience.js-vue';
import {NinetailedSegmentPlugin} from '@ninetailed/experience.js-plugin-segment';

Vue.config.productionTip = false

Vue.use(VueCompositionAPI)
Vue.use(NinetailedPlugin, { clientId: "d6b38b25-9646-41eb-8492-8cc7b3508202", url: 'https://develop-api.ninetailed.co', plugins: [NinetailedSegmentPlugin({writeKey: "y6XleGK4KDipB91ac2TzxF0R0GeUn17r"})]})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
