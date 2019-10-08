<template>
  <div @scroll.passive="scrolling" class="chat-skill" ref='page'>
    <fieldset v-for="group in infoGroups" :key="group.name">
      <legend>{{ group.name }}</legend>
      <div class="card-container">
        <template v-for="id in group.infoIDs">
        <div
          :ref="skillInfos[id].name"
          :key="id" class="card"
          v-if="skillInfos[id] !== undefined">
          <input-list-table
            v-if="skillInfos[id].contents !== undefined"
            :title="skillInfos[id].name"
            :desc="skillInfos[id].comment"
            :key="skillInfos[id].type"
            :maxLength=200
            :maxValues="maxNums[id] || 5"
            v-model="skillInfos[id].contents"
            @input="inputChange(id, $event)"
            @submit="submitChange(id)"></input-list-table>
            <transition name="fade">
            <!-- <div class="card-button-container"> -->
            <div class="card-button-container" v-if="buttonEnable[id] === true">
              <loading-button @click="saveChange(id, $event)" :ref="`chat_${id}_button`">
                <template slot="loading">{{ $t('general.saving') }}</template>
                <template slot="init">{{ $t('general.save') }}</template>
                <template slot="finish">{{ $t('general.finish') }}</template>
              </loading-button>
            </div>
            </transition>
        </div>
        </template>
      </div>
    </fieldset>
    <div class="fix-top fixed" ref='top-fix'>
      <div v-for="(group, groupIdx) in infoGroups" :key="group.name" class="quick-link-container">
        <template v-for="(id, idx) in group.infoIDs">
        <div 
          :key="skillInfos[id].name"
          v-if="skillInfos[id] !== undefined"
          class="quick-link"
          :class="{show: infoPos[id] === -1}"
          :data-group="groupIdx"
          :data-idx="idx"
          :data-type-id="id"
          @click="clickAndScroll">
          {{ skillInfos[id].name }}
        </div>
        </template>
      </div>
    </div>
    <div class="fix-bottom fixed" ref='bottom-fix'>
      <div v-for="(group, groupIdx) in infoGroups" :key="group.name" class="quick-link-container">
        <template v-for="(id, idx) in group.infoIDs">
        <div
          :key="skillInfos[id].name"
          v-if="skillInfos[id] !== undefined && infoPos[id] === 1"
          class="quick-link"
          :class="{show: infoPos[id] === 1}"
          :data-group="groupIdx"
          :data-idx="idx"
          :data-type-id="id"
          @click="clickAndScroll">
          {{ skillInfos[id].name }}
        </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import InputListTable from '@/components/InputListTable';
import LoadingButton from '@/components/basic/LoadingButton';
import api from './_api/chatskill';

