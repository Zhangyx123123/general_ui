import PropertyManage from './PropertyManage';
import RelationManage from './EntityManage';
import MaterialManage from './MaterialManage';

export default {
  displayNameKey: 'knowledge_graph',
  icon: 'menu_te',
  pages: {
    PropertyManage,
    RelationManage,
    MaterialManage,
  },
};
