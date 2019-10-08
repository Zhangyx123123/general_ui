import ContextMenu from '@/components/layout/ContextMenu';

function popContextMenu(option) {
  this.$root.$emit('showContextMenu', option);
}
function hideContextMenu(option) {
  this.$root.$emit('hideContextMenu', option);
}

const MyPlugin = {
  install(Vue) {
    Vue.component(ContextMenu.name, ContextMenu);

    Vue.prototype.$showContextMenu = popContextMenu;
    Vue.prototype.$hideContextMenu = hideContextMenu;
  },
};

export default MyPlugin;
