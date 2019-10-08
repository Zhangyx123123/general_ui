<template>
  <div class="user-info-form normal">
    <div class="row">
      <div class="row-title">
        {{ $t('knowledge_graph.property_edit.property_name') }}
      </div>
      <div class="row-input-col">
        <input class="row-input length-auto" v-model="propertyName">
      </div>
    </div>
    <div class="row">
      <div class="row-title">
        {{ $t('knowledge_graph.entity_edit.introduction') }}
      </div>
      <div class="row-input-col">
        <input class="row-input length-auto" v-model="propertyIntroduction">
      </div>
    </div>
    <el-collapse accordion>

      <el-collapse-item>
        <template slot="title">
          {{ $t('knowledge_graph.property_edit.assign_synonym') }}
        </template>
        <div class="row">
          <el-tag
            v-for="(item, idx) in synonymSet"
            :key="idx"
            closable
            :disable-transitions="false"
            @close="removeSynonym(synonymSet[idx])"
          >
            {{ synonymSet[idx] }}
          </el-tag>
          <el-input
            class="input-new-tag"
            v-if="inputVisible"
            v-model="newSynonym"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="addSynonym"
            @blur="addSynonym"
          ></el-input>
          <el-button v-else
                     class="button-new-tag"
                     size="small"
                     @click="showInput"
          >{{ $t('knowledge_graph.entity_edit.add_synonym')}}
          </el-button>

        </div>
      </el-collapse-item>
      <el-collapse-item>
        <template slot="title">
          {{ $t('knowledge_graph.property_edit.assign_corpus') }}
        </template>
        <div class="row" v-for="(item, idx) in corpusSet" :key="idx">
          <div class="row-input-col length-limit">
            <input class="row-input length-limit" v-model="corpusSet[idx]">
          </div>
          <div class="row-button">
            <text-button width="60px" button-type="error" @click="removeCorpus(corpusSet[idx])">
              {{ $t('general.delete') }}
            </text-button>
          </div>
        </div>
        <div class="row">
          <!--<div class="row-title"></div>-->
          <text-button button-type="primary" @click="addCorpus">{{ $t('general.add') }}</text-button>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import api from '../_api/knowledgeGraph';

