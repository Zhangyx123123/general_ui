<template>
  <div class="user-info-form">

    <template v-if="this.extData.editMode">
      <div class="row">
        <div class="row-title">
          {{ $t('knowledge_graph.entity_edit.entity_name') }}
        </div>
        <div class="row-input-col">
          <input class="row-input length-auto" v-model="entityName">
        </div>
      </div>
      <div class="row">
        <div class="row-title">
          {{ $t('knowledge_graph.entity_edit.introduction') }}
        </div>
        <div class="row-input-col">
          <input class="row-input length-auto" v-model="entityIntroduction">
        </div>
      </div>
      <div class="row">
        <div class="row-title">
          {{ $t('wordbank.synonym') }}
        </div>
      </div>
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

      <div class="row">
        <div class="row_space_between">
          <div class="row-title">
            {{ $t('knowledge_graph.entity_edit.property_list') }}
          </div>
          <text-button button-type="primary" @click="addProperty">{{ $t('general.add') }}</text-button>
        </div>
      </div>
      <div class="property_list">
        <el-collapse @change="switchTableHeader" v-model="activeName" accordion>
          <el-collapse-item v-for="(item, idx) in currentPropertySet" :key="idx" :name="item.id">
            <template slot="title">
              <div style=" width: 50%">
                <template v-if="item.expanded">

                </template>
                <template v-else>
                  <div class="property_title">{{ item.propertyName }}</div>
                </template>
              </div>
            </template>

            <div class="row">
              <div class="row-text">{{ $t('knowledge_graph.property_edit.property_name') }}</div>
              <el-select v-model="item.property"
                         class="selector"
                         size="mini"
                         filterable
                         :placeholder="$t('general.please_choose')"
                         @change="changePropertyDisplayName(item)"
                         >
                <el-option
                  v-for="item in functionPropertyOptions"
                  :key="item.value"
                  :label="item.text"
                  :value="item.value"
                  :disabled="item.disabled"
                  :title='item.text'
                >
                </el-option>
              </el-select>

            </div>

            <div class="row">
              <div class="row-text">{{ $t('knowledge_graph.property_edit.property_type') }}</div>

              <el-select v-model="item.propertyType"
                         class="selector"
                         size="mini"
                         filterable
                         :placeholder="$t('general.please_choose')"
                         @visible-change="handleVisibleChange(item)"
              >
                <el-option
                  v-for="item in entityTypes"
                  :key="item.name"
                  :label="item.text"
                  :value="item.name"
                  :title='item.text'
                  :disabled="item.disabled">
                </el-option>
              </el-select>

            </div>

            <template v-if="item.propertyType === 'string'">
              <div class="row">
                <div class="row-text">{{ $t('knowledge_graph.property_edit.property_value') }}</div>
              </div>
<!--              <div class="row">-->
<!--                <div class="nav">-->
<!--                  <nav-bar :options="textTypes" v-model="textType"/>-->
<!--                </div>-->
<!--              </div>-->
              <div class="rich_row">
                <textarea v-if="textType === 'simple'" rows="5" class="row-input" v-model="item.propertyValue[0]"/>
