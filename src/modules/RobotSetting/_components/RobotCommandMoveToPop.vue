<template>
  <div id="moveto-container" ref="moveToContainer" v-tooltip="warnTooltip">
    <category-card ref="categoryCard" id="card-category"
      :maxLayer="1"
      :categoryTree="categoryTree"
      :activeItemId="activeItemId"
      :allowSubCategory="false"
      :canEdit="false"
      :canDelete="false"
      :canCreate="false"
      :selectOnly="true"
      @activeItemChange="handleActiveItemChange"
      >
    </category-card>
  </div>
</template>
<script>
import event from '@/utils/js/event';
import CategoryCard from '@/components/CategoryCard';

export default {
  components: {
    CategoryCard,
  },
  props: {
    value: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      categoryTree: {},
      activeItemId: undefined,
      warnTooltip: {
        msg: this.$t('robot_command.movetopop.tooltip'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
    };
  },
  watch: {
    activeItemId() {
      if (this.activeItemId !== undefined) {
        this.$emit('enableOK');
      } else {
        this.$emit('disableOK');
      }
    },
  },
  methods: {
    handleActiveItemChange(activeItem) {
      this.activeItemId = activeItem.cid;
      this.$refs.moveToContainer.dispatchEvent(event.createEvent('tooltip-hide'));
    },
    validate() {
      if (this.activeItemId !== undefined) {
        this.$emit('validateSuccess', this.activeItemId);
      } else {
        this.$refs.moveToContainer.dispatchEvent(event.createEvent('tooltip-show'));
      }
    },
  },
  mounted() {
    this.categoryTree = {
      children: [],
      cid: -1,
      name: '',
    };
    // copy the category tree by for each cause there's only one layer
    this.value.categoryTree.children.forEach((child) => {
      this.categoryTree.children.push({
        isActive: false,
        name: child.name,
        cid: child.cid,
        children: [],
        deletable: child.deletable,
        editable: child.editable,
        layer: child.layer,
        showChild: child.showChild,
        visible: true,
      });
    });
    this.$on('validate', this.validate);
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

