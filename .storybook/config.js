import { configure } from '@storybook/vue';
import { setOptions } from '@storybook/addon-options';

import Vue from 'vue';
import Vuex from 'vuex'; // Vue plugins

// Import your custom components.
import Icon from '../src/components/basic/Icon';
import Tag from '../src/components/basic/Tag';
import Textbutton from '../src/components/basic/TextButton';
import SearchInput from '../src/components/basic/SearchInput';

// Import self plugins.
import tooltip from '../src/plugins/tooltip';
import dropdown from '../src/plugins/dropdown';

// Import self extensions.
import CustomNotification from '../src/plugins/CustomNotification';
import PopWindow from '../src/plugins/PopWindow';

// Install Vue plugins.
Vue.use(Vuex);
Vue.use(tooltip);
Vue.use(dropdown);
Vue.use(PopWindow);
Vue.use(CustomNotification, {
  delay: 4000,
});

// Install self component
Vue.component('icon', Icon);
Vue.component('tag', Tag);
Vue.component('text-button', Textbutton);
Vue.component('search-input', SearchInput);

setOptions({
  name: 'BFOP General Components',
  url: '#',
  addonPanelInRight: true,
  hierarchySeparator: /\//,
  hierarchyRootSeparator: /\|/,
});

function loadStories() {
  // You can require as many stories as you need.
  require('../src/stories');
}

/** Have to comment out "background: url('...')"" in main.scss 
 *  for storybook to work for now */
require('../src/assets/styles/reset.scss');
require('../src/assets/styles/main.scss'); 

configure(loadStories, module);