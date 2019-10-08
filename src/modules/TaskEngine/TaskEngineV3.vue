<template>
  <div id="task-engine-v3">
    <wizard-mode></wizard-mode>
  </div>
</template>

<script>
import Vue from 'vue';
import VueSelect from 'vue-select';
import VueCookie from 'vue-cookie';
import VueUUID from 'vue-uuid';
import ToggleButton from 'vue-js-toggle-button';
import VueOnToast from 'vue-on-toast';

Vue.component('v-select', VueSelect);
Vue.use(VueCookie);
Vue.use(VueUUID);
Vue.use(ToggleButton);
Vue.use(VueOnToast);

export default {
  name: 'task-engine-scenario-v3',
  path: 'task-engine-scenario-v3',
  childrenPath: [
    { path: '', component: () => import('./TaskEngineV3/src/components/ScenarioListPage') },
    { path: 'scenario/:id', component: () => import('./TaskEngineV3/src/components/ScenarioEditPage') },
    { path: 'entity', component: () => import('./TaskEngineV3/src/components/EntityManagementPage') },
  ],
  privCode: 'task_engine',
  displayNameKey: 'task_engine_scenario_v3',
  icon: 'white_task_engine',
  components: {
    'wizard-mode': () => import('./TaskEngineV3/src/components/WizardMode'),
  },
  data() {
    return {
    };
  },
  computed: {},
  watch: {},
  methods: {},
};
</script>
