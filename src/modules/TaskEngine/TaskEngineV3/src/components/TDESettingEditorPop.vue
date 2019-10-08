<template lang="html">
<div id="tde-setting-editor-pop" class="tde-setting-editor-pop">
    <div class="row">
      <div class="title_column">{{$t("task_engine_v3.tde_setting_editor_pop.nlgTemplate")}}</div>
      <div class="input_column"><input type="text" v-model="tde_setting.nlgTemplate"></div>
    </div>
    <div class="row">
      <div class="title_column">{{$t("task_engine_v3.tde_setting_editor_pop.service")}}</div>
      <div class="input_column"><input type="text" v-model="tde_setting.service"></div>
    </div>
    <div class="row">
      <div class="title_column">{{$t("task_engine_v3.tde_setting_editor_pop.jumpOutTimes")}}</div>
      <div class="input_column"><input type="number" v-model="tde_setting.jumpOutTimes"></div>
    </div>
</div>
</template>

<script>
export default {
  name: 'tde-setting-editor-pop',
  components: {},
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      tde_setting: {},
    };
  },
  computed: {},
  watch: {},
  methods: {
    validateDate() {
      this.$emit(
        'validateSuccess',
        JSON.parse(JSON.stringify(this.tde_setting)),
      );
    },
  },
  beforeMount() {},
  mounted() {
    const obj = JSON.parse(JSON.stringify(this.value));
    this.tde_setting = obj.tde_setting;
    this.$on('validate', this.validateDate);
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
$title-font-size: 14px;
.tde-setting-editor-pop {
  line-height: $default-line-height;
  margin: 10px 0;
  padding: 0 30px;
  .row{
    font-size: $title-font-size;
    display:flex;
    flex-direction: row;
    .title_column{
      flex: 0 0 200px;
    }
    .input_column{
      flex: 1 1 200px;
      input{
        width: 100%;
      }
    }
  }
}
</style>