<template>
  <div class="choose-user">
    <div class="type-container" @click="nowChoose = 2" :class="{choose: nowChoose === 2}">
      <div class="type-icon">
        <icon icon-type="normal_acc" :size="65"/>
      </div>
      <div class="type-text">
        <div class="text">{{ $t('management.normal_user') }}</div>
        <icon :size=15 icon-type="help" />
      </div>
    </div>
    <div class="type-container" @click="nowChoose = 1" :class="{choose: nowChoose === 1}">
      <div class="type-icon">
        <icon icon-type="enterprise_admin" :size="65"/>
      </div>
      <div class="type-text">
        <div class="text">{{ $t('management.enterprise_admin') }}</div>
        <icon :size=15 icon-type="help" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'user-choose-form',
  props: {
    extData: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      nowChoose: undefined,
    };
  },
  mounted() {
    const that = this;
    that.$on('validate', () => {
      if (that.nowChoose) {
        that.$emit('validateSuccess', that.nowChoose);
      }
    });
    that.nowChoose = that.extData.defaultType;
  },
};
</script>

<style lang="scss" scoped>
.choose-user {
  width: 470px;
  height: 170px;
  padding: 10px 20px;

  display: flex;
  justify-content: space-between;
  .type-container {
    flex: 0 0 200px;
    border-radius: 4px;
    border: solid 1px $color-borderline;

    &:hover {
      box-shadow: 0 0 14px 0 rgba(0, 0, 0, 0.2);
    }
    &.choose {
      box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.25);
      border: 1px solid $color-borderline-hover;
      background-color: #ffffff;
      &:hover {
        box-shadow: 0 0 14px 0 rgba(0, 0, 0, 0.2);
      }
    }

    display: flex;
    flex-direction: column;
    .type-icon {
      flex: 0 0 100px;

      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    .type-text {
      flex: 1;

      display: flex;
      align-items: center;
      justify-content: center;
      .text {
        margin-right: 5px;
      }
    }
  }
}
</style>
