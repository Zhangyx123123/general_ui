<template>
<div id="intent-test-list">
  <div class="intent-block"
    v-for="intent in intentList"
    :key="intent.id"
    :class="{'active': intent.expand}">
    <div class="intent-header" @click="handleIntentClicked(intent)">
      <template v-if="intentListType === 'withoutIntent'">
        <div class="intent-name">
          {{`${$t('intent_engine.test_data.num_test_corpus', {cnum: intent.sentences_count})}`}}
        </div>
      </template>
      <template v-if="intentListType === 'withIntent'">
        <div class="icon">
          <icon icon-type="intent" :size="15"/>
        </div>
        <div class="intent-name after-icon">
          {{`${intent.name} ( ${$t('intent_engine.test_data.num_test_corpus', {cnum: intent.sentences_count})} )`}}
        </div>
      </template>
      <div  class="intent-test-result-stats" v-if="intentListMode === 'result'">
        <span class="positive-count">{{`${$t('intent_engine.test_data.result_correct')}: ${intent.positives_count}/${intent.sentences_count}`}}</span>
        <span class="correct-rate">{{composeIntentTestCorrectRate(intent)}}</span>
      </div>
      <div class="close-expand-icon" v-if="intent.expand">
        <icon icon-type="close_expand" :size="18"></icon>
      </div>
    </div>
    <transition name="intent-content">
    <div v-if="intent.expand">
      <div class="corpus-loading-container" v-if="intentContentLoaded===false">
        <loading-dot :magnify="0.4"></loading-dot>
      </div>
      <div class="intent-content" v-if="intentContentLoaded===true">
        <div class="label">
          {{ $t('intent_engine.test_data.test_corpus') }}
        </div>
        <div class="corpus-block">
          <div class="add-corpus-row" v-if="intentListMode === 'edit'">
            <input type="text" v-model="newCorpus"
              :placeholder="$t('intent_engine.test_data.add_new_test_corpus')"
              @compositionstart="setCompositionState(true)"
              @compositionend="setCompositionState(false)"
              @keydown.enter="detectCompositionState"
              @keyup.enter="addCorpus(intent)"/>
            <text-button class="add-corpus-btn" @click="detectCompositionState(); addCorpus(intent)">{{ $t('intent_engine.manage.addin') }}</text-button>
          </div>
          <div v-if="intent.testCorpus.length === 0" class="corpus-row">
            <div class="corpus">
              <span>{{ $t('general.no_data') }}</span>
            </div>
          </div>
          <div class="corpus-row" v-for="corpus in getCorpusPage(intent)"
            :key="corpus.id"
            @mouseover="corpus.mouseover = true" 
            @mouseleave="corpus.mouseover = false">
            <div class="corpus">
              <input v-if="corpus.isEditing" type="text" v-model="editingCorpusContent"
                  ref="editCorpusInput"
                  v-tooltip="editCorpusTooltip"
                  @compositionstart="setCompositionState(true)"
                  @compositionend="setCompositionState(false)"
                  @keydown.enter="detectCompositionState"
                  @keyup.enter="updateCorpus(intent, corpus)"
                  @blur="finishEditingCorpus(intent, corpus)"/>
              <template v-else>
                <span
                  v-tooltip="{msg:corpus.sentence, alignLeft: true, left: -10, eventOnly: true}"
                  @mouseover="showFullCorpusIfEllipsis($event)" 
                  @mouseleave="hideFullCorpus($event)">
                  {{corpus.sentence}}
                </span>
              </template>
            </div>
            <template v-if="intentListMode === 'edit'">
              <template v-if="showEditResult">
                <div class="edit-mode-test-result" v-if="!intent.hasCorpusEditing">
                  <span v-if="corpus.result === 0" class="result-none result">{{$t('intent_engine.test_data.result_none')}}</span>
                  <span v-if="corpus.result === 2" class="result-wrong result" v-tooltip="getEditModeTestResultTooltip(corpus)">{{$t('intent_engine.test_data.result_wrong')}}</span>
                  <template v-if="corpus.result === 1">
                    <template v-if="intentListType === 'withoutIntent'">
                      <span class="result-correct result">{{$t('intent_engine.test_data.result_correct')}}</span>
                    </template>
                    <template v-if="intentListType === 'withIntent'">
                      <span class="result-correct result" v-tooltip="getEditModeTestResultTooltip(corpus)">{{$t('intent_engine.test_data.result_correct')}}</span>
                    </template>
                  </template>
                </div>
              </template>
              <div class="corpus-action" v-if="corpus.mouseover && !intent.hasCorpusEditing">
                <div class="action corpus-action-edit" @click="startEditingCorpus(intent, corpus)">{{ $t('general.edit') }}</div>
                <div class="action corpus-action-delete" @click="deleteCorpus(intent, corpus)">{{ $t('general.delete')}}</div>
              </div>
            </template>
            <template v-if="intentListMode === 'result'">
              <div class="result-mode-test-result">
                <div class="result-correct" v-if="corpus.result === 1">
                  <template v-if="intentListType === 'withoutIntent'">
                    <span class="result">{{`${$t('intent_engine.test_data.result_correct')}`}}</span>
                  </template>
                  <template v-if="intentListType === 'withIntent'">
                    <span class="result">{{`${$t('intent_engine.test_data.result_correct')}`}}</span>
                    <span class="score">{{`｜${$t('intent_engine.test_data.result_score')}: ${corpus.score}`}}</span>
                  </template>
                </div>
                <div class="result-wrong" v-if="corpus.result === 2" v-tooltip="getResultModeTestResultTooltip(corpus)">
                  <span class="result">{{`${$t('intent_engine.test_data.result_wrong')}`}}</span>
                  <span class="score">{{`｜${$t('intent_engine.test_data.result_score')}: ${corpus.score}`}}</span>
                  <span class="answer">{{`, ${$t('intent_engine.test_data.robot_predict')}: ${corpus.answer}`}}</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="intent-footer" v-if="intent.testCorpus.length > LIST_PAGE_SIZE">
        <v-pagination
          size="small"
          :total="intent.testCorpus.length"
          :pageIndex="intent.curPage"
          :pageSize="LIST_PAGE_SIZE"
          :layout="['prev', 'pager', 'next', 'jumper']"
          @page-change="handlePageChange($event, intent)">
        </v-pagination>
      </div>
    </div>
    </transition>
  </div>
