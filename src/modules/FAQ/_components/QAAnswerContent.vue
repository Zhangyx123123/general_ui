<template>
 <div ref="tt" class="answer-block" style="width: 100%;">
    <div ref="container" class="answer-container answer-content" v-bind:class="{full: expand}">
      <div ref="content" style="flex:1; display:block; max-width: calc(100% - 10px);" v-html="escape(answerContent)"></div>
      <div class="detail-container">
        <div class="detail-text" @click="showDetail" v-if="show && !expand">▶</div>
        <div class="detail-text" @click="showDetail" v-if="show && expand">▼</div>
      </div>
    </div>
  </div>
</template>

<script>
import ellipsis from 'text-ellipsis';

const ellipsisLength = 150;

export default {
  name: 'QATableAnswerContent',
  data() {
    return {
      expand: false,
      show: false,
      // used for preventing content larger than container slightly, but can not show
      safeMargin: 10,
      isJSONAnswer: false,
    };
  },
  updated() {
    this.reCountHeight();
  },
  mounted() {
    this.reCountHeight();
  },
  methods: {
    reCountHeight() {
      const contentDiv = this.$refs.content;
      const exceed = contentDiv.scrollHeight > contentDiv.offsetHeight;
      if (!exceed && !this.expand) {
        this.show = false;
      } else {
        this.show = true;
      }
    },
    ellipsised(string) {
      if (this.expand || !this.show) {
        return string;
      }
      return ellipsis(string, ellipsisLength);
    },
    showDetail() {
      this.expand = !this.expand;
    },
    escape(value) {
      let escapedValue = '';
      try {
        const answers = JSON.parse(value);
        // Hack for now, the display method will be discussed with UI/UX later
        escapedValue = answers.map(ans => ans.value).join('<br><div style="border-bottom: 1px dotted black; width: 100%; margin: 5px 0;"></div>');
      } catch (e) {
        // Old style answer
        escapedValue = value.replace(/@E@/g, '<br>');
        escapedValue = escapedValue.replace(/<script>/g, '<x-script>');
        escapedValue = escapedValue.replace(/<\/script>/g, '</x-script>');
        escapedValue = escapedValue.replace(/<a/g, '<a target="_blank"');

      // transform @E@ into <br>
        escapedValue = escapedValue.replace(/@E@/g, '<br>');
      }
      return escapedValue;
    },
  },
  computed: {
  },
  props: ['answerContent'],
  watch: {
    answerContent() {
      // when answer content changed, reset expand
      this.expand = false;
    },
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
div {
  display: inline-block;
  vertical-align: top;
  margin-right: -4px;
}
h1, h2 {
  font-weight: normal;
}

$fill-parent: 100%;
$width_5percent: 6.25%;
$fixed-height: 142px;

.answer-block {
  min-height: $fixed-height;
  .content {
    pointer-events: none;
  }
}
.answer-container {
    display: flex;
}
.answer-content {
    width: $fill-parent;
    height: $fixed-height;
    padding: 5px;
    word-wrap: break-word;
    word-break: break-all;
    overflow: hidden;
    font-size: 14px;

    // cancel reset of bold and italic, use HTML5 spec ref: https://www.w3.org/TR/html5/rendering.html
    & /deep/ b { font-weight: bolder; }
    & /deep/ strong { font-weight: bolder; }
    & /deep/ i { font-style: italic; }
    & /deep/ em { font-style: italic; }

    &.full {
      height: auto;
      min-height: $fixed-height;
      overflow: auto;
    }

    /deep/ ul {
      li::before {
        content: "\2022";
        margin-right: 5px;
        display: inline-block;
      }
    }

    /deep/ ol {
      counter-reset: list-item-counter;
      li {
        counter-increment: list-item-counter;
      }
      li::before {
        content: counter(list-item-counter)".";
        margin-right: 5px;
        display: inline-block;
      }
    }
}

.detail-container {
  width: 15px;
  margin: 0 5px;
  position: relative;
}

.detail-text {
  cursor: pointer;
  color: #118eeb;
  position: absolute;
  bottom: 0;
}

/*
@media screen and (max-width: 1440px) and (min-width: 1024px) {
   div {
     font-size: 10px;
   }
} 

@media screen and (min-width: 1440px) {
  div {
     font-size: 14px;
   }
}
*/
</style>