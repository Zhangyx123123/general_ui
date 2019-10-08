<template>
  <div id="command-edit-pop">
    <div id="edit-command" class="edit-row">
      <div class="edit-title">{{ $t('robot_command.editpop.command.title') }}</div>
      <div id="edit-command-content" class="edit-content">
        <input ref="commandName" id="edit-command-input" type="text"
          v-model="commandName"
          v-tooltip="commandNameTooltip"
          :class="{'error': isCommandNameTooltipShown}"
          :disabled="readonly">
        <!-- <info-input
          v-model="commandName"
          :msg="'輸入不得為空'"
          fill
          :disabled="readonly"
          :error="!isNameValid"
          :errorMsg="isNameEmpty ? $t('robot_command.error.name_input_empty') : $t('robot_command.error.name_input_duplicate')">
        </info-input> -->
      </div>
    </div>

    <div id="edit-ruleto" class="edit-row">
      <div class="edit-title">{{ $t('robot_command.editpop.rule.title') }}</div>
      <div id="edit-ruleto-content" class="edit-content">
        <input v-model="ruleTo" id="ruletoQ" type="radio" name="ruleTo" :value="RULETO_QUESTION" :disabled="readonly"><label for="ruletoQ">{{ $t('robot_command.editpop.rule.to_question') }}</label>
        <input v-model="ruleTo" id="ruletoA" type="radio" name="ruleTo" :value="RULETO_ANSWER" :disabled="readonly"><label for="ruletoA">{{ $t('robot_command.editpop.rule.to_answer') }}</label>
      </div>
    </div>

    <div id="edit-tag" class="edit-row">
      <div class="edit-title">{{ $t('robot_command.editpop.tag.title') }}</div>
      <div id="edit-tag-content" class="edit-content">
        <tag-input
          :origTags="origTags"
          :tagsList="tagsList"
          :readonly="readonly"
          :maxlength="10"
          width="100%"
          @selectedTagsChanged="updateTags"
          @addNewTag="addNewLabel"
          allowTypeahead
        ></tag-input>
      </div>
    </div>

    <div id="edit-keyword" class="edit-row">
      <div class="edit-title">{{ $t('robot_command.editpop.keyword.title') }}</div>
      <div id="edit-keyword-content" class="edit-content">
        <!-- <input type="text" v-model="keywords" :placeholder="$t('robot_command.editpop.keyword.keyword_placeholder')" :disabled="readonly"> -->
        <info-input
          v-model="keywords"
          :placeholder="$t('robot_command.editpop.keyword.keyword_placeholder')"
        :msg="$t('robot_command.editpop.keyword.keyword_placeholder')"
          fill
          :disabled="readonly"
        >
        </info-input>
        <div id="advanced-block">
          <input id="advanced" type="checkbox" v-model="hasAdvanced" :disabled="readonly">
          <label for="advanced">{{ $t('robot_command.editpop.keyword.advanced') }}</label>
        </div>
      </div>
    </div>
    <div id="edit-keyword-advance" v-if="hasAdvanced" class="edit-row">
      <div class="edit-title"></div>
      <div id="edit-keyword-advance-content" class="edit-content">
        <div v-for="(reg, idx) in regex" :key="idx" class="regex-row">
          <span>{{ $t('robot_command.editpop.keyword.regex' )}}</span>
          <input type="text" v-model="reg.value[0]" :disabled="readonly">
          <text-button button-type="error" @click="deleteRegex(idx)" v-if="!readonly">{{ $t('general.delete') }}</text-button>
        </div>
        <div v-if="!readonly" class="regex-row">
          <text-button button-type="primary" @click="addRegex">{{ $t('general.add') }}</text-button>
        </div>
      </div>
    </div>

    <div id="edit-datetime" class="edit-row">
      <div class="edit-title">{{ $t('robot_command.editpop.datetime.title') }}</div>
      <div id="edit-datetime-content" class="edit-content">
        <input v-model="dateFormat" id="forever" type="radio" name="datetime" value="forever" :disabled="readonly"><label for="forever">{{ $t('robot_command.editpop.datetime.forever') }}</label>
        <input v-model="dateFormat" id="custom" type="radio" name="datetime" value="custom" :disabled="readonly"><label for="custom">{{ $t('robot_command.editpop.datetime.custom') }}</label>
        <div v-if="dateFormat === 'custom'" ref="datePicker" id="pickers" v-tooltip="datePickerTooltip">
          <date-picker
            v-model="startDate"
            :readonly="readonly"
            format="yyyy/MM/dd"
            language="zh"
            ref="start"
          ></date-picker>
          <span style="margin: 0 5px;">～</span>
          <date-picker
            v-model="endDate"
            :readonly="readonly"
            format="yyyy/MM/dd"
            language="zh"
            ref="end"
          ></date-picker>
        </div>
      </div>
    </div>

    <div id="edit-reply" class="edit-row">
      <div class="edit-title">{{ $t('robot_command.editpop.reply.title') }}</div>
      <div id="edit-reply-content" class="edit-content">
        <input v-model="replyFormat" id="intext" type="radio" name="format" value="intext" :disabled="readonly"><label for="intext">{{ $t('robot_command.editpop.reply.intext') }}</label>
        <input v-model="replyFormat" id="injson" type="radio" name="format" value="injson" :disabled="readonly"><label for="injson">{{ $t('robot_command.editpop.reply.injson') }}</label>
      </div>
    </div>
    <div class="edit-row">
      <div class="edit-title"></div>
      <div id="edit-reply-textarea" class="edit-content" ref="replyFormatJSON" v-tooltip="replyJSONTooltip">
        <textarea 
          v-if="replyFormat === 'intext'"
          name="" id="" rows="5" 
          v-model="replyContentText"
          :placeholder="$t('robot_command.editpop.reply.intext_placeholder')"
          :disabled="readonly"
          :class="{'error': isReplyJsonWarning}"></textarea>
        <textarea 
          v-if="replyFormat === 'injson'"
          name="" id="" rows="5"
          v-model="replyContentJson"
          @keydown="closeJSONTooltip"
          :placeholder="$t('robot_command.editpop.reply.injson_placeholder')"
          :disabled="readonly"
          :class="{'error': isReplyJsonWarning}"></textarea>
      </div>
    </div>

    <div id="edit-replyplace" class="edit-row">
      <div class="edit-title">{{ $t('robot_command.editpop.reply_place.title') }}</div>
      <div id="edit-replyplace-content" class="edit-content">
        <input v-model="replyPlace" id="replace" type="radio" name="replyPlace" :value="PLACE_REPLACE" :disabled="readonly"><label for="replace">{{ $t('robot_command.editpop.reply_place.replace') }}</label>
        <input v-model="replyPlace" id="before" type="radio" name="replyPlace" :value="PLACE_BEFORE" :disabled="readonly"><label for="before">{{ $t('robot_command.editpop.reply_place.before') }}</label>
        <input v-model="replyPlace" id="after" type="radio" name="replyPlace" :value="PLACE_AFTER" :disabled="readonly"><label for="after">{{ $t('robot_command.editpop.reply_place.after') }}</label>
      </div>
    </div>

  </div>  
