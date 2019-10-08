<template>
  <div class="intent-list">
    <div v-for="(intent, idx) in intentListShown" :key="idx" class="intent-block" :class="{'active': intent.expand}" @mouseover="hoverIntent(intent, true)" @mouseout="hoverIntent(intent, false)">
      <div class="intent-block-header" @click="beforeExpandIntent(intent, $event)">
        <div class="intent-icons">
          <input @click="updateChecked" type="checkbox" v-if="!oneInEdit" v-model="intent.checked">
          <icon icon-type="intent" :size="16" v-else/>
        </div>
        <div class="intent-title" v-if="intent.isEditMode">
          <input type="text" ref="intentName" v-model="editIntentName" v-tooltip="intentNameTooltip" :placeholder="$t('intent_engine.manage.placeholder.intent_title')" />
        </div>
        <template v-else>
          <div class="intent-title">
            <div>{{intent.name}}</div>
          </div>
          <div class="intent-title-count" >
            <template v-if="searchIntentWithKeyword">
              {{$t('intent_engine.manage.corpus_search_num', { pos: intent.positiveCount, neg: intent.negativeCount })}}
            </template>
            <template v-else>
              {{$t('intent_engine.manage.corpus_num', { pos: intent.positiveCount, neg: intent.negativeCount })}}
            </template>
          </div>
        </template>
        <div v-if="hasIntentAction && !anyIsChecked" class="intent-action">
          <div v-if="intent.isEditMode" class="intent-save-tool">
            <text-button button-type="primary" @click="saveEditIntent(intent)">{{ $t('general.save') }}</text-button>
            <text-button @click.stop="cancelEditIntentPop(intent)">{{ $t('general.cancel') }}</text-button>
          </div>
          <div v-else class="intent-action-tool">
            <div v-if="intent.isHover || intent.expand" class="intent-action-icon" :ref="`${idx}_intentAction`" @click.stop="showDropdown(intent, idx)" v-dropdown="intentActionDropdown">
              <icon icon-type="more_blue" :size="24"></icon>
            </div>
            <div v-if="intent.expand" class="intent-action-icon close" @click.stop="closeExpandIntent(intent, idx)">
              <icon icon-type="close_expand" :size="18"></icon>
            </div>
          </div>
        </div>
      </div>
      <transition name="intent-content">
      <div v-if="intent.expand">
        <div class="corpus-loading-container" v-if="intentContentLoaded===false">
          <loading-dot :magnify="0.4"></loading-dot>
        </div>
        <template v-if="intentContentLoaded===true">
        <div class="intent-block-content">
          <div class="corpus-tools">
            <label-switch
              :options="corpusTypeOption"
              v-model="intent.viewCorpusType"
              @change="changeCorpusViewType($event, intent)"/>
            <!-- <div v-if="!intent.hasCorpusEditing && intent.hasCorpusSelected" class="corpus-delete-btn">
              <text-button button-type="error" @click="deleteMultiCorpus(intent)">{{ $t('general.delete') }}</text-button>
            </div> -->
          </div>
          <div class="corpus-block" @mouseout="clearHover(intent)">
            <div v-if="intent.isEditMode" class="corpus-add-row">
              <input type="text" v-model="newCorpus" v-tooltip="corpusTooltip"
                ref="newCorpus"
                :placeholder="$t('intent_engine.manage.placeholder.add_corpus')"
                @compositionstart="setCompositionState(true)"
                @compositionend="setCompositionState(false)"
                @keydown.enter="detectCompositionState"
                @keyup.enter="addCorpus(intent)"/>
              <text-button class="add-corpus-btn" @click="addCorpusByClick(intent)">{{ $t('intent_engine.manage.addin') }}</text-button>
            </div>
            <div v-if="intent.corpus[intent.viewCorpusType].length === 0" class="corpus-row">
              {{ $t('general.no_data') }}
            </div>
            <div v-else v-for="(corpus, cidx) in getCorpusPage(intent)" :key="`${idx}-${cidx}`"
              class="corpus-row" :class="{'editing': corpus.isEdit}"
              @mouseover="hoverCorpus(intent, corpus)"
              >
              <!-- <div v-if="!intent.hasCorpusEditing && (intent.hasCorpusSelected || (intent.isEditMode && corpus.isHover))">
                <input type="checkbox" :checked="corpus.isSelect" @change="selectCorpus(intent, corpus)">
              </div> -->
              <div class="corpus">
                <input v-if="corpus.isEdit" type="text" v-model="editCorpusContent"
                  ref="editCorpus"
                  v-tooltip="editCorpusTooltip"
                  :placeholder="$t('intent_engine.manage.placeholder.edit_corpus')"
                  @compositionstart="setCompositionState(true)"
                  @compositionend="setCompositionState(false)"
                  @keydown.enter="detectCompositionState"
                  @keyup.enter="confirmEditCorpus(intent, corpus)"
                  @blur="leaveEditCorpus(corpus, intent)"/>
                <!-- <span v-else-if="isSearchMode && corpus.text.indexOf(keyword) !== -1">
                  highlight keywords
                </span> -->
                <span v-else>{{corpus.text}}</span>
              </div>
              <div v-if="!intent.hasCorpusEditing && intent.isEditMode && corpus.isHover" class="corpus-action">
                <div class="corpus-action-edit" @click="editCorpus(intent, corpus)">{{ $t('general.edit') }}</div>
                <div class="corpus-action-delete" @click="deleteCorpus(intent, corpus)">{{ $t('general.delete')}}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="getCurTotal(intent) > LIST_PAGE_SIZE" class="intent-block-footer">
          <v-pagination size="small" :total="getCurTotal(intent)" :pageIndex="intent.curPage" :pageSize="LIST_PAGE_SIZE" :layout="['prev', 'pager', 'next', 'jumper']" @page-change="handlePageChange($event, intent)"></v-pagination>
        </div>
        </template>
      </div>
      </transition>
    </div>

    <!--ADD INTENT BLOCK-->
    <div v-if="isAddIntent" class="intent-block active">
      <!-- // TODO: add intent block here, only need the style in edit mode
      // on save, call api, if save success, reload whole intent list
      // v-if to control show this block or not -->
      <div class="intent-block-header">
        <div class="intent-icons">
          <icon icon-type="intent" :size="16"/>
        </div>
        <div class="intent-title">
          <input type="text" ref="intentAddName" v-model="newIntentName" v-tooltip="intentNameTooltip" :placeholder="$t('intent_engine.manage.placeholder.intent_title')"/>
        </div>
        <div class="intent-action">
          <div class="intent-save-tool">
            <text-button button-type="primary" @click="saveAddIntent()">{{ $t('general.save') }}</text-button>
            <text-button @click.stop="cancelAddNewIntent()">{{ $t('general.cancel') }}</text-button>
          </div>
        </div>
      </div>
      <div class="intent-block-content">
        <div class="corpus-tools">
          <label-switch
            :options="corpusTypeOption"
            v-model="newIntent.viewCorpusType"
            @change="changeCorpusViewType($event, newIntent)"/>
          <div v-if="!newIntent.hasCorpusEditing && newIntent.hasCorpusSelected" class="corpus-delete-btn">
            <text-button button-type="error" @click="deleteMultiCorpus(newIntent)">{{ $t('general.delete') }}</text-button>
          </div>
        </div>
        <div class="corpus-block" @mouseout="clearHover(newIntent)">
          <div v-if="newIntent.isEditMode" class="corpus-add-row">
            <input type="text" v-model="newCorpus" v-tooltip="corpusTooltip"
            ref="newCorpus"
              :placeholder="$t('intent_engine.manage.placeholder.add_corpus')"
              @compositionstart="setCompositionState(true)"
              @compositionend="setCompositionState(false)"
              @keydown.enter="detectCompositionState"
              @keyup.enter="addCorpus(newIntent)"/>
            <text-button class="add-corpus-btn" @click="addCorpusByClick(newIntent)">{{ $t('intent_engine.manage.addin') }}</text-button>
          </div>
          <div v-if="newIntent.corpus[newIntent.viewCorpusType].length === 0" class="corpus-row">
            {{ $t('general.no_data') }}
          </div>
          <div v-else v-for="(corpus, cidx) in getCorpusPage(newIntent)" :key="`newIntent-${cidx}`"
            class="corpus-row" :class="{'editing': corpus.isEdit}"
            @mouseover="hoverCorpus(newIntent, corpus)"
          >
            <div v-if="!newIntent.hasCorpusEditing && (newIntent.hasCorpusSelected || corpus.isHover)">
              <input type="checkbox" :checked="corpus.isSelect" @change="selectCorpus(newIntent, corpus)">
            </div>
            <div class="corpus">
              <input v-if="corpus.isEdit" type="text" v-model="editCorpusContent"
                ref="editCorpus"
                :placeholder="$t('intent_engine.manage.placeholder.edit_corpus')"
                @compositionstart="setCompositionState(true)"
                @compositionend="setCompositionState(false)"
                @keydown.enter="detectCompositionState"
                @keyup.enter="confirmEditCorpus(newIntent, corpus)"/>
              <span v-else>{{corpus.text}}</span>
            </div>
            <div v-if="!newIntent.hasCorpusEditing && corpus.isHover" class="corpus-action">
                  <div class="corpus-action-edit" @click="editCorpus(newIntent, corpus)">{{ $t('general.edit') }}</div>
                <div class="corpus-action-delete" @click="deleteCorpus(newIntent, corpus)">{{ $t('general.delete')}}</div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="getCurTotal(newIntent) > LIST_PAGE_SIZE" class="intent-block-footer">
        <v-pagination size="small" :total="getCurTotal(newIntent)" :pageIndex="newIntent.curPage" :pageSize="LIST_PAGE_SIZE" :layout="['prev', 'pager', 'next', 'jumper']" @page-change="handlePageChange($event, newIntent)"></v-pagination>
      </div>
    </div>
  </div>
