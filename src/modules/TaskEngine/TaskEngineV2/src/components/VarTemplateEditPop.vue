<template lang="html">
<div id="var-template-edit-pop">
  <div class="instruction block">
    {{$t("task_engine_v2.var_template_edit_pop.instruction")}}
  </div>
  <div class="block-list-container">
    <draggable v-model="varTemplates" :options="{ghostClass:'ghost'}" @start="dragStart" @end="dragEnd">
      <template v-for="(template, index) in varTemplates">
        <div class="block" :key="template.id" :class="{'block-template': true}">
          <div class="button-delete-template">
            <icon icon-type="delete" :enableHover="true" :size=24 @click="deleteTemplate(index)"/>
          </div>
          <div class="row">
            <div class="label">
              {{$t("task_engine_v2.var_template_edit_pop.label_key")}}
            </div>
            <div ref="dropdown" class="input-template-container" v-dropdown="insertVarDropdown(index)" :data-id="template.id">
              <input 
                ref="input_key" 
                class="input-key" 
                :data-index="index"
                v-model="template.key"
                v-tooltip="inputKeyTooltip"
                :class="{'error': template.isInputKeyTooltipShown}"
                @focus="template.isInputKeyTooltipShown = false;onInputFocus($event)"/>
            </div>
          </div>
          <div class="row">
            <div class="label">
              {{$t("task_engine_v2.var_template_edit_pop.label_template")}}
            </div>
            <input 
              ref="input_template" 
              class="input-template" 
              :data-index="index"
              v-model="template.msg"
              v-tooltip="inputTemplateTooltip"
              :class="{'error': template.isInputTemplateTooltipShown}"
              @focus="template.isInputTemplateTooltipShown = false;onInputFocus($event)"/>
          </div>
        </div>
      </template>
    </draggable>
    <button
      class="button-add-template"
      @click="addTemplate()">
      {{$t("task_engine_v2.var_template_edit_pop.button_add_template")}}
    </button>
  </div>
</div>
</template>

<script>
import event from '@/utils/js/event';
import general from '@/modules/TaskEngine/_utils/general';
import draggable from 'vuedraggable';
import scenarioInitializer from '../_utils/scenarioInitializer';

