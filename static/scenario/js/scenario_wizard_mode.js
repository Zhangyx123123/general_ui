import Vue from './vue-2.4.2';
import WizardMode from '../components/WizardMode.vue';
import zhcn from '../i18n/zh-CN.json';
import zhtw from '../i18n/zh-TW.json';
import VueSelect from 'vue-select';
import VueCookie from 'vue-cookie';
import VueUUID from 'vue-uuid';
import ToggleButton from './vue-js-toggle-button';
import VueOnToast from 'vue-on-toast'
import VueI18n from 'vue-i18n';
import VueRouter from 'vue-router';
import ScenarioListPage from '../components/ScenarioListPage.vue';
import ScenarioEditPage from '../components/ScenarioEditPage.vue';
import EntityManagementPage from '../components/EntityManagementPage.vue';

Vue.component('v-select', VueSelect)
Vue.use(VueCookie);
Vue.use(VueUUID)
Vue.use(ToggleButton)
Vue.use(VueOnToast)
Vue.use(VueI18n);
const messages = {
  zhcn,
  zhtw,
};
const i18n = new VueI18n({
    locale: 'zhcn',
    messages,
});

Vue.use(VueRouter);
const routes = [
    { path: '', redirect: '/scenarios' },
    { path: '/scenarios', component: ScenarioListPage },
    { path: '/scenario/:id', component: ScenarioEditPage },
    { path: '/entity', component: EntityManagementPage },
];
const router = new VueRouter({
    routes
});

// add v-click-outside directive
Vue.directive('click-outside', {
    bind: function (el, binding, vnode) {
        el.event = function (event) {
            const targetIsDescendant = el.compareDocumentPosition(event.target) & Node.DOCUMENT_POSITION_CONTAINED_BY;
            const isClickOutside = !(el == event.target || targetIsDescendant);
            let isException = false;
            for (let i = 0; i < binding.value.exceptClasses.length; i++){
                const className = binding.value.exceptClasses[i];
                if(event.target.classList.contains(className)){
                    isException = true;
                    break;
                }
            }
            if (isClickOutside && !isException){
                vnode.context[binding.value.method](binding.value.parameters, event);
            }
        }
        document.body.addEventListener('click', el.event)
    },
    unbind: function (el) {
        document.body.removeEventListener('click', el.event)
    },
});

var app = new Vue({
    el: '#scenario_wizard_mode',
    components: {
        'wizard-mode': WizardMode,
    },
    data: {},
    i18n,
    router,
});