<template>
    <div id="qa-table-title" v-bind:style="{height: height + 'px', lineHeight: height + 'px'}">
      <div class="row">
        <div id="standard_q" class="cell">{{ standard_q }}</div>
        <div class="cell">
          <div class="answer-title-group table">
            <div class="row">
              <div id="tags" class="cell">{{ tags }}</div>
              <!-- <div id="label" class="cell">{{ $t('qalist.answer_label') }}</div> -->
              <div id="standard_a" class="cell">{{ standard_a }}</div>
              <!-- <div id="commands" class="cell">{{ commands }}</div>
              <div id="dynamic_menu" class="cell">{{ dynamic_menu }}</div> -->
              <div class="cell valid_time">{{ $t('qalist.valid_time') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
// import i18nutils from '@/utils/i18nUtil';

export default {
  name: 'QATableHeader',
  data() {
    return {
      standard_q: '',
      tags: '',
      standard_a: '',
      commands: '',
      dynamic_menu: '',
      start_time: '',
      end_time: '',
    };
  },
  mounted() {
    this.standard_q = this.$t('qalist.standard_q');
    this.tags = this.$t('qalist.tags');
    this.standard_a = this.$t('qalist.standard_a');
    this.commands = this.$t('qalist.command');
    this.dynamic_menu = this.$t('qalist.header_related_question');
    this.start_time = this.$t('qalist.start_time');
    this.end_time = this.$t('qalist.end_time');
  },
  methods: {
  },
  props: ['height'],
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

ul {
  list-style-type: none;
  display: inline-block;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}


$fill-parent: 100%;
$width_5percent: 5%;

#qa-table-title {
    width: $fill-parent;
    height: $fill-parent;

    display: table;
    table-layout: fixed;
    .row {
        & > .cell:last-child {
            border-right: solid black 1px;
        }
    }
    .row {
      display: table-row;
    }
    .cell {
        display: table-cell;
        height: 100%;
        border: solid black 1px;
        border-right: 0px;
        text-align: center;
        background-color: #e8f3ff;
        overflow: hidden;
        white-space: nowrap;
    }

    #standard_q {
        width: 15%;
    }

    .answer-title-group {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        display: table;
        table-layout: fixed;

        & > .row {
            & > .cell {
                border-top: none;
                border-bottom: none;
                &:first-child {
                  border-left: none;
                }
                &:last-child {
                  border-right: none;
                }
            }
        }

        #tags {
            width: 5%;
        }

        #standard_a {
            width: 50%;
        }

        #label {
          width: $width_5percent;
        }

        #commands {
            width: $width_5percent;
        }

        #dynamic_menu {
            width: 16%;
        }

        #start_time {
            width: $width_5percent;
        }

        #end_time {
            width: $width_5percent;
        }

        .valid_time {
            width: 2 * $width_5percent;
        }
    }
}
div {
  font-size: 14px;
  font-weight: bold;
}

</style>