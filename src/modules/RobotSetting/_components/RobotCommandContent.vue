
<template>
  <div id="card-content" class="card">
    <div id="card-content-header">
      <div id="card-content-title">{{ categoryName }}</div>
      <search-input v-model="commandKeyword"></search-input>
    </div>
    <div id="card-content-content">
      <div id="toolbar">
        <text-button
          v-if="canCreate"
          button-type="primary"
          @click="popAddCommand">
          {{ $t('robot_command.add_command') }}
        </text-button>
        <text-button 
          v-if="canDelete"
          @click="deleteMultiCommand"
          :button-type="this.checkedCommand.length === 0 ? 'disable' : 'error'">
          {{ $t('robot_command.delete') }}
        </text-button>
        <text-button 
          v-if="canEdit"
          @click="popMoveToCategory"
          :button-type="this.checkedCommand.length === 0 ? 'disable' : 'default'">
          {{ $t('robot_command.moveto') }}
        </text-button>
      </div>
      <general-table id="content-table" 
        :tableHeader="tableHeader" :tableData="tableData" :action="tableAction"
        @checkedChange="handleCheckedChange" checkbox
        showEmpty></general-table>
    </div>
    <div id="card-content-footer">
      <v-pagination size="small" :total="curTotal" :pageIndex="curPageIdx" :pageSize="pageLimit" :pageSizeOption="[25, 50, 100, 200, 500, 1000]" :layout="['prev', 'pager', 'next', 'sizer', 'jumper']" @page-change="handlePageChange" @page-size-change="handlePageSizeChange"></v-pagination>
    </div>

    <div id="content-blocker" v-if="isEditMode"></div>
  </div>
</template>
<script>
import labelAPI from '@/modules/SSM/_api/qalabel';
import CommandEditPop from './RobotCommandEditPop';
import MoveToPop from './RobotCommandMoveToPop';
import api from '../_api/command';

