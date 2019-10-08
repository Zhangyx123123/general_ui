<template lang="html">
  <div id="trigger-page" class="page trigger-page">

    <div id="card-content" class="card">
      <div class="head">{{ $t('knowledge_graph.property_edit.property_list') }}</div>
      <div id="card-content-header">
        <search-input v-model="PropertyKeyword"></search-input>
        <div id="io-buttons">
          <div id="toolbar">
            <text-button v-if="canCreate && propertyType === 'common'" button-type="primary" @click="popAddProperty">{{
              $t('knowledge_graph.add_property')
              }}
            </text-button>
            <!--<input type="file" ref="fileChooser" id="fileChooser" style="display: none" accept=".xlsx" @change="validateFile"/>-->
            <!--<text-button v-if="canCreate" button-type="primary" @click="batchAddProperty">{{-->
            <!--$t('knowledge_graph.batch_add_property')-->
            <!--}}-->
            <!--</text-button>-->
            <text-button
              v-if="canDelete"
              @click="deleteMultiProperty"
              :button-type="this.checkedProperty.length === 0 ? 'disable' : 'error'">
              {{ $t('wordbank.delete') }}
            </text-button>
          </div>
        </div>
      </div>
      <div id="card-content-content">
        <general-table id="content-table"
                       :tableHeader="tableHeader" :tableData="tableData" :action="tableAction"
                       @checkedChange="handleCheckedChange" checkbox
                       showEmpty></general-table>
      </div>
      <div id="card-content-footer">
        <v-pagination size="small" :total="curTotal" :pageIndex="curPageIdx" :pageSize="pageLimit"
                      :layout="['prev', 'pager', 'next', 'jumper']" @page-change="handlePageChange"></v-pagination>
      </div>

      <div id="content-blocker" v-if="isEditMode"></div>
    </div>

  </div>
</template>

