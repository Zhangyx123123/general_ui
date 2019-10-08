<template lang="html">
<div id="scenario-editor-pop">
  <div class="row">
    <div id="template-list">
      <div class="template-item" v-for="(template, index) in templateList" @click="selectTemplate(template.scenarioID)">
        <img :src="`/static/images/${template.image}`" alt="...">
        <div class="caption">
          <icon v-if="templateID === template.scenarioID" icon-type="check" :size=16 />
          {{template.scenarioName}}
        </div>
      </div>
    </div>
  </div>
  <div class="row">
    <div id="scenario-name">
      <div class="edit-title">{{$t("task_engine_v3.create_scenario_pop.label_name_the_scenario")}}</div>
      <div class="edit-data">
        <input ref="scenarioName" v-tooltip="noNameTooltip" v-model="scenarioName" 
          :placeholder="$t('task_engine_v3.create_scenario_pop.placeholder_enter_scenario_name')"
        ></input>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import taskEngineApi from '@/modules/TaskEngine/_api/taskEngine';
import event from '@/utils/js/event';

export default {
  name: 'scenario-editor-pop',
  components: {
  },
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      i18n: {},
      scenarioName: this.value.scenarioName,
      noNameTooltip: {
        msg: this.$t('task_engine_v3.error_msg.please_enter_the_scenario_name'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      templateList: [],
      templateID: '',
    };
  },
  computed: {},
  watch: {
    scenarioName() {
      if (this.scenarioName.trim() !== '') {
        this.$refs.scenarioName.dispatchEvent(event.createEvent('tooltip-hide'));
      }
    },
  },
  methods: {
    validate() {
      if (this.scenarioName === '') {
        this.$refs.scenarioName.dispatchEvent(event.createEvent('tooltip-reload'));
        this.$refs.scenarioName.dispatchEvent(event.createEvent('tooltip-show'));
        this.$refs.scenarioName.focus();
      } else {
        this.$emit('validateSuccess', { scenarioName: this.scenarioName, templateID: this.templateID });
      }
    },
    setTemplateImage(templateItem) {
      const template = {};
      template.scenarioName = templateItem.scenarioName;
      template.scenarioID = templateItem.scenarioID;
      if (templateItem.scenarioName === '不使用范本') {
        template.image = 'new.png';
      } else if (templateItem.scenarioName === '酒店预订') {
        template.image = 'hotel_booking.png';
      } else if (templateItem.scenarioName === '订飞机票') {
        template.image = 'flight_booking.png';
      } else if (templateItem.scenarioName === '参数收集节点范例') {
        template.image = 'data_collecting_node_demo.png';
      } else if (templateItem.scenarioName === '时间地点节点范例') {
        template.image = 'time_place_nodes_demo.png';
      } else if (templateItem.scenarioName === '退货机器人') {
        template.image = 'refund_bot.png';
      }
      return template;
    },
    selectTemplate(scenarioID) {
      this.templateID = scenarioID;
    },
  },
  beforeMount() {
    const that = this;
    taskEngineApi.loadTemplateScenario().then((data) => {
      that.templateList.push(that.setTemplateImage({ scenarioName: '不使用范本', scenarioID: '' }));
      const templateItemList = data.result;
      templateItemList.forEach((templateItem) => {
        that.templateList.push(that.setTemplateImage(templateItem));
      });
    });
  },
  mounted() {
    this.$on('validate', this.validate);
    this.$refs.scenarioName.focus();
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';
$row-height: $default-line-height;
@import "../scss/createScenarioPop.scss";
</style>
