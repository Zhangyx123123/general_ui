<template lang="html">
<div id="create-skill-pop">
  <div class="edit-skill-container">
    <div class="label-skill-name">{{$t('task_engine_v3.create_skill_pop.label_skill_name')}}</div>
    <input
      class="input-skill-name"
      v-model="skillName"
      :placeholder="$t('task_engine_v3.create_skill_pop.placeholder_enter_skill_name')"
    />
  </div>
</div>
</template>

<script>
import i18nUtils from '../utils/i18nUtil';
import general from '../utils/general';

export default {
  name: 'create-skill-pop',
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
      skillName: this.value.skillName,
    };
  },
  computed: {},
  watch: {},
  methods: {
    validate() {
      if (this.skillName === '') {
        general.popErrorWindow(this,
          this.i18n.task_engine_v3.error_msg.please_enter_the_skill_name,
          '',
        );
      } else {
        this.$emit('validateSuccess', this.skillName);
      }
    },
  },
  beforeMount() {},
  mounted() {
    this.i18n = i18nUtils.getLocaleMsgs(this.$i18n);
    this.$on('validate', this.validate);
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
#create-skill-pop{
  display: flex;
  flex-direction: column;
  width: 428px;
  .edit-skill-container{
    display: flex;
    flex-direction: row;
    .label-skill-name{
      flex: 0 0 auto;
      width: 60px;
      height: 28px;
      font-size: 14px;
      line-height: 2;
      color: $color-font-normal;
      margin-left: 25px;
    }
    .input-skill-name{
      flex: 1 1 0;
      height: 28px;
      font-size: 14px;
      line-height: 2;
      color: $color-font-active;
      margin-left: 10px;
      margin-right: 22px;
    }
  }
}
</style>