<script>
  import XLSX from 'xlsx';
  import NavBar from '@/components/NavigationBar';
  import { mapGetters, mapMutations } from 'vuex';
  import WordbankEditPop from './_components/AddPropertyPop';
  import CorpusDisplay from './_components/DisplayCorpusPop';
  import api from './_api/knowledgeGraph';


  export default {
    name: 'property-manage',
    path: 'property-manage-new',
    privCode: 'domain_kg',
    displayNameKey: 'property_manage',
    icon: 'white_task_engine',
    api,
    components: {
      NavBar,
    },
    data() {
      return {
        propertyMap: {
          common: `${this.$t('knowledge_graph.property_edit.custom')}`,
          special: `${this.$t('knowledge_graph.property_edit.standard')}`,
        },
        propertyType: 'common',
        Properties: [],
        filteredProperties: [],
        currentProperties: [],

        PropertyKeyword: '',
        tableHeader: [
          {
            key: 'property',
            text: this.$t('knowledge_graph.property_edit.property'),
            width: '400px',
          },
          {
            key: 'corpus',
            text: this.$t('knowledge_graph.property_edit.corpus'),
            width: '120px',
            type: 'click',
          },
          {
            key: 'synonym',
            text: this.$t('knowledge_graph.property_edit.synonyms'),
            type: 'tag',
          },
        ],
        tableAction: [],
        checkedProperty: [],

        curPageIdx: 1,
        pageLimit: 20,
      };
    },
    computed: {
      ...mapGetters([
        'wordbank',
        // 'currentCategory',
        'isEditMode',
        'robotID',
        'userID',
      ]),
      tableData() { // This is curPage
        // Handle empty data cause curPageIdx to zero;
        if (this.curPageIdx <= 0) {
          this.toFirstPage();
        }

        const startIdx = (this.curPageIdx - 1) * this.pageLimit;
        const endIdx = startIdx + this.pageLimit;
        return this.currentProperties.slice(startIdx, endIdx)
          .map((data) => {
            // // console.log(data);
            const tablerow = {
              id: data.id,
              property: data.name,
              corpus: {
                val: data.corpus[0] === null ? 0 : data.corpus.length,
                typeClass: 'primary',
                onclick: this.showCorrespondingCorpus,
              },
              synonym: data.synonym,
            };
            return tablerow;
          });
      },
      curTotal() {
        return this.currentProperties.length;
      },
      lastPageIdx() {
        return Math.floor((this.curTotal - 1) / this.pageLimit) + 1;
      },
      canCreate() {
        return this.$hasRight('create');
      },
      canDelete() {
        return this.$hasRight('delete');
      },
      canEdit() {
        return this.$hasRight('edit');
      },
    },
    watch: {

      propertyType() {
        this.getAllProperties();
        this.loadTableActionByPrivilege();
      },

      Properties() {
        this.PropertyKeyword = '';
        this.currentProperties = this.Properties;
        this.filteredProperties = [];
      },
      PropertyKeyword() {
        this.PropertyKeyword = this.PropertyKeyword.trim();
        this.currentProperties = this.Properties;
        const filterSet = this.currentProperties.map(prop => prop);
        if (this.PropertyKeyword !== '') {
          this.currentProperties = filterSet
            .filter(prop =>
              // // console.log(this.PropertyKeyword);
              // // console.log(prop.name.includes(this.PropertyKeyword));
              prop.name.includes(this.PropertyKeyword) === true);
        } else {
          this.currentProperties = this.Properties;
          this.filteredProperties = [];
        }
        this.toFirstPage();
      },
      lastPageIdx() {
        if (this.curPageIdx > this.lastPageIdx) {
          this.toCurPage(this.lastPageIdx);
        }
      },
    },
    methods: {
      ...mapMutations([
        'setWordbank',
        'setCurrentCategory',
        'setWordbankEditMode',
        'updateWordbankInCategory',
        // 'addWordbankToCategory',
        'deleteWordbankFromCategory',
      ]),

      batchAddProperty() {
        // this.getLatestStatus();
        //
        //
        // if (this.lastImportResult !== 'done' && this.lastImportResult !== 'nothing') {
        //   console.alert('训练正在进行，请稍后~');
        //   return;
        // }

        this.$refs.fileChooser.click();
      },

      validateFile() {
        let msg = '';

        const fileSizeLimit = 15 * 1024 * 1024;
        const theFile = this.$refs.fileChooser.files[0];
        this.fileValid = false;
        if (!theFile) {
          this.fileValid = false;
          msg = this.$t('wordbank.upload_file_undefined');
        } else if (theFile.size <= 0 || theFile.size > fileSizeLimit) {
          this.fileValid = false;
          msg = this.$t('wordbank.upload_file_size_error');
        } else {
          this.fileTypeInvalid(theFile).then((invalid) => {
            if (invalid) {
              this.fileValid = false;
              msg = this.$t('wordbank.upload_file_type_invalid');
            } else {
              this.fileValid = true;
              this.file = theFile;
              this.updateFilename();
            }
            if (this.fileValid) {
              this.uploadFile();
            } else {
              this.$message({
                showClose: true,
                message: msg,
                type: 'error',
              });
            }
          });
        }
      },

      fileTypeInvalid(file) {
        const promise = new Promise((resolve) => {
          const fileName = file.name;
          if (fileName.indexOf('.xlsx') === -1) {
            resolve(true);
          } else {
            const reader = new FileReader();
            reader.onload = (e) => {
              const data = new Uint8Array(e.target.result);
              const workbook = XLSX.read(data, { type: 'array' });
              if (!workbook.Workbook) {
                resolve(true);
              } else {
                resolve(false);
              }
            };
            reader.readAsArrayBuffer(file);
          }
        });
        return promise;
      },

      updateFilename(msg) {
        this.filename = msg || this.file.name;
      },

      uploadFile() {
        const that = this;
        console.log(this.file);

        that.$emit('startLoading');

        if (this.propertyType === 'special') {
          that.$api.batchUploadSpecialProperties(this.file, this.robotID, this.userID)
            .then((data) => {
              const res = data.data;
              if (res.status === 0) {
                that.$notify({ text: that.$t('wordbank.result.success') });
              }
            })
            .catch((err) => {
              if (err.response.status === 400) {
                that.$notifyFail(that.$t('wordbank.error.import_format_invalid'));
              } else {
                that.$notifyFail(that.$t('wordbank.result.fail'));
              }
            })
            .finally(() => {
              this.listenFlag = true;
              that.$refs.fileChooser.value = '';
              this.getAllProperties();
              that.$emit('endLoading');
            });
        } else {
          that.$api.batchUploadProperties(this.file, this.robotID, this.userID)
            .then((data) => {
              const res = data.data;
              if (res.status === 0) {
                that.$notify({ text: that.$t('wordbank.result.success') });
              }
            })
            .catch((err) => {
              if (err.response.status === 400) {
                that.$notifyFail(that.$t('wordbank.error.import_format_invalid'));
              } else {
                that.$notifyFail(that.$t('wordbank.result.fail'));
              }
            })
            .finally(() => {
              this.listenFlag = true;
              that.$refs.fileChooser.value = '';
              this.getAllProperties();
              that.$emit('endLoading');
            });
        }
      },

      handlePageChange(page) {
        if (page <= 0) {
          this.toFirstPage();
        } else {
          this.toCurPage(page);
        }
        this.checkedProperty = [];
      },
      // loadCurrentProperty() {
      //   if (!this.isEditMode) {
      //   }
      // },

      loadTableActionByPrivilege() {
        this.tableAction = [];
        if (this.canEdit) {
          this.tableAction.push({
            text: this.$t('wordbank.edit'),
            type: 'primary',
            onclick: this.editProperty,
          });
        }

        // else {
        //   this.tableAction.push({
        //     text: this.$t('wordbank.view'),
        //     type: 'primary',
        //     onclick: this.viewWordbank,
        //   });
        // }
        if (this.canDelete && this.propertyType === 'common') {
          this.tableAction.push({
            text: this.$t('wordbank.delete'),
            type: 'error',
            onclick: this.deleteProperty,
          });
        }
      },
      getPropertyById(id) {
        return this.currentProperties.filter(property => property.Id === id)[0];
      },
      showCorrespondingCorpus(corpus) {
        // console.log(corpus);
        this.$api.getPropertyById(this.robotID, corpus.id).then((res) => {
          const corpusList = res.data.property.corpus[0] === null ? [] : res.data.property.corpus;
          const options = {
            component: CorpusDisplay,
            title: this.$t('knowledge_graph.property_edit.corpus_display'),
            data: {
              corpusList,
            },
            validate: false,
            callback: {
              ok: () => {
              },
            },
          };
          this.$pop(options);
        });
      },

      editProperty(data) {
        console.log(data);
        let prop = {
          id: '',
          name: '',
          corpus: [],
          synonym: [],
        };
        const selectedProperty = this.currentProperties.filter(item => item.id === data.id);
        if (selectedProperty.length > 0) {
          prop = {
            id: selectedProperty[0].id,
            propertyName: selectedProperty[0].name,
            introduction: selectedProperty[0].introduction,
            corpusSet: selectedProperty[0].corpus,
            synonymSet: selectedProperty[0].synonym,
          };
        }
        this.popEditProperty(prop);
        // this.$api.getPropertyById(this.robotID, data.id)
        //   .then((property) => {
        //     prop = property.data.property;
        //     prop.id = data.id;
        //     if (prop.corpus[0] === null) {
        //       prop.corpus = [];
        //     }
        //     this.popEditProperty(prop);
        //   });
      },

      popEditProperty(property) {
        const options = {
          component: WordbankEditPop,
          title: this.$t('knowledge_graph.property_edit.property_edit'),
          extData: {
            editMode: true,
            property,
          },
          validate: true,
          callback: {
            ok: () => {
              // // console.log(editedProperty);
              // this.updateProperties(editedProperty);
              this.getAllProperties();
            },
          },
        };
        this.$pop(options);
      },

      updateProperties(editedProperty) {
        const param = {
          name: editedProperty.name,
          introduction: editedProperty.introduction,
          corpus: editedProperty.corpusSet,
          synonym: editedProperty.synonymSet,
        };

        this.$api.updateProperty(this.robotID, editedProperty.id, param).then(() => {
          this.getAllProperties();
        });
      },

      isWordbankSensitive() {  // By recursive through sensitive category
        const isIn = false;
        return isIn;
      },

      handleCheckedChange(checked) {
        this.checkedProperty = checked;
      },

      deleteProperty(data) {
        // console.log(data);
        const option = {
          data: {
            msg: this.$t('knowledge_graph.property_edit.delete_property_msg', { name: data.property }),
          },
          callback: {
            ok: () => {
              this.confirmDeleteProperty(data.id);
            },
          },
        };
        this.$popCheck(option);
      },
      popAddProperty() {
        const propertyProp = {
          Id: undefined,
          appid: this.robotID,
          introduction: null,
          synonymSet: [],
          corpusSet: [],
          propertyName: '',
        };
        const options = {
          component: WordbankEditPop,
          title: this.$t('knowledge_graph.add_property'),
          extData: {
            editMode: false,
            property: propertyProp,
          },
          // disable_ok: true,
          validate: true,
          callback: {
            ok: () => {
              // console.log(newProperty);
              // this.addNewProperty(newProperty);
              this.getAllProperties();
            },
          },
        };
        this.$pop(options);
      },

      addNewProperty(newProperty) {
        const param = {

          name: newProperty.name,
          introduction: newProperty.introduction,
          corpus: newProperty.corpusSet,
          synonym: newProperty.synonymSet,
        };

        this.$api.createProperty(this.robotID, param)
          .then(() => {
            this.getAllProperties();
          })
          .catch((error) => {
            if (error.response.status === 400 && error.response.data.propertyRepeat) {
              this.$message({
                showClose: true,
                message: this.$t('knowledge_graph.property_edit.err_msg_duplicated_property'),
                type: 'error',
              });
            }
          });
      },

      confirmDeleteProperty(id) {
        this.$api.deletePropertyUnderRobot(this.robotID, id)
          .then(() => {
            this.getAllProperties();
          })
          .catch(() => {
            // // console.log(err);
            this.$notifyFail(this.$t('wordbank.error.delete_wordbank_fail'));
          });
      },
      deleteMultiProperty() {
        if (this.checkedProperty.length === 0) {
          return;
        }
        const option = {
          data: {
            msg: this.$t('knowledge_graph.property_edit.delete_multi_wordbank_msg'),
          },
          callback: {
            ok: () => {
              this.checkedProperty.forEach((bank) => {
                this.confirmDeleteProperty(bank.id);
              });
              this.checkedProperty = [];
            },
          },
        };
        this.$popCheck(option);
      },
      getAllProperties() {
        this.$api.getPropertiesOfRobot(this.robotID)
          .then((result) => {
            // console.log(result);
            let props = [];
            if (this.propertyType === 'common') {
              props = result.data.properties.filter(filterData => filterData.type === 'common');
            } else {
              props = result.data.properties.filter(filterData => filterData.type !== 'common');
            }
            const apiBatch = props.map(prop => new Promise((resolve) => {
              prop.corpus = [];
              this.$api.getPropertyById(this.robotID, prop.id).then((curposRet) => {
                prop.corpus = curposRet.data.property.corpus;
                prop.synonym = curposRet.data.property.synonym;
                prop.introduction = curposRet.data.property.introduction;
                resolve();
              });
            }));

            Promise.all(apiBatch).then(() => {
              this.currentProperties = props;
              this.Properties = this.currentProperties;
            });
          });
      },

      toFirstPage() {
        this.curPageIdx = 1;
        // const elem = this.$refs.synonymList;
        // elem.scrollTop = 0;
      },
      toCurPage(page) {
        this.curPageIdx = page;
        // const elem = this.$refs.synonymList;
        // elem.scrollTop = 0;
      },
    },
    beforeMount() {

    },
    mounted() {
      this.getAllProperties();
      this.loadTableActionByPrivilege();
      // this.currentProperties = this.Properties;
      this.checkedProperty = [];
    },
  };
