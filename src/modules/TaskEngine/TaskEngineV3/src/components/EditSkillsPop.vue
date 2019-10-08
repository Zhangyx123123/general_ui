<template lang="html">
<div id="edit-skills-pop" class="edit-skills-pop">
  <text-button
    class="button-add-skill"
    button-type='primary'
    @click="addSkill">
    {{$t("task_engine_v3.edit_skill_pop.button_add_skill")}}
  </text-button>
  <div class="skill-list-container">
    <template v-for="(skill, skillId) in skills">
      <div class="skill-row" :key="skillId">
        <div class="label-skill-name">{{$t('task_engine_v3.edit_skill_pop.label_skill_name')}}</div>
        <input
          class="input-skill-name"
          :ref="'inputName_' + skillId"
          v-model="skill.skillName"
          v-tooltip="nameTooltipMap[skillId]"
        />
        <div
          class="button-delete-skill"
          v-if="skillId !== 'mainSkill'"
          @click="deleteSkill(skillId)"
        >{{$t('task_engine_v3.edit_skill_pop.button_delete_skill')}}
        </div>
      </div>
    </template>
  </div>
</div>
</template>

<script>
import event from '@/utils/js/event';

export default {
  name: 'edit-skills-pop',
  components: {
  },
  props: {
    origData: {
      type: Object,
      default: undefined,
    },
  },
  data() {
    return {
      skills: {},
      nameTooltipMap: {},
    };
  },
  computed: {},
  watch: {},
  methods: {
    addSkill() {
      const skillId = this.$uuid.v1();
      this.skills[skillId] = {
        skillName: '',
        entityCollectorList: [],
        actionGroupList: [],
        relatedEntities: {
          relatedEntityCollectorList: [],
          relatedEntityMatrix: [],
        },
        re_parsers: [],
        tde_setting: {},
      };
      this.nameTooltipMap[skillId] = {
        msg: '',
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      };
      this.$forceUpdate();
    },
    deleteSkill(skillId) {
      const options = {
        ok_msg: this.$t('general.ok'),
        cancel_msg: this.$t('general.cancel'),
        callback: {
          ok: () => {
            delete this.skills[skillId];
            delete this.nameTooltipMap[skillId];
            this.$forceUpdate();
          },
        },
        data: {
          msg: `${this.$t('task_engine_v3.edit_skill_pop.warn_delete_skill')}`,
        },
      };
      this.$popWarn(options);
    },
    validateDate() {
      let success = true;
      Object.keys(this.skills).forEach((skillId) => {
        if (this.skills[skillId].skillName === '') {
          this.nameTooltipMap[skillId].msg = this.$t('task_engine_v3.edit_skill_pop.tooltip_empty_name');
          const refName = `inputName_${skillId}`;
          this.$refs[refName][0].dispatchEvent(event.createEvent('tooltip-reload'));
          this.$refs[refName][0].dispatchEvent(event.createEvent('tooltip-show'));
          this.$refs[refName][0].focus();
          success = false;
        }// TODO: check duplicate skill names;
      });
      if (success) {
        this.$emit('validateSuccess', this.skills);
      }
    },
  },
  beforeMount() {},
  mounted() {
    const obj = JSON.parse(JSON.stringify(this.origData));
    this.skills = obj.skills;
    Object.keys(this.skills).forEach((skillId) => {
      this.nameTooltipMap[skillId] = {
        msg: '',
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      };
    });
    this.$on('validate', this.validateDate);
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
.edit-skills-pop{
  .button-add-skill{
    margin-left: 24px;
    width: 68px;
    height: 28px;
    margin-bottom: 13px;
  }
  .skill-list-container{
    @include auto-overflow();
    @include customScrollbar();
    padding-left: 24px;
    padding-right: 24px;
    height: 254px;
    .skill-row{
      position: relative;
      display: flex;
      flex-direction: row;
      width: 680px;
      height: 48px;
      border-radius: 4px;
      border: solid 1px #dbdbdb;
      background-color: #ffffff;
      align-items: center;
      padding: 10px;
      margin-bottom: 12px;
      transition: all .2s ease-in-out;
      &:hover{
        box-shadow: 0 4px 9px 0 rgba(115, 115, 115, 0.2), 0 5px 8px 0 rgba(228, 228, 228, 0.5);
      }
      .label-skill-name{
        width: 56px;
        height: 28px;
        font-size: 14px;
        line-height: 2;
        color: $color-font-normal;
      }
      .input-skill-name{
        width: 320px;
        height: 28px;
        margin-left: 10px;
      }
      .button-delete-skill{
        position: absolute;
        right: 20px;
        width: 24px;
        height: 28px;
        font-size: 12px;
        line-height: 28px;
        color: $color-error;
        &:hover {
          cursor: pointer;
          color: darken($color-error, 15%);
        }
      }
    }
  }
}
</style>