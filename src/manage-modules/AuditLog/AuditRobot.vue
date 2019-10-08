<template>
  <div id="audit-robot" class="audit-page">
    <div class="card h-fill w-fill">
      <div id="audit-header">
        <template v-if="isNormalUser">
          <nav-bar class="nav-bar" :options="pageOption"></nav-bar>
        </template>
        <template v-else>
          <nav-bar class="nav-bar" :options="pageOption" v-model="currentPage"></nav-bar>
        </template>
        <div class="back-button">
          <text-button @click="goBack">{{ $t('management.go_back') }}</text-button>
        </div>
      </div>

      <div id="audit-filter">
        <div id="filter-block">
          <div class="row">
            <div class="row-title">{{ $t  ('management.audit.filter_robot') }}</div>
            <div class="row-content">
              <dropdown-select
                v-if="!isSystemAdmin"
                v-model="filterRobot"
                :options="filterRobotOptions"
                :showCheckedIcon="false"
                :placeholder="$t('general.please_choose')"
                width="300px"
              />
              <dropdown-cascader
                v-else
                v-model="filterRobot"
                :options="filterRobotOptions"
                :placeholder="$t('general.please_choose')"
                width="300px"
              />
            </div>
          </div>
          <template v-if="expertMode">
            <div class="row">
              <div class="row-title">{{ $t('management.audit.filter_time') }}</div>
              <div class="row-content">
                <label-switch class="switch" v-model="dayRange"
                  :options="timeOption"
                  @change="setUpTime">
                </label-switch>
                <datetime-picker
                  :value="start"
                  :disableDate="startDisableDate"
                  @dateChanged="handleStartDateChanged"
                  @validityChange="value => {startValidity = value}"
                ></datetime-picker>
                <span>～</span>
                <datetime-picker
                  :value="end"
                  :disableDate="endDisableDate"
                  @dateChanged="handleEndDateChanged"
                  @validityChange="value => {endValidity = value}"
                ></datetime-picker>
              </div>
              <div class="row-title">{{ $t('management.audit.filter_userid') }}</div>
              <div class="row-content">
                <input type="text" v-model="filterUserId">
              </div>
            </div>
            <div class="row">
              <div class="row-title">{{ $t('management.audit.filter_module') }}</div>
              <div class="row-content">
                <dropdown-select
                  v-model="filterModule"
                  :options="filterModuleOptions"
                  :showCheckedIcon="false"
                  :placeholder="$t('general.please_choose')"
                  width="160px"
                  @input="setFilterActionType"
                />
                <dropdown-select
                  v-model="filterActionType"
                  :options="filterActionTypeOptions"
                  :showCheckedIcon="false"
                  :placeholder="$t('general.please_choose')"
                  width="160px"
                />
              </div>
            </div>
          </template>
        </div>
        <div id="filter-operation">
          <text-button
            :button-type="canSearch ? 'primary': 'disable'"
            :disabled="!validFormInput"
            @click="doSearch(1)"
            >
            {{ $t('general.search') }}
          </text-button>
          <div @click="expertMode = !expertMode" class="show-more" :class="{more: expertMode}">
            <div class="text">
              {{ $t('statistics.export_mode') }}
            </div>
            <icon class="expand-icon" icon-type="expand" :size=12 />
          </div>
        </div>
      </div> <!-- ./#audit-filter -->
      
      <div id="audit-result">
        <div id="audit-toolbar">
          <!-- <text-button v-if="canExport"
            :button-type="totalLogCount > 0 ? 'default' : 'disable'"
            @click="doExport">
            {{ $t('general.export') }}
          </text-button> -->
          <div id="audit-log-count">{{ $t('management.audit.total', { num: totalLogCount }) }}</div>
        </div>

        <div id="audit-content" v-if="showTable">
          <general-table 
            auto-height show-empty
            :tableData="tableData"
            :tableHeader="tableHeader"
          >
          </general-table>
        </div>
        <div id="audit-footer" v-if="showPagination">
          <v-pagination size="small"
            :total="totalLogCount"  
            :pageIndex="pageIdx"
            :pageSize="pageLimit"
            :pageSizeOption="[25, 50, 100, 200, 500, 1000]"
            :layout="['prev', 'pager', 'next', 'sizer', 'jumper']"
            @page-change="doSearch"
            @page-size-change="handlePageSizeChange"  
          ></v-pagination>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import moment from 'moment';
import DatetimePicker from '@/components/DateTimePicker';
import NavBar from '@/components/NavigationBar';
import csvUtil from '@/utils/js/csv';
import miscUtil from '@/utils/js/misc';
import datepickerMixin from './_mixin/datepicker';
import RobotModuleMap from './_mixin/RobotModuleMap';
import operationType from './_mixin/operationType';
import dataModify from './_mixin/dataModify';
import UserType from './_data/UserType';
import api from './_api/audit';

