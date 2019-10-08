<template>
  <div id="robot-profile">
    <div style="height: 100%;" class="card w-fill h-fill">
      <!--<div class="header">-->
        <!--<nav-bar :options="propertyMap" v-model="propertyType"/>-->

      <!--</div>-->

      <!--<template v-if=!isGraph>-->
        <div class="list_layout">
          <div class="categories">
            <CategorySelector
              ref="CategorySelector"
              :entityData=KGEntities
              :propertyTypes=KGPropertyDropList
              :rootNodeList=categoryData
              @selectNode="selectNode"
            >
            </CategorySelector>
          </div>
          <div class="entity_list">
            <div class="head">{{ $t('knowledge_graph.entity_edit.entity_list') }}</div>
            <div id="card-content-header">
              <!--<div id="card-content-title">{{ this.categoryName }}</div>-->
              <div id="io-buttons">
                <search-input v-model="EntityKeyword"></search-input>
                <!-- <text-button>{{ $t('wordbank.batch_import') }}</text-button> -->
                <!--<text-button v-if="canExport" @click="exportWordbank">{{ $t('wordbank.export_all') }}</text-button>-->
              </div>
              <div id="toolbar">
                <text-button v-if="canCreate" button-type="primary" @click="popAddEntity">{{
                  $t('knowledge_graph.entity_edit.add_entity')
                  }}
                </text-button>
                <input type="file" ref="entityFileChooser" id="entityFileChooser" style="display: none" accept=".xlsx"
                       @change="valiEntityFile"/>
                <!--<text-button button-type="primary" @click="batchAddEntity">{{-->
                <!--$t('knowledge_graph.entity_edit.batch_add_entity')-->
                <!--}}-->
                <!--</text-button>-->
              </div>
            </div>
            <div id="card-content-content">

              <div class="qa-list">
                <div class="empty-entity" v-if="displayEntities.length === 0">
                  {{ $t('knowledge_graph.entity_edit.no_entity') }}
                </div>
                <div v-else v-for="(entity, idx) in displayEntities" :key="idx"
                     class="qa" :class="[entity.expand ? 'expand' : '']">
                  <template v-if="!entity.expand">
                    <div class="robot-q row">
                      <!--<icon :size=24 icon-type="profile_question"/>-->
                      <div class="content list-content">{{ entity.entityName }}</div>
                      <div class="command" v-if="canEdit">
                        <div class="clickable edit"
                             @click="popDisplayEntity(entity)">{{ $t('general.browse') }}
                        </div>
                        <div class="clickable edit" v-if="canEditIt"
                             @click="popEditEntity(entity)">{{ $t('general.edit') }}
                        </div>
                        <div class="clickable delete" v-if="canDelete"
                             @click="deleteEntity(entity)">{{ $t('general.delete') }}
                        </div>
                      </div>
                    </div>
                  </template>
                </div>

              </div>
              <div id="card-content-footer">
                <v-pagination size="small" :total="curTotal" :pageIndex="curPageIdx" :pageSize="pageLimit"
                              :layout="['prev', 'pager', 'next', 'jumper']"
                              @page-change="handlePageChange"></v-pagination>
              </div>
            </div>
          </div>

        </div>
    </div>
  </div>
