<template>
  <div id="robot-command">
    <category-card ref="categoryCard" id="card-category" class="card h-fill"
      :title="$t('pages.robot_setting.robot_command')"
      :maxLayer="1"
      :categoryTree="categoryTree"
      :allowSubCategory="false"
      :canEdit="canEdit"
      :canDelete="canDelete"
      :canCreate="canCreate"
      @editModeChange="handleEditModeChange"
      @activeItemChange="handleActiveItemChange"
      @itemNameChange="handleItemNameChange"
      @deleteCategory="handleDeleteCategory"
      @addCategory="handleAddCategory">
    </category-card>
    <robot-command-content 
      id="card-content" class="card h-fill"
      :isEditMode="isEditMode"
      :categoryTree="categoryTree"
      :value="currentCategory.cmds"
      :currentCategoryId="currentCategory.cid"
      :canEdit="canEdit"
      :canDelete="canDelete"
      :canCreate="canCreate"
      @reloadCommand="handleReloadCommand">
    </robot-command-content>
  </div>
</template>

<script>
import CategoryCard from '@/components/CategoryCard';
import api from './_api/command';
import RobotCommandContent from './_components/RobotCommandContent';

export default {
  path: 'robot-command',
  privCode: 'robot_command',
  displayNameKey: 'robot_command',
  icon: 'white_chat',
  name: 'robot-command',
  api,
  components: {
    CategoryCard,
    RobotCommandContent,
  },
  data() {
    return {
      categoryTree: {},
      currentCategory: {},
      isEditMode: false,
    };
  },
  computed: {
    canEdit() {
      return this.$hasRight('edit');
    },
    canDelete() {
      return this.$hasRight('edit');
    },
    canCreate() {
      return this.$hasRight('edit');
    },
  },
  methods: {
    handleReloadCommand(activeItemId) {
      this.reloadCommand(activeItemId, 1);
    },
    reloadCommand(cid, layer) {
      if (!this.isEditMode) {
        if (cid > 0) {
          this.$api.getSingleCommandClass(cid, layer)
          .then((category) => {
            const classIdx = this.categoryTree.children
              .findIndex(child => child.cid === category.cid);
            this.categoryTree.children.splice(classIdx, 1, category);
            this.setCurrentCategory(category);
          });
        } else {
          this.loadCommands();
        }
      }
    },
    handleEditModeChange(editMode) {
      if (!editMode) {
        this.loadCommands().finally(() => {
          this.isEditMode = editMode;
        });
        return;
      }
      this.isEditMode = editMode;
      // block some actions outside
    },
    handleActiveItemChange(activeItem) {
      this.reloadCommand(activeItem.cid, activeItem.layer);
    },
    handleItemNameChange(item, itemName) {
      this.$api.editCommandClass(item.cid, itemName)
      .then(() => {
        this.$refs.categoryCard.editItemNameSuccess(true);
        this.$notify({ text: this.$t('error_msg.save_success') });
      })
      .catch((err) => {
        if (err.response.status >= 400 && err.response.status < 500) {
          this.$notifyFail(err.response.data.result);
          this.$notifyFail(this.$t('robot_command.error.edit_category_name_fail'));
        } else {
          this.$notifyFail(this.$t('robot_command.error.edit_category_name_fail'));
        }
        this.$refs.categoryCard.editItemNameSuccess(false);
      });
    },
    handleDeleteCategory(category) {
      const cid = category.cid;
      this.$api.deleteCommandClass(cid)
      .then(() => {
        this.$refs.categoryCard.deleteCategorySuccess(true);
        this.$notify({ text: this.$t('general.delete_success') });
      })
      .catch((err) => {
        if (err.response.status >= 400 && err.response.status < 500) {
          this.$notifyFail(err.response.data.result);
          this.$notifyFail(this.$t('robot_command.error.delete_category_fail'));
        } else {
          this.$notifyFail(this.$t('robot_command.error.delete_category_fail'));
        }
        this.$refs.categoryCard.deleteCategorySuccess(false);
      });
      // this.$refs.categoryCard.deleteCategorySuccess(true);
    },
    handleAddCategory(pid, newName, layer) {
      this.$api.addCommandClass(newName, layer)
      .then((category) => {
        this.$refs.categoryCard.addCategorySuccess(true, category);
        this.$notify({ text: this.$t('error_msg.save_success') });
      })
      .catch((err) => {
        if (err.response.status >= 400 && err.response.status < 500) {
          this.$notifyFail(err.response.data.result);
          this.$notifyFail(this.$t('robot_command.error.add_category_fail'));
        } else {
          this.$notifyFail(this.$t('robot_command.error.add_category_fail'));
        }
        this.$refs.categoryCard.addCategorySuccess(false);
      });
    },
    setCategoryTree(tree) {
      this.categoryTree = tree;
    },
    setCurrentCategory(category) {
      this.currentCategory = category;
      this.currentCategory.isActive = true;
    },
    loadCommands() {
      const that = this;
      that.$startPageLoading();
      return that.$api.getRobotCommands()
        .then((data) => {
          that.setCategoryTree(data);
          that.setCurrentCategory(data.children[0]);
          data.children[0].isActive = true;
        })
        .catch((err) => {
          if (err.response.status >= 400 && err.response.status < 500) {
            that.$notifyFail(err.response.data.result);
          } else {
            that.$notifyFail(this.$t('robot_command.error.load_commands_fail'));
          }
        })
        .finally(() => {
          that.$emit('endLoading');
        });
    },
  },
  mounted() {
    this.loadCommands();
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable';
#robot-command {
  display: flex;
  #card-category {
    flex: 0 0 200px;
  }
  #card-content {
    flex: 1;
    margin-left: 20px;
  }
}
</style>
