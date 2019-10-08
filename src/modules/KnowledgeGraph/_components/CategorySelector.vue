<template>
  <div class="category_selector">
    <div class="head">
      {{ $t('knowledge_graph.entity_edit.entity_hierarchy_tree') }}
    </div>
    <div class="content">
      <div class="tree">
        <el-tree
          :props="props"
          :load="loadNode"
          ref="tree"
          :key="treeKey"
          lazy
          accordion
          @node-click="handleNodeClick"
          @node-expand="handleNodeExpand"
          @node-collapse="handleNodeCollapse"
        >
        </el-tree>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import api from '../_api/knowledgeGraph';

  export default {
    name: 'CategorySelector',
    api,

    props: ['entityData', 'propertyTypes', 'rootNodeList'],

    data() {
      return {
        treeKey: '',
        node: '',
        resolve: '',
        detailKGEntities: [],
        categoryData: [],
        entityNameList: [],
        storedTree: [],
        props: {
          label: 'name',
          children: 'zones',
        },
        count: 1,
      };
    },

    computed: {

      ...mapGetters([
        'robotID',
        'userID',
      ]),
    },

    mounted() {
      this.categoryData = this.rootNodeList;
    },

    methods: {

      renderTree() {
        this.treeKey += Math.random();
      },

      handleNodeExpand(data, node) {
        this.node = node;
        this.emitCategoryNode(data);
      },

      handleNodeCollapse(data, node) {
        this.node = node;
        this.emitCategoryNode(data);
      },

      loadNode(node, resolve) {
        this.categoryData = this.rootNodeList;
        const selectedNode = [];
        if (node.level === 0) {
          this.$emit('selectNode', []);
          return resolve([{ name: this.$t('general.all'), entityId: 0 }]);
        }

        if (node.level === 1) {
          return resolve(this.categoryData);
        }
        this.$api.getChildNodes(this.robotID, node.data.entityId).then((res) => {
          selectedNode.push(node.data.name);
          const subNodeList = res.data.root.map(item => ({
            entityId: item.id,
            name: this.entityData.filter(entity => entity.id === item.id)[0].entityName,
          }));
          const nameList = subNodeList.map(item => item.name);
          selectedNode.push(...nameList);

          let storedNode = this.storedTree.filter(item => item.data.name === node.data.name);
          if (storedNode.length > 0) {
            storedNode = storedNode[0];
            const storedIndex = this.storedTree.indexOf(storedNode);
            this.storedTree.splice(storedIndex, 1);
          }
          this.storedTree.push(node);
          this.$emit('selectNode', selectedNode);
          return resolve(subNodeList);
        }).catch(() => {
          selectedNode.push(node.data.name);
          this.storedTree.push(node);
          this.$emit('selectNode', selectedNode);
          resolve([]);
        });
        return 0;
      },

      emitCategoryNode(data) {
        const selectedNode = this.storedTree.filter(item => item.data.name === data.name)[0];
        if (selectedNode !== undefined) {
          const selectedNodeNames = [];
          if (selectedNode.childNodes !== undefined) {
            selectedNodeNames.push(selectedNode.data.name);
            const childLabelList = selectedNode.childNodes.map(item => item.data.name);
            selectedNodeNames.push(...childLabelList);
            // case: expandable node
          } else {
            // case: leaf node
            selectedNodeNames.push(data.name);
          }
          this.$emit('selectNode', selectedNodeNames);
        } else if (data.entityId === 0) {
          this.$emit('selectNode', []);
        }
      },

      handleNodeClick(data, node) {
        this.node = node;
        this.emitCategoryNode(data);
      },
    },

  };
</script>

<style lang="scss" scoped>
  @import '../../../assets/styles/variable.scss';
  .category_selector {
    // max-height: calc(100vh - 200px);
    height: 100%;
    overflow-y: auto;
    padding: 10px 20px;
    display: flex;
    flex-direction: column;
    .head {
      height: 60px;
      @include font-16px();
      color: $color-font-active;
      flex: 0 0 60px;
      border-bottom: 1px solid $color-borderline;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .content {
      flex: 1 1 auto;
      // padding: 10px 0px;
      display: flex;
      flex-direction: column;
      .tree {
        max-height: calc(60vh - 100px);
      }
    }

  }
</style>