</script>

<style lang="scss" scoped>
  @import '../../assets/styles/variable';

  #trigger-page {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    padding: 20px;
    background: #f8f8f8;
    .add-trigger-container {
      flex: 0 0 auto;
      padding: 10px;
      height: 86px;
      background: #f8f8f8;
      border-radius: 4px;
      .row {
        display: flex;
        flex-direction: row;
        .label-add-trigger {
          color: $color-font-active;
          line-height: 28px;
          font-size: 14px;
        }
        .icon-container {
          margin-left: 4px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .select-add-trigger {
          height: 28px;
          background: #ffffff;
        }
        .button-add-trigger {
          margin-left: 10px;
        }
      }
      .row-margin-top {
        margin-top: 10px;
      }
    }
    .intent-list {
      padding-top: 25px;
    }
  }

  .head {
    @include font-16px();
    padding: 0px 20px;
    color: $color-font-active;
    flex: 0 0 60px;
    border-bottom: 1px solid $color-borderline;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav {
    flex: 0 0 auto;
    margin-bottom: 10px;
    display: flex;
    // padding-right: 20px;
    // justify-content: space-between;
    box-shadow: inset 0 -1px 0 0 #e9e9e9;
  }

  #card-content {
    position: relative;
    display: flex;
    flex-direction: column;
    #card-content-header {
      flex: 0 0 60px;
      padding: 0 20px;
      border-bottom: 1px solid $color-borderline;
      display: flex;
      align-items: center;
      justify-content: space-between;
      #card-content-title {
        @include font-16px();
        color: $color-font-active;
      }
      #io-buttons {
        display: flex;
        justify-content: space-between;
        .text-button {
          margin: 0 5px;
        }
        :last-child {
          margin-right: 0px;
        }
      }
    }
    #card-content-content {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      #toolbar {
        flex: 0 0 auto;
        margin: 10px 20px;
        display: flex;
        .text-button {
          margin: 0 5px;
        }
        :first-child {
          margin-left: 0px;
        }
      }

      #content-table {
        overflow: hidden;
      }
    }
    #card-content-footer {
      border-top: 1px solid $color-borderline;
      flex: 0 0 50px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    #content-blocker {
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.55);
    }
  }

</style>