export default {
  components: {
    draggable,
  },
  props: {
    extData: {
      type: Object,
      required: true,
    },
  },
  data() {
    // render globalEdges
    const varTemplates = this.extData.varTemplates.map((template) => {
      const obj = { ...template };
      obj.id = this.$uuid.v1();
      obj.isInputKeyTooltipShown = false;
      obj.isInputTemplateTooltipShown = false;
      return obj;
    });
    const originalVarTemplatesStr =
      JSON.stringify(varTemplates, general.JSONStringifyReplacer);

    // render globalVarOptions
    const globalVarOptionsMap = this.extData.globalVarOptionsMap;
    const globalVarOptions = Object.values(globalVarOptionsMap)
    .reduce((acc, globalVarOption) => {
      acc.push(...globalVarOption);
      return acc;
    }, []);
    return {
      inputKeyTooltip: {
        msg: this.$t('task_engine_v2.var_template_edit_pop.err_empty_label_key'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
        absolute: true,
      },
      inputTemplateTooltip: {
        msg: this.$t('task_engine_v2.var_template_edit_pop.err_empty_label_template'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
        absolute: true,
      },
      varTemplates,
      originalVarTemplatesStr,
      globalVarOptions,
      valid: false,
      validateInput: false,
    };
  },
  watch: {
    validateInput(newV, oldV) {
      if (newV && !oldV) {
        if (!this.varTemplates.length) {
          this.valid = true;
        } else {
          let valid = true;
          this.$refs.input_key.forEach((el) => {
            if (!el.value.trim()) {
              valid = false;
              this.varTemplates[el.dataset.index].isInputKeyTooltipShown = true;
              el.dispatchEvent(event.createEvent('tooltip-show'));
            }
          });
          this.$refs.input_template.forEach((el) => {
            if (!el.value.trim()) {
              valid = false;
              this.varTemplates[el.dataset.index].isInputTemplateTooltipShown = true;
              el.dispatchEvent(event.createEvent('tooltip-show'));
            }
          });
          this.valid = valid;
        }
      }
    },
  },
  methods: {
    onInputFocus(evt) {
      evt.target.dispatchEvent(event.createEvent('tooltip-hide'));
    },
    addTemplate() {
      const template = scenarioInitializer.initialVarTemplate();
      template.id = this.$uuid.v1();
      this.varTemplates.push(template);
    },
    deleteTemplate(index) {
      this.varTemplates.splice(index, 1);
    },
    insertVarDropdown(index) {
      const options = this.globalVarOptions.map(option => ({
        text: `${option.text}：${option.value}`,
        onclick: () => { this.insertVarSelect(index, option.value); },
      }));
      return {
        options,
        width: '450px',
      };
    },
    insertVarSelect(index, key) {
      const toInsert = `$global{${key}}`;
      this.varTemplates[index].key = key;
      this.varTemplates[index].msg = toInsert;
    },
    validate() {
      this.validateInput = true;
      this.$nextTick(() => {
        this.validateInput = false;
        if (this.valid) {
          const varTemplates = this.varTemplates.map(varTemplate => ({
            key: varTemplate.key,
            msg: varTemplate.msg,
            type: varTemplate.type,
          }));
          this.$emit(
            'validateSuccess',
            varTemplates,
          );
        }
      });
    },
    cancelValidate() {
      const newVarTemplatesStr = JSON.stringify(this.varTemplates, general.JSONStringifyReplacer);
      if (newVarTemplatesStr === this.originalVarTemplatesStr) {
        this.$emit('cancelValidateSuccess');
      } else {
        const that = this;
        that.$popCheck({
          bindValue: true,
          data: {
            msg: that.$t('task_engine_v2.var_template_edit_pop.confirm_to_save_changes'),
          },
          callback: {
            ok() {
              const varTemplates = that.varTemplates.map(varTemplate => ({
                key: varTemplate.key,
                msg: varTemplate.msg,
                type: varTemplate.type,
              }));
              that.$emit(
                'validateSuccess',
                varTemplates,
              );
            },
            cancel() {
              that.$emit('cancelValidateSuccess');
            },
          },
        });
      }
    },
    dropDownReload() {
      this.$refs.dropdown.forEach((el) => {
        const index = this.varTemplates.findIndex(varTemplate => varTemplate.id === el.dataset.id);
        el.dispatchEvent(event.createCustomEvent('dropdown-reload', this.insertVarDropdown(index)));
      });
    },
    dragStart() {
      this.drag = true;
    },
    dragEnd() {
      this.drag = false;
      this.dropDownReload();
    },
  },
  mounted() {
    this.$on('validate', this.validate);
    this.$on('cancelValidate', this.cancelValidate);
  },
};
</script>

<style lang="scss" scoped>
#var-template-edit-pop {
  width: 600px;
  height: 70vh;
  display: flex;
  flex-direction: column;
  padding: 25px 25px 0px 25px;
  .block{
    position: relative;
    background: #F3F7F9;
    padding: 20px 20px 20px 20px;
    border: 1px solid $color-borderline;
    border-radius: 5px;
    &:nth-child(n+2){
      margin: 20px 0px 0px 0px;
    }
  }
  .block-template{
    cursor: move;
  }
  .instruction{
    height: 60px;
    flex: 0 0 60px;
    line-height: 20px;
    color: $color-font-normal;
    font-size: 14px;
  }
  .block-list-container{
    display: flex;
    flex-direction: column;
    @include auto-overflow();
    @include customScrollbar();
    padding-top: 20px;
    .button-delete-template{
      position: absolute;
      top: 10px;
      right: 10px;
    }
    .row{
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 36px;
      &:not(:last-child){
        margin: 0px 0px 10px 0px;
      }
      .label{
        height: 36px;
        line-height: 36px;
        font-size: 16px;
        width: 84px;
      }
      input{
        height: 36px;
        width: 400px;
      }
      .input-template-container{
        position: relative;
      }
    }
  }
  .button-add-template{
    height: 40px;
    flex: 0 0 40px;
    background: #46BE8A;
    border-radius: 5px;
    color: white;
    font-size: 18px;
    font-weight: 600;
    margin: 20px 0px 10px 0px;
    cursor: pointer;
    &:hover{
      transition: background-color 0.5s ease;
      background: lighten(#46BE8A, 10%);
    }
  }
}
</style>
