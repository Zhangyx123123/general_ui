<template>
  <div class="robot-qa-edit">
    <div class="robot-qa-edit-row">
      <div class="robot-qa-edit-title">{{ $t('general.question') }}</div>
      <div class="robot-qa-edit-data">{{ value.main_question }}</div>
    </div>
    <div class="robot-qa-edit-row" v-for="idx in 5" :key="idx">
      <div class="robot-qa-edit-title">
        <template v-if="idx === 1">{{ $t('general.answer') }}</template>
        <template v-else>{{ $t('general.ext_answer') }}{{idx-1}}</template>
      </div>
      <div class="robot-qa-edit-data">
        <input :value="value.answers[idx - 1]" ref="answer"
          :placeholder="idx === 1 ? $t('robot_setting.input_qa_placeholder') : $t('robot_setting.input_qa_ext_placeholder')">
		    <!-- <button v-if="idx != 1" type="reset" v-on:click="resetAnswer(idx - 1)"></button> -->
      </div>
    </div>
    <div class="robot-qa-edit-error" :class="{show: showEmptyError}" v-if="showEmptyError">
      {{ $t('error_msg.input_empty') }}
    </div>
  </div>  
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      showEmptyError: false,
    };
  },
  methods: {
    resetAnswer(idx) {
      this.$refs.answer[idx].value = '';
    },
    validate() {
      const answers = this.$refs.answer.map(input => input.value);
      const allBlank = answers.reduce((val, ans) => val && !(ans.trim()), true);
      if (allBlank) {
        this.showEmptyError = true;
      } else {
        this.showEmptyError = false;
        const ret = this.$refs.answer.map(input => input.value);
        this.$emit('validateSuccess', ret);
      }
    },
  },
  mounted() {
    this.$on('validate', this.validate);
  },
};
</script>

<style lang="scss" scoped>
@import "styles/variable";

$title-font-size: 14px;

.robot-qa-edit {
  .robot-qa-edit-error {
    line-height: 40px;
    color: red;
    text-align: center;
    visibility: hidden;
    &.show {
      visibility: inherit;
    }
  }
  .robot-qa-edit-row {
    line-height: $default-line-height;
    margin: 10px 0;
    padding: 0 30px;
    & > div {
      display: inline-block;
      vertical-align: middle;
    }
    .robot-qa-edit-title {
      font-size: $title-font-size;
      min-width: 100px;
      &::after {
        content: "：";
      }
    }
    .robot-qa-edit-data {
      font-size: $title-font-size;
      position: relative;
      input {
        width: 400px;
        padding: 5px 8px;
        font-size: 12px;
      }
      // TODO: use following structure to rewrite reset button
/*
      <div class="dynamic-button icon delete-icon">
        <span @click="deleteRow(idx)">
          <div class="row"></div>
          <div class="vertical"></div>
        </span>
      </div>
      input:hover ~ .delete-icon {
        visibility: visible;
      }
      .row {
        top: calc(0.5em - 1px);
        width: 18px;
        height: 2px;
        background-color: black;
        display: block;
      }
      .vertical {
        top: calc(0.5em - 1px);
        width: 18px;
        height: 2px;
        background-color: black;
        display: block;
        transform: rotate(90deg);
      }
      .delete-icon {
        visibility: hidden;
        opacity: 0.8;
        background: white;
        transform: rotate(45deg) scale(0.8, 0.8);
        position: absolute;
        left: 350px;
        top: calc(50% - 8px);

        &:hover {
          visibility: visible;
        }
      }
*/
      // button {
      //   visibility: hidden;
      // }
      // &:hover, &:focus {
      //   button {
      //     border:none;
      //     background-color: transparent;
      //     visibility: initial;
      //     display: inline-block;
      //     vertical-align: middle;
      //     outline: 0;
      //     cursor: pointer;
      //     &:before {
      //       content: 'X';
      //       display: block;
      //       width: 1em;
      //       height: 1em;
      //       line-height: 1em;
      //       position: absolute;
      //       background-color: $page-header-color;
      //       z-index:1;
      //       right: 2em;
      //       top: 0;
      //       bottom: 0;
      //       margin: auto;
      //       border-radius: 50%;
      //       color: white;
      //       box-shadow: 0 0 2px $page-header-color;
      //       cursor: pointer;
      //     }
      //   }
      // }
    }
  }
}
</style>
