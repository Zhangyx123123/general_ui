import Vue from 'vue';
import VueCookie from 'vue-cookie';
import 'es6-promise/auto';

import Version from './VersionInfo';
import request from './plugins/request';
import api from './plugins/api';
import './plugins/Polyfill';

Vue.use(VueCookie);
Vue.use(request);
Vue.use(api);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<version/>',
  components: { Version },
});