</div>

</template>

<script>
import event from '@/utils/js/event';
import eventBus from '../_utils/eventBus';
import api from '../_api/intentTest';

export default {
  name: 'intent-test-list',
  api,
  components: {},
  props: {
    initialIntentList: {
      type: Array,
      required: true,
      default: () => [],
    },
    intentListType: {
      type: String,
      required: true,
      default: () => 'withIntent',
      // value: withIntent / withoutIntent
    },
    intentListMode: {
      type: String,
      required: false,
      default: () => 'edit',
      // value: edit / result
    },
    showEditResult: {
      type: Boolean,
      default: false,
    },
    showSmallTestCorpusOnly: {
      type: Boolean,
      default: false,
    },
    keyword: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      intentList: [],
      LIST_PAGE_SIZE: 10,
      newCorpus: '',
      compositionState: false,
      wasCompositioning: false,
      eventBus: eventBus.eventBus,
      intentContentLoaded: false,
      editCorpusTooltip: {
        msg: this.$t('intent_engine.manage.tooltip.hit_enter_to_save'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
    };
  },
  watch: {
    showSmallTestCorpusOnly() {
      this.renderIntentList(this.initialIntentList);
    },
  },
  computed: {},
  methods: {
    renderIntentList(initialIntentList) {
      let intentList = initialIntentList;
      if (this.showSmallTestCorpusOnly) {
        intentList = initialIntentList.filter(intent => intent.sentences_count < 3);
      }
      this.intentList = intentList.map(intent => ({
        ...intent,
        expand: intent.expand ? intent.expand : false,
        testCorpus: intent.testCorpus ? intent.testCorpus : [],
        curPage: 1,
        hasCorpusEditing: intent.hasCorpusEditing ? intent.hasCorpusEditing : false,
      }));
    },
    emitUpdate() {
      const newIntentList = this.intentList.map((intent) => {
        const { expand, testCorpus, curPage, hasCorpusEditing, ...left } = intent;
        return left;
      });
      this.$emit('update', newIntentList);
    },
    handleIntentClicked(intent) {
      if (intent.expand) {
        this.shrinkIntentBlock(intent);
      } else {
        this.expandIntentBlock(intent);
      }
    },
    expandIntentBlock(intent) {
      this.intentList.forEach((i) => {
        i.expand = false;
      });
      if (intent.sentences_count === 0) {
        this.intentContentLoaded = true;
        intent.expand = true;
      } else {
        this.intentContentLoaded = false;
        intent.expand = true;
        this.fetchCorpus(intent).then(() => {
          this.intentContentLoaded = true;
        });
      }
    },
    fetchCorpus(intent) {
      return this.$api.getIntentTestCorpus(intent.id, this.keyword).then((data) => {
        intent.testCorpus = data.map(corpus => ({
          ...corpus,
          mouseover: false,
          isEditing: false,
        }));
      });
    },
    shirnkAllIntentBlock() {
      this.intentList.forEach((i) => {
        this.shrinkIntentBlock(i);
      });
    },
    shrinkIntentBlock(intent) {
      intent.expand = false;
    },
    setCompositionState(bool) {
      this.compositionState = bool;
    },
    detectCompositionState() {
      this.wasCompositioning = this.compositionState;
    },
    handlePageChange(pageIdx, intent) {
      intent.curPage = pageIdx;
    },
    getCorpusPage(intent) {
      const start = this.LIST_PAGE_SIZE * (intent.curPage - 1);
      const end = this.LIST_PAGE_SIZE * intent.curPage;
      return intent.testCorpus.slice(start, end);
    },
    startEditingCorpus(intent, corpus) {
      corpus.isEditing = true;
      intent.hasCorpusEditing = true;
      this.editingCorpusContent = corpus.sentence;
      this.$nextTick(() => {
        this.$refs.editCorpusInput[0].focus();
        this.$nextTick(() => {
          this.$refs.editCorpusInput[0].dispatchEvent(event.createEvent('tooltip-show'));
        });
      });
    },
    finishEditingCorpus(intent, corpus) {
      corpus.isEditing = false;
      intent.hasCorpusEditing = false;
      this.$refs.editCorpusInput[0].dispatchEvent(event.createEvent('tooltip-hide'));
    },
    updateCorpus(intent, corpus) {
      if (this.wasCompositioning) {
        return;
      }
      this.editingCorpusContent = this.editingCorpusContent.trim();
      if (this.editingCorpusContent === '') {
        this.deleteCorpus(intent, corpus);
      } else {
        corpus.sentence = this.editingCorpusContent;
        corpus.result = 0;
        const update = [{
          id: corpus.id,
          content: corpus.sentence,
        }];
        this.patchCorpus(intent, update, []);
      }
      this.finishEditingCorpus(intent, corpus);
    },
    addCorpus(intent) {
      if (this.wasCompositioning) {
        return;
      }
      this.newCorpus = this.newCorpus.trim();
      const update = [{
        id: 0,
        content: this.newCorpus,
      }];
      this.patchCorpus(intent, update, []).then(() => {
        this.fetchCorpus(intent).then(() => {
          intent.sentences_count += 1;
          intent.curPage = Math.ceil(intent.testCorpus.length / this.LIST_PAGE_SIZE);
          this.emitUpdate();
        });
      });
      this.newCorpus = '';
    },
    deleteCorpus(intent, corpus) {
      const corpusIdx = intent.testCorpus.findIndex(cp => cp.id === corpus.id);
      intent.testCorpus.splice(corpusIdx, 1);
      const del = [corpus.id];
      this.patchCorpus(intent, [], del).then(() => {
        intent.sentences_count -= 1;
        this.emitUpdate();
      });
      intent.curPage = Math.ceil(intent.testCorpus.length / this.LIST_PAGE_SIZE);
    },
    patchCorpus(intent, update, del) {
      return this.$api.patchIntentTestCorpus(intent.id, update, del);
    },
    getEditModeTestResultTooltip(corpus) {
      const tooltip = {
        msg: '',
        alignLeft: true,
        top: 30,
        left: -40,
      };
      if (corpus.result === 1) {
        tooltip.msg = `${this.$t('intent_engine.test_data.result_correct')}, ${this.$t('intent_engine.test_data.result_score')}: ${corpus.score}`;
      } else if (corpus.result === 2) {
        tooltip.msg = `${this.$t('intent_engine.test_data.robot_predict')}: ${corpus.answer}, ${this.$t('intent_engine.test_data.result_score')}: ${corpus.score}`;
      }
      return tooltip;
    },
    getResultModeTestResultTooltip(corpus) {
      const tooltip = {
        msg: '',
        alignLeft: true,
        left: -20,
      };
      const wrong = this.$t('intent_engine.test_data.result_wrong');
      const score = this.$t('intent_engine.test_data.result_score');
      const predict = this.$t('intent_engine.test_data.robot_predict');
      tooltip.msg = `${wrong}｜${score}: ${corpus.score}, ${predict}: ${corpus.answer}`;
      return tooltip;
    },
    composeIntentTestCorrectRate(intent) {
      const total = intent.sentences_count;
      if (total > 0) {
        const positive = intent.positives_count;
        const rate = Math.round((positive * 100) / total);
        return `(${rate}%)`;
      }
      return '';
    },
    showFullCorpusIfEllipsis(e) {
      const overflow = e.target.scrollWidth > e.target.clientWidth;
      if (overflow) {
        e.target.dispatchEvent(event.createEvent('tooltip-show'));
      }
    },
    hideFullCorpus(e) {
      e.target.dispatchEvent(event.createEvent('tooltip-hide'));
    },
  },
  mounted() {
    this.renderIntentList(this.initialIntentList);
    this.$on('renderIntentTestList', (initialIntentList) => {
      this.renderIntentList(initialIntentList);
    });
    this.eventBus.$on('startTesting', () => {
      this.shirnkAllIntentBlock();
    });
  },
};
</script>

<style lang="scss" scoped>
#intent-test-list{
  display: flex;
  flex-direction: column;
  .intent-block{
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    margin-top: 10px;
    border: 1px solid $color-borderline;
    border-radius: 4px;
    overflow:hidden;
    transition: all .2s ease-in-out;
    &:hover {
      box-shadow: 0 4px 9px 0 rgba(115, 115, 115, 0.2), 0 5px 8px 0 rgba(228, 228, 228, 0.5);
    }
    &.active {
      box-shadow: 0 4px 9px 0 rgba(115, 115, 115, 0.2), 0 5px 8px 0 rgba(228, 228, 228, 0.5);
    }
    .intent-header{
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      height: 48px;
      padding: 10px 20px;
      background-color: $table-body-hover-background;
      cursor: pointer;
      .intent-name{
        flex: 1 1 auto;
        @include font-14px-line-height-28px();
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        &.after-icon{
          margin-left: 18px;
        }
      }
      .intent-test-result-stats{
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        @include font-14px-line-height-28px();
        .positive-count{
          width: 100px;
        }
        .correct-rate{
          width: 40px;
        }
      }
      .close-expand-icon{
        flex: 0 0 auto;
        margin-left: 20px;
      }
    }
    .intent-content-enter-active, .intent-content-leave-active {
      transition: max-height .4s ease-in-out;
      overflow: hidden;
    }
    .intent-content-enter, .intent-content-leave-to {
      max-height: 0px;
    }
    .intent-content-enter-to, .intent-content-leave {
      max-height: 1000px;
    }
    .corpus-loading-container{
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      height: 100px;
      align-items: center;
      justify-content: center;
    }
    .intent-content{
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      padding: 10px 20px 10px 20px;
      border-top: 1px solid $color-borderline;
      background-color: $table-body-hover-background;
      .label{
        flex: 0 0 auto;
        @include font-14px-line-height-28px();
      }
      .corpus-block{
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        margin-top: 22px;
        border-left: 3px solid rgba(74, 144, 226, 0.24);
        .corpus-row{
          flex: 0 0 auto;
          display: flex;
          position: relative;
          margin: 4px 0px 0px 20px;
          &:hover {
            background-color: #f1f1f1;
          }
          .corpus{
            flex: 1 1 auto;
            display: flex;
            height: 28px;
            min-width: 200px;
            span{
              // flex: 1 1 auto;
              @include font-14px-line-height-28px();
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              margin-right: 20px;
            }
            input[type=text] {
              flex: 1 1 auto;
            }
          }
          .edit-mode-test-result{
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            margin-right: 140px;
            width: 50px;
            height: 28px;
            cursor: default;
            .result{
              @include font-14px();
            }
            .result-nont{
              color: $color-font-normal;
            }
            .result-correct{
              color: $color-success;
            }
            .result-wrong{
              color: $color-error;
            }
          }
          .corpus-action{
            position: absolute;
            right: 0px;
            display: flex;
            .action{
              @include clickable-text();
              margin-right: 14px;
              @include font-12px-line-height-28px();
            }
            .corpus-action-edit{
              color: $color-primary;
            }
            .corpus-action-delete{
              color: $color-error;
            }
          }
          .result-mode-test-result{
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            width: 300px;
            height: 28px;
            @include font-14px();
            .result-correct{
              flex: 0 0 auto;
              display: flex;
              color: $color-success;
            }
            .result-wrong{
              flex: 1 1 auto;
              display: flex;
              color: $color-error;
            }
            .result{
              flex: 0 0 auto;
            }
            .score{
              flex: 0 0 auto;
            }
            .answer{
              flex: 1 1 auto;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
        .add-corpus-row{
          flex: 0 0 auto;
          display: flex;
          height: 28px;
          margin: 0px 0px 0px 20px;
          input[type=text] {
            flex: 1;
          }
          .add-corpus-btn {
            margin-left: 10px;
            width: 68px;
          }
        }
      }
    }
    .intent-footer {
      border-top: 1px solid $color-borderline;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 12px;
    }
  }
}

</style>
