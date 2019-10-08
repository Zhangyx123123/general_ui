<template>
  <div id="moveto-container" ref="moveToContainer" v-tooltip="warnTooltip">
    <category-tree v-for="(child, idx) in wordbank.children" 
      v-if="child.visible && child.name !== $t('wordbank.all')"
      :treeItem="child"
      :ref="`${child.cid}-${child.name}`"
      :key="`${child.name}-${idx}`">
    </category-tree>
  </div>  
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
import event from '@/utils/js/event';
import CategoryTree from './CategoryTree';

export default {
  components: {
    CategoryTree,
  },
  data() {
    return {
      warnTooltip: {
        msg: this.$t('robot_command.movetopop.tooltip'),
        eventOnly: true,
        alignLeft: true,
      },
    };
  },
  computed: {
    ...mapGetters([
      'wordbank',
      'isActiveId',
    ]),
  },
  watch: {
    isActiveId() {
      if (this.isActiveId !== undefined) {
        this.$emit('enableOK');
        this.$refs.moveToContainer.dispatchEvent(event.createEvent('tooltip-hide'));
      } else {
        this.$emit('disableOK');
      }
    },
  },
  methods: {
    ...mapMutations([
      'toggleMoveToMode',
      'storeLastCategoryStatus',
      'closeAllChild',
      'resetActiveCategory',
      'recoverLastActiveCategory',
      'resetActiveId',
    ]),
    validate() {
      if (this.isActiveId === undefined) {
        // should show error message somewhere
        this.$refs.moveToContainer.dispatchEvent(event.createEvent('tooltip-show'));
        return;
      }
      this.$emit('validateSuccess', this.isActiveId);
    },
  },
  mounted() {
    this.toggleMoveToMode();
    this.closeAllChild();
    this.resetActiveCategory();
    this.storeLastCategoryStatus();
    this.resetActiveId();

    this.$on('validate', this.validate);
  },
  beforeDestroy() {
    this.toggleMoveToMode();
    this.resetActiveCategory();
    this.recoverLastActiveCategory();
  },
};
</script>
<style lang="scss" scoped>
@import 'styles/variable';
#moveto-container {
  height: 300px;
  width: 700px;
  margin: 0 30px;
  border: 1px solid $color-borderline;
  @include auto-overflow();
  @include customScrollbar();
}
</style>