<!--                <template v-if="textType==='file'">-->
<!--                  <div class="row">-->
<!--                    <input type="file" ref="attachment" id="entityFileChooser" style="display: none" accept=".jpg"-->
<!--                           @change="validFile(item, idx)"/>-->
<!--                    <text-button button-type="primary" @click.stop="uploadAttachment(idx)">-->
<!--                      {{ $t('knowledge_graph.entity_edit.pic_upload') }}-->
<!--                    </text-button>-->
<!--                    <div>{{ item.propertyValue[0] }}</div>-->
<!--                  </div>-->
<!--                </template>-->
              </div>

            </template>
            <template v-else-if="item.propertyType === 'entity'">
              <div class="row" v-if="item.isInheritProperty">
                <div class="row-text">{{ $t('knowledge_graph.entity_edit.hierarchy_property') }}</div>
                <el-select v-model="item.selectedHProperty"
                           class="selector"
                           size="mini"
                           filterable
                           multiple
                           :placeholder="$t('general.please_choose')"
                           >
                  <el-option
                    v-for="prop in item.hierarchyPropertySelection"
                    :key="prop.value"
                    :label="prop.text"
                    :value="prop.value"
                    :title='item.text'
                  >
                  </el-option>
                </el-select>
              </div>
              <div class="row">
                <div class="row-text">{{ $t('knowledge_graph.property_edit.property_value') }}</div>
                <el-select v-model="item.entity"
                           class="selector"
                           size="mini"
                           filterable
                           :multiple=item.allowMutiValue
                           :placeholder="$t('general.please_choose')"
                           @change="changePropertyHierarchySelections(item)">
                  <el-option
                    v-for="item in entityOptions"
                    :key="item.value"
                    :label="item.text"
                    :value="item.value"
                    :title='item.text'
                  >
                  </el-option>
                </el-select>

              </div>
            </template>

            <template v-else-if="item.propertyType === 'float'">
              <div class="row">
                <div class="row-text">{{ $t('knowledge_graph.property_edit.property_value') }}</div>
                <input class="row-input" style="max-width: 160px" @keyup="validateNumberInput(item.propertyValue[0])"
                       v-model="item.propertyValue[0]"/>
                <div class="row-text">{{ $t('knowledge_graph.entity_edit.unit') }}</div>
                <input class="row-input" style="max-width: 160px" v-model="item.unit"/>
              </div>

              <div class="row">

              </div>
            </template>

            <template v-else-if="item.propertyType === 'none'">
              <div class="row">
                <div class="row-text">{{ $t('knowledge_graph.property_edit.property_value') }}</div>
              </div>

              <div class="row">
                <input class="row-input" disabled v-model="item.propertyValue"/>
              </div>
            </template>


            <div class="row">
              <div class="row-text">{{ $t('knowledge_graph.entity_edit.single_speech') }}</div>

            </div>
            <div class="row">
              <input class="row-input" :disabled="item.canEdit" v-model="item.singleSpeech"/>
            </div>
            <div class="row">
              <div class="reverse_layout">
                <text-button width="60px" button-type="error" @click="removeProperty(item)">
                  {{ $t('general.delete') }}
                </text-button>
              </div>
            </div>
          </el-collapse-item>

        </el-collapse>
      </div>
      <div class="row">
        <v-pagination size="small" :total="curTotal" :pageIndex="curPageIdx" :pageSize="pageLimit"
                      :layout="['prev', 'pager', 'next', 'jumper']" @page-change="handlePageChange"></v-pagination>
      </div>
    </template>
    <template v-else>
      <div class="row">
        <div class="row-text" style="width: 10%">
          {{ $t('knowledge_graph.entity_edit.entity_name') }}
        </div>
        <div class="row-text" style="width: 90%">
          {{ entityName }}
        </div>
      </div>
      <div class="row" style="max-height: 500px" v-for="(item, idx) in propertySet" :key="idx">
        <div class="row-text row-text-ellipsis" style="width: 10%" :title="item.propertyName" >{{ item.propertyName }}</div>
        <template v-if="isFloat(item)">
          <div class="display_values">
            <div class="row-text" v-for="(value, idx) in item.propertyValue" :key="idx">{{ value }}</div>
            <div class="row-text">{{ item.unit }}</div>
          </div>
        </template>
        <template v-else-if="isEntity(item)">
          <div class="display_values">
            <div v-if="!isArray(item.propertyValue)" class="row-text row-text-ellipsis" >{{ item.propertyValue }}</div>
            <div v-else class="row-text" v-for="(value, idx) in item.propertyValue" :key="idx">{{ value }}</div>
          </div>
        </template>
        <template v-else>
          <div class="display_values">
            <div  v-if="item.propertyValue[0] !== ''" class="row-text">
              <div v-html="item.propertyValue[0]">
              </div>
            </div>
            <div class="row-text" v-show="idx > 0" v-for="(value, idx) in item.propertyValue" :key="idx">
              <div v-if="!isObject(value)" v-html="value">
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import DropdownSelector from '@/components/DropdownSelect';
  import NavBar from '@/components/NavigationBar';
  import misc from '@/utils/js/misc';
  import api from '../_api/knowledgeGraph';


  export default {
    NavBar,
    name: 'AddEntityPop',
    api,
    misc,
    props: {
      extData: {
        type: Object,
        default: () => ({
          type: 2,
        }),
      },
    },

    components: {
      DropdownSelector,
      NavBar,
    },

    data() {
      return {
        entityIntroduction: '',
        pageLimit: 10,
        lastCurPageIdx: 1,
        curPageIdx: 1,
        lastPageIdx: 1,
        newSynonym: '',
        inputVisible: false,
        activeName: '',
        // test: '',
        isAdmin: false,
        // readonly: false,
        entityName: '',
        textTypes: {
          simple: this.$t('knowledge_graph.entity_edit.simple'),
          // rich: this.$t('knowledge_graph.entity_edit.rich'),
          file: this.$t('knowledge_graph.entity_edit.file'),
        },
        textType: 'simple',
        entityTypes: [
          {
            text: this.$t('knowledge_graph.entity_edit.type_e'),
            name: 'entity',
            value: 1,
          },
          {
            text: this.$t('knowledge_graph.entity_edit.type_s'),
            name: 'string',
            value: 2,
          },
          {
            text: this.$t('knowledge_graph.entity_edit.type_f'),
            name: 'float',
            value: 3,
          },
          {
            text: this.$t('knowledge_graph.entity_edit.type_n'),
            name: 'none',
            value: 4,
          },
        ],
        synonymSet: [],
        // propertyOptions: [],
        functionPropertyOptions: [],
        entityOptions: [],
        // entityType: 'entity',
        entityValue: '',
        //
        // colConfigs: [
        //   { prop: 'propertyName', label: this.$t('knowledge_graph.property_edit.property_name') },
        //   { prop: 'expanded', label: this.$t('knowledge_graph.property_edit.property_type')
        //   , component: ExpandColumn },
        //   // { prop: 'action', label: this.$t('general.actions'), component: OperationColumn },
        //
        // ],
        propertySet: [],
        currentPropertySet: [],
        lastActiveName: '',
      };
    },

    computed: {

      ...mapGetters([
        'robotID',
        'userID',
      ]),

      curTotal() {
        return this.propertySet.length;
      },
    },

    watch: {

      curPageIdx() {
        this.refreshPropertySet();
      },
    },

    methods: {
      attachmentExport(id) {
        window.open(`/fs/file/preview/${id}`, '_blank');
      },

      isArray(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
      },

      isFloat(item) {
        return item.propertyType === 'float';
      },

      isEntity(item) {
        return item.propertyType === 'entity';
      },

      isObject(value) {
        return misc.recognizeJSDataType(value) === 'object';
      },

      changePropertyHierarchySelections(item) {
        if (item.isInheritProperty) {
          this.$api.getEntityByEntityId(this.robotID, item.entity)
            .then((result) => {
              const resultList = result.data.entity.properties.map(prop => (
                parseInt(prop.propertyId, 10)
              ));
              item.hierarchyPropertySelection = this.functionPropertyOptions
                .filter(prop => resultList.indexOf(prop.value) > -1 && prop.type === 'common');
              item.selectedHProperty = [];
              const propertyIndex = this.currentPropertySet.indexOf(item);
              this.currentPropertySet.splice(propertyIndex, 1, item);
            });
        }
      },

      handleVisibleChange(item) {
        this.restrictPropertyTypeSelection(item);
      },

      handlePageChange(page) {
        if (page <= 0) {
          this.toFirstPage();
        } else {
          this.toCurPage(page);
        }
        this.lastPageIdx = page;
      },

      // removeAttachment(file, propertyValue, item) {
      //   const fileId = file.fileName;
      //   const propIndex = this.currentPropertySet.indexOf(item);
      //
      //   this.$api.DeleteAttachDoc(fileId).then(() => {
      //     const newPropertyValue = propertyValue.filter(prop => prop.fileName !== fileId);
      //     item.propertyValue = newPropertyValue;
      //     this.currentPropertySet.splice(propIndex, 1, item);
      //   });
      // },

      toFirstPage() {
        this.curPageIdx = 1;
      },
      toCurPage(page) {
        this.curPageIdx = page;
      },

      uploadAttachment(idx) {
        this.$refs.attachment[idx].click();
      },

      refreshPropertySet() { // This is curPage
        // Handle empty data cause curPageIdx to zero;
        if (this.curPageIdx <= 0) {
          this.toFirstPage();
        }

        const startIdx = (this.curPageIdx - 1) * this.pageLimit;
        const endIdx = startIdx + this.pageLimit;

        if (this.lastPageIdx !== this.curPageIdx) {
          const lastStartIdx = (this.lastPageIdx - 1) * this.pageLimit;
          this.propertySet
            .splice(lastStartIdx, 10, ...this.currentPropertySet);
        }
        this.currentPropertySet = this.propertySet.slice(startIdx, endIdx)
          .map(data => data);
        this.lastPageIdx = this.curPageIdx;
      },

      validFile(item, idx) {
        let msg = '';
        const fileSizeLimit = 50 * 1024 * 1024;
        const theFile = this.$refs.attachment[idx].files[0];
        if (!theFile) {
          this.fileValid = false;
          msg = this.$t('wordbank.upload_file_undefined');
        } else if (theFile.size <= 0 || theFile.size > fileSizeLimit) {
          this.fileValid = false;
          msg = this.$t('knowledge_graph.entity_edit.upload_file_size_error');
        } else if (this.fileTypeInvalid(theFile)) {
          this.fileValid = false;
          msg = this.$t('knowledge_graph.entity_edit.upload_file_type_invalid');
        } else {
          this.fileValid = true;
          this.file = theFile;
        }

        if (this.fileValid) {
          this.attachDocument(item, idx);
          // this.uploadEntityFile();
        } else {
          this.$message({
            showClose: true,
            message: msg,
            type: 'error',
          });
        }
      },

      fileTypeInvalid(file) {
        const validType =
          ['image/jpg', 'image/jpeg'];
        return validType.indexOf(file.type) === -1;
      },

      attachDocument(item, idx) {
        // this.$emit('startLoading');
        this.$api.UploadPicture(this.robotID, this.userID, this.file).then((res) => {
          const fileData = res.data.data;
          const itemIndex = this.currentPropertySet.indexOf(item);
          item.propertyValue[0] = fileData;
          this.currentPropertySet.splice(itemIndex, 1, item);
          this.file = '';
          this.$refs.attachment[idx].value = '';
        });
      },

      validateNumberInput(value) {
        console.log(value);
        if ((!/^([0-9]+)$/.test(value))
          && (!/^([0-9]{1,}[.][0-9]*)$/.test(value))
          && (value.length > 0)) {
          this.$message({
            message: this.$t('knowledge_graph.entity_edit.float_warn_msg'),
            type: 'warning',
            showClose: true,
          });
        }
      },

      // propertyTypeText(id) {
      //   console.log(id);
      //   const filterResult = this.entityTypes.filter(item => item.name === id);
      //   if (filterResult !== undefined && filterResult.length > 0) {
      //     return filterResult.text;
      //   } else if (id === 'anonymousEntity') {
      //     return this.$t('knowledge_graph.entity_edit.type_a');
      //   }
      //   return id;
      // },
      //
      // propertyTypeName(id) {
      //   console.log(id);
      //   return this.entityTypes.filter(item => item.value === id)[0].name;
      // },

      removeProperty(item) {
        // const removeIndex = this.propertySet.indexOf(item);
        // this.propertySet.splice(removeIndex, 1);
        const currentRemoveIndex = this.currentPropertySet.indexOf(item);
        this.currentPropertySet.splice(currentRemoveIndex, 1);
      },

      addProperty() {
        const newProperty = {
          id: `${'-1+'}${Math.random()}`,
          property: '',
          entity: [],
          propertyId: '',
          propertyName: '',
          propertyType: '',
          // boolType: true,
          propertyValue: [''],
          relationType: 'entityNormal',
          unit: null,
          singleSpeech: '[XEON_ENTITY]的[XEON_PROPERTY]是[XEON_VALUE]',
          expanded: true,
          isInheritProperty: false,
          hierarchyPropertySelection: [],
          selectedHProperty: [],
        };
        this.currentPropertySet.splice(0, 0, newProperty);
        this.activeName = newProperty.id;
        this.switchTableHeader(this.activeName);
      },

      examinePropertySettings(selectedProperty) {
        let message = '';
        if (selectedProperty.property === '') {
          message = this.$t('knowledge_graph.entity_edit.err_msg_invalid_id', { name: selectedProperty.propertyName });
        } else if (selectedProperty.propertyType === '') {
          message = this.$t('knowledge_graph.entity_edit.err_msg_invalid_type', { name: selectedProperty.propertyName });
        } else if (selectedProperty.propertyType === 'float') {
          if (selectedProperty.propertyValue[0] === ''
            || ((!/^([0-9]+)$/.test(selectedProperty.propertyValue[0]))
              && (!/^([0-9]{1,}[.][0-9]*)$/.test(selectedProperty.propertyValue[0])))) {
            message = this.$t('knowledge_graph.entity_edit.err_msg_invalid_value', { name: selectedProperty.propertyName });
          }
        } else if (selectedProperty.propertyType === 'string') {
          if (!selectedProperty.propertyValue[0]) {
            message = this.$t('knowledge_graph.entity_edit.err_msg_empty_value', { name: selectedProperty.propertyName });
          } else if (selectedProperty.propertyValue[0].length > 3000) {
            message = this.$t('knowledge_graph.entity_edit.err_msg_max_length', { name: selectedProperty.propertyName });
          } else if (selectedProperty.propertyValue[0].trim().length === 0) {
            message = this.$t('knowledge_graph.entity_edit.err_msg_empty_value', { name: selectedProperty.propertyName });
          }
        } else if (selectedProperty.propertyType === 'entity') {
          if (selectedProperty.entity === '') {
            message = this.$t('knowledge_graph.entity_edit.err_msg_empty_value', { name: selectedProperty.propertyName });
          }
        }

        if (message !== '') {
          this.$message({
            message,
            type: 'error',
            showClose: true,
          });

          return false;
        }

        return true;
      },

      switchTableHeader(val) {
        this.currentPropertySet = this.currentPropertySet.map((item) => {
          item.expanded = false;
          return item;
        });
        if (val.length !== 0) {
          this.currentPropertySet = this.currentPropertySet.map((item) => {
            item.expanded = false;
            return item;
          });
          const updatedProperty = this.currentPropertySet
              .filter(item => item.id === val)[0];
          const propertyIndex = this.currentPropertySet.indexOf(updatedProperty);

          updatedProperty.expanded = true;
          this.currentPropertySet.splice(propertyIndex, 1, updatedProperty);
        }
        this.lastActiveName = this.activeName;
      },

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

      // restrictPropertySelection(value) {
      //   this.functionPropertyOptions.map((item) => {
      //
      //
      //   })
      // },

      restrictPropertyTypeSelection(value) {
        this.entityTypes = this.entityTypes.map((item) => {
          item.disabled = false;
          return item;
        });
        if (this.functionPropertyOptions.filter(item => item.value === value.property)[0].type !== 'common') {
          this.entityTypes = this.entityTypes.map((item) => {
            item.disabled = item.value !== 1;
            return item;
          });
        }
      },

      changePropertyDisplayName(value) {
        console.log(value);
        const propertyIndex = this.currentPropertySet.indexOf(value);
        value.propertyName = this.functionPropertyOptions
          .filter(item => item.value === value.property)[0].text;
        value.isInheritProperty = this.functionPropertyOptions
          .filter(prop => prop.value === parseInt(value.property, 10))[0].type === 'is_a';
        value.id = `${value.property}+${Math.random()}`;
        const propertyType = this.functionPropertyOptions
          .filter(prop => prop.value === parseInt(value.property, 10))[0].type;
        value.allowMutiValue = propertyType === 'common' || propertyType === 'has_a';
        value.propertyType = '';
        this.currentPropertySet.splice(propertyIndex, 1, value);
        this.activeName = value.id;
        this.restrictPropertyTypeSelection(value);
      },
      isvalidValue(data) {
        return data !== null && data !== undefined && data !== '';
      },

      getPropertyTypes() {
        return this.$api.getPropertyTypes(this.robotID)
          .then((res) => {
            const responseList = res.data.type.map(item => item.name);
            this.entityTypes = this.entityTypes
              .filter(item => responseList.indexOf(item.name) !== -1);
            return new Promise((resolve) => {
              resolve();
            });
          });
      },

      packagePropertyValue(item) {
        if (item.propertyType === 'entity') {
          if (misc.recognizeJSDataType(item.entity) === 'string') {
            return [item.entity];
          }
          return item.entity.map(e => e.toString());
        }
        return item.propertyValue.map((value) => {
          if (misc.recognizeJSDataType(value) === 'string') {
            return value;
          }
          return JSON.stringify(value);
        });
      },

      checkFunctionPropertyStatus(propertySet) {
        let flag = true;
        const propertyIds = propertySet.map(p => parseInt(p.property, 10));
        propertyIds.forEach((prop) => {
          if (this.functionPropertyOptions.filter(property => parseInt(property.value, 10) === prop)[0].type !== 'common'
            && propertySet.filter(pp => pp.property === prop).length > 1) {
            flag = false;
          }
        });
        return flag;
      },

      checkInheritStatus(propertySet) {
        let inheritProperty = propertySet.filter(item => item.selectedHProperty.length > 0);
        if (inheritProperty.length === 0) {
          return true;
        }
        inheritProperty = inheritProperty[0]
          .selectedHProperty.map(item => item.toString());
        const selfProperty = propertySet.map(item => item.property.toString());
        const interList = selfProperty.filter(f => inheritProperty.includes(f));

        if (interList.length > 0) {
          return false;
        }
        return true;
      },

      validate() {
        const that = this;
        let ret = {};
        const properties = [];
        let validFlag = true;
        const startIdx = (this.curPageIdx - 1) * this.pageLimit;
        this.propertySet.splice(startIdx, 10, ...this.currentPropertySet);


        this.currentPropertySet.forEach((item) => {
          if (validFlag) {
            if (!this.examinePropertySettings(item)) {
              // this.activeName = item.id;
              validFlag = false;
            }
          }
        });

        if (validFlag) {
          if (this.entityName.length === 0) {
            this.$message({
              message: this.$t('knowledge_graph.entity_edit.err_msg_empty_name'),
              type: 'error',
              showClose: true,
            });
            validFlag = false;
          } else if (!this.checkFunctionPropertyStatus(this.propertySet)) {
            this.$message({
              message: this.$t('knowledge_graph.entity_edit.property_limit_msg'),
              type: 'error',
              showClose: true,
            });
            validFlag = false;
          } else if (!this.checkInheritStatus(this.propertySet)) {
            this.$message({
              message: this.$t('knowledge_graph.entity_edit.inherit_duplicate_msg'),
              type: 'error',
              showClose: true,
            });
            validFlag = false;
          }
        }
        if (validFlag) {
          this.propertySet
            .filter(property => this.isvalidValue(property.property) === true)
            .forEach((item) => {
              console.log(item);
              const newItem = {
                propertyId: item.property.toString(),
                entityType: item.propertyType,
                entity: this.packagePropertyValue(item),
                relationType: item.relationType,
                unit: item.unit === '' ? null : item.unit,
                speech: item.singleSpeech,
              };

              newItem.isInherit = item.isInheritProperty && item.selectedHProperty.length > 0;
              if (newItem.isInherit) {
                newItem.propertyInheritInfo = [
                  {
                    parentEntityId: newItem.entity[0].toString(),
                    inheritedPropertyId: item.selectedHProperty.map(i => i.toString()),
                  },
                ];
              } else {
                newItem.propertyInheritInfo = [];
              }

              properties.push(newItem);
            });
          const synonym = this.synonymSet.filter(item => item !== '');
          // if (this.entityType === 'entity') {
          ret = {
            entityInfo: {
              name: this.entityName,
              type: 'entity',
              synonym,
              properties,
              introduction: this.entityIntroduction,
            },
          };

          if (that.extData.editMode) {
            // condition entity creation and editing
            if (that.extData.entityData.id !== undefined) {
              that.$api.updateEntityUnderRobot(
                that.robotID, that.extData.entityData.id, ret.entityInfo)
                .then(() => {
                  that.$emit('validateSuccess', ret);
                })
                .catch((err) => {
                  console.log(err);
                  let errMsg = err.response.data.message;
                  if (err.response.data.message.trim() === 'fail to update entity name: have the repeat name;') {
                    errMsg = this.$t('knowledge_graph.entity_edit.err_msg_duplicated_entity_update');
                  } else {
                    errMsg = err.response.data.message;
                  }
                  this.$message({
                    showClose: true,
                    message: errMsg,
                    type: 'error',
                  });
                });
            } else {
              that.$api.addEntityUnderRobot(that.robotID, ret.entityInfo)
                .then(() => {
                  that.$emit('validateSuccess', ret);
                })
                .catch((err) => {
                  // console.log(err);
                  let errMsg = err.response.data.message;
                  if (err.response.data.message.trim() === 'Check exist repeat entity name or synonym value') {
                    errMsg = this.$t('knowledge_graph.entity_edit.err_msg_duplicated_entity');
                  } else {
                    errMsg = err.response.data.message;
                  }

                  this.$message({
                    showClose: true,
                    message: errMsg,
                    type: 'error',
                  });
                });
            }
          } else {
            that.$emit('validateSuccess', ret);
          }

          // }
        }
      },

    },

    beforeMount() {
      this.getPropertyTypes()
        .then(() => new Promise((resolve) => {
          const apiBatch = [];
          // return new Promise((resolve) => {
          console.log(this.extData);
          this.functionPropertyOptions = this.extData.KGPropertyDropList;
          this.entityOptions = this.extData.KGEntityDropList;

          this.entityName = this.extData.entityData.entityName;
          this.entityIntroduction = this.extData.entityData.introduction;
          this.synonymSet = this.extData.entityData.synonym;

          const tempList = this.extData.entityData.properties;
          console.log(tempList);

          tempList.forEach((item) => {
            item.expanded = false;
            item.propertyValue = item.propertyValue.map((value) => {
              if (!misc.isJsonString(value)) {
                return value;
              }
              // console.log(JSON.parse(value));
              return JSON.parse(value);
            });
            // console.log(item.propertyValue);
            item.isInheritProperty = this.functionPropertyOptions
              .filter(prop => prop.value === parseInt(item.property, 10))[0].type === 'is_a';
            item.hierarchyPropertySelection = [];
            const propertyType = this.functionPropertyOptions
              .filter(prop => prop.value === parseInt(item.property, 10))[0].type;
            item.allowMutiValue = propertyType === 'common' || propertyType === 'has_a';
            // item.selectedHProperty = [];
            if (!item.allowMutiValue) {
              item.entity = item.entity[0].toString();
              item.propertyValue = item.propertyValue[0];
            }
            if (item.isInheritProperty) {
              apiBatch.push(new Promise(
                res => this.$api.getEntityByEntityId(this.robotID, item.entity)
                  .then((result) => {
                    const resultList = result.data.entity.properties.map(prop => (
                      parseInt(prop.propertyId, 10)
                    ));
                    item.hierarchyPropertySelection = this.functionPropertyOptions
                      .filter(prop => resultList.indexOf(prop.value) > -1 && prop.type === 'common');
                    res(item);
                  })));
            }
          });


          Promise.all(apiBatch).then((items) => {
            items.forEach((item) => {
              const itemIndex = tempList.indexOf(tempList.filter(tem => tem.id === item.id)[0]);
              tempList.splice(itemIndex, 1, item);
            });
            resolve(tempList);
          });
        }),


        // this.propertySet = this.extData.entityData.properties.map((item) => {
        //   item.expanded = false;
        //     // if (item.propertyType === 'entity') {
        //     //   item.entity = item.entity.map(e => parseInt(e, 10));
        //     // }
        //
        //   item.isInheritProperty = this.functionPropertyOptions
        //     .filter(prop => prop.value === parseInt(item.property, 10))[0].type === 'is_a';
        //   item.hierarchyPropertySelection = [];
        //   if (item.isInheritProperty) {
        //
        //   }
        //
        //   // item.isInheritProperty = this.functionPropertyOptions
        //   //     .filter(prop => prop.value === parseInt(item.property, 10))[0].type === 'is_a';
        //   return item;
        // });


        // });
      ).then((temList) => {
        this.propertySet = temList;
        this.refreshPropertySet();
        this.$on('validate', this.validate);
      });
    },
  };
