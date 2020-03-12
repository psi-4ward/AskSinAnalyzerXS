import Vue from 'vue'
import { Quasar, Ripple, ClosePopup, Loading } from 'quasar';
import lang from 'quasar/lang/de.js'
import './styles/quasar.styl'
import '@quasar/extras/material-icons/material-icons.css'

import {version} from '../../app/package.json';

import App from './App.vue'
import './filter';
import router from './router'
import Service from './Service';

// Init Service
const service = new Service();
Vue.prototype.$service = service;

Vue.prototype.$debounce = function(fn, delay) {
  let timeoutID = null;
  return function() {
    clearTimeout(timeoutID);
    const args = arguments;
    const that = this;
    timeoutID = setTimeout(function() {
      fn.apply(that, args)
    }, delay)
  }
};

// Init Vue
Vue.use(Quasar, { lang, directives: { Ripple, ClosePopup } });
Vue.config.productionTip = false;

const vm = new Vue({
  router,
  data() {
    return {
      version,
      COMMIT_HASH: process.env.VUE_APP_COMMIT_HASH || 'master',
      data: service.data,
      timefilter: {
        start: null,
        stop: null
      }
    };
  },
  beforeMount() {
    if(!service.data.config.serialPort && this.$route.path !== '/settings') {
      this.$router.push('/settings');
    }
  },
  render: h => h(App)
});

// Init
(async function() {
  try {
    await service.openWebsocket();
    // TODO: Update notifier
  } catch (e) {
    console.error(e);
    vm.data.feErrors.unshift(e.toString());
  }
  setTimeout(() => {
    vm.$mount('#app');
  },500);
})();