export default {
  props: {
    extData: {
      type: Object,
      default: () => ({
        type: 2,
      }),
    },
  },
  api,
  data() {
    return {
      newSynonym: '',
      inputVisible: false,
      synonymSet: [],
      corpusSet: [],
      propertyIntroduction: this.extData.property.introduction,
      propertyName: this.extData.property.propertyName,
    };
  },
  computed: {
    ...mapGetters([
      'robotID',
      'userID',
    ]),
    propertyId() {
      return this.extData.editMode ? this.extData.property.id : '';
    },
  },
  watch: {

  },
  methods: {
    // add synonym from synonym list of property
    addSynonym() {
      const newValue = this.newSynonym;
      newValue.replace(/[\r\n]/g, '');
      if (newValue && newValue.length > 0) {
        this.synonymSet.push(this.newSynonym);
        this.inputVisible = false;
        this.newSynonym = '';
      } else if (newValue && newValue.length > 0) {
        this.$message({
          message: this.$t('knowledge_graph.entity_edit.value_warn_msg'),
          type: 'error',
          showClose: true,
        });
      }
    },

    showInput() {
      this.inputVisible = true;
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    removeSynonym(item) {
      this.synonymSet.splice(this.synonymSet.indexOf(item), 1);
    },

    addCorpus() {
      this.corpusSet.push('');
    },

    removeCorpus(corpus) {
      const idx = this.corpusSet.indexOf(corpus);
      this.corpusSet.splice(idx, 1);
    },

    validate() {
      let validFlag = true;

      this.synonymSet = this.synonymSet.filter(item => item !== '');
      this.corpusSet = this.corpusSet.filter(item => item !== '');

      if (this.propertyName.length === 0) {
        this.$message({
          message: this.$t('knowledge_graph.entity_edit.err_msg_invalid_id'),
          type: 'error',
          showClose: true,
        });
        validFlag = false;
      }

      // else if (!/^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(this.propertyName)) {
      //   this.$message({
      //     message: this.$t('knowledge_graph.entity_edit.value_warn_msg'),
      //     type: 'error',
      //     showClose: true,
      //   });
      //   validFlag = false;
      // }

      const editedProperty = {
        id: this.propertyId,
        name: this.propertyName,
        introduction: this.propertyIntroduction === '' ? null : this.propertyIntroduction,
        synonymSet: this.synonymSet,
        corpusSet: this.corpusSet,
      };
      if (validFlag) {
        if (this.extData.editMode) {
          const param = {
            name: editedProperty.name,
            introduction: editedProperty.introduction,
            corpus: editedProperty.corpusSet,
            synonym: editedProperty.synonymSet,
          };

          this.$api.updateProperty(this.robotID, editedProperty.id, param).then((res) => {
            console.log(JSON.stringify(res, null, 2));
            this.$emit('validateSuccess', editedProperty);
          })
            .catch((err) => {
              if (err.response.data.propertyRepeat) {
                this.$message({
                  showClose: true,
                  message: this.$t('knowledge_graph.property_edit.err_msg_duplicated_property'),
                  type: 'error',
                });
              } else if (err.response.data.status === 'fail') {
                let errMsg = '';
                switch (err.response.data.message.trim()) {
                  default:
                    errMsg = err.response.data.message.trim();
                    break;
                  case 'property corpus can not duplicated;':
                  case 'update CorpusSet failed;':
                  case 'corpusSet has repeat item':
                    errMsg = this.$t('knowledge_graph.property_edit.err_msg_duplicated_corpus');
                    break;
                  case 'update SynonymSet failed;':
                  case 'synonymSet has repeat item':
                    errMsg = this.$t('knowledge_graph.property_edit.err_msg_duplicated_synonym');
                }
                this.$message({
                  showClose: true,
                  message: errMsg,
                  type: 'error',
                });
              } else {
                this.$message({
                  showClose: true,
                  message: err.response.data.message,
                  type: 'error',
                });
              }
            });
        } else {
          const param = {
            name: editedProperty.name,
            introduction: editedProperty.introduction,
            corpus: editedProperty.corpusSet,
            synonym: editedProperty.synonymSet,
          };

          this.$api.createProperty(this.robotID, param)
            .then(() => {
              this.$emit('validateSuccess', editedProperty);
            })
            .catch((err) => {
              if (err.response.data.propertyRepeat) {
                this.$message({
                  showClose: true,
                  message: this.$t('knowledge_graph.property_edit.err_msg_duplicated_property'),
                  type: 'error',
                });
              } else if (err.response.data.synonymSetRepeat) {
                this.$message({
                  showClose: true,
                  message: this.$t('knowledge_graph.property_edit.err_msg_duplicated_synonym'),
                  type: 'error',
                });
              } else if (err.response.data.corpusSetRepeat) {
                this.$message({
                  showClose: true,
                  message: this.$t('knowledge_graph.property_edit.err_msg_duplicated_corpus'),
                  type: 'error',
                });
              } else if (err.response.data.status === 'fail') {
                let errMsg = '';
                switch (err.response.data.message.trim()) {
                  default:
                    errMsg = err.response.data.message.trim();
                    break;
                  case 'property corpus can not duplicated;':
                  case 'update CorpusSet failed;':
                  case 'corpusSet has repeat item':
                    errMsg = this.$t('knowledge_graph.property_edit.err_msg_duplicated_corpus');
                    break;
                  case 'update SynonymSet failed;':
                  case 'synonymSet has repeat item':
                    errMsg = this.$t('knowledge_graph.property_edit.err_msg_duplicated_synonym');
                }
                this.$message({
                  showClose: true,
                  message: errMsg,
                  type: 'error',
                });
              } else {
                this.$message({
                  showClose: true,
                  message: err.response.data.message,
                  type: 'error',
                });
              }
            });
        }
      }
    },
  },
  beforeMount() {
    // case: create new Property
    this.synonymSet = this.extData.property.synonymSet.map(item => item);
    this.corpusSet = this.extData.property.corpusSet.map(item => item);
    this.$on('validate', this.validate);
  },
};
</script>
<style lang="scss" scoped>
@import 'styles/variable';

.user-info-form {
  color: #666666;
  padding: 0 25px;
  @include font-14px();
  &.admin {
    /*width: 820px;*/
    width: 60vw;
  }
  &.normal {
    /*width: 820px;*/
    width: 60vw;
  }
  display: flex;
  flex-direction: column;
  .row /deep/  {
    margin: 5px 0px;
    flex: 0 0 40px;
    max-height: 40px;

    display: flex;
    align-items: center;
    .el-tag + .el-tag {
      margin-left: 10px;
    }
    .button-new-tag {
      margin-left: 10px;
      height: 32px;
      line-height: 30px;
      padding-top: 0;
      padding-bottom: 0;
    }
    .input-new-tag {
      width: 90px;
      margin-left: 10px;
      vertical-align: bottom;
    }
    .row-title {
      flex: 0 0 100px;
      max-width: 100px;
      .required {
        display: inline-block;
        width: 14px;
        color: $color-primary;
      }
    }
    .row-input {
      /*flex: 0 0 100%;*/
      flex: 1;
      padding: 3px 8px;
      @include font-14px();
    }

    /*.length-limit {*/
    /*max-width: 140px;*/
    /*}*/

    .length-auto {
      flex: 0 1 340px;
    }
    .row-input-col {
      /*flex: 0 0 140px;*/
      flex: 1;
      /*max-width: 140px;*/
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .row-text {
      margin: 0 8px 0 10px;
    }
    .row-button {
      margin-left: 10px;
    }
    .selector {
      /*flex: 0 0 140px;*/
      // max-width: 140px;
      flex: 1;
    }
  }
}

/*#edit-content {*/
  /*height: 100%;*/
/*}*/
</style>
