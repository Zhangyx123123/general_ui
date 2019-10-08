<template>
  <div id="js-code-edit-pop">
    <div class="title">
      <h2>{{ title }}</h2>
      <div class="select-type">
        <p>{{ $t('task_engine_v2.js_code_edit_pop.script_type') }}</p>
        <dropdown-select
          class="select"
          v-model="scriptType"
          :options="scriptTyepeOptions"
          :showCheckedIcon="false"
          width="140px"
          height="28px"
        />
      </div>
    </div>
    <div class="private js-script" v-if="scriptType[0] === 'private'">
      <div class="empty-script" v-if="privateFun === '' && !editScript">
        <p>{{ $t('task_engine_v2.js_code_edit_pop.empty_private_script') }}</p>
        <text-button button-type='primary' width='100px' height='28px' @click="editScript = true;">
          {{$t("task_engine_v2.js_code_edit_pop.add_private_script")}}
        </text-button>
      </div>
      <div class="script-content" v-else>
        <div class="private-box">
          <codemirror
            class="code-mirror"
            v-model="privateFun"
            :options="privOptions"
            >
          </codemirror>
        </div>
      </div>
    </div>
    <div class="callable js-script" v-if="scriptType[0] === 'callable'">
      <div class="empty-script" v-if="callable.length === 0 || listNone">
        <p>{{ $t('task_engine_v2.js_code_edit_pop.empty_callable_script') }}</p>
        <text-button button-type='primary' width='100px' height='28px' @click="addFun()">
          {{$t("task_engine_v2.js_code_edit_pop.add_callable_script")}}
        </text-button>
      </div>
      <div class="script-content" v-else>
        <div class="script-title">
          <h3>{{ $t('task_engine_v2.js_code_edit_pop.script_list') }}</h3>
          <div class="right">
            <h3>{{ $t('task_engine_v2.js_code_edit_pop.script_content') }}</h3>
            <text-button button-type='default' width='100px' height='28px' @click="addFun">
              {{$t("task_engine_v2.js_code_edit_pop.add_callable_script")}}
            </text-button>
          </div>
        </div>
        <div class="script-box">
          <div class="script-list">
            <div class="list" ref="alias" v-for="(item, index) in callable" :class="{hover: item.hover}" @click="changeHover(index)" v-tooltip="errEmptyAlias" :key="index">
              <input 
                v-model="item.alias"
                v-focus
                v-if="item.editAlias" 
                @keyup.enter="changeAlias(item)" 
                @blur="changeAlias(item)"
                :placeholder="$t('task_engine_v2.js_code_edit_pop.placeholder_func_alias')">
              <p v-else>{{item.alias}}</p>
              <div class="icon">
                <icon :size="16" :iconType="`${item.hover ? 'edit_pencil_hover' : 'edit_pencil'}`" 
                  @click="item.editAlias=true; editAlias(index);" v-tooltip="tipsEditAlias" />
                <icon :size="16" :icon-type="`${item.hover ? 'edit_delete_hover' : 'edit_delete'}`" @click.stop="deleteFun(index)" v-tooltip="tipsDeleteFunc" />
              </div>
            </div>
          </div>
          <div class="script-func">
            <input type="text" ref="funcname" class="func-name" @focus="focusFuncName" v-model="callable[hoverIndex].name" :placeholder="$t('task_engine_v2.js_code_edit_pop.placeholder_func_name')"  v-tooltip="errEmptyName">
            <div ref="codemirror" class="code-mirror" v-tooltip="errEmptyCode" @click="editCodeMirror">
              <codemirror
              class="code"
              v-model="callable[hoverIndex].code"
              :options="cmOptions"
              ></codemirror>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { codemirror } from 'vue-codemirror';
  import 'codemirror/lib/codemirror.css';
  import 'codemirror/mode/javascript/javascript';
  import 'codemirror/addon/hint/show-hint';
  import 'codemirror/addon/hint/show-hint.css';
  import 'codemirror/addon/hint/javascript-hint';
  import 'codemirror/addon/selection/active-line';
  import 'codemirror/addon/edit/matchbrackets';
  import 'codemirror/addon/edit/closebrackets';
  import DropdownSelect from '@/components/DropdownSelect';
  import general from '@/modules/TaskEngine/_utils/general';
  import event from '@/utils/js/event';

  export default {
    props: {
      extData: {
        type: Object,
        required: true,
      },
    },
    data() {
      const title = this.extData.title;
      const jsCode = this.extData.jsCode || {};
      let privateFun = '';
      let callable = [];
      if (jsCode.main) {
        privateFun = jsCode.main.private || '';
        callable = jsCode.main.callable || [];
      }
      const originalJsCodeStr = JSON.stringify(jsCode, general.JSONStringifyReplacer);
      callable = callable.map((item, index) => {
        if (index === 0) {
          return { ...item, hover: true, editAlias: false };
        }
        return { ...item, hover: false, editAlias: false };
      });
      return {
        valid: false,
        title,
        jsCode,
        privateFun,
        callable,
        originalJsCodeStr,
        listNone: false,
        editScript: false,
        scriptType: ['callable'],
        scriptTyepeOptions: [
          {
            text: 'Private',
            value: 'private',
          }, {
            text: 'Callable',
            value: 'callable',
          },
        ],
        hoverIndex: 0,
        canChange: true,
        cmOptions: {
          tabSize: 2,
          // lineNumbers: true,
          line: true,
          styleActiveLine: true,
          smartIndent: true,
          mode: 'text/javascript',
          theme: 'default',
          matchBrackets: true,
          autoCloseBrackets: true,
          hintOptions: {
            // 当匹配只有一项的时候是否自动补全
            completeSingle: true,
          },
        },
        tipsEditAlias: {
          msg: this.$t('task_engine_v2.js_code_edit_pop.edit_func_alias'),
          eventOnly: false,
          clickShow: false,
          alignLeft: true,
        },
        tipsDeleteFunc: {
          msg: this.$t('task_engine_v2.js_code_edit_pop.delete_func'),
          eventOnly: false,
          clickShow: false,
          alignLeft: true,
        },
        errEmptyAlias: {
          msg: this.$t('task_engine_v2.js_code_edit_pop.err_empty_alias'),
          eventOnly: true,
          errorType: true,
          alignLeft: true,
        },
        errEmptyName: {
          msg: this.$t('task_engine_v2.js_code_edit_pop.err_empty_name'),
          eventOnly: true,
          errorType: true,
          alignLeft: true,
        },
        errEmptyCode: {
          msg: this.$t('task_engine_v2.js_code_edit_pop.err_empty_code'),
          eventOnly: true,
          errorType: true,
          alignLeft: true,
        },
      };
    },
    components: {
      DropdownSelect,
      codemirror,
    },
    directives: {
      focus: {
        inserted(el) {
          el.focus();
        },
      },
    },
    computed: {
      privOptions() {
        return { ...this.cmOptions, lineNumbers: true };
      },
    },
    watch: {
      scriptType() {
        this.editScript = false;
      },
    },
    methods: {
      checkInput() {
        const index = this.hoverIndex;
        let valid = true;
        if (this.callable.length !== 0) {
          const data = this.callable[index];
          if (!data.alias.trim()) {
            valid = false;
            this.$refs.alias[index].dispatchEvent(event.createEvent('tooltip-show'));
          }
          if (!data.name.trim()) {
            valid = false;
            this.$refs.funcname.dispatchEvent(event.createEvent('tooltip-show'));
          }
          if (!data.code.trim()) {
            valid = false;
            this.$refs.codemirror.dispatchEvent(event.createEvent('tooltip-show'));
          }
        }
        return valid;
      },
      editAlias(index) {
        this.$refs.alias[index].dispatchEvent(event.createEvent('tooltip-hide'));
      },
      focusFuncName() {
        this.$refs.funcname.dispatchEvent(event.createEvent('tooltip-hide'));
      },
      editCodeMirror() {
        this.$refs.codemirror.dispatchEvent(event.createEvent('tooltip-hide'));
      },
      changeAlias(data) {
        data.editAlias = false;
      },
      checkAliasEmpty(e) {
        if (!e.target.value.trim()) {
          e.target.dispatchEvent(event.createEvent('tooltip-show'));
          e.target.focus();
        }
      },
      changeHover(index) {
        if (!this.callable[index].hover && this.checkInput()) {
          const callable = this.callable.map(item => ({ ...item, hover: false }));
          callable[index].hover = true;
          this.callable = callable;
          this.hoverIndex = index;
        }
      },
      addFun() {
        const index = this.callable.findIndex(item => item.hover === true);
        if (index === -1 || this.checkInput()) {
          this.callable = this.callable.map(item => ({ ...item, hover: false }));
          this.callable.push({
            alias: '',
            name: '',
            code: '',
            editAlias: true,
            hover: true,
          });
          this.hoverIndex = this.callable.length - 1;
        }
        this.listNone = false;
      },
      deleteFun(index) {
        const len = this.callable.length;
        if (this.callable[index].hover && len !== 1) {
          let i = index - 1;
          if (index < this.callable.length - 1) {
            i = index;
          }
          this.hoverIndex = i;
          const data = this.callable[i];
          this.$set(this.callable, i, { ...data, hover: true });
        }
        if (len === 1) {
          this.listNone = true;
        }
        this.callable.splice(index, 1);
      },
      setJsCode() {
        const callable = this.callable.map(item => ({
          alias: item.alias,
          name: item.name,
          code: item.code,
        })) || [];
        const alias = this.callable.map(item => item.alias) || [];
        this.jsCode = {
          alias,
          text_type: 'plain',
          main: {
            private: this.privateFun || '',
            callable,
          },
        };
        return this.jsCode;
      },
      validate() {
        if (this.checkInput()) {
          const jsCode = this.setJsCode();
          this.$emit(
            'validateSuccess',
            jsCode,
          );
        }
      },
      cancelValidate() {
        const jsCode = this.setJsCode();
        const newJsCodeStr = JSON.stringify(jsCode, general.JSONStringifyReplacer);
        if (newJsCodeStr === this.originalJsCodeStr) {
          this.$emit('cancelValidateSuccess');
        } else {
          const that = this;
          that.$popCheck({
            bindValue: true,
            data: {
              msg: that.$t('task_engine_v2.js_code_edit_pop.confirm_to_save_changes'),
            },
            callback: {
              ok() {
                if (that.checkInput()) {
                  that.$emit(
                    'validateSuccess',
                    that.jsCode,
                  );
                }
              },
              cancel() {
                that.$emit('cancelValidateSuccess');
              },
            },
          });
        }
      },
    },
    mounted() {
      this.$on('validate', this.validate);
      this.$on('cancelValidate', this.cancelValidate);
    },
    beforeDestroy() {
      // this.editScript = false;
    },
  };