export default {
  api: [labelAPI, api],
  props: {
    value: {
      type: Array,
      default() {
        return [];
      },
    },
    categoryTree: {
      type: Object,
      default: {},
    },
    isEditMode: {
      type: Boolean,
      default: false,
    },
    currentCategoryId: {
      type: Number,
      default: -1,
    },
    canEdit: {
      type: Boolean,
      default: false,
    },
    canDelete: {
      type: Boolean,
      default: false,
    },
    canCreate: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      appid: this.getAppID('appid'),
      labels: [],

      categoryName: '',
      commands: [],
      filteredCommands: [],
      currentCommands: [],

      commandKeyword: '',
      tableHeader: [
        {
          key: 'command',
          text: this.$t('robot_command.command_name'),
          width: '160px',
        },
        {
          key: 'keyword',
          text: this.$t('robot_command.command_keyword'),
          width: '180px',
        },
        {
          key: 'tag',
          text: this.$t('robot_command.command_tag'),
          type: 'tag',
        },
        {
          key: 'status',
          text: this.$t('robot_command.command_status'),
          type: 'toggle',
          width: '60px',
        },
      ],
      tableAction: [],

      checkedCommand: [],

      curPageIdx: 1,
      pageLimit: 25,
    };
  },
  computed: {
    tableData() { // This is curPage
      const that = this;
      // Handle empty data cause curPageIdx to zero;
      if (that.curPageIdx <= 0) {
        that.toFirstPage();
      }

      const startIdx = (that.curPageIdx - 1) * that.pageLimit;
      const endIdx = startIdx + that.pageLimit;

      function getKeyword(rules) {
        const keywordRules = rules.filter(rule => rule.type === 'keyword')
                                  .map(rule => rule.value[0]);
        return keywordRules.join('/');
      }
      function getLabelName(tags) {
        return that.labels.filter(label => tags.indexOf(label.id) !== -1)
                          .map(label => label.name);
      }
      return that.currentCommands.slice(startIdx, endIdx)
        .map((cmd) => {
          const tablerow = {
            id: cmd.id,
            command: cmd.name,
            keyword: getKeyword(cmd.rule),
            tag: getLabelName(cmd.labels),
            status: {
              val: cmd.status,
              onclick: that.toggleCommandStatus,
              disabled: !that.canEdit,
            },
          };
          return tablerow;
        });
    },
    curTotal() {
      return this.currentCommands.length;
    },
    lastPageIdx() {
      return Math.floor((this.curTotal - 1) / this.pageLimit) + 1;
    },
  },
  watch: {
    value() {
      this.loadCurrentCommands();
      this.currentCommands = this.commands;
      this.checkedCommand = [];
    },
    commands() {
      this.commandKeyword = '';
      this.currentCommands = this.commands;
      this.filteredCommands = [];
    },
    // currentCategory() {
    //   this.loadCurrentCommands();
    //   this.currentCommands = this.commands;
    // },
    commandKeyword() {
      if (this.commandKeyword !== '') {
        this.filteredCommands = this.commands
          .filter(cmd => cmd.name.indexOf(this.commandKeyword) !== -1);
        this.currentCommands = this.filteredCommands;
      } else {
        this.currentCommands = this.commands;
        this.filteredCommands = [];
      }
      this.toFirstPage();
    },
    lastPageIdx() {
      if (this.curPageIdx > this.lastPageIdx) {
        this.toCurPage(this.lastPageIdx);
      }
    },
  },
  methods: {
    loadTableActionByPrivilege() {
      if (this.canEdit) {
        this.tableAction.push({
          text: this.$t('robot_command.edit'),
          type: 'primary',
          onclick: this.editCommand,
        });
      } else {
        this.tableAction.push({
          text: this.$t('robot_command.view'),
          type: 'primary',
          onclick: this.viewCommand,
        });
      }
      if (this.canDelete) {
        this.tableAction.push({
          text: this.$t('robot_command.delete'),
          type: 'error',
          onclick: this.deleteCommand,
        });
      }
    },
    toFirstPage() {
      this.curPageIdx = 1;
    },
    toCurPage(page) {
      this.curPageIdx = page;
    },
    handlePageChange(page) {
      if (page <= 0) {
        this.toFirstPage();
      } else {
        this.toCurPage(page);
      }
      this.checkedCommand = [];
    },
    handlePageSizeChange(pageSize) {
      this.pageLimit = pageSize;
      this.toFirstPage();
      this.checkedCommand = [];
    },
    toggleCommandStatus(data) {
      const command = this.currentCommands.find(cmd => cmd.id === data.id);
      command.status = !command.status;
      this.$api.editRobotCommand(command)
        .then((rspCommand) => {
          const theCommandIdx = this.currentCommands
            .findIndex(cmd => cmd.id === rspCommand.id);
          this.currentCommands.splice(theCommandIdx, 1, command);
        })
        .catch((err) => {
          console.log(err);
          this.$notifyFail(this.$t('robot_command.error.edit_command_fail'));
          // should reset status in tableData
          command.status = !command.status;
          const theCommandIdx = this.currentCommands
            .findIndex(cmd => cmd.id === command.id);
          this.currentCommands.splice(theCommandIdx, 1, command);
        });
    },
    viewCommand(data) {
      const command = this.currentCommands.find(cmd => cmd.id === data.id);
      this.popViewCommand(command);
    },
    editCommand(data) {
      const command = this.currentCommands.find(cmd => cmd.id === data.id);
      this.popEditCommand(command);
    },

    popAddCommand() {
      const command = {
        id: undefined,
        status: false,
        name: '',
        target: 0,
        response_type: 0,
        begin_time: null,
        end_time: null,
        answer: '',
        rule: [],
        labels: [],
      };
      const options = {
        component: CommandEditPop,
        title: this.$t('robot_command.add_command'),
        data: {
          command,
          existedNames: this.getAllCommandName(),
        },
        validate: true,
        callback: {
          ok: (addedCommand) => {
            const cid = this.currentCategoryId;
            this.$api.addRobotCommand(cid, addedCommand)
            .then((cmd) => {
              this.commands.splice(0, 0, cmd);
              this.loadLabels();
              this.$notify({ text: this.$t('error_msg.save_success') });
            })
            .catch((err) => {
              console.log(err);
              this.$notifyFail(this.$t('robot_command.error.add_command_fail'));
            });
          },
        },
      };
      this.$pop(options);
    },
    getAllCommandName() {
      const commandNames = [];
      this.categoryTree.children.forEach((child) => {
        child.cmds.forEach(cmd => commandNames.push(cmd.name));
      });
      return commandNames;
    },
    popEditCommand(command) {
      const options = {
        component: CommandEditPop,
        title: this.$t('robot_command.edit_command'),
        data: {
          command,
          existedNames: this.getAllCommandName(),
        },
        validate: true,
        callback: {
          ok: (editedCommand) => {
            this.$api.editRobotCommand(editedCommand)
            .then((rspCommand) => {
              const theCommandIdx = this.commands
                .findIndex(cmd => cmd.id === rspCommand.id);
              this.commands.splice(theCommandIdx, 1, rspCommand);
              this.$notify({ text: this.$t('error_msg.save_success') });
              this.loadLabels();
            })
            .catch((err) => {
              console.log(err);
              this.$notifyFail(this.$t('robot_command.error.edit_command_fail'));
            });
          },
        },
      };
      this.$pop(options);
    },
    popViewCommand(command) {
      const options = {
        component: CommandEditPop,
        title: this.$t('robot_command.view_command'),
        data: {
          command,
          readonly: true,
        },
        buttons: ['ok'],
        validate: false,
      };
      this.$pop(options);
    },
    popMoveToCategory() {
      if (this.checkedCommand.length === 0) {
        return;
      }
      const options = {
        component: MoveToPop,
        title: this.$t('robot_command.movetopop.title'),
        data: {
          categoryTree: this.categoryTree,
        },
        validate: true,
        disable_ok: true,
        callback: {
          ok: (toCid) => {
            let cmd = this.checkedCommand.shift();
            const movePromises = [];
            while (cmd !== undefined) {
              movePromises.push(this.confirmMoveCommand(cmd.id, toCid));
              cmd = this.checkedCommand.shift();
            }
            Promise.all(movePromises)
            .then((response) => {
              const hasError = response.filter(rsp => rsp.status === 'success').length !== response.length;
              if (hasError) {
                this.$notifyFail(this.$t('robot_command.error.move_fail'));
                response.forEach((rsp) => {
                  if (rsp.status === 'fail') {
                    this.$notifyFail(`${rsp.name}: ${rsp.msg}`);
                  }
                });
              } else {
                this.$notify({ text: this.$t('robot_command.movetopop.move_command_success') });
              }
              this.$notify({ text: this.$t('error_msg.save_success') });
              this.$emit('reloadCommand', this.currentCategoryId);
            })
            .catch((err) => {
              console.log(err);
              this.$notifyFail(this.$t('robot_command.error.move_fail'));
            });
          },
        },
      };
      this.$pop(options);
    },
    confirmMoveCommand(id, cid) {
      const that = this;
      const theCommandIdx = that.commands
            .findIndex(cmd => cmd.id === id);
      const cmdname = that.commands[theCommandIdx].name;
      return that.$api.moveToCategory(id, cid)
      .then(() => ({ status: 'success', idx: theCommandIdx, name: cmdname }))
      .catch(err => ({ status: 'fail', idx: theCommandIdx, name: cmdname, msg: err.response.data.result }));
    },
    deleteCommand(data) {
      const option = {
        data: {
          msg: this.$t('robot_command.delete_command_msg', { name: data.command }),
        },
        callback: {
          ok: () => {
            this.confirmDeleteCommand(data.id);
          },
        },
      };
      this.$popWarn(option);
    },
    confirmDeleteCommand(id) {
      // api call
      this.$api.deleteRobotCommand(id)
        .then(() => {
          const theCommandIdx = this.commands
            .findIndex(cmd => cmd.id === id);
          this.commands.splice(theCommandIdx, 1);
          this.$notify({ text: this.$t('general.delete_success') });
        })
        .catch((err) => {
          console.log(err);
          this.$notifyFail(this.$t('robot_command.error.delete_command_fail'));
        });
    },
    deleteMultiCommand() {
      if (this.checkedCommand.length === 0) {
        return;
      }
      const option = {
        data: {
          msg: this.$t('robot_command.delete_multi_command_msg'),
        },
        callback: {
          ok: () => {
            let cmd = this.checkedCommand.shift();
            while (cmd !== undefined) {
              this.confirmDeleteCommand(cmd.id);
              cmd = this.checkedCommand.shift();
            }
          },
        },
      };
      this.$popWarn(option);
    },
    handleCheckedChange(checked) {
      this.checkedCommand = checked;
    },
    loadCurrentCommands() {
      this.commands = this.value;
      this.categoryName = this.categoryTree.children
        .find(child => child.cid === this.currentCategoryId).name;
    },
    loadLabels() {
      const that = this;
      that.$startPageLoading();
      that.$api.loadLabels().then((res) => {
        if (res.status === 0) {
          that.labels = res.result;
        } else {
          that.$popError(res.message);
        }
      }, () => {
        // TODO: handle error if status code is not 500,
      })
      .then(() => {
        that.$emit('endLoading');
      });
    },
    getAppID(name) {
      const label = `${name}=`;
      const ca = document.cookie.split(';');
      let appId = '';
      ca.forEach((val) => {
        let c = val;
        if (c.charAt(0) === ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(label) !== -1) {
          appId = c.substring(label.length, c.length);
          return true;
        }
        return true;
      });
      return appId;
    },
  },
  mounted() {
    this.loadLabels();
    this.loadTableActionByPrivilege();
  },
};
</script>
<style lang="scss" scoped>
@import 'styles/variable';
#card-content {
  position: relative;
  display: flex;
  flex-direction: column;
  #card-content-header {
    flex: 0 0 60px;
    padding: 0 20px;
    border-bottom: 1px solid $color-borderline;
    display: flex;
    align-items: center;
    justify-content: space-between;
    #card-content-title {
      @include font-16px();
      color: $color-font-active;
    }
    #io-buttons {
      display: flex;
      justify-content: space-between;
      .text-button {
        margin: 0 5px;
      }
      :last-child {
        margin-right: 0px;
      }
    }
  }
  #card-content-content {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    #toolbar {
      flex: 0 0 auto;
      margin: 20px;
      display: flex;
      .text-button {
        margin: 0 5px;
      }
      :first-child {
        margin-left: 0px;
      }
    }

    #content-table {
      overflow: hidden;
    }
  }
  #card-content-footer {
    border-top: 1px solid $color-borderline;
    flex: 0 0 50px;
    padding-right: 12px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  #content-blocker {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.55);
    border-radius: 4px;
  }
}
</style>