const auditEnterprisePage = '/manage/audit-enterprise';
const auditSystemPage = '/manage/audit-system';
export default {
  path: 'audit-robot',
  name: 'audit-robot',
  privCode: 'statistic_audit',
  components: {
    NavBar,
    DatetimePicker,
  },
  api,
  mixins: [datepickerMixin, RobotModuleMap, operationType, dataModify],
  data() {
    return {
      userType: undefined,
      currentPage: 'auditRobot',
      pageOption: {},
      isNormalUser: false,
      isSystemAdmin: false,

      expertMode: false,

      filterRobot: [],
      filterRobotOptions: [],
      filterUserId: '',
      filterModule: [],
      filterModuleOptions: [],
      filterActionType: [],
      filterActionTypeOptions: [],

      dayRange: 1,

      showTable: false,
      totalLogCount: 0,
      tableHeader: [],
      tableData: [],

      pageIdx: 1,
      pageLimit: 25,
    };
  },
  computed: {
    ...mapGetters([
      'userInfo',
      'robotList',
      'robotID',
      'enterpriseList',
      'enterpriseID',
      'privilegeList',
      'privilegeMap',
    ]),
    canExport() {
      return this.$hasRight('export');
    },
    canSearch() {
      return this.filterRobot.length > 0;
    },
    showPagination() {
      return this.showTable && this.totalLogCount > 0;
    },
  },
  watch: {
    currentPage(val) {
      if (val === 'auditEnterprise') {
        this.$router.replace(auditEnterprisePage);
      } else if (val === 'auditSystem') {
        this.$router.replace(auditSystemPage);
      }
    },
    expertMode(val) {
      if (val) {
        this.initDatetimePicker();
      }
    },
  },
  methods: {
    goBack() {
      this.$router.back(); // history forward 1 page
    },
    handlePageSizeChange(pageSize) {
      const that = this;
      that.pageLimit = pageSize;
      that.doSearch(1);
    },
    doExport() {
      const that = this;
      const searchParams = that.getSearchParams();
      that.$api.exportRobotAuditLog(searchParams).then((response) => {
        // TODO: export response

        const startTimeString = moment(that.start.getTimestamp() * 1000)
        .format('YYYYMMDDHHmm');
        const endTimeString = moment(that.end.getTimestamp() * 1000)
        .format('YYYYMMDDHHmm');
        const filename = `${that.$t('statistics.audit_record_filename')}_${startTimeString}_${endTimeString}.csv`;

        let recordArray = response.data.result.data;
        recordArray = that.convertAPIDataToTable(recordArray);
        const csvData = csvUtil.convertToCSV(recordArray, this.headerInfo);
        const blobData = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvData], { type: 'text/csv' });
        miscUtil.downloadRawFile(blobData, filename);
        that.$emit('endLoading');
      });
    },
    doSearch(page) {
      const that = this;
      that.pageIdx = page;
      const searchParams = that.getSearchParams();
      searchParams.page = that.pageIdx;
      searchParams.limit = that.pageLimit;
      that.$api.getRobotAuditLog(searchParams).then((result) => {
        that.rowDataModify(result.data);
        that.totalLogCount = result.total_size;
        that.tableHeader = result.table_header;
        that.tableData = result.data;
        that.showTable = true;
      });
    },
    getSearchParams() {
      const that = this;
      const params = {
        start_time: that.start.getTimestamp(),
        end_time: that.end.getTimestamp(),
      };

      if (that.userType !== UserType.SYSTEM_ADMIN) {
        params.enterprise_id = [that.enterpriseID];
        params.robot_id = that.filterRobot;
      } else {
        params.enterprsie_id = [that.filterRobot[0]];
        params.robot_id = [that.filterRobot[1]];
      }
      that.filterUserId = that.filterUserId.trim();
      if (that.filterUserId !== '') {
        params.user_id = that.filterUserId;
      }
      const targetModule = that.robotModuleList
          .find(robotModule => robotModule.id === that.filterModule[0]);
      params.operation = {
        module: targetModule.privCode,
        type: that.filterActionType[0] === 'all' ? '' : that.filterActionType[0],
      };
      return params;
    },
    setPageOption() {
      if (this.userType === UserType.SYSTEM_ADMIN) {
        this.pageOption = {
          auditSystem: this.$t('management.audit.system'),
          auditEnterprise: this.$t('management.audit.enterprise'),
          auditRobot: this.$t('management.audit.robot'),
        };
        return;
      } else if (this.userType === UserType.ENTERPRISE_ADMIN) {
        this.pageOption = {
          auditEnterprise: this.$t('management.audit.enterprise'),
          auditRobot: this.$t('management.audit.robot'),
        };
        return;
      }
      this.pageOption = {
        auditRobot: this.$t('management.audit.robot'),
      };
    },
    setFilterOption() {
      /** filterRobot */
      if (this.userType !== UserType.SYSTEM_ADMIN) {
        this.filterRobotOptions = this.robotList.map(robot => ({
          text: robot.name,
          value: robot.id,
        }));
        if (this.robotID && this.robotID !== '') {
          this.filterRobot = [this.robotID];
        }
      } else {
        // TODO: else: system admin call api to get full enterprise and robot list
        this.$api.getFullEnterpriseList().then((result) => {
          this.filterRobotOptions = result.map((res) => {
            const option = {};
            option.text = res.name;
            option.value = res.id;
            if (res.robots) {
              option.options = res.robots.map(robot => ({
                text: robot.name,
                value: robot.id,
              }));
            } else {
              option.options = [];
            }
            return option;
          });
          if (this.enterpriseID && this.enterpriseID !== '' &&
            this.robotID && this.robotID !== '') {
            this.filterRobot = [this.enterpriseID, this.robotID];
          }
        });
      }

      /** filterModule & filterActionType */
      const moduleOptions = [];
      if (this.userType === UserType.SYSTEM_ADMIN) {
        this.robotModuleList.forEach((robotModule) => {
          moduleOptions.push({
            text: robotModule.name,
            value: robotModule.id,
          });
        });
      } else {
        const privCodes = this.privilegeList.map(priv => priv.code);
        this.robotModuleList.forEach((robotModule) => {
          // Only add option if the Enterprise have certain module
          const hasModule = privCodes
            .some(code => robotModule.privCode.indexOf(code) !== -1);
          if (hasModule || robotModule.id === 'all') {
            moduleOptions.push({
              text: robotModule.name,
              value: robotModule.id,
            });
          }
        });
      }

      this.robotModuleList.forEach((robotModule) => {
        if (robotModule.id === 'ssm') {
          robotModule.privCode.push('2');
        }
      });

      this.filterModuleOptions = moduleOptions;
      this.filterModule = [moduleOptions[0].value];
      this.setFilterActionType();
    },
    setFilterActionType() {
      const currentModule = this.robotModuleList
        .find(robotModule => robotModule.id === this.filterModule[0]);
      const actionTypeOptions = currentModule.operation
        .map(op => ({
          text: this.operationType[op],
          value: op,
        }));
      this.filterActionTypeOptions = actionTypeOptions;
      this.filterActionType = [actionTypeOptions[0].value];
    },
  },
  beforeMount() {
    this.userType = this.userInfo.type;
    this.setPageOption();
    this.isNormalUser = this.userType === UserType.NORMAL_USER;
    this.isSystemAdmin = this.userType === UserType.SYSTEM_ADMIN;
    this.setFilterOption();
    this.initDatetimePicker();
  },
};