export default {
  path: 'robot-chat-skill',
  privCode: 'robot_chat_skill',
  displayNameKey: 'robot_chat_skill',
  icon: 'white_chat',
  name: 'robot-chat-skill',
  components: {
    InputListTable,
    LoadingButton,
  },
  methods: {
    submitChange(id) {
      const btns = this.$refs[`chat_${id}_button`];
      if (btns && btns[0]) {
        btns[0].$emit('forceClick');
      }
    },
    scrollTo(id) {
      const that = this;
      const card = that.$refs[that.skillInfos[id].name][0];
      const page = that.$refs.page;
      page.scrollTop = card.offsetTop - (parseInt(id / 2, 10) * 30);
      that.$nextTick(() => {
        that.scrolling();
      });
    },
    clickAndScroll(e) {
      const that = this;
      const data = e.target.dataset;
      const groupIdx = parseInt(data.group, 10);
      const idxInGroup = parseInt(data.idx, 10);
      const typeId = data.typeId;

      const card = that.$refs[that.skillInfos[typeId].name][0];
      const page = that.$refs.page;
      let count = 0;
      // count remaining counts;
      for (let i = 0; i < groupIdx; i += 1) {
        let countInGroup = that.infoGroups[i].infoIDs.length;
        countInGroup = countInGroup % 2 === 0 ? countInGroup : countInGroup + 1;
        count += countInGroup;
      }
      count += idxInGroup;
      page.scrollTop = (card.offsetTop - 30) - (parseInt(count / 2, 10) * 30);
      that.$nextTick(() => {
        that.scrolling();
      });
    },
    scrolling() {
      const that = this;
      const page = that.$refs.page;
      const infoPos = {};
      Object.keys(that.skillInfos).forEach((typeKey) => {
        const element = that.$refs[that.skillInfos[typeKey].name];
        if (element === undefined) {
          return;
        }
        const pos = element[0].getBoundingClientRect().y;
        if (pos < 50) {
          infoPos[typeKey] = -1;
        } else if (pos > page.clientHeight) {
          infoPos[typeKey] = 1;
        } else {
          infoPos[typeKey] = 0;
        }
      });
      that.infoPos = infoPos;
    },
    inputChange(id) {
      this.buttonEnable[id] = true;
    },
    saveChange(id, button) {
      const that = this;
      const contents = this.skillInfos[id].contents;
      const name = this.skillInfos[id].name;

      const params = [{
        type: id,
        name,
        contents,
      }];
      that.$api.updateRobotChat(params)
      .then(() => {
        that.buttonEnable[id] = false;
        button.$emit('finish');
        that.$notify({ text: that.$t('chat_skill.save_success_msg', { item: name }) });
      })
      .catch(() => {
        button.$emit('reset');
      });
    },
    getChatDescriptions() {
      const that = this;
      const skillInfos = {};
      const buttonEnable = {};
      const infoPos = {};
      that.$startPageLoading();
      that.$api.getRobotChatDescription().then((data) => {
        data.forEach((info) => {
          skillInfos[info.type] = info;
          buttonEnable[info.type] = false;
          infoPos[info.type] = false;
        });
      })
      .then(() => that.$api.getRobotChatList())
      .then((data) => {
        const skillContents = {};
        data.forEach((skill) => {
          skillContents[skill.type] = skill.contents;
        });
        Object.keys(skillInfos).forEach((infoType) => {
          if (skillContents[infoType]) {
            skillInfos[infoType].contents = skillContents[infoType];
          } else {
            skillInfos[infoType].contents = [];
          }
        });
        that.buttonEnable = buttonEnable;
        that.skillInfos = skillInfos;
        that.$nextTick(() => {
          that.scrolling();
        });
        that.$emit('endLoading');
      })
      .catch((err) => {
        if (typeof (err) === 'string') {
          that.$notify({ text: err, type: 'fail' });
        }
        that.$emit('endLoading');
      });
    },
  },
  api,
  data() {
    return {
      skillID: [],
      skillInfos: {},
      buttonEnable: {},
      infoPos: {},
      infoGroups: [
        {
          name: this.$t('chat_skill.group_basic'),
          infoIDs: [1, 2, 4, 3, 12],
        },
        {
          name: this.$t('chat_skill.group_emotion'),
          infoIDs: [9, 10, 11],
        },
        {
          name: this.$t('chat_skill.group_timeout'),
          infoIDs: [7, 8],
        },
      ],
      maxNums: {
        3: 10,
      },
    };
  },
  mounted() {
    this.getChatDescriptions();
  },
};
</script>

<style lang="scss" scoped>
@import 'styles/variable.scss';
.chat-skill {
  @include auto-overflow();
}
.fade-leave-active {
  transition: opacity .5s;
}
.fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
fieldset {
  border: 1px solid $area-border-color;
  padding: 5px 20px;
  margin-top: 10px;
  margin-bottom: 40px;
  legend {
    padding: 0 10px;
  }
}
.card-container {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: space-between;
  padding-top: 10px;
  .card {
    flex: 0 0 50%;
    flex-basis: calc(50% - 15px);
    float: left;
    margin-bottom: 20px;
  }
  .card-button-container {
    padding: 10px 0;
    text-align: right;
  }
}

.fix-top {
  position: fixed;
  top: $page-header-height;
  // border-bottom: 1px solid black;
  box-shadow: 0 1px 5px $page-header-color;
}
.fix-bottom {
  position: fixed;
  bottom: 0;
  box-shadow: 0 -1px 5px $page-header-color;
}
.fixed {
  width: calc(100% - #{$page-menu-width});
  padding: 0 40px;
  left: $page-menu-width;
  background: $page-base;
  .quick-link-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    .quick-link {
      flex: 0 0 50%;
      flex-basis: calc(50% - 20px);
      height: 0px;
      overflow: hidden;
      &.show {
        border: 1px solid $table-border-color;
        height: 30px;
        line-height: 30px;
      }
      @include click-button();
    }
  }
}
</style>
