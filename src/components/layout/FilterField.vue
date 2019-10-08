<template>
  <div class="filter-field">
    <div class="main-filter">
      <slot name="main-filter" />
    </div>
    <div class="filters" :class="{hide: !expertMode}">
      <slot name="filters" v-bind:class="filter-item"/>
    </div>
    <div class="button">
      <text-button button-type="primary" @click="emitSearch">{{ $t('general.search') }}</text-button>
      <div @click="expertMode = !expertMode" class="show-more" :class="{more: expertMode}">
        <div class="text">
          {{ $t('statistics.export_mode') }}
        </div>
        <icon class="expand-icon" icon-type="expand" :size=12 />
      </div>
    </div>
  </div>
</template>

<script>

export default {
  methods: {
    emitSearch() {
      this.$emit('search', this.expertMode);
    },
  },
  data() {
    return {
      expertMode: false,
    };
  },
};
</script>

<style lang="scss" scoped>
.filter-field {
  position: relative;
  padding: 20px;
  padding-bottom: 10px;
  box-shadow: inset 0 -1px 0 0 #dbdbdb;
  .main-filter {
    margin-bottom: 10px;
  }
  .filters {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    & > div {
      margin-right: 30px;
      margin-bottom: 10px;
    }
    &.hide {
      max-height: 0;
      overflow: hidden;
    }
  }
  .button {
    position: absolute;
    height: 28px;
    bottom: 20px;
    right: 20px;

    display: flex;
    .show-more {
      @include click-button();
      display: flex;
      align-items: center;
      margin-left: 12px;
      .text {
        margin-right: 5px;
      }
      &:not(.more) {
        .expand-icon {
          transform: rotate(180deg);
        }
      }
    }
  }
}
</style>

