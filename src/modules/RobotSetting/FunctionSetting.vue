<template>
<div id="robot-skill">
  <div class="card h-fill w-fill">
    <div class="header">
      <div class="header-text">{{ $t('pages.robot_setting.robot_function') }}</div>
      <icon iconType="info" :size="16" enableHover v-tooltip="pageInfoTooltip"></icon>
    </div>
    <div class="page">
      <div class="row">
        <text-button v-if="canEdit" v-on:click="setAll(true)" :button-type="allActive ? 'disable': 'default'">{{ $t("robot_setting.all_active") }}</text-button>
        <text-button v-if="canEdit" v-on:click="setAll(false)" :button-type="allDeactive ? 'disable': 'default'">{{ $t("robot_setting.all_deactive") }}</text-button>
      </div>
      <div class="skill-card-container">
        <div v-for="skill in moduleList" :key="skill.id" class="skill-card" :class="{checked: skill.active}">
          <div class="skill-switch" v-if="canEdit">
            <toggle v-model="skill.active" @change="updateSkill(skill)"/>
          </div>
          <div class="skill-switch" v-else style="cursor: default;"></div>
          <div class="skill-text">
            <div class="skill-name">{{ skill.name }}</div>
            <div class="skill-remark">{{ skill.remark }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import api from './_api/robot';

export default {
  path: 'robot-function',
  privCode: 'robot_function',
  displayNameKey: 'robot_function',
  icon: 'white_setting2',
  api,
  methods: {
    reloadSkill() {
      const that = this;
      return that.$api.getFunctionsStatusV2()
      .then((data) => {
        that.moduleList = data;
        that.moduleList.forEach((mod) => {
          mod.image = `/static/function_${mod.code.toLowerCase()}.png`;
        });
      }, () => {});
    },
    toggleSkill(skill) {
      skill.checked = !skill.checked;
      this.updateSkill(skill);
    },
    updateSkill(skill) {
      const active = skill.active;
      const that = this;

      that.$startPageLoading();
      this.$api.setFunctionStatusV2(skill.code, active).then((data) => {
        const res = data.data;
        if (res.status === 0) {
          this.$notify({ text: that.$t('error_msg.success') });
        } else {
          this.$notify({ text: res.message });
        }
      }, () => {
        // util.handleAPIError(that, err).catch((value) => {
        // pop.popErrorWindow(that, that.$t('error_msg.save_fail'), err);
        // });
      })
      .then(() => that.reloadSkill())
      .then(() => {
        that.$emit('endLoading');
      });
    },
    setAll(val) {
      const that = this;
      if ((val && this.allActive) || (!val && this.allDeactive)) return;
      that.moduleList.forEach((skill) => {
        skill.checked = val;
      });

      that.$startPageLoading();
      this.$api.setFunctionInfosV2(that.moduleList, val)
      .then((rsp) => {
        if (rsp.data.status !== 0) {
          that.$notifyFail('error_msg.request_fail');
        } else {
          this.$notify({ text: that.$t('error_msg.success') });
        }
      }, () => {
        that.$notifyFail('error_msg.request_fail');
      })
      .then(() => that.reloadSkill())
      .then(() => {
        that.$emit('endLoading');
      });
    },
    setUpModuleList() {
      this.moduleList = [
      ];
    },
    initPage() {
      const that = this;

      that.$startPageLoading();
      that.reloadSkill().then(() => {
        that.$emit('endLoading');
      });
    },
  },
  data() {
    return {
      showLoading: false,
      moduleList: [],
      i18n: undefined,
      pageInfoTooltip: {
        msg: this.$t('robot_setting.tooltip'),
      },
    };
  },
  activated() {
    this.initPage();
  },
  mounted() {
    this.setUpModuleList();
    this.initPage();
  },
  computed: {
    canEdit() {
      return this.$hasRight('edit');
    },
    allActive() {
      return this.moduleList.reduce((ret, mod) => ret && mod.active, true);
    },
    allDeactive() {
      return this.moduleList.reduce((ret, mod) => ret && !mod.active, true);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "styles/variable";

$function-header-height: 60px;
$function-header-font-size: 16px;
$function-header-bg: #fcfcfc;

$card-name-font-size: 14px;
$card-name-color: $color-font-active;
$card-remark-font-size: 12px;
$card-remark-color: #999999;

#robot-skill {
  .card {
    display: flex;
    flex-direction: column;
  }
  .header {
    flex: 0 0 $function-header-height;
    display: flex;
    align-items: center;
    font-size: $function-header-font-size;
    padding: 0 20px;
    box-shadow: inset 0 -1px 0 0 $color-borderline;
    .header-text {
      color: $color-font-active;
    }
    .icon {
       margin-left: 6px;
     }
    .text-button {
      margin-right: 10px;
    }
  }
  .page {
    flex: 1;
    @include auto-overflow();
    @include customScrollbar();
    .row {
      flex: 0 0 auto;
      margin: 20px;
      .text-button {
        margin: 0 5px;
        &:first-child {
          margin-left: 0px;
        }
      }
    }
    .skill-card-container {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      height: calc(100% - $function-header-height);
  
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      align-content: flex-start;
      padding: 20px;
      padding-top: 0px;
  
      .skill-card {
        flex: 0 0 calc(50% - 10px);
        flex-basis: calc(50% - 10px);
        min-width: 300px;
        height: 80px;
        border-radius: 4px;
        border: solid 1px $color-borderline;
        margin-bottom: 20px;
        margin-right: 20px;
        transition: all .2s ease-in-out;
        &:nth-child(2n) {
          margin-right: 0px;
        }
        &:hover{
          box-shadow: 0 4px 9px 0 rgba(115, 115, 115, 0.2), 0 5px 8px 0 rgba(228, 228, 228, 0.5);
        }
        display: flex;
        align-items: center;
        .skill-text {
          display: flex;
          flex-direction: column;
          margin-left: 20px;
          .skill-name {
            font-size: $card-name-font-size;
            color: $card-name-color;
          }
          .skill-remark {
            margin-top: 6px;
            font-size: $card-remark-font-size;
            color: $card-remark-color;
            &::before {
              content: '"';
            }
            &::after {
              content: '"';
            }
          }
        }
        .skill-switch {
          flex: 0 0 70px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-right: 1px solid #dbdbdb;
          height: 100%;
        }
      }
    }
  }
}
</style>
