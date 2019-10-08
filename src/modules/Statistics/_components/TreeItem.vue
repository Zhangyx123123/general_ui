<template>    
  <li class="tree-item-list">
    <div class="category-head clickable" v-if="isFolder" @click="toggle">{{open ? '▼' : '▶'}}</div>
    <div class="category-head" v-else>－</div>
    <input type="radio" name="showCategory" :id="`${token}label_${treeData.id}`">
    <label
      class="clickable"
      @click="handleClick"
      @contextmenu.stop.prevent="handleRightClick($event)"
      :for="`${token}label_${treeData.id}`"
    >
      {{ treeData.text }}
    </label>
    <ul v-show="open">
      <TreeItem
        v-on:itemClicked="handleChildrenClick"
        v-on:itemRightClicked="handleChildrenRightClick"
        class="tree-item"
        v-for="(model, idx) in treeData.children"
        :treeData="model"
        :parent="treeData.id"
        :level=" parseInt(level, 10) + 1"
        ref="trees"
        :key="idx">
      </TreeItem>
    </ul>
  </li>
</template>

<script>

export default {
  name: 'treeitem',
  methods: {
    makeToken() {
      let token = '';
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (let i = 0; i < 32; i += 1) {
        token += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      return token;
    },
    toggle() {
      if (this.isFolder) {
        this.open = !this.open;
      }
    },
    handleClick() {
      this.$emit('itemClicked', this.treeData.id);
    },
    handleRightClick($event) {
      const item = {
        name: this.treeData.text,
        parent: this.parent,
        level: this.level,
        node: this.treeData,
      };
      this.$emit('itemRightClicked', { item, x: $event.clientX, y: $event.clientY });
    },
    handleChildrenClick(id) {
      this.$emit('itemClicked', id);
    },
    handleChildrenRightClick($e) {
      this.$emit('itemRightClicked', $e);
    },
    setOpen(opened) {
      if (this.isFolder) {
        this.open = opened;
      }
      if (this.$refs.trees) {
        this.$refs.trees.forEach((tree) => {
          tree.setOpen(opened);
        });
      }
    },
    find(id) {
      if (id === this.treeData.id) {
        if (this.isFolder) {
          this.open = true;
        }
        // get input DOM object, and set checked to true
        const input = document.getElementById(`${this.token}label_${this.treeData.id}`);
        input.checked = true;
        return true;
      } else if (!this.treeData.children || this.treeData.children.length === 0) {
        return false;
      }

      let findInChildren = false;
      this.$refs.trees.forEach((tree) => {
        if (!findInChildren) {
          findInChildren = tree.find(id);
        }
      });

      if (findInChildren && this.isFolder) {
        this.open = true;
      }
      return findInChildren;
    },
  },
  data() {
    return {
      open: false,
      token: this.makeToken(),
    };
  },
  props: ['treeData', 'parent', 'level', 'id'],
  computed: {
    isFolder() {
      return (this.treeData.children &&
        this.treeData.children.length);
    },
  },
};

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

li {
  list-style: none;
}

.tree-item-list {
  white-space: nowrap;
  line-height: 25px;
  user-select: none;

  .tree-item {
    padding-left: 1em;
  }
}

.category-head {
  display: inline-flex;
  width: 20px;
  text-align: center;
  cursor: default;
}

.clickable  {
  cursor: pointer;
}

input {
  display: none;
  & ~ label {
    display: inline-block;
  }
  &:checked ~ label {
    color: #0099FF;
  }
}
</style>
