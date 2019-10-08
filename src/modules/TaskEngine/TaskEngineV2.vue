<template>
  <div id="task-engine-v2">
    <!-- <scenario-list-page>
    </scenario-list-page> -->
    <router-view></router-view>
  </div>
</template>
<script>

const ListPageImport = () => import('./TaskEngineV2/src/components/ScenarioListPage');
const EditPageImport = () => import('./TaskEngineV2/src/components/ScenarioEditPage');

export default {
  name: 'task-engine-scenario-v2',
  path: 'task-engine-scenario-v2',
  childrenPath: [
    { path: '', component: ListPageImport },
    { path: 'scenario/:id', component: EditPageImport },
  ],
  privCode: 'task_engine',
  displayNameKey: 'task_engine_scenario_v2',
  icon: 'white_task_engine',
  data() {
    return {
    };
  },
  computed: {},
  watch: {},
  methods: {},
};
</script>