</script>

<style lang="scss" scoped>

  .property_title {
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .nav {
    flex: 1;
    margin-bottom: 10px;
  }

  .user-info-form {
    color: #666666;
    padding: 0 25px;
    width: 60vw;
    @include font-14px();
    &.admin {
      /*width: 820px;*/
      width: 60vw;
    }
    &.normal {
      /*width: 820px;*/

    }
    .property_list {
      max-height: 60vh;
      overflow-y: auto;
    }
    display: flex;
    flex-direction: column;

    .rich_row {
      margin: 5px 0px;
      flex: 0 0 100%;
      max-height: 40vh;
      /*display: flex;*/
      /*align-items: center;*/
      word-break: normal;
      overflow: auto;
      .row-file-upload {
        display: flex;
        flex-direction: row;
        flex: 1;
      }

      .row-input {
        /*flex: 0 0 100%;*/
        width: 100%;
        flex: 1;
        padding: 3px 8px;
        @include font-14px();
      }
    }

    .row /deep/ {
      margin: 5px 0px;
      flex: 0 0 100%;
      max-height: 20vh;
      display: flex;
      align-items: center;
      word-break: normal;
      overflow: auto;

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


      .reverse_layout {
        flex: 1;
        display: flex;
        flex-direction: row-reverse;
      }
      .row_space_between {
        flex: 1;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
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
      .row-text-ellipsis {
        @include textEllipsis();
      }
      .row-text {
        margin: 0 8px 0 10px;
        min-width: 60px;
      }
      .row-button {
        margin-left: 10px;
      }

      .display_values {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        width: 90%;
      }

    }
  }

  .selector /deep/ {
    flex: 0 0 400px;
    width: 100%;
    input {
      width: 400px;
    }
  }

  .el-select-dropdown__item{
    max-width: 400px;
  }

</style>
