<template>
  <div class="form">
    <div class="row">
      <div class="row-title">{{ $t('management.robot_name') }}</div>
      <input class="row-input" v-model="name"
        :placeholder="$t('management.input_placeholder')"
        :class="{'error': isNameTooltipShown}"
        v-tooltip="nameTooltip"
        maxlength=50
        ref="name">
    </div>
    <div class="row">
      <div class="row-title">{{ $t('management.description') }}</div>
      <input class="row-input" v-model="description" maxlength=50
        :placeholder="$t('management.length_50_placeholder')">
    </div>
  </div>
</template>

<script>
import event from '@/utils/js/event';

export default {
  name: 'robot-add-form',
  props: {
    extData: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      name: '',
      description: '',
      existedRobots: [],
      nameTooltip: {
        msg: '',
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      isNameTooltipShown: false,
    };
  },
  watch: {
    name() {
      if (this.name.trim() !== '') {
        this.isNameTooltipShown = false;
        this.$refs.name.dispatchEvent(event.createEvent('tooltip-hide'));
      }
    },
  },
  methods: {
    validate() {
      const that = this;
      that.name = that.name.trim();
      if (that.name === '') {
        that.nameTooltip.msg = that.$t('management.err_robot_name_empty');
        that.$refs.name.dispatchEvent(event.createEvent('tooltip-reload'));
        that.$refs.name.dispatchEvent(event.createEvent('tooltip-show'));
        that.$refs.name.focus();
        that.isNameTooltipShown = true;
        return;
      } else if (that.name !== that.extData.name && that.existedRobots.indexOf(that.name) >= 0) {
        that.nameTooltip.msg = that.$t('management.err_robot_duplicate');
        that.$refs.name.dispatchEvent(event.createEvent('tooltip-reload'));
        that.$refs.name.dispatchEvent(event.createEvent('tooltip-show'));
        that.$refs.name.focus();
        that.isNameTooltipShown = true;
        return;
      }
      that.$emit('validateSuccess', {
        name: that.name,
        description: that.description,
        app_type: 0,
      });
    },
  },
  mounted() {
    const that = this;

    that.name = that.extData.name || '';
    that.description = that.extData.description || '';
    that.existedRobots = that.extData.existedRobots || [];
    that.$on('validate', that.validate);
  },
};
</script>

<style lang="scss" scoped>
.form {
  width: 400px;
  padding: 0 30px;

  display: flex;
  flex-direction: column;
  .row {
    margin-bottom: 10px;

    display: flex;
    align-items: center;
    .row-title {
      flex: 0 0 80px;
      &:after {
        content: '：'
      }
    }
    .row-input {
      flex: 1;
      display: flex;
    }
  }
}
</style>
