import Vue from 'vue'
import { Quasar, Ripple, ClosePopup, Loading } from 'quasar';
import lang from 'quasar/lang/de.js'
import './styles/quasar.styl'
import '@quasar/extras/material-icons/material-icons.css'

import App from './App.vue'
import './filter';
import router from './router'
import Service from './Service';


// Load Settings from localStorage
const defaultSettings = {
  maxTelegrams: 100000,
};
const storedSettings = JSON.parse(localStorage.getItem('AskSinAnalyzer_Settings'));
const settings = { ...defaultSettings, ...storedSettings };

// Init Service
const service = new Service(settings.maxTelegrams);
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
      COMMIT: process.env.VUE_APP_COMMIT_HASH || 'dev',
      LATEST_COMMIT: null,
      data: service.data,
      settings,
      errors: [],
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
    // await espService.fetchVersion();
    // if(vm.espConfig.updateAvailable) {
    //   vm.errors.common.push('ESP Update verfügbar.');
    // }
    // try {
    //   const res = await fetch((vm.CDN || 'https://raw.githubusercontent.com/jp112sdl/AskSinAnalyzer/gh-pages/master') + '/commit-hash.txt', { cache: "no-store" });
    //   if (res.ok) {
    //     vm.LATEST_COMMIT = (await res.text()).trim();
    //     if(vm.LATEST_COMMIT !== vm.COMMIT) {
    //       vm.errors.common.push('WebUI Update verfügbar.');
    //     }
    //   } else {
    //     console.error(new Error(`${ res.status }: ${ res.statusText }`));
    //   }
    // }
    // catch (e) {
    //   e.message = `Network error while fetching latest commit from Github; ${ e.message }`;
    //   console.error(e);
    // }

  } catch (e) {
    console.error(e);
    vm.errors.unshift(e.toString());
  }

  setTimeout(() => {
    vm.$mount('#app');
  },500);
})();