</script>
<style lang="scss" scoped>
.audit-page {
  .card {
    display: flex;
    flex-direction: column;
  }
}
#audit-header {
  flex: 0 0 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .nav-bar {
    flex: 1;
  }
  .back-button {
    padding-right: 20px;
    height: 60px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid $color-borderline;
  }
}

#audit-filter {
  flex: 0 0 auto;
  padding: 16px 20px;
  display: flex;
  border-bottom: 1px solid $color-borderline;
  #filter-block {
    flex: 1;
    .row {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      &:not(:first-child) {
        margin-top: 10px;
      }

      .row-title {
        @include font-14px();
        color: $color-font-normal;
        flex: 0 0 100px;

      }
      .row-content {
        display: flex;
        align-items: center;
        margin-left: 12px;
        margin-right: 100px;

        >:not(:last-child) {
          margin-right: 10px;
        }
      }
    }
  }
  #filter-operation {
    flex: 0 0 auto;
    display: flex;
    align-items: flex-end;
    .text-button{
      &.disabled {
        pointer-events: none;
      }
    }
    .show-more {
      @include click-button();
      display: flex;
      align-items: center;
      height: 28px;
      margin-left: 12px;
      .text {
        margin-right: 5px;
      }
      &:not(.more) {
        .expand-icon {
          transform: rotate(180deg);
        }
      }
    }
  }
}
#audit-result {
  flex: 1;
  display: flex;
  flex-direction: column;
  #audit-toolbar {
    flex: 0 0 auto;
    padding: 20px;
    display: flex;
    align-items: center;
    >:not(:first-child) {
      margin-left: 10px;
    }
    .text-button {
      &.disabled {
        pointer-events: none;
      }
    }
    #audit-log-count {
      height: 28px;
      display: flex;
      align-items: center;
    }
  }
  #audit-content {
    flex: 1;
    display: flex;
  }
  #audit-footer {
    flex: 0 0 50px;
    border-top: 1px solid $color-borderline;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
