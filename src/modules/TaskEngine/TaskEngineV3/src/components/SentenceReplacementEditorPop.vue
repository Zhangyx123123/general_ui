<template lang="html">
<div id="sentence-replacement-editor-pop" class="sentence-replacement-editor-pop">
  <text-button
    width='68px'
    height='28px'
    button-type='primary'
    @click="addREParser">
    {{$t("task_engine_v3.sentence_replacement_editor_pop.add_replacement_rule")}}
  </text-button>
  <div class="pattern_text_header">
    <div class="pattern_text_container">
      <div class="pattern_column">{{$t("task_engine_v3.sentence_replacement_editor_pop.pattern")}}</div>
      <div class="transit_column"></div>
      <div class="text_column">{{$t("task_engine_v3.sentence_replacement_editor_pop.text")}}</div>
    </div>
  </div>
  <div class="pattern_text_list">
    <draggable v-model="re_parsers" :options="{ghostClass:'ghost'}" @start="drag=true" @end="drag=false">
      <div v-for="(re_parser, index) in re_parsers" :key="index" class="pattern_text_row">
        <div class="pattern_text_container">
          <div class="pattern_column">
            <input type="text" class="full_width"
              :placeholder="$t('task_engine_v3.sentence_replacement_editor_pop.pattern_placeholder')"
              v-model="re_parser.pattern"
            >
          </div>
          <div class="transit_column">
            <icon icon-type="month_right" :size=20 />
          </div>
          <div class="text_column">
            <input type="text" class="full_width"
              :placeholder="$t('task_engine_v3.sentence_replacement_editor_pop.text_placeholder')"
              v-model="re_parser.text"
            >
          </div>
          <div class="delete-button" @click="deleteREParser(index)">{{$t('task_engine_v3.sentence_replacement_editor_pop.delete_replacement_rule')}}</div>
        </div>
      </div>
    </draggable>
  </div>
</div>
</template>

<script>
import draggable from 'vuedraggable';

export default {
  name: 'sentence-replacement-editor-pop',
  components: {
    draggable,
  },
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      re_parsers: [],
    };
  },
  computed: {},
  watch: {},
  methods: {
    addREParser() {
      this.re_parsers.push({ pattern: '', text: '' });
    },
    deleteREParser(index) {
      this.re_parsers.splice(index, 1);
    },
    validateDate() {
      this.$emit('validateSuccess', JSON.parse(JSON.stringify(this.re_parsers)));
    },
  },
  beforeMount() {},
  mounted() {
    const obj = JSON.parse(JSON.stringify(this.value));
    this.re_parsers = obj.re_parsers;
    this.$on('validate', this.validateDate);
  },
};
</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
.sentence-replacement-editor-pop{
  min-width: 800px;
  min-height: 390px;
  padding: 0 20px 0 20px;
  display: flex;
  flex-direction: column;
  .pattern_text_container{
    display:flex;
    flex-direction: row;
    align-items: center;
    .pattern_column{
      flex:1;
      padding-right: 10px;
    }
    .transit_column{
      flex: 0 0 20px;
    }
    .text_column{
      flex:1;
      padding-left: 10px;
      padding-right: 10px;
    }
    .delete-button{
      flex: 0 0 30px;
      color: $color-error;
      cursor: pointer;
    }
  }
  .pattern_text_header{
    flex: 0 0 auto;
    margin: 20px 0px 10px 0px;
    padding: 0 20px 0 20px;
    @include font-14px();
  }
  .pattern_text_list{
    flex: 1 1 100px;
    display: flex;
    flex-direction: column;
    @include auto-overflow();
    @include customScrollbar();
    .pattern_text_row{
      padding: 0 20px 0 20px;
      @include font-14px();
      cursor: move;
      border-radius: 4px;
      border: solid 1px $color-borderline;
      min-height: 60px;
      display: flex;
      flex-direction: column;
      flex: 0 0 auto;
      justify-content: center;
      transition: all .2s ease-in-out;
      &:not(:first-child){
        margin-top: 12px;
      }
      &:last-child{
        margin-bottom: 20px;
      }
      &:hover{
        box-shadow: 0 4px 9px 0 rgba(115, 115, 115, 0.2), 0 5px 8px 0 rgba(228, 228, 228, 0.5);
      }
      &:active{
        box-shadow: none;
      }
      &.ghost{
        background-color: #f8f8f8;
      }
    }
  }
  .full_width{
    width:100%;
  }
}
</style>