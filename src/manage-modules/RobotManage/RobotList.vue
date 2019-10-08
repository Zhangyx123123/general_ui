<template>
  <div>
    <div class="card h-fill w-fill">
      <nav-bar class='nav-bar' v-model="currentPage" :options="getNavbarOption()" @search="doSearch" showSearch></nav-bar>
      <div class="page">
        <command-row class="commands">
            <template v-if="isAdmin">
            <text-button button-type="primary" @click="createRobot">{{ $t('management.create_robot') }}</text-button>
            <text-button @click="goGroupList">{{ $t('management.group_manage') }}</text-button>
            </template>
        </command-row>
        <div class="robot-list">
          <div class="robot-card"
            v-for="robot in filteredRobots" :key="robot.id"
            @click="goRobot(robot)">
            <div class="card-title">
              <div class="card-title-image">
                <icon :size=18 icon-type="robot"></icon>
              </div>
              <div :ref="robot.id" class="card-title-text" v-tooltip="robotNameTooltip" @mouseover="showFullRobotName($event, robot.name, robot.id)" @mouseout="hideFullRobotName($event, robot.id)">
                {{ robot.name }}
              </div>
              <div class="card-title-edit" @click.stop="editName(robot)" v-if="isAdmin">
                <icon :size=12 icon-type="edit_blue"></icon>
              </div>
            </div>
            <div class="card-description">
              {{ robot.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import event from '@/utils/js/event';
import misc from '@/utils/js/misc';
import NavBar from '@/components/NavigationBar';
import RobotForm from './_components/RobotAddForm';
import CommandRow from '../_components/CommandRow';
import robotAPI from '../_api/robot';
import roleAPI from '../_api/role';
import userAPI from '../_api/user';
import RobotDeleteForm from './_components/RobotDeleteForm';
import mixin from './_store/mixin';

const defaultPath = '/statistic-dash';
export default {
  path: 'robot-manage',
  name: 'robot-manage',
  privCode: 'manage_robot',
  components: {
    NavBar,
    CommandRow,
  },
  api: [robotAPI, roleAPI, userAPI],
  mixins: [mixin],
  computed: {
    ...mapGetters([
      'userInfo',
      'enterpriseID',
      'robotList',
      'userRoleMap',
    ]),
    isAdmin() {
      return this.userInfo.type < 2;
    },
    filteredRobots() {
      if (this.keyword === '') {
        return this.robotList;
      }
      return this.robotList.filter(robot =>
        robot.name.indexOf(this.keyword) >= 0 ||
        (robot.description && robot.description.indexOf(this.keyword) >= 0));
    },
  },
  data() {
    return {
      currentPage: 'robotList',
      keyword: '',
      robots: [],
      robotNameTooltip: {
        msg: '',
        eventOnly: true,
        alignLeft: true,
        top: -10,
        left: 80,
      },
    };
  },
  watch: {
    currentPage(val) {
      if (val === 'enterpriseSetting') {
        this.$router.push('enterprise-setting');
      }
    },
  },
  methods: {
    ...mapMutations([
      'setRobot',
      'setRobotList',
      'setUserRole',
    ]),
    showFullRobotName(e, name, robotId) {
      const that = this;
      if (!misc.isEllipsisActive(e.target)) return;
      that.robotNameTooltip.msg = name;
      that.$refs[robotId][0].dispatchEvent(event.createEvent('tooltip-reload'));
      that.$refs[robotId][0].dispatchEvent(event.createEvent('tooltip-show'));
    },
    hideFullRobotName(e, robotId) {
      const that = this;
      if (!misc.isEllipsisActive(e.target)) return;
      that.$refs[robotId][0].dispatchEvent(event.createEvent('tooltip-hide'));
    },
    doSearch(word) {
      this.keyword = word;
    },
    editName(robot) {
      const that = this;
      that.$api.getRobots(that.enterpriseID).then((data) => {
        that.$pop({
          title: that.$t('management.edit_robot'),
          component: RobotForm,
          validate: true,
          extData: {
            name: robot.name,
            description: robot.description,
            existedRobots: data.map(robots => robots.name),
          },
          left_button: {
            msg: that.$t('general.delete'),
            type: 'error',
            closeAfterClick: true,
            callback: () => {
              that.popDelete(robot);
            },
          },
          callback: {
            ok(retData) {
              that.$api.updateRobot(that.enterpriseID, robot.id, retData)
              .then(() => that.updateRobots())
              .finally(() => {
                that.$emit('endLoading');
              });
            },
          },
        });
      });
    },
    popDelete(robot) {
      const that = this;
      that.$pop({
        title: that.$t('management.delete_robot'),
        component: RobotDeleteForm,
        validate: true,
        extData: {
          name: robot.name,
          description: robot.description,
        },
        callback: {
          ok(reason) {
            that.$api.deleteRobot(that.enterpriseID, robot.id, reason)
              .then(() => that.updateRobots());
          },
        },
      });
    },
    goRobot(robot) {
      const that = this;
      let promise;

      if (that.userInfo.type === 2) {
        const roleIDs = that.userRoleMap[robot.id];
        const roleID = roleIDs[0];
        const promises = roleIDs.map(id => that.$api.getEnterpriseRole(that.enterpriseID, id));
        promise = Promise.all(promises).then((roles) => {
          that.setUserRole(roles);
        })
        .then(() => that.$api.updateBFUserRole(that.enterpriseID, that.userInfo.id, roleID));
      } else {
        promise = new Promise(r => r());
      }
      promise.then(() => {
        that.setRobot(robot.id);
        that.$router.push(defaultPath);
      });
    },
    goGroupList() {
      this.$router.push('/manage/robot-group');
    },
    createRobot() {
      const that = this;
      that.$api.getRobots(that.enterpriseID).then((data) => {
        that.$pop({
          title: that.$t('management.create_robot'),
          component: RobotForm,
          extData: {
            existedRobots: data.map(robot => robot.name),
          },
          validate: true,
          callback: {
            ok(retData) {
              that.$startPageLoading();
              that.$api.addRobot(that.enterpriseID, retData, that.userInfo.id)
              .then(() => that.updateRobots())
              .catch((err) => {
                this.$notifyFail(`${that.$t('management.err_add_robot_fail')}: ${err.response.data.ret_msg}`);
                console.log(err);
              })
              .finally(() => {
                that.$emit('endLoading');
              });
            },
          },
        });
      });
    },
    updateRobots() {
      const that = this;
      that.$startPageLoading();
      return that.$loadRobotOfUser(that.userInfo).then((robots) => {
        const robotMap = {};
        robots.forEach((robot) => {
          if (robot.app_type === 0 || robot.app_type === undefined) {
            robotMap[robot.id] = robot;
          }
        });
        const generalRobots = robots.filter(s => s.app_type === 0 || s.app_type === undefined);
        that.setRobotList(generalRobots);
      })
      .finally(() => {
        that.$emit('endLoading');
      });
    },
  },
  mounted() {
    this.updateRobots();
    this.setRobot('');
  },
};
</script>

<style lang="scss" scoped>
.card {
  display: flex;
  flex-direction: column;

  .nav-bar {
    flex: 0 0 60px;
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

  .robot-list {
    flex: 1;
    padding: 20px;
    padding-bottom: 0px;

    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    .robot-card {
      flex: 0 0 380px;
      max-width: 380px;
      height: 180px;
      border-radius: 4px;
      border: 1px solid $color-borderline;
      margin-right: 30px;
      margin-bottom: 20px;
      padding: 20px;
      @include click-button();
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
        padding-bottom: 10px;
        margin-bottom: 20px;
        box-shadow: inset 0 -1px 0 0 $color-borderline;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;

        display: flex;
        align-items: center;
        .card-title-image {
          flex: 0 0 40px;
          height: 40px;
          border-radius: 100px;
          background-color: #ffca43;

          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-title-text {
          flex: 1;
          font-size: 20px;
          line-height: 24px;
          color: #333333;
          margin: 0 20px;
          text-overflow: ellipsis;
          overflow: hidden;
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
      .card-description {
        @include font-14px();
        color: #666666;
        word-break: break-all;
      }
    }
  }
}
</style>
