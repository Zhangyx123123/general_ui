<template>
<div id="page-menu">
  <div class="category" v-for="directory in menuPages" :key="directory.name" :class="{expanded: directory.expanded}">
    <div class="category-name row" @click="clickCategory(directory)"
      :class="{clickable: directory.path, active: directory.path === currentRoute}">
      <div class="space"></div>
      <icon class="page-icon" :icon-type="directory.icon" :size=15 />
      <div class="name">{{$t(directory.display)}}</div>
      <icon class="expand-icon" icon-type="menu_expand" :size=18 />
    </div>
    <div v-if="directory.pages && directory.pages.length > 0" class="children" :style="childrenStyle(directory)">
      <div class="page row clickable"
        v-for="page in directory.pages"
        :key="page.name"
        :class="{active: page.path === currentRoute}"
        @click="toPage(page)">
        <div class="space"></div>
        <div class="name">
          <span>{{$t(page.display)}}</span>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex';
import Icon from '@/components/basic/Icon';

const lineHeight = 40;

export default {
  computed: {
    ...mapGetters([
      'menuPages',
    ]),
    currentRoute() {
      return this.$route.path.split('/')[1];
    },
  },
  components: {
    icon: Icon,
  },
  methods: {
    ...mapMutations([
      'setCurrentPage',
      'toggleCategory',
    ]),
    clickCategory(category) {
      this.toggleCategory(category.name);
    },
    toPage(page) {
      this.setCurrentPage(page);
      if (page.isLink) {
        localStorage.setItem('path', page.path);
        window.location = `/${page.path}.html`;
      } else {
        this.$router.push({ path: `/${page.path}` });
      }
    },
    childrenStyle(category) {
      let height = 0;
      if (category.expanded) {
        height = lineHeight * category.pages.length;
      }
      return {
        height: `${height}px`,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
@import "styles/variable";

$menu-line-height: 40px;
$menu-category-background: #444444;
$menu-background: $page-menu-color;
$menu-width: $page-menu-width;
$menu-font-size: $app-dft-font-size;
$menu-active-color: #3D80FF;

#page-menu {
  position: absolute;
  left: 0;
  top: $page-header-height;
  width: $menu-width;
  height: calc(100vh - #{$page-header-height});
  background: $menu-background;
  color: white;
  font-size: $menu-font-size;
  @include auto-overflow();
  @include customScrollbar();

  .category {
    overflow: hidden;
    .children {
      transition: height .5s ease-in-out;
      overflow: hidden;
    }
    &:not(.expanded) {
      .expand-icon {
        transform: rotate(180deg);
      }
    }
    .row {
      display: flex;
      align-items: center;
      user-select: none;
      height: $menu-line-height;

      .space {
        flex: 0 0 40px;
      }
      .page-icon {
        flex: 0 0 15px;
        margin-left: 15px;
      }
      .name {
        flex: auto;
        margin-left: 14px;
      }
      .expand-icon {
        flex: 0 0 12px;
        margin-right: 9px;
        transition: transform .5s ease-in-out;
      }

      &.active {
        background: $menu-active-color;
      }

      &.clickable {
        @include click-button();
      }

      &:not(.category-name):not(.active):hover {
        background: $menu-category-background;
      }

      &.category-name {
        background: $menu-category-background;
        justify-content: flex-end;

        @include click-button();
        .space {
          flex: 0 0 0px;
        }
        .name {
        margin-left: 10px;
        }
      }
    }
  }
}
</style>