</template>
<script>
  // import d3 from d3;
  import XLSX from 'xlsx';
  import NavBar from '@/components/NavigationBar';
  import { mapGetters } from 'vuex';
  import AddEntityPop from './_components/AddEntityPop';
  import api from './_api/knowledgeGraph';
  import Header from '../../components/layout/Header';
  import CorpusDisplay from './_components/DisplayCorpusPop';
  import CategorySelector from './_components/CategorySelector';

  export default {
    path: 'relation-manage-new',
    privCode: 'domain_kg',
    displayNameKey: 'relation_manage',
    icon: 'white_folder',
    api,
    components: {
      CategorySelector,
      Header,
      NavBar,
      AddEntityPop,
      // RelationGraph,
      CorpusDisplay,
    },
    data() {
      return {
        categoryData: [],
        curPageIdx: 1,
        pageLimit: 10,
        propertyMap: {
          graph: `${this.$t('knowledge_graph.entity_edit.graph_mode')}`,
          table: `${this.$t('knowledge_graph.entity_edit.list_mode')}`,
        },

        tableHeders: [
          { prop: 'name', label: this.$t('knowledge_graph.property_edit.property_name') },
          { prop: 'corpus_common', label: this.$t('knowledge_graph.entity_edit.corpus_common') },
          { prop: 'corpus_spec', label: this.$t('knowledge_graph.entity_edit.corpus_spec') },
          { prop: 'displayValue', label: this.$t('knowledge_graph.entity_edit.value') },
          { prop: 'singleSpeech', label: this.$t('knowledge_graph.entity_edit.single_speech') },
        ],

        propertyType: 'graph',
        KGEntities: [],
        currentKGEntities: [],
        canEdit: true,
        isGraph: true,
        graphGenerator: null,
        KGEntityDropList: [],
        KGPropertyDropList: [],
        // PropertyDropList: [],
        EntityKeyword: '',
        fileName: '',
        displayEntities: [],
        categoryEntities: [],
        currentCategory: '',
      };
    },
    computed: {
      ...mapGetters([
        'robotID',
        'userID',
        'userInfo',
      ]),
      curTotal() {
        return this.currentKGEntities.length;
      },
      canCreate() {
        return this.$hasRight('create');
      },
      canDelete() {
        return this.$hasRight('delete');
      },
      canEditIt() {
        return this.$hasRight('edit');
      },
      canExport() {
        return this.$hasRight('export');
      },
    },
    watch: {
      propertyType() {
        if (this.propertyType === 'graph') {
          this.isGraph = true;
          // this.generateGraph();
        } else {
          this.isGraph = false;
        }
      },

      curPageIdx() {
        this.refreshKGEntities();
      },

      EntityKeyword() {
        this.EntityKeyword = this.EntityKeyword.trim();
        let filterSet = '';
        if (this.categoryEntities.length === 0) {
          filterSet = this.KGEntities.map(prop => prop);
        } else {
          filterSet = this.categoryEntities.map(prop => prop);
        }
        if (this.EntityKeyword !== '') {
          this.currentKGEntities = filterSet
            .filter(prop =>
              prop.entityName.includes(this.EntityKeyword) === true);
          // this.KGEntities = this.currentKGEntities;
          const exactEntity = this.currentKGEntities
            .filter(item => item.entityName.toLowerCase() === this.EntityKeyword.toLowerCase())[0];
          if (exactEntity !== undefined) {
            const exactIndex = this.currentKGEntities.indexOf(exactEntity);
            this.currentKGEntities.splice(exactIndex, 1);
            this.currentKGEntities.splice(0, 0, exactEntity);
          }
        } else {
          this.currentKGEntities = filterSet;
        }
        if (this.curPageIdx !== 1) {
          this.toFirstPage();
        } else {
          this.refreshKGEntities();
        }
      },
    },
    methods: {

      selectNode(selectedNode) {
        const filterSet = this.KGEntities.map(prop => prop);
        console.log(selectedNode);

        if (selectedNode.length > 0) {
          this.currentCategory = filterSet.filter(prop => selectedNode[0] === prop.entityName)[0];
          this.currentKGEntities = filterSet
            .filter(prop => selectedNode.indexOf(prop.entityName) > -1);
          // this.KGEntities = this.currentKGEntities;
        } else if (selectedNode.length === 0) {
          this.currentCategory = '';
          this.currentKGEntities = this.KGEntities;
        }
        this.categoryEntities = this.currentKGEntities;
        if (this.curPageIdx !== 1) {
          this.toFirstPage();
        } else {
          this.refreshKGEntities();
        }
      },

      popDisplayEntity(entity) {
        const that = this;

        this.getEntityDetail(entity)
          .then(() => {
            const options = {
              component: AddEntityPop,
              title: that.$t('knowledge_graph.entity_edit.display_entity'),
              validate: true,
              // left_button: {
              //   type: 'fill',
              //   msg: that.$t('review.review'),
              //   closeAfterClick: false,
              //   callback: () => {
              //     reviewApi.getReview(this.userInfo.display_name, entity.id, 0).then(
              //       (res) => {
              //         const resData = res.data;
              //         let status;
              //         let comment = '';
              //         let id;
              //         if (resData.status === 'success') {
              //           status = 0;
              //           comment = resData.data.comment;
              //           id = resData.data.id;
              //         } else {
              //           status = -1;
              //         }
              //         this.$pop({
              //           title: this.$t('review.add'),
              //           component: ReviewInput,
              //           clickOutsideClose: true,
              //           data: comment,
              //           extData: {
              //             type: 0,
              //             target: entity.entityName,
              //             target_id: entity.id,
              //             reviewer: this.userInfo.display_name,
              //             status,
              //             comment,
              //             id,
              //           },
              //           bindValue: true,
              //           validate: true,
              //           callback: {
              //             ok: () => {
              //               this.$notify({
              //                 text: this.$t('review.add_success'),
              //               });
              //             },
              //           },
              //         });
              //       });
              //   },
              // },
              extData: {
                editMode: false,
                KGEntityDropList: this.KGEntityDropList,
                KGPropertyDropList: this.containProperty(entity.properties),
                // PropertyDropList: this.containProperty(entity.properties),
                entityData: {
                  entityName: entity.entityName,
                  id: entity.id,
                  type: 'entity',
                  synonym: entity.synonym,
                  properties: entity.properties.map(item => ({
                    id: `${item.id}+${Math.random()}`,
                    property: item.id,
                    entity: item.value,
                    propertyId: item.id,
                    propertyName: this.getPropertyName(item.name),
                    selectedHProperty: this.getInheritedProperties(item),
                    propertyType: item.propertyType,
                    unit: item.unit,
                    propertyValue: this.getDisplayValue(item),
                    singleSpeech: item.singleSpeech,
                  })),
                },
              },
              callback: {
                ok(res) {
                  console.log(res);
                  // that.$api.updateEntityUnderRobot(that.robotID, entity.id, res.entityInfo)
                  //   .then(() => {
                  //     that.refreshKGEntityList();
                  //   });
                },
              },
            };
            this.$pop(options);
          });
      },

      batchAddEntity() {
        this.$refs.entityFileChooser.click();
      },

      valiEntityFile() {
        const fileSizeLimit = 150 * 1024 * 1024;
        const theFile = this.$refs.entityFileChooser.files[0];
        this.fileValid = false;
        if (!theFile) {
          this.fileValid = false;
          this.updateFilename(this.$t('wordbank.upload_file_undefined'));
        } else if (theFile.size <= 0 || theFile.size > fileSizeLimit) {
          this.fileValid = false;
          this.updateFilename(this.$t('wordbank.upload_file_size_error'));
        } else {
          this.fileTypeInvalid(theFile).then((invalid) => {
            if (invalid) {
              this.fileValid = false;
              this.updateFilename(this.$t('wordbank.upload_file_type_invalid'));
            } else {
              this.fileValid = true;
              this.file = theFile;
              this.updateFilename();
            }
            if (this.fileValid) {
              this.uploadEntityFile();
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

      validateRelateionFile() {
        const fileSizeLimit = 150 * 1024 * 1024;
        const theFile = this.$refs.relateionFileChooser.files[0];
        if (!theFile) {
          this.fileValid = false;
          this.updateFilename(this.$t('wordbank.upload_file_undefined'));
        } else if (theFile.size <= 0 || theFile.size > fileSizeLimit) {
          this.fileValid = false;
          this.updateFilename(this.$t('wordbank.upload_file_size_error'));
        } else if (this.fileTypeInvalid(theFile)) {
          this.fileValid = false;
          this.updateFilename(this.$t('wordbank.upload_file_type_invalid'));
        } else {
          this.fileValid = true;
          this.file = theFile;
          this.updateFilename();
        }

        if (this.fileValid) {
          this.uploadRelationFile();
        }
      },

      uploadRelationFile() {
        const that = this;
        // console.log(this.file);

        that.$emit('startLoading');
        that.$api.batchUploadEntities(this.file, this.robotID, this.userID)
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
            // this.listenFlag = true;
            that.$refs.entityFileChooser.value = '';
            that.$emit('endLoading');
          });
      },

      updateFilename(msg) {
        this.filename = msg || this.file.name;
      },

      uploadEntityFile() {
        const that = this;
        // console.log(this.file);

        that.$emit('startLoading');
        that.$api.batchUploadEntities(this.file, this.robotID, this.userID)
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
            // this.listenFlag = true;
            that.$refs.entityFileChooser.value = '';
            this.refreshKGEntityList();
            that.$emit('endLoading');
          });
      },


      refreshKGEntities() { // This is curPage
        // Handle empty data cause curPageIdx to zero;
        if (this.curPageIdx <= 0) {
          this.toFirstPage();
        }

        const startIdx = (this.curPageIdx - 1) * this.pageLimit;
        const endIdx = startIdx + this.pageLimit;
        this.displayEntities = this.currentKGEntities.slice(startIdx, endIdx)
          .map(data => data);
      },


      handlePageChange(page) {
        if (page <= 0) {
          this.toFirstPage();
        } else {
          this.toCurPage(page);
        }
        // this.tableData();
      },

      toFirstPage() {
        this.curPageIdx = 1;
      },
      toCurPage(page) {
        this.curPageIdx = page;
      },

      getRootEntities() {
        return this.$api.getRootNodes(this.robotID)
          .then((res) => {
            let rootNodeList = res.data.root.map((item => item.id));
            rootNodeList = this.KGEntities
              .filter(item => rootNodeList.indexOf(item.id) > -1)
              .map(item => ({ name: item.entityName, entityId: item.id }));
            this.categoryData = [];
            this.categoryData.push(...rootNodeList);
            return new Promise((resolve) => {
              resolve();
            });
          });
      },

      deleteEntity(entity) {
        const option = {
          data: {
            msg: this.$t('knowledge_graph.entity_edit.delete_entity', { name: entity.entityName }),
          },
          callback: {
            ok: () => {
              this.$api.deleteEntityUnderRobot(this.robotID, entity.id)
                .then(() => {
                  this.$refs.CategorySelector.renderTree();
                  this.refreshKGEntityList();
                });
            },
          },
        };
        this.$popCheck(option);
      },

      refreshKGEntityList() {
        this.EntityKeyword = this.EntityKeyword.trim();
        this.getAllEntities()
          .then(() => {
            this.KGEntityDropList = this.KGEntities.map(entity => ({
              text: entity.entityName,
              value: entity.id,
            }));
            if (this.EntityKeyword !== '') {
              let filterSet = '';
              if (this.categoryEntities === []) {
                filterSet = this.KGEntities.map(prop => prop);
              } else {
                filterSet = this.categoryEntities.map(prop => prop);
              }
              this.currentKGEntities = filterSet
                .filter(prop =>
                  prop.entityName.includes(this.EntityKeyword) === true);
              const exactEntity = this.currentKGEntities
                .filter(item => item.entityName === this.EntityKeyword)[0];
              if (exactEntity !== undefined) {
                const exactIndex = this.currentKGEntities.indexOf(exactEntity);
                this.currentKGEntities.splice(exactIndex, 1);
                this.currentKGEntities.splice(0, 0, exactEntity);
              }
            } else {
              this.currentKGEntities = this.KGEntities;
            }
            this.refreshKGEntities();
            return new Promise((resolve) => {
              resolve();
            });
          })
          .then(() => {
            this.generatePropertyDropList();
          })
          .then(() => {
            this.getRootEntities();
          });
      },


      getAllEntities() {
        return this.$api.getAllEntitiesByrobotId(this.robotID)
          .then((result) => {
            console.log(result.data.entities);
            if (result.data.entities !== null) {
              this.KGEntities = result.data.entities.map(entity => ({
                expand: false,
                id: entity.id,
                entityName: entity.name,
                properties: [],
                synonym: [],
              }));
            }
            return new Promise((resolve) => {
              resolve();
            });
          });
      },

      containProperty(propertyList) {
        const resultList = this.KGPropertyDropList.map((item) => {
          if (propertyList.filter(pItem => pItem.id === item.value).length > 0
          ) {
            console.log(item.value);
            if (item.type === 'belongs_to') {
              item.disabled = true;
            }
          } else {
            item.disabled = false;
          }
          return item;
        });
        return resultList;
      },

      getPropertyName(propertyId) {
        return this.KGPropertyDropList
          .filter(item => item.value === parseInt(propertyId, 10))[0].text;
      },

      getDisplayValue(item) {
        console.log(item);
        if (item.propertyType === 'entity') {
          return item.displayValue
            .map(entity => this.KGEntityDropList
              .filter(drop => drop.value.toString() === entity.toString())[0].text);
        }
        return item.displayValue;
      },

      getInheritedProperties(item) {
        let result = [];

        if (item.isInherit === false) {
          result = [];
        } else {
          result = item.propertyInheritInfo.inheritedPropertyId.map(i => parseInt(i, 10));
        }

        return result;
      },

      isEditable(item) {
        const type = this.KGPropertyDropList
          .filter(prop => prop.value === parseInt(item.id, 10))[0].type;
        return type === 'belongs_to' || type === 'has_a';
      },


      popEditEntity(entity) {
        const that = this;

        this.getEntityDetail(entity)
          .then(() => {
            console.log(entity);
            const options = {
              component: AddEntityPop,
              title: that.$t('knowledge_graph.entity_edit.edit_entity'),
              validate: true,
              extData: {
                editMode: true,
                KGEntityDropList: this.KGEntityDropList,
                KGPropertyDropList: this.containProperty(entity.properties),
                entityData: {
                  entityName: entity.entityName,
                  id: entity.id,
                  type: 'entity',
                  synonym: entity.synonym,
                  introduction: entity.introduction,
                  properties: entity.properties.map((item) => {
                    console.log(item);

                    const newObj = {
                      id: `${item.id}+${Math.random()}`,
                      property: parseInt(item.id, 10),
                      selectedHProperty: this.getInheritedProperties(item),
                      propertyId: parseInt(item.id, 10),
                      propertyName: this.getPropertyName(item.name),
                      propertyType: item.propertyType,
                      unit: item.unit,
                      propertyValue: item.displayValue,
                      relationType: item.relationType,
                      singleSpeech: item.singleSpeech,
                      canEdit: this.isEditable(item),
                    };

                    newObj.entity = item.value.map(i => i);

                    console.log(newObj);

                    return newObj;
                  }),
                },
              },
              callback: {
                ok(res) {
                  console.log(res);
                  // // that.$api.updateEntityUnderRobot(that.robotID, entity.id, res.entityInfo)
                  // //   .then(() => {
                  that.$refs.CategorySelector.renderTree();
                  that.refreshKGEntityList();
                  // })
                  // .catch((err) => {
                  //   console.log(err);
                  //   this.$message({
                  //     showClose: true,
                  //     message: err.response.data.message,
                  //     type: 'error',
                  //   });
                  // });
                },
              },
            };

            console.log(options);
            this.$pop(options);
          });
      },

      popAddEntity() {
        const that = this;
        const defaultProperties = [];
        if (this.currentCategory !== '') {
          const belongsToProperty = this.KGPropertyDropList.filter(item => item.type === 'belongs_to')[0];
          const defaultProperty = {
            id: `${belongsToProperty.value}+${Math.random()}`,
            property: belongsToProperty.value,
            entity: [this.currentCategory.id],
            selectedHProperty: [],
            propertyName: belongsToProperty.text,
            propertyType: 'entity',
            propertyValue: [this.currentCategory.id],
            relationType: 'entityNormal',
            singleSpeech: null,
            unit: null,
          };
          defaultProperties.push(defaultProperty);
        }


        const options = {
          component: AddEntityPop,
          title: that.$t('knowledge_graph.entity_edit.add_entity'),
          validate: true,
          extData: {
            entityData: {
              entityName: '',
              synonym: [],
              properties: [...defaultProperties],
            },
            editMode: true,
            KGEntityDropList: this.KGEntityDropList,
            KGPropertyDropList: this.KGPropertyDropList.map((item) => {
              item.disabled = false;
              return item;
            }),
          },
          callback: {
            ok: (res) => {
              console.log(res);
              // this.$api.addEntityUnderRobot(this.robotID, res.entityInfo)
              //   .then(() => {
              this.$refs.CategorySelector.renderTree();
              this.refreshKGEntityList();
              // })
              // .catch((err) => {
              //   console.log(err);
              //   this.$message({
              //     showClose: true,
              //     message: err.response.data.message,
              //     type: 'error',
              //   });
              // });
            },
          },
        };
        this.$pop(options);
      },

      getEntityDetail(entity) {
        // const entityIndex = this.currentKGEntities.indexOf(entity);
        return this.$api.getEntityByEntityId(this.robotID, entity.id)
          .then((result) => {
            entity.properties = result.data.entity.properties.map(prop => ({
              // corpus_spec: 0,
              id: prop.propertyId,
              name: prop.propertyId,
              displayValue: prop.entity === null ? '' : prop.entity,
              value: prop.entity === null ? '' : prop.entity,
              propertyType: prop.entityType,
              unit: prop.unit === null ? '' : prop.unit,
              singleSpeech: prop.speech,
              relationType: prop.relationType,
              isInherit: prop.isInherit,
              propertyInheritInfo: prop.propertyInheritInfo,
            }));
            entity.introduction = result.data.entity.introduction;
            entity.synonym = result.data.entity.synonym;
            // entity.synonymNum = result.data.entity.synonym.length;

            return new Promise((resolve) => {
              resolve();
            });
          });
      },
      closeEntity(e, entity) {
        e.stopPropagation();
        entity.expand = false;
        this.$forceUpdate();
      },

      showLog() {
        console.alert('a');
      },

      startLoading() {
        this.$emit('startLoading');
      },

      endLoading() {
        this.$emit('endLoading');
      },

      generatePropertyDropList() {
        return this.$api.getPropertiesOfRobot(this.robotID)
          .then((result) => {
            this.KGPropertyDropList = result.data.properties
              .filter(item => ['is_a', 'what_is'].indexOf(item.type) < 0)
              .map(prop => ({
                type: prop.type,
                text: prop.name,
                value: parseInt(prop.id, 10),
              }));
            return new Promise((resolve) => {
              resolve();
            });
          });
      },
    },


    beforeMount() {
      // this.$emit('startLoading');
      this.refreshKGEntityList();
    },
    beforeDestroy() {
    },

  };
</script>
<style lang="scss" scoped>
  @import '../../assets/styles/variable';

  $header-height: 60px;
  $header-font-size: 16px;
  $header-color: #333333;

  .list_layout {
    flex: 1;
    display: flex;
    flex-direction: row;
    .categories {
      width: 20%;
    }
    .entity_list {
      padding: 10px;
      width: 80%;
      display: flex;
      flex-direction: column;
      .head {
        @include font-16px();
        color: $color-font-active;
        flex: 0 0 60px;
        border-bottom: 1px solid $color-borderline;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  }

  thead {
    background: #f7f7f7;
  }

  tr {
    /*display: flex;*/
    /*width: inherit;*/
    overflow: hidden;
    border-bottom: 1px solid;
    border-bottom-color: #f7f7f7;
  }

  td {
    padding: 15px 10px;
  }

  @mixin card-header() {
    position: relative;
    .robot-q {
      flex: 0 0 calc(50% - 30px);
      flex-basis: calc(50% - 30px);
      &:first-child {
        margin-right: 60px;
      }
    }
    .robot-a {
      flex: 1;
      input {
        margin-left: 10px;
        margin-right: 80px;
        flex: 1;
      }
      span {
        margin-left: 10px;
        margin-right: 80px;
      }
    }
    .close-button {
      position: absolute;
      right: 16px;
    }
  }

  .synonym-list {
    display: flex;
    flex-direction: row;
  }

  .synonym {
    margin: 0px 10px;
    padding: 0px 10px;
    background: rgba(115, 115, 115, 0.2);
  }

  @mixin card-content() {
    flex: 0 0 auto;

    display: flex;
    align-items: flex-start;
    .column {
      &.robot-q {
        flex: 0 0 calc(100% - 20px);
        flex-basis: calc(100% - 20px);
      }
      &.robot-a {
        flex: 0 0 calc(100% - 30px);
        flex-basis: calc(100% - 30px);
      }
      height: auto;
      &:first-child {
        margin-right: 50px;
      }
      .title {
        color: $color-font-active;
      }
      .list {
        margin-top: 10px;
        padding-left: 10px;
        border-left: solid 3px rgba(74, 144, 226, 0.24);
        height: auto;

        display: flex;
        flex-direction: column;
        .list-row {
          flex: 0 0 auto;

          display: flex;
          align-items: center;
          &.add-row {
            input {
              flex: 1;
              margin-right: 10px;
            }
          }
          &:not(.add-row):not(.edit-row) {
            padding: 4px 10px;
          }
          &:not(.add-row):not(.edit-row):hover {
            background-color: #f7f7f7;
          }
          &:not(:last-child) {
            margin-bottom: 10px;
          }

          .edit-input {
            flex: 1;
          }
        }
      }
    }
  }

  .list-content {
    flex: 1;
  }

  .command {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    .clickable {
      @include click-button();
    }
    .edit {
      color: $color-primary;
      margin-left: 10px;
    }
    .delete {
      color: $color-error;
      margin-left: 10px;
    }
  }

  .right-justify {
    justify-content: flex-end;
  }

  .card {
    height: 100%;
    overflow-y: auto;
    padding-bottom: 10px;
    box-sizing: border-box;
    line-height: $default-line-height;

    display: flex;
    flex-direction: column;
    // page header

    & > .header {
      font-size: $header-font-size;
      color: $header-color;
      flex: 0 0 $header-height;
      display: flex;
      align-items: center;
      padding: 0 20px;
      box-shadow: inset 0 -1px 0 0 #e9e9e9;
    }

    // card list css
    .qa-list {
      flex: 1;
      padding: 20px;
      padding-right: 0;
      max-height: 70vh;
      overflow-y: scroll;
      @include auto-overflow();
      @include customScrollbar();

      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;

      .empty-entity {
        text-align: center;
        width: 100%;
        font-size: 16px;
      }

      // every single card
      .qa {
        flex: 0 0 calc(100% - 20px);
        flex-basis: calc(100% - 20px);
        max-width: calc(100% - 20px);
        margin-bottom: 20px;
        padding: 20px;
        margin-right: 20px;
        transition: all .5s ease-in-out;
        height: 90px;

        // expand will set width to 100% and use animate
        &.expand {
          flex: 0 0 calc(100% - 20px);
          flex-basis: calc(100% - 20px);
          height: auto;
          box-shadow: 0 4px 9px 0 rgba(115, 115, 115, 0.2), 0 5px 8px 0 rgba(228, 228, 228, 0.5);
        }
        &:hover {
          box-shadow: 0 4px 9px 0 rgba(115, 115, 115, 0.2), 0 5px 8px 0 rgba(228, 228, 228, 0.5);
        }
        //@include click-button();

        background-color: #ffffff;
        border: solid 1px #dbdbdb;
        display: flex;
        flex-direction: column;
        .row {
          @include font-14px();
          display: flex;
          align-items: center;
          overflow: hidden;
          text-overflow: ellipsis;
          .content {
            margin-left: 15px;
            max-width: 80%;
            overflow:hidden;
            white-space:nowrap;
            text-overflow: ellipsis;
            &.empty {
              color: $color-font-disabled;
            }
          }
        }
        & > .row {
          &:not(:last-child) {
            margin-bottom: 15px;
          }
        }

        // after expand, use css below
        // first line in card
        .card-header {
          @include card-header();
        }

        // content part of card
        .card-content {
          @include card-content();
        }
      }
    }
    .footer {
      flex: 0 0 auto;
    }
  }

  #card-content-footer {
    border-top: 1px solid $color-borderline;
    flex: 0 0 50px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
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

  #card-content-header {
    flex: 0 0 60px;
    padding: 10px 20px;
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
</style>
