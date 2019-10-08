<template lang="html">
<div id="tde-setting-editor-pop" class="tde-setting-editor-pop">
  <div class="tooltip_container" v-tooltip="{ msg: $t('task_engine_v3.register_json_editor_pop.title_description')}">
    <icon icon-type="info" :enableHover="true" :size=20 />
  </div>
  <textarea v-model="register_json_str">
  </textarea>
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
      register_json: {},
      register_json_str: '',
    };
  },
  computed: {},
  watch: {},
  methods: {
    validateDate() {
      try {
        this.register_json = JSON.parse(this.register_json_str);
      } catch (e) {
        console.log('parse register JSON error');
        this.register_json = {};
      }
      this.$emit(
        'validateSuccess',
        JSON.parse(JSON.stringify(this.register_json)),
      );
    },
  },
  beforeMount() {
    const obj = JSON.parse(JSON.stringify(this.value));
    this.register_json = obj.register_json;
    this.register_json_str = JSON.stringify(this.register_json, null, 4);
    this.$on('validate', this.validateDate);
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
$title-font-size: 14px;
.tde-setting-editor-pop {
  line-height: $default-line-height;
  margin: 10px 0;
  padding: 0 30px;
  .tooltip_container{
    width: 20px;
    height: 20px;
  }
  textarea{
    width: 800px;
    height: 300px;
  }
}
</style>