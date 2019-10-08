<template>
  <div>
    <div class="card w-fill h-fill">
      <div class="header">
        <nav-bar :options="pageOption" @search="keywordChange" showSearch></nav-bar>
        <div class="back-button">
          <text-button @click="goRobotList">{{ $t('management.go_back') }}</text-button>
        </div>
      </div>
      <div class="page">
        <command-row class="commands">
          <text-button button-type="primary" @click="popGroupEditor()">{{ $t('management.create_group') }}</text-button>
        </command-row>
        <div class="group-list">
          <div v-for="group in filteredGroup" :key="group.id" class="group-card">
            <div class="card-title">
              <div class="card-title-text">
                {{ group.name }}
              </div>
              <div class="card-title-edit" @click="popGroupEditor(group)">
                <icon :size=12 icon-type="edit_blue"></icon>
              </div>
            </div>
            <div class="card-content">
              <tag class="tags" v-for="app in group.apps" :key="app.id">{{ app.name }}</tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import NavBar from '@/components/NavigationBar';
import Tag from '@/components/basic/Tag';
import CommandRow from '../_components/CommandRow';
import GroupAddForm from './_components/GroupAddForm';
import GroupDeleteForm from './_components/GroupDeleteForm';
import GroupAPI from '../_api/group';
import AppAPI from '../_api/robot';

export default {
  path: 'robot-group',
  name: 'robot-group',
  privCode: 'manage_robot',
  api: [GroupAPI, AppAPI],
  data() {
    return {
      pageOption: {
        robotGroup: this.$t('management.group_manage'),
      },
      robotGroups: [],
      keyword: '',
    };
  },
  components: {
    NavBar,
    CommandRow,
    Tag,
  },
  computed: {
    ...mapGetters([
      'enterpriseID',
    ]),
    filteredGroup() {
      if (this.keyword === '') {
        return this.robotGroups;
      }
      return this.robotGroups.filter(group => group.name.indexOf(this.keyword) >= 0);
    },
  },
  methods: {
    keywordChange(word) {
      this.keyword = word;
    },
    goRobotList() {
      this.$router.push('/manage/robot-manage');
    },
    getRobotsAndGroups() {
      const that = this;

      let robots = [];
      let groups = [];
      return that.$api.getRobots(that.enterpriseID)
      .then((data) => {
        robots = data;
      })
      .then(() => that.$api.getRobotGroups(that.enterpriseID))
      .then((data) => {
        groups = data;
      })
      .then(() => ({
        groups,
        robots,
      }));
    },
    popGroupEditor(group) {
      // when group is undefined, create new robot group
      const that = this;
      that.$startPageLoading();
      that.getRobotsAndGroups()
      .then((data) => {
        const option = {
          title: that.$t('management.create_group'),
          component: GroupAddForm,
          validate: true,
          extData: {
            robots: data.robots,
            groups: data.groups.map(g => g.name),
            group,
          },
          callback: {
            ok(retData) {
              that.$startPageLoading();
              let promise;
              if (group === undefined) {
                promise = that.$api.addRobotGroup(that.enterpriseID, retData);
              } else {
                promise = that.$api.updateRobotGroup(that.enterpriseID, group.id, retData);
              }
              promise.finally(() => {
                that.loadGroup();
                that.$emit('endLoading');
              });
            },
          },
        };
        if (group !== undefined) {
          option.title = that.$t('management.edit_group');
          option.left_button = {
            msg: that.$t('general.delete'),
            type: 'error',
            closeAfterClick: true,
            callback: () => {
              that.popDelete(group);
            },
          };
        }
        that.$pop(option);
      })
      .finally(() => {
        that.$emit('endLoading');
      });
    },
    popDelete(group) {
      const that = this;
      that.$pop({
        title: that.$t('management.delete_group'),
        component: GroupDeleteForm,
        validate: true,
        extData: {
          name: group.name,
          description: group.description,
        },
        callback: {
          ok() {
            that.$api.deleteRobotGroup(that.enterpriseID, group.id)
              .then(() => that.loadGroup());
          },
        },
      });
    },
    loadGroup() {
      const that = this;
      that.$startPageLoading();
      that.$api.getRobotGroups(that.enterpriseID).then((groups) => {
        that.robotGroups = groups;
      })
      .finally(() => {
        that.$emit('endLoading');
      });
    },
  },
  mounted() {
    this.loadGroup();
  },
};
</script>

<style lang="scss" scoped>
.card {
  display: flex;
  flex-direction: column;
  position: relative;

  .header{
    flex: 0 0 60px;
    display: flex;
    .nav-bar {
      flex: 1;
    }
    .back-button {
      flex: 0 90px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid $color-borderline;
    }
  }
  .page {
    flex: 1;
  }
}
.page {
  display: flex;
  flex-direction: column;
  @include auto-overflow();
  @include customScrollbar();
  .commands {
    flex: 0 0 auto;
  }
  .group-list {
    flex: 1;
    padding: 20px;
    padding-bottom: 0; 

    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    .group-card {
      flex: 0 0 274px;
      max-width: 274px;
      height: 180px;
      margin-right: 30px;
      margin-bottom: 30px;
      border-radius: 4px;
      border: solid 1px $color-borderline;
      transition: all .2s ease-in-out;
      &:hover {
        box-shadow: 0 4px 9px 0 rgba(115, 115, 115, 0.2), 0 5px 8px 0 rgba(228, 228, 228, 0.5);
        .card-title {
          .card-title-edit {
            visibility: visible;
          }
        }
      }

      display: flex;
      flex-direction: column;
      .card-title {
        flex: 0 0 auto;
        color: $color-font-active;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        background-color: #ffffff;
        border-bottom: solid 1px $color-borderline;
        font-size: 16px;
        line-height: 24px;
        padding: 10px;

        display: flex;
        align-items: center;
        .card-title-text {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .card-title-edit {
          flex: 0 0 24px;
          height: 24px;
          visibility: hidden;
          @include click-button();

          display: flex;
          align-items: center;
          justify-content: center;
          &:hover {
            background-color: #f7f7f7;
            border-radius: 12px;
          }
        }
      }
      .card-content {
        flex: 1;
        padding: 10px;
        @include auto-overflow();
        @include customScrollbar();

        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        .tags {
          flex: 0 0 auto;
          max-width: 230px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          height: 26px;
          &.tag {
            margin: 3px 5px;
          }
        }
      }
    }
  }
}
</style>