</template>
<script>
import DatePicker from '@/components/DateTimePicker/DatePicker';
import TagInput from '@/components/basic/TagInput';
import labelAPI from '@/modules/SSM/_api/qalabel';
import validate from '@/utils/js/validate';
import event from '@/utils/js/event';

export default {
  api: [labelAPI],
  components: {
    DatePicker,
    TagInput,
  },
  props: {
    value: {
      type: Object,
    },
  },
  data() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    return {
      appid: this.getAppID('appid'),
      labels: [],

      readonly: false,
      commandName: '',
      keywords: '',
      hasAdvanced: false,
      regex: [],
      dateFormat: 'forever', // 'forever', 'custom'
      startDate: today,
      endDate: tomorrow,
      replyFormat: 'intext', // 'intext', 'injson'
      replyContentText: '',
      replyContentJson: '',

      RULETO_QUESTION: 0,
      RULETO_ANSWER: 1,
      ruleTo: 0, // 'question', 'answer'
      PLACE_REPLACE: 0,
      PLACE_BEFORE: 1,
      PLACE_AFTER: 2,
      replyPlace: 0, // 'replace', 'before', 'after'

      origTags: [],
      tagsList: [],
      selectedTags: [],

      commandNameTooltip: {
        eventOnly: true,
        msg: '',
        errorType: true,
        alignLeft: true,
      },
      datePickerTooltip: {
        msg: this.$t('robot_command.error.date_format_error'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      replyJSONTooltip: {
        msg: this.$t('robot_command.error.reply_format_json_error'),
        eventOnly: true,
        errorType: true,
        alignLeft: true,
      },
      isReplyJsonWarning: false,
      isCommandNameTooltipShown: false,

      isAddNewCommand: false,
    };
  },
  computed: {
    isNameEmpty() {
      if (this.readonly) return false;
      this.commandName = this.commandName.trim();
      return this.commandName === '';
    },
    isNameDuplicate() {
      if (this.readonly) return false;
      return this.value.existedNames
        .findIndex(name => name !== this.value.command.name && name === this.commandName) !== -1;
    },
    isNameValid() {
      return !this.isNameEmpty && !this.isNameDuplicate;
    },
    isTimeValid() {
      if (this.dateFormat === 'custom') {
        return this.startDate < this.endDate;
      }
      return true;
    },
  },
  watch: {
    hasAdvanced() {
      if (this.hasAdvanced) {
        if (this.regex.length === 0) {
          this.addRegex();
        }
      } else {
        this.regex = [];
      }
    },
    dateFormat() {
      if (this.dateFormat === 'forever') {  // reset 'custom' if chooose 'forever'
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        this.startDate = today;
        this.endDate = tomorrow;
        this.$refs.datePicker.dispatchEvent(event.createEvent('tooltip-hide'));
      }
    },
    replyFormat() {
      if (this.replyFormat === 'intext') {
        this.replyContentJson = '';
        this.closeJSONTooltip();
      } else if (this.replyFormat === 'injson') {
        this.replyContentText = '';
      }
    },
    commandName() {
      if (this.commandName !== '') {
        this.isCommandNameTooltipShown = false;
        this.$refs.commandName.dispatchEvent(event.createEvent('tooltip-hide'));
      }
    },
    isNameEmpty() {
      this.isAddNewCommand = false;
      // this.updateNameTooltip();
    },
    // isNameDuplicate() {
    //   this.updateNameTooltip();
    // },
    isTimeValid() {
      if (this.dateFormat === 'custom') {
        if (!this.isTimeValid) {
          this.$refs.datePicker.dispatchEvent(event.createEvent('tooltip-show'));
        } else {
          this.$refs.datePicker.dispatchEvent(event.createEvent('tooltip-hide'));
        }
      }
    },
  },
  methods: {
    addRegex() {
      this.regex.push({
        type: 'regex',
        value: [],
      });
    },
    deleteRegex(idx) {
      this.regex.splice(idx, 1);
    },
    updateTags(tags) {
      this.selectedTags = tags;
    },
    validate() {
      // build return obj and return
      if (!this.isReturnDataValid()) {
        // this.updateNameTooltip();

        if (!this.isTimeValid) {
          if (this.dateFormat === 'custom') {
            this.$refs.datePicker.dispatchEvent(event.createEvent('tooltip-show'));
          }
        }
        return;
      }
      const returnObj = this.parseReturnObj();
      this.$emit('validateSuccess', returnObj);
    },
    parseReturnObj() {
      const that = this;
      function parseRule(keywords, regex) {
        let rules = [];
        keywords.split('/').forEach((keyword) => {
          rules.push({
            type: 'keyword',
            value: [keyword],
          });
        });
        rules = rules.concat(regex.filter(reg => reg.value !== ''));
        return rules;
      }
      function parseTags(tags) {
        return tags.map((tag) => {
          const theLabel = that.labels.find(label => label.name === tag);
          return theLabel.id;
        });
      }
      const returnObj = {
        id: that.value.command.id,
        status: that.value.command.status,
        name: that.commandName,
        target: that.ruleTo,
        response_type: that.replyPlace,
        begin_time: that.dateFormat === 'forever' ? null : that.startDate,
        end_time: that.dateFormat === 'forever' ? null : that.endDate,
        answer: that.replyFormat === 'intext' ? that.replyContentText : that.replyContentJson,
        rule: parseRule(that.keywords, that.regex),
        labels: parseTags(that.selectedTags),
      };
      return returnObj;
    },
    isReturnDataValid() {
      this.updateNameTooltip();
      return this.isNameValid && this.isTimeValid && this.isReplyValid();
    },
    isReplyValid() {
      if (this.replyFormat === 'injson') {
        try {
          JSON.parse(this.replyContentJson);
          return true;
        } catch (err) {
          console.log(err);
          this.isReplyJsonWarning = true;
          this.$refs.replyFormatJSON.dispatchEvent(event.createEvent('tooltip-show'));
          return false;
        }
      }
      return true;
    },
    closeJSONTooltip() {
      this.isReplyJsonWarning = false;
      this.$refs.replyFormatJSON.dispatchEvent(event.createEvent('tooltip-hide'));
    },
    updateNameTooltip() {
      if (!this.isNameValid) {
        this.isAddNewCommand = false;
        if (this.isNameEmpty) {
          this.commandNameTooltip.msg = this.$t('robot_command.error.name_input_empty');
        } else if (this.isNameDuplicate) {
          this.commandNameTooltip.msg = this.$t('robot_command.error.name_input_duplicate');
        }
        this.isCommandNameTooltipShown = true;
        this.$refs.commandName.dispatchEvent(event.createEvent('tooltip-reload'));
        this.$refs.commandName.dispatchEvent(event.createEvent('tooltip-show'));
      } else {
        this.isCommandNameTooltipShown = false;
        this.$refs.commandName.dispatchEvent(event.createEvent('tooltip-hide'));
      }
    },
    parseCommandDetail() {
      const that = this;
      function getKeyword(rules) {
        const keywordRules = rules.filter(rule => rule.type === 'keyword')
                                  .map(rule => rule.value[0]);
        return keywordRules.join('/');
      }
      function getRegex(rules) {
        const regexRules = rules.filter(rule => rule.type === 'regex');
                                // .map(rule => rule.value);
        return regexRules;
      }
      function getLabelName(tags) {
        return that.labels.filter(label => tags.indexOf(label.id) !== -1)
                          .map(label => label.name);
      }

      const cmd = that.value.command;
      that.isAddNewCommand = cmd.name === '';
      that.commandName = cmd.name;
      that.ruleTo = cmd.target;
      that.replyPlace = cmd.response_type;

      if (cmd.begin_time !== null && cmd.end_time !== null) {
        that.dateFormat = 'custom';
        that.startDate = cmd.begin_time;
        that.endDate = cmd.end_time;
      } else {
        that.dateFormat = 'forever';
      }

      that.hasAdvanced = cmd.rule.filter(r => r.type === 'regex').length > 0;
      that.keywords = getKeyword(cmd.rule);
      that.regex = getRegex(cmd.rule);

      try {
        JSON.parse(cmd.answer);
        that.replyFormat = 'injson';
        that.replyContentJson = cmd.answer;
      } catch (err) {
        that.replyFormat = 'intext';
        that.replyContentText = cmd.answer;
      }
      that.origTags = getLabelName(cmd.labels);
      that.selectedTags = that.origTags;
      that.tagsList = that.labels.map(label => label.name);
    },
    addNewLabel(tag) {
      const that = this;
      const params = {
        appid: that.appid,
        name: tag,
        type: 'userdefine',
        category: 'sq',
      };
      console.log('add new label');
      if (!validate.isValidLabel(tag)) {
        // Reset tagList to old one and refresh tags
        that.$notifyFail(that.$t('robot_command.error.tag_invalid'));
        const idxInTagList = that.tagsList.indexOf(params.name);
        that.tagsList.splice(idxInTagList, 1);
        console.log('selected tags before', JSON.stringify(that.selectedTags));
        const idxInSelectedTags = that.selectedTags.indexOf(params.name);
        that.selectedTags.splice(idxInSelectedTags, 1);
        console.log('selected tags', JSON.stringify(that.selectedTags));
        that.origTags = that.selectedTags;
        console.log('origTags', JSON.stringify(that.origTags));
        return;
      }
      that.$api.addLabel(params)
        .then((res) => {
          if (res.error_code !== 0) {
            that.$notifyFail(that.$t('robot_command.error.add_new_tag_fail'));
            // Reset tagList to old one and refresh tags
            const idxInTagList = that.tagsList.indexOf(params.name);
            that.tagsList.splice(idxInTagList, 1);
            const idxInSelectedTags = that.selectedTags.indexOf(params.name);
            that.selectedTags.splice(idxInSelectedTags, 1);
            that.origTags = that.selectedTags;
          } else {
            const newtag = res.data.tag;
            this.labels.splice(0, 0, newtag);
          }
        })
        .catch((err) => {
          console.log(err);
          that.$notifyFail(that.$t('robot_command.error.add_new_tag_fail'));
          // Reset tagList to old one and refresh tags
          const idxInTagList = that.tagList.indexOf(params.name);
          that.tagList.splice(idxInTagList, 1);
          const idxInSelectedTags = that.selectedTags.indexOf(params.name);
          that.selectedTags.splice(idxInSelectedTags, 1);
          that.origTags = that.selectedTags;
        });
    },
    setReadonly() {
      if (this.value.readonly) {
        this.readonly = this.value.readonly ? this.value.readonly : false;
      }
    },
    loadLabels() {
      const that = this;
      that.$startPageLoading();
      return that.$api.loadLabels().then((res) => {
        if (res.status === 0) {
          that.labels = res.result;
        } else {
          that.$popError(res.message);
        }
      }, () => {
        // TODO: handle error if status code is not 500,
      })
      .then(() => {
        that.$emit('endLoading');
      });
    },
    getAppID(name) {
      const label = `${name}=`;
      const ca = document.cookie.split(';');
      let appId = '';
      ca.forEach((val) => {
        let c = val;
        if (c.charAt(0) === ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(label) !== -1) {
          appId = c.substring(label.length, c.length);
          return true;
        }

        return true;
      });

      return appId;
    },
  },
  mounted() {
    // parse value
    this.loadLabels()
    .then(() => {
      this.parseCommandDetail();
      this.setReadonly();
      this.$on('validate', this.validate);
    });
  },
};
</script>
<style lang="scss" scoped>
@import 'styles/variable';
$row-height: 30px;

#command-edit-pop {
  @include font-14px();
  width: 660px;
  margin: 0 30px;
}
.edit-row {
  color: $color-font-normal;
  margin: 10px 0;
  min-height: $row-height;
  display: flex;
  align-items: center;
  .edit-title {
    flex: 0 0 100px;
  }
  .edit-content {
    flex: 1 1 auto;
    max-width: 560px;
  }
}

input[type=radio], input[type=checkbox] {
  &:disabled {
    &+label {
      &:hover {
        cursor: default;
      }
    }
  }
  &+label {
    &:hover {
      cursor: pointer;
    }
  }
}

#edit-command {
  #edit-command-content {
    #edit-command-input {
      width: 100%;
    }
  }
}

#edit-keyword-content {
  display: flex;
  align-items: center;
  input {
    flex: 1 1 auto;
  }
  #advanced-block {
    flex: 0 0 auto;
    padding: 0 5px;
  }
}

#edit-keyword-advance {
  .regex-row {
    display: flex;
    align-items: center;
    height: $row-height;
    margin: 5px 0;
    input {
      flex: 1 1 auto;
      margin: 0 10px;
    }
    .text-button {
      flex: 0 0 auto;
    }
  }
}

#edit-datetime-content {
  display: flex;
  align-items: center;
  #pickers {
    margin-left: 10px;
    display: inline-flex;
    align-items: center;
  }
}

#edit-reply-textarea {
  textarea {
    width: 100%;
  }
}

</style>
