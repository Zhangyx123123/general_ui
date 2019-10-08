// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VueCookie from 'vue-cookie';
import VueI18n from 'vue-i18n';
import 'es6-promise/auto';

// import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';


import TextButton from '@/components/basic/TextButton';
import SearchInput from '@/components/basic/SearchInput';
import InfoInput from '@/components/basic/InfoInput';
import Loading from '@/components/basic/Loading';
import Toggle from '@/components/basic/Toggle';
import Icon from '@/components/basic/Icon';
import GeneralTable from '@/components/GeneralTable';
import LabelSwitch from '@/components/basic/LabelSwitch';
import DropdownSelect from '@/components/DropdownSelect';
import DropdownCascader from '@/components/basic/DropdownCascader';
import NavBar from '@/components/NavigationBar';
import Tag from '@/components/basic/Tag';
import LoadingLine from '@/components/basic/LoadingLine';
import LoadingDot from '@/components/basic/LoadingDot';

import '@/components/EasyTable/themes-base/index.css';
import VPagination from '@/components/EasyTable/v-pagination';

import BFOPMixin from '@/store/BFOPMixin';

import App from './App';
import router from './router';
import store from './store';
import messages from './i18n';
import PopWindow from './plugins/PopWindow';
import ContextMenu from './plugins/ContextMenu';
import CustomNotification from './plugins/CustomNotification';
import request from './plugins/request';
import auth from './plugins/auth';
import api from './plugins/api';
import Tooltip from './plugins/tooltip';
import Dropdown from './plugins/dropdown';
import './plugins/Polyfill';
import misc from './utils/js/misc';

// import '../static/ueditor/ueditor.config';
// import '../static/ueditor/ueditor.all';
// import '../static/ueditor/lang/zh-cn/zh-cn';
// import '../static/ueditor/ueditor.parse.min';
import('element-ui').then((data) => {
  Vue.use(data);
  // Use custom plugin after element-ui
  Vue.use(Tooltip);
  Vue.use(Dropdown);
  Vue.use(VueCookie);
  Vue.use(VueI18n);
  Vue.use(PopWindow);
  Vue.use(ContextMenu);
  Vue.use(CustomNotification, {
    delay: 4000,
  });
  Vue.use(request);
  Vue.use(auth);
  Vue.use(api);

  let locale = localStorage.getItem('locale');
  if (!locale) {
    locale = misc.getBrowserLanguage();
  }

  const i18n = new VueI18n({
    locale,
    messages,
  });

  window.vm = new Vue({
    el: '#app',
    router,
    store,
    template: '<App/>',
    i18n,
    components: { App },
  });
});

Vue.config.productionTip = false;
// Mock.start();

Vue.component('text-button', TextButton);
Vue.component('search-input', SearchInput);
Vue.component('info-input', InfoInput);
Vue.component('loading', Loading);
Vue.component('toggle', Toggle);
Vue.component('icon', Icon);
Vue.component('general-table', GeneralTable);
Vue.component('v-pagination', VPagination);
Vue.component('label-switch', LabelSwitch);
Vue.component('dropdown-select', DropdownSelect);
Vue.component('dropdown-cascader', DropdownCascader);
Vue.component('tag', Tag);
Vue.component('loading-line', LoadingLine);
Vue.component('loading-dot', LoadingDot);
Vue.component('nav-bar', NavBar);

Vue.mixin(BFOPMixin);

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (token === '') {
    window.location = '/login.html?invalid=1';
  } else {
    next();
  }
});