</template>
<script>
import event from '@/utils/js/event';
import api from '../_api/intent';

const POSITIVE_CORPUS = 'pos';
const NEGATIVE_CORPUS = 'neg';

export default {
  api,
  props: {
    intentList: {
      type: Array,
      required: true,
      default: () => [],
    },
    addIntentMode: {
      type: Boolean,
      default: false,
    },
    searchIntentMode: {
      type: Boolean,
      default: false,
    },
    searchIntentWithKeyword: {
      type: Boolean,
      default: false,
    },
    canEditIntent: {
      type: Boolean,
      default: true,
    },
    canDeleteIntent: {  // Delete from database
      type: Boolean,
      default: true,
    },
    canRemoveIntent: {  // Remove from view, allow emit 'removeIntent' event
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
      intentListShown: [],
      editIntentName: '',
      editCorpusContent: '',

      isAddIntent: false,
      newIntentName: '',
      newCorpus: '',
      corpusBackup: {},
      LIST_PAGE_SIZE: 10,
      newIntent: {
        name: '',
        corpus: {
          pos: [],
          neg: [],
        },
        curPage: 1,
        expand: true,
        isHover: false,
        isEditMode: true,
        viewCorpusType: POSITIVE_CORPUS,
        hasCorpusSelected: false,
        hasCorpusEditing: false,
      },

      intentActionDropdown: {
        options: [{
          text: '編輯',
          onclick: this.beforeEditIntent,
        }],
        alignLeft: true,
        globalFix: false,
      },

      intentNameTooltip: {
        msg: '',
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      corpusTooltip: {  // on newCorpus
        msg: this.$t('intent_engine.manage.tooltip.corpus_duplicate_positive'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      editCorpusTooltip: {
        msg: this.$t('intent_engine.manage.tooltip.hit_enter_to_save'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },

      corpusTypeOption: [{
        text: this.$t('intent_engine.manage.positive'),
        val: POSITIVE_CORPUS,
      }, {
        text: this.$t('intent_engine.manage.negative'),
        val: NEGATIVE_CORPUS,
      }],
      compositionState: false,
      wasCompositioning: false,

      // Keep edit actions at local and send these till user click save btn
      deletedCorpusIds: [],
      updatedCorpus: [],
      addedCorpus: [],
      intentContentLoaded: false,
    };
  },
  computed: {
    hasIntentAction() {
      return (this.canEditIntent || this.canDeleteIntent || this.canRemoveIntent);
    },
    alreadyEdit() {
      const intentInEditMode = this.intentInEditMode();
      return intentInEditMode && (
        this.deletedCorpusIds.length !== 0 ||
        this.updatedCorpus.length !== 0 ||
        this.addedCorpus.length !== 0 ||
        this.editIntentName !== intentInEditMode.name);
    },
    canMultiSelect() {
      return true;
    },
    oneInEdit() {
      if (this.intentListShown !== undefined) {
        return this.intentListShown.reduce((val, intent) => intent.isEditMode || val, false);
      }
      return false;
    },
    anyIsChecked() {
      if (this.intentListShown !== undefined) {
        return this.intentListShown.reduce((val, intent) => intent.checked || val, false);
      }
      return false;
    },
  },
  watch: {
    intentList() {
      this.parseIntentListShown();
    },
    addIntentMode() {
      if (this.addIntentMode) {
        this.beforeAddIntent();
      } else {
        this.isAddIntent = false;
      }
    },
    searchIntentMode() {
      if (this.searchIntentMode) {
        this.beforeSearchIntent();
      }
    },
    editIntentName() {
      if (this.$refs.intentName !== undefined && this.$refs.intentName[0] !== undefined) {
        this.$refs.intentName[0].dispatchEvent(event.createEvent('tooltip-hide'));
      }
    },
    newIntentName() {
      if (this.$refs.intentAddName !== undefined) {
        this.$refs.intentAddName.dispatchEvent(event.createEvent('tooltip-hide'));
      }
    },
    newCorpus() {
      if (this.isAddIntent && this.$refs.newCorpus !== undefined) {
        this.$refs.newCorpus.dispatchEvent(event.createEvent('tooltip-hide'));
      } else if (!this.isAddIntent &&
        this.$refs.newCorpus !== undefined && this.$refs.newCorpus[0] !== undefined) {
        this.$refs.newCorpus[0].dispatchEvent(event.createEvent('tooltip-hide'));
      }
    },
  },
  methods: {
    getCorpusPage(intent) {
      const currentCorpus = intent.corpus[intent.viewCorpusType];
      const start = this.LIST_PAGE_SIZE * (intent.curPage - 1);
      const end = this.LIST_PAGE_SIZE * intent.curPage;
      return currentCorpus.slice(start, end);
    },
    getCurTotal(intent) {
      const currentCorpus = intent.corpus[intent.viewCorpusType];
      return currentCorpus.length;
    },
    toFirstPage(intent) {
      intent.curPage = 1;
    },
    handlePageChange(pageIdx, intent) {
      intent.curPage = pageIdx;
      if (intent.hasCorpusEditing) {
        const editingCorpus = intent.corpus[intent.viewCorpusType].find(cp => cp.isEdit === true);
        this.leaveEditCorpus(editingCorpus, intent);
      }
    },
    setCompositionState(bool) {
      this.compositionState = bool;
    },
    detectCompositionState() {
      this.wasCompositioning = this.compositionState;
    },
    hoverIntent(intent, bool) {
      intent.isHover = bool;
    },
    showDropdown(intent, idx) {
      const that = this;
      that.intentActionDropdown.options = [];
      if (that.canEditIntent) {
        that.intentActionDropdown.options = [{
          text: that.$t('general.edit'),
          onclick: that.beforeEditIntent.bind(that, intent, idx),
        }];
      }
      if (that.canDeleteIntent) {
        that.intentActionDropdown.options.push({
          text: that.$t('general.delete'),
          onclick: () => {
            that.deleteIntentPop(intent);
          },
        });
      }
      if (that.canRemoveIntent) {
        that.intentActionDropdown.options.push({
          text: that.$t('general.remove'),
          onclick: () => {
            that.$emit('removeIntent', idx);
          },
        });
      }
      const refName = `${idx}_intentAction`;
      that.$refs[refName][0].dispatchEvent(event.createEvent('dropdown-reload'));
    },
    deleteIntentPop(intent) {
      const that = this;
      const option = {
        data: {
          msg: that.$t('intent_engine.manage.delete_intent_msg', { name: intent.name }),
        },
        callback: {
          ok: () => {
            that.deleteIntent(intent);
          },
        },
      };
      that.$popWarn(option);
    },
    deleteIntent(intent) {
      const that = this;
      that.$api.deleteIntent(intent.id)
      .then(() => {
        that.$emit('deleteIntentDone');
        that.$notify({ text: that.$t('intent_engine.manage.notify.delete_intent_success') });
      })
      .catch((err) => {
        console.log(err);
        that.$notifyFail(that.$t('intent_engine.manage.notify.delete_intent_fail'));
      });
    },
    closeExpandIntent(intent) {
      intent.expand = false;
    },
    closeAllIntent() {
      const that = this;
      that.intentListShown.forEach((intentItem) => {
        intentItem.expand = false;
      });
    },
    intentInEditMode() {
      const that = this;
      return that.intentListShown.find(intent => intent.isEditMode === true);
    },
    beforeExpandIntent(intent, e) {
      const that = this;
      if (e.target.type === 'checkbox') {
        return;
      }
      if (intent.expand) {
        if (that.isAddIntent) return;
        const intentInEditMode = that.intentInEditMode();
        if (intentInEditMode === undefined) {
          that.closeExpandIntent(intent);
        }
        return;
      }
      if (that.isAddIntent) {
        that.cancelAddNewIntent(that.expandIntent.bind(that, intent));
        return;
      }
      const intentInEditMode = that.intentInEditMode();
      if (intentInEditMode !== undefined) {
        that.cancelEditIntentPop(intentInEditMode, that.expandIntent.bind(that, intent));
      } else {
        that.expandIntent(intent);
      }
    },
    expandIntent(intent) {
      if (intent.expand === true) {
        return Promise.resolve();
      }
      const that = this;
      that.closeAllIntent();
      if (intent.positiveCount + intent.negativeCount === 0) {
        intent.corpus = {
          pos: [],
          neg: [],
        };
        this.corpusBackup = { ...intent.corpus };
        this.intentContentLoaded = true;
        intent.expand = true;
        return Promise.resolve();
      }
      this.intentContentLoaded = false;
      intent.expand = true;
      return that.callGetCorpus(intent).then(() => {
        this.intentContentLoaded = true;
      });
    },
    callGetCorpus(intent) {
      const that = this;
      return that.$api.getCorpus(intent.id, that.keyword)
      .then((res) => {
        if (res.name !== intent.name) {
          intent.name = res.name;
        }
        const corpus = {
          pos: [],
          neg: [],
        };
        corpus.pos = res.positive.map((cp) => {
          cp.text = cp.content;
          cp.isEdit = false;
          cp.isHover = false;
          cp.isSelect = false;
          return cp;
        });
        corpus.neg = res.negative.map((cp) => {
          cp.text = cp.content;
          cp.isEdit = false;
          cp.isHover = false;
          cp.isSelect = false;
          return cp;
        });
        intent.corpus = corpus;
        that.corpusBackup = {
          pos: [].concat(intent.corpus.pos),
          neg: [].concat(intent.corpus.neg),
        };

        intent.positiveCount = corpus.pos.length;
        intent.negativeCount = corpus.neg.length;
        that.toFirstPage(intent);
      })
      .catch((err) => {
        console.log(err);
        that.$notifyFail(that.$t('intent_engine.manage.notify.get_corpus_fail'));
      });
    },
    /** Handle Edit Intent */
    beforeEditIntent(intent) {
      const that = this;
      if (that.isAddIntent) {
        that.cancelAddNewIntent(that.editIntent.bind(that, intent));
        return;
      }
      const intentInEditMode = that.intentInEditMode();
      if (intentInEditMode !== undefined) {
        that.cancelEditIntentPop(intentInEditMode, that.editIntent.bind(that, intent));
      } else {
        that.editIntent(intent);
      }
    },
    editIntent(intent) {
      const that = this;
      that.expandIntent(intent).then(() => {
        intent.isEditMode = true;
        that.editIntentName = intent.name;
        that.$nextTick(() => {
          that.$refs.intentName[0].focus();
        });
      });
    },
    confirmCancelEditIntent(intent, nextAction) {
      const that = this;
      that.initEditStorage();
      that.$refs.intentName[0].dispatchEvent(event.createEvent('tooltip-hide'));
      intent.isEditMode = false;
      intent.hasCorpusSelected = false;
      intent.hasCorpusEditing = false;
      intent.corpus = that.corpusBackup;
      intent.viewCorpusType = POSITIVE_CORPUS;
      if (nextAction) {
        nextAction();
      }
    },
    cancelEditIntentPop(intent, nextActionOnOk, nextActionOnCancel) {
      const that = this;
      if (!that.alreadyEdit) {
        that.confirmCancelEditIntent(intent, nextActionOnOk);
        return;
      }
      const option = {
        data: {
          msg: that.$t('intent_engine.manage.cancel_edit_msg'),
        },
        callback: {
          ok: () => {
            that.confirmCancelEditIntent(intent, nextActionOnOk);
          },
          cancel: () => {
            if (nextActionOnCancel) {
              nextActionOnCancel();
            }
          },
        },
      };
      that.$popCheck(option);
    },
    initEditStorage() {
      const that = this;
      that.newCorpus = '';
      that.deletedCorpusIds = [];
      that.updatedCorpus = [];
      that.addedCorpus = [];
    },
    saveEditIntent(intent) {
      const that = this;
      const intentNameValid = that.validateIntentName(that.editIntentName, intent.name);
      if (intentNameValid) {
        that.updatedCorpus = that.updatedCorpus
          .filter(cp => that.deletedCorpusIds
            .findIndex(dId => cp.id === dId) === -1);
        that.$api.updateIntent(intent, that.editIntentName,
          that.updatedCorpus, that.addedCorpus, that.deletedCorpusIds)
        .then(() => {
          that.callGetCorpus(intent);
          that.initEditStorage();
          intent.isEditMode = false;
          that.$notify({ text: that.$t('intent_engine.manage.notify.update_intent_success') });
        })
        .catch((err) => {
          console.log(err);
          that.$notifyFail(that.$t('intent_engine.manage.notify.update_intent_fail'));
          that.callGetCorpus(intent);
          that.initEditStorage();
        });
      } else {
        that.$refs.intentName[0].focus();
        that.$refs.intentName[0].dispatchEvent(event.createEvent('tooltip-reload'));
        that.$refs.intentName[0].dispatchEvent(event.createEvent('tooltip-show'));
      }
    },
    validateIntentName(name, oldname) {
      const that = this;
      if (name.length === 0) {
        that.intentNameTooltip.msg = that.$t('intent_engine.manage.tooltip.name_empty');
        return false;
      }
      const isNotOldName = (oldname === undefined) ? true : (oldname !== name);
      const hasDuplicateName = that.intentListShown
        .find(intent => intent.name === name) !== undefined;
      if (isNotOldName && hasDuplicateName) {
        that.intentNameTooltip.msg = that.$t('intent_engine.manage.tooltip.name_duplicate');
        return false;
      }
      return true;
    },
    beforeSearchIntent() {
      const that = this;
      const intentInEditMode = that.intentInEditMode();
      if (intentInEditMode !== undefined) {
        that.cancelEditIntentPop(intentInEditMode, null, that.cancelSearch);
      }
    },
    cancelSearch() {
      this.$emit('cancelSearch');
    },
    /** Handle Add Intent */
    beforeAddIntent() {
      const that = this;
      const intentInEditMode = that.intentInEditMode();
      if (intentInEditMode !== undefined) {
        that.cancelEditIntentPop(intentInEditMode, that.addIntent);
      } else {
        that.addIntent();
      }
    },
    addIntent() {
      const that = this;
      that.closeAllIntent();
      that.newIntent = {
        name: '',
        corpus: {
          pos: [],
          neg: [],
        },
        curPage: 1,
        expand: true,
        isEditMode: true,
        viewCorpusType: POSITIVE_CORPUS,
        hasCorpusSelected: false,
        hasCorpusEditing: false,
      };
      that.isAddIntent = true;
      that.$nextTick(() => {
        that.$refs.intentAddName.focus();
      });
    },
    saveAddIntent() {
      const that = this;
      const intentNameValid = that.validateIntentName(that.newIntentName);
      if (intentNameValid) {
        const param = {
          name: that.newIntentName,
          pos: that.newIntent.corpus.pos.map(cp => cp.text),
          neg: that.newIntent.corpus.neg.map(cp => cp.text),
        };
        that.$api.addIntent(param)
        .then(() => {
          that.$emit('addIntentDone', true);  // reload all
          that.initEditStorage();
          that.newIntentName = '';
          that.$notify({ text: that.$t('intent_engine.manage.notify.add_intent_success') });
        })
        .catch((err) => {
          console.log(err);
          that.$notifyFail(that.$t('intent_engine.manage.notify.add_intent_fail'));
        });
      } else {
        that.$refs.intentAddName.focus();
        that.$refs.intentAddName.dispatchEvent(event.createEvent('tooltip-reload'));
        that.$refs.intentAddName.dispatchEvent(event.createEvent('tooltip-show'));
      }
    },
    cancelAddNewIntent(nextAction) {
      const that = this;
      const option = {
        data: {
          msg: that.$t('intent_engine.manage.cancel_add_msg'),
        },
        callback: {
          ok: () => {
            that.newIntent = {};
            that.isAddIntent = false;
            that.newIntentName = '';
            that.initEditStorage();
            that.$emit('addIntentDone', false);
            if (nextAction !== undefined) {
              nextAction();
            }
          },
        },
      };
      that.$popCheck(option);
    },

    /** Handle Corpus */
    changeCorpusViewType(type, intent) {
      // cancel all actions of previous type
      intent.hasCorpusEditing = false;
      intent.hasCorpusSelected = false;
      this.toFirstPage(intent);
      if (type === POSITIVE_CORPUS) {
        intent.corpus[NEGATIVE_CORPUS].forEach((cp) => {
          cp.isSelect = false;
          cp.isEdit = false;
        });
      } else if (type === NEGATIVE_CORPUS) {
        intent.corpus[POSITIVE_CORPUS].forEach((cp) => {
          cp.isSelect = false;
          cp.isEdit = false;
        });
      }
    },
    hoverCorpus(intent, corpus) {
      intent.corpus[intent.viewCorpusType].forEach((cp) => {
        cp.isHover = false;
      });
      corpus.isHover = true;
    },
    clearHover(intent) {
      if (intent.corpus) {
        intent.corpus[intent.viewCorpusType].forEach((cp) => {
          cp.isHover = false;
        });
      }
    },
    selectCorpus(intent, corpus) {
      corpus.isSelect = !corpus.isSelect;
      intent.hasCorpusSelected = intent.corpus[intent.viewCorpusType]
        .filter(cp => cp.isSelect === true).length !== 0;
    },
    leaveEditCorpus(corpus, intent) {
      corpus.isEdit = false;
      intent.hasCorpusEditing = false;
      this.$refs.editCorpus[0].dispatchEvent(event.createEvent('tooltip-hide'));
    },
    editCorpus(intent, corpus) {
      const that = this;
      corpus.isEdit = true;
      intent.hasCorpusEditing = true;
      that.editCorpusContent = corpus.text;
      that.$nextTick(() => {
        that.$refs.editCorpus[0].focus();
        that.$nextTick(() => {
          that.$refs.editCorpus[0].dispatchEvent(event.createEvent('tooltip-show'));
        });
      });
    },
    confirmEditCorpus(intent, corpus) {
      const that = this;
      if (that.wasCompositioning) {
        return;
      }
      that.editCorpusContent = that.editCorpusContent.trim();
      if (that.editCorpusContent === '') {
        that.deleteCorpus(intent, corpus);
      } else {
        corpus.text = that.editCorpusContent;
        that.refreshUpdatedCorpus(corpus, that.editCorpusContent, intent.viewCorpusType);
      }
      that.leaveEditCorpus(corpus, intent);
    },
    refreshUpdatedCorpus(corpus, newText, type) {
      const that = this;
      const idxInUpdatedCorpus = that.updatedCorpus.findIndex(cp => cp.id === corpus.id);
      const idxInAddedCorpus = that.addedCorpus.findIndex(cp => cp.id === corpus.id);

      if (idxInAddedCorpus !== -1) {
        that.addedCorpus[idxInAddedCorpus].text = newText;
      } else if (idxInUpdatedCorpus !== -1) {
        that.updatedCorpus[idxInUpdatedCorpus].text = newText;
      } else {
        that.updatedCorpus.push({
          id: corpus.id,
          text: newText,
          type,
        });
      }
    },
    refreshDeletedCorpus(corpus) {
      const that = this;
      if (corpus.id >= 0) {  // positive ids are corpus already in db
        that.deletedCorpusIds.push(corpus.id);
      } else { // negative ids are newly add corpus
        const idxInAddedCorpus = that.addedCorpus.findIndex(cp => cp.id === corpus.id);
        that.addedCorpus.splice(idxInAddedCorpus, 1);
      }
    },
    deleteCorpus(intent, corpus) {
      const that = this;
      const viewedCorpus = intent.corpus[intent.viewCorpusType];
      const corpusIdx = viewedCorpus.findIndex(cp => cp.id === corpus.id);
      viewedCorpus.splice(corpusIdx, 1);
      const page = Math.floor((viewedCorpus.length - 1) / 10) + 1;
      if (page < intent.curPage) {
        intent.curPage = page;
      }
      that.refreshDeletedCorpus(corpus);
      intent.hasCorpusSelected = viewedCorpus
        .filter(cp => cp.isSelect === true).length !== 0;
    },
    deleteMultiCorpus(intent) {
      const that = this;
      const selectedCorpus = intent.corpus[intent.viewCorpusType]
        .filter(cp => cp.isSelect === true);
      selectedCorpus.forEach((corpus) => {
        that.deleteCorpus(intent, corpus);
      });
    },
    isDuplicateCorpus(newCorpus, intent) {
      if (intent.corpus[POSITIVE_CORPUS].find(cp => cp.text === newCorpus) !== undefined) {
        return POSITIVE_CORPUS;
      } else if (intent.corpus[NEGATIVE_CORPUS].find(cp => cp.text === newCorpus) !== undefined) {
        return NEGATIVE_CORPUS;
      }
      return undefined;
    },
    addCorpusByClick(intent) {
      const that = this;
      that.detectCompositionState();
      that.addCorpus(intent);
    },
    addCorpus(intent) {
      const that = this;
      if (that.wasCompositioning) {
        return;
      }
      if (intent.hasCorpusEditing) {
        const editingCorpus = intent.corpus[intent.viewCorpusType].find(cp => cp.isEdit === true);
        that.leaveEditCorpus(editingCorpus, intent);
      }
      if (that.newCorpus !== '') {
        const isDuplicate = that.isDuplicateCorpus(that.newCorpus, intent);
        if (isDuplicate !== undefined) {
          // show tooltip
          const msg = (isDuplicate === POSITIVE_CORPUS) ? that.$t('intent_engine.manage.tooltip.corpus_duplicate_positive') : that.$t('intent_engine.manage.tooltip.corpus_duplicate_negative');
          that.corpusTooltip.msg = msg;
          if (that.isAddIntent) {
            that.$refs.newCorpus.dispatchEvent(event.createEvent('tooltip-reload'));
            that.$refs.newCorpus.dispatchEvent(event.createEvent('tooltip-show'));
          } else {
            that.$refs.newCorpus[0].dispatchEvent(event.createEvent('tooltip-reload'));
            that.$refs.newCorpus[0].dispatchEvent(event.createEvent('tooltip-show'));
          }
          return;
        }
        const tempId = -parseInt(Math.random() * 1000, 10);
        intent.corpus[intent.viewCorpusType].splice(0, 0, {
          id: tempId,
          text: that.newCorpus,
          isHover: false,
          isSelect: false,
        });
        that.addedCorpus.push({
          id: tempId,
          text: that.newCorpus,
          type: intent.viewCorpusType,
        });
        that.newCorpus = '';
        that.toFirstPage(intent);
      }
    },
    parseIntentListShown() {
      this.intentListShown = this.intentList.map(intent => ({
        id: intent.id,
        name: intent.name,
        total: intent.total,
        positiveCount: intent.positiveCount,
        negativeCount: intent.negativeCount,
        curPage: 1,
        corpus: {},
        expand: false,
        isHover: false,
        isEditMode: false,
        viewCorpusType: POSITIVE_CORPUS,
        hasCorpusSelected: false,
        hasCorpusEditing: false,
        checked: false,
      }));
    },
    getCheckedIntentIDs() {
      return this.intentListShown.map(
        intent => (intent.checked ? intent.id : undefined),
      ).filter(x => x !== undefined);
    },
    updateChecked() {
      // emit after value changed
      this.$nextTick(() => {
        this.$emit('checkedIntent');
      });
    },
  },
  mounted() {
    this.parseIntentListShown();
    if (this.addIntentMode) {
      this.isAddIntent = true;
    }
  },
};
</script>
<style lang="scss" scoped>
.intent-list {
  @include font-14px();
  > :not(:last-child) {
    margin-bottom: 12px;
  }

  .intent-block {
    border: 1px solid #DBDBDB;
    border-radius: 4px;
    transition: all .2s ease-in-out;
    &:hover {
      box-shadow: 0 4px 9px 0 rgba(115, 115, 115, 0.2), 0 5px 8px 0 rgba(228, 228, 228, 0.5);
    }
    &.active {
      box-shadow: 0 4px 9px 0 rgba(115, 115, 115, 0.2), 0 5px 8px 0 rgba(228, 228, 228, 0.5);
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

    .intent-block-header {
      height: 50px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      width: 100%;
      cursor: pointer;

      .intent-icons {
        height: 16px;
        margin-right: 20px;
        display: flex;
        align-items: center;
      }
      .intent-title {
        color: $color-font-normal;
        flex: 1;
        display: flex;
        input[type=text] {
          flex: 1;
        }

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        & > div {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .intent-title-count {
        flex: 0 0 auto;
      }
      .intent-action {
        min-width: 24px;
        .intent-action-tool{
          display: flex;
          .intent-action-icon{
            position: relative;
            height: 24px;
            width: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            &:hover {
              background-color: $color-disabled;
              border-radius: 100%;
            }
            &:not(:last-child) {
              margin-right: 10px;
            }
            &.close{
              &:hover {
                background-color: white;
              }
            }
          }
        }
        .intent-save-tool {
          margin-left: 10px;
        }
      }
    }
    .corpus-loading-container{
      display: flex;
      flex-direction: column;
      height: 100px;
      align-items: center;
      justify-content: center;
    }
    .intent-block-content {
      padding: 10px 20px;
      border-top: 1px solid $color-borderline;
      color: $color-font-normal;
      .corpus-tools{
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }
      .corpus-block {
        border-left: 3px solid rgba(74, 144, 226, 0.24);
        .corpus-delete-btn {
          margin-left: 15px;
          padding-left: 5px;
        }
        .corpus-row {
          min-height: 28px;
          margin: 4px 0;
          margin-left: 15px;
          padding: 0 15px 0 5px;
          border-radius: 2px;
          display: flex;
          align-items: center;
          &:hover {
            background-color: $color-disabled;
          }
          &.editing {
            margin-left: 10px;
            padding: 0px;
          }
          input[type=checkbox] {
            height: 14px;
            width: 14px;
            margin-left: 0px;
            margin-right: 10px;
            cursor: pointer;
          }
          .corpus {
            flex: 1;
            display: flex;
            word-break: break-all;
            input[type=text] {
              flex: 1;
            }
          }
          .corpus-action {
            display: flex;
            > :not(:last-child) {
              margin-right: 10px;
            }
            .corpus-action-edit {
              color: $color-primary;
              @include clickable-text();
            }
            .corpus-action-delete {
              color: $color-error;
              @include clickable-text();
            }
          }
        }
        .corpus-add-row {
          height: 28px;
          margin: 4px 0;
          margin-left: 10px;
          padding: 0 15px 0 5px;
          padding: 0px;
          display: flex;
          input[type=text] {
            flex: 1;
          }
          .add-corpus-btn {
            margin-left: 10px;
          }
        }
      }
    }
    .intent-block-footer {
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