</script>

<style lang="scss" scoped>
$popWidth: 700px;
$titleLineHeight: 28px;
$contentWdith: 100%;
$contentHeight: 500px;
$emptyHeight: 120px;
$listHeight: 50px;
$funcHeight: 300px;
$borderColor: #E9E9E9;

#js-code-edit-pop {
  width: $popWidth;

  .title {
    line-height: $titleLineHeight;
    color: #333333;
    font-size: 20px;
    padding: calc(20px - 5px) 20px 20px;
    width: 100%;
    display: flex;
    justify-content: space-between;

    h2 {
      display: inline-block;
      max-width: 600px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .select-type {
      display: flex;
      font-size: 14px;
      color: #666666;

      & > p {
        padding-right: 28px;
      }
    }
  }

  .js-script {
    width: $contentWdith;
    border: 1px solid $borderColor;
    .empty-script {
      // height: $emptyHeight;
      text-align: center;
      margin: 64px 0 76px;

      p {
        margin-bottom: 20px;
      }
    }
  }
  .script-content {
    padding: 20px;
    font-size: 14px;
  }
  .script-title {
    display: flex;
    padding-bottom: 20px;
    // font-size: 14px;
    line-height: $titleLineHeight;

    & > * {
      width: 50%;
    }

    .right {
      display: flex;
      justify-content: space-between;
    }
  }
  .private-box {
    height: $funcHeight;

    .code-mirror {
      height: 100%;
      border: 1px solid $borderColor;
    }
  }
  .script-box {
    display: flex;
    // font-size: 14px;
    .script-list {
      flex: 1;
      margin-right: 10px;
      height: $funcHeight;
      overflow-y: auto;

      .list {
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        padding: 0 16px;
        height: $listHeight;
        line-height: $listHeight;
        border: 1px solid $borderColor;
        box-sizing: border-box;
        align-items: center;

        input, p {
          flex: 1;
          height: $listHeight / 2;
          line-height: $listHeight / 2;
          margin-right: 8px;
        }
        & > p {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        &.hover {
          color: #fff;
          background-color: #3D80FF;
        }
      }
      
      .list:not(:last-child) {
        margin-bottom: 10px;
      }
    }
    .script-func {
      flex: 1;
      width: 50%;
      height: $funcHeight;
      border: 1px solid $borderColor;

      .func-name {
        width: calc(100% - 2 * 15px);
        height: $listHeight;
        line-height: $listHeight;
        border: none;
        border-bottom: 1px solid $borderColor;
        margin: 0 15px;

        &:focus {
          box-shadow: none;
        }
      }
      .code-mirror {
        width: 100%;
        padding: 0 15px;
        height: calc(100% - #{$listHeight});

        .code {
          height: 100%;
        }
      }
    }
  }
}
</style>

<style lang="scss">
.CodeMirror {
  height: 100%;
}
</style>

