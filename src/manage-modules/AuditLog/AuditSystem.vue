<template>
  <div id="audit-system" class="audit-page">
    <div class="card h-fill w-fill">
      <div id="audit-header">
        <nav-bar class="nav-bar" :options="pageOption" v-model="currentPage"></nav-bar>
        <div class="back-button">
          <text-button @click="goBack">{{ $t('management.go_back') }}</text-button>
        </div>
      </div>
      
      <div id="audit-filter">
        <div id="filter-block">
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
          <template v-if="expertMode">
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
            button-type="primary" 
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
import DatetimePicker from '@/components/DateTimePicker';
import NavBar from '@/components/NavigationBar';
import datepickerMixin from './_mixin/datepicker';
import SystemModuleMap from './_mixin/SystemModuleMap';
import operationType from './_mixin/operationType';
import dataModify from './_mixin/dataModify';
import api from './_api/audit';

const auditEnterprisePage = '/manage/audit-enterprise';
const auditRobotPage = '/manage/audit-robot';
export default {
  path: 'audit-system',
  name: 'audit-system',
  privCode: 'statistic_audit',
  components: {
    NavBar,
    DatetimePicker,
  },
  api,
  mixins: [datepickerMixin, SystemModuleMap, operationType, dataModify],
  data() {
    return {
      currentPage: 'auditSystem',
      pageOption: {
        auditSystem: this.$t('management.audit.system'),
        auditEnterprise: this.$t('management.audit.enterprise'),
        auditRobot: this.$t('management.audit.robot'),
      },

      expertMode: false,

      filterUserId: '',
      filterModule: [],
      filterModuleOptions: [],
      filterActionType: [],
      filterActionTypeOptions: [],

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
      'enterpriseID',
    ]),
    canExport() {
      return this.$hasRight('export');
    },
    showPagination() {
      return this.showTable && this.totalLogCount > 0;
    },
  },
  watch: {
    currentPage(val) {
      if (val === 'auditEnterprise') {
        this.$router.replace(auditEnterprisePage);
      } else if (val === 'auditRobot') {
        this.$router.replace(auditRobotPage);
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
      that.$api.exportSystemAuditLog(searchParams).then((response) => {
        // TODO: export response
        console.log({ response });
      });
    },
    doSearch(page) {
      const that = this;
      that.pageIdx = page;
      const searchParams = that.getSearchParams();
      searchParams.page = that.pageIdx;
      searchParams.limit = that.pageLimit;
      console.log({ searchParams });
      that.$api.getSystemAuditLog(searchParams).then((result) => {
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
      that.filterUserId = that.filterUserId.trim();
      if (that.filterUserId !== '') {
        params.user_id = that.filterUserId;
      }
      const targetModule = that.systemModuleList
          .find(systemModule => systemModule.id === that.filterModule[0]);
      params.operation = {
        module: targetModule.privCode,
        type: that.filterActionType[0] === 'all' ? '' : that.filterActionType[0],
      };
      return params;
    },
    setFilterOption() {
      /** filterModule & filterActionType */
      const moduleOptions = [];
      this.systemModuleList.forEach((systemModule) => {
        moduleOptions.push({
          text: systemModule.name,
          value: systemModule.id,
        });
      });
      this.filterModuleOptions = moduleOptions;
      this.filterModule = [moduleOptions[0].value];
      this.setFilterActionType();
    },
    setFilterActionType() {
      const currentModule = this.systemModuleList
        .find(systemModule => systemModule.id === this.filterModule[0]);
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
