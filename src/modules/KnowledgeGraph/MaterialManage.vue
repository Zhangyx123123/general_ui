<template>
  <div id="material-manage">
    <div class="card content h-fill w-fill">
      <div class="row title">{{ $t('knowledge_graph.material_manage.title') }}
        <div class="sandbox_operation" v-if="sandboxSwitch">
<!--          <text-button button-type="primary" @click.stop="syncSandBox">{{-->
<!--            $t('knowledge_graph.material_manage.sandbox_release')-->
<!--            }}-->
<!--          </text-button>-->
<!--          <text-button button-type="fill" @click.stop="withdrawSandBox">{{-->
<!--            $t('knowledge_graph.material_manage.sandbox_sync')-->
<!--            }}-->
<!--          </text-button>-->
        </div>
      </div>
      <div class="box-card" v-if="canImport">
        <div class="head">{{ $t('knowledge_graph.material_manage.KG_build_title') }}</div>
        <div class="content">
          <div class="toolbar">
            <input type="file" ref="initKGfile" id="entityFileChooser" style="display: none" accept=".xlsx"
                   @change="validFile('init')"/>
            <text-button button-type="primary" @click.stop="initKG">{{
              $t('knowledge_graph.material_manage.build_KG')
              }}
            </text-button>
            <!--<text-button button-type="primary" @click.stop="exportKG">-->
              <!--{{ $t('knowledge_graph.material_manage.export_KG') }}-->
            <!--</text-button>-->
            <!--<a ref="exportKGLink"></a>-->
            <div class="status" v-if="isUploadFailed">
              <span class="clickable-link" @click="logExport()"> {{ $t('knowledge_graph.material_manage.err_log', { name: failFileName }) }}</span>
              <a ref="downloadLink"></a>
            </div>
            <div class="status" v-else>
              <span class="clickable-link" @click="downloadBatchUploadTemplate()"> {{ $t('knowledge_graph.material_manage.batch_upload_filename') }}</span>
              <a ref="templateDownloadLink"></a>
            </div>
          </div>
        </div>
      </div>
      <div class="box-card" v-if="canEdit">
        <div class="head">{{ $t('knowledge_graph.training.title') }}</div>
        <div class="content">
          <div class="toolbar">
            <text-button button-type="primary" @click="KGTraining">{{ $t('knowledge_graph.training.title') }}
            </text-button>
            <div class="status">
              <p>{{ lastImportResult }}</p>
              <i v-if="lastImportResult === 'training'" class="el-icon-loading process"></i>
              <i v-if="lastImportResult === 'done'" class="el-icon-success success"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="box-card">
        <div class="head">{{ $t('knowledge_graph.material_manage.KG_test') }}</div>
        <div class="content" v-if="canImport">
          <div class="toolbar">
            <input type="file" ref="testFileUploader" id="testFileChooser" style="display: none" accept=".xlsx"
                   @change="validFile('test')"/>
            <text-button button-type="primary" @click.stop="uploadTestFile">{{
              $t('knowledge_graph.material_manage.test_file_upload')
              }}
            </text-button>
            <div class="status" v-if="isTestCaseUploadFailed">
              <span class="clickable-link" @click="testCaseLogExport()"> {{ $t('knowledge_graph.material_manage.err_log', { name: testCaseFailFileName }) }}</span>
              <a ref="testCaseDownloadLink"></a>
            </div>
            <div class="status" v-else>
              <span class="clickable-link" @click="downloadTestTemplate()"> {{ $t('knowledge_graph.material_manage.batch_upload_test') }}</span>
              <a ref="testTemplateDownloadLink"></a>
            </div>
          </div>
        </div>
        <div style="flex: 1" class="content">
          <template>
            <operation-table
              :data="tableData"
              :col-configs="colConfigs"
              :sort="sort"
              :height="'48vh'"
            >
            </operation-table>
          </template>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
  import XLSX from 'xlsx';
  import { mapGetters } from 'vuex';
  import api from './_api/knowledgeGraph';
  import OperationTable from './_components/OperationTable';
  import AccuracyColumn from './_components/AccuracyColumn';
  import OperationColumn from './_components/OperationColumn';

  export default {
    name: 'material-manage',
    components: { OperationTable },
    path: 'material-manage-new',
    privCode: 'domain_kg',
    displayNameKey: 'material_manage',
    icon: 'white_task_engine',
    api,
    OperationTable,
    AccuracyColumn,

    data() {
      return {
        isUploadFailed: false,
        failFileName: '',
        isTestCaseUploadFailed: false,
        testCaseFailFileName: '',
        propertyNum: 0,
        entityNum: 0,
        taskId: 0,
        TestTaskId: 0,
        listenFlag: false,
        isLastResultSuccess: false,
        lastImportResult: '',
        lastTestImportResult: {
          result: '0',
          taskId: '',
          dataset: '',
        },
        isLastTestResultSuccess: false,
        testListenFlag: false,
        colConfigs: [
          { prop: 'dataset', label: this.$t('knowledge_graph.material_manage.dataSet'), sortable: true },
          { prop: 'task_id', label: this.$t('knowledge_graph.material_manage.taskId'), sortable: true },
          { prop: 'status', label: this.$t('knowledge_graph.material_manage.test_status') },
          { prop: 'result', label: this.$t('knowledge_graph.material_manage.accurate'), component: AccuracyColumn },
          // { prop: 'action', label: this.$t('general.actions'), slot: 'opt' },
          { prop: 'action', label: this.$t('general.actions'), component: OperationColumn },
        ],
        tableData: [],
        sort: { prop: 'dataset', order: 'descending' },
        sandboxSwitch: false,
      };
    },

    watch: {
      listenFlag() {
        if (this.listenFlag === true) {
          this.getStatus();
        }
      },

      testListenFlag() {
        if (this.testListenFlag === true) {
          this.getTestStatus();
        }
      },
    },

    computed: {
      ...mapGetters([
        'robotID',
      ]),
      canDelete() {
        return this.$hasRight('delete');
      },
      canEdit() {
        return this.$hasRight('edit');
      },
      canImport() {
        return this.$hasRight('import');
      },
    },

    methods: {

      syncSandBox() {
        this.$emit('startLoading');
        this.$api.SandboxSync(this.robotID).then(() => {
          this.$api.syncDataAfterTest(this.robotID);
          this.$message({
            showClose: true,
            message: this.$t('knowledge_graph.material_manage.sandbox_sync_msg'),
            type: 'success',
          });
          this.refreshSandBoxStatus();
          this.$emit('endLoading');
        });
      },

      withdrawSandBox() {
        this.$emit('startLoading');
        this.$api.SandboxWithdraw(this.robotID).then(() => {
          this.$message({
            showClose: true,
            message: this.$t('knowledge_graph.material_manage.sandbox_withdraw_msg'),
            type: 'success',
          });
          this.refreshSandBoxStatus();
          this.$emit('endLoading');
        });
      },

      downloadTestTemplate() {
        const that = this;
        this.$api.TestFileTemplate()
          .then((res) => {
            console.log(res);
            const errFile = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });

            window.URL = window.URL || window.webkitURL;
            that.$refs.testTemplateDownloadLink.href = URL.createObjectURL(errFile);
            that.$refs.testTemplateDownloadLink.download = `${this.$t('knowledge_graph.material_manage.batch_upload_test')}.xlsx`;
            // window.open(URL.createObjectURL(errFile), '_blank');

            that.$refs.testTemplateDownloadLink.click();
          });
      },


      downloadBatchUploadTemplate() {
        const that = this;
        this.$api.batchUploadTemplate()
          .then((res) => {
            console.log(res);
            const errFile = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });

            window.URL = window.URL || window.webkitURL;
            that.$refs.templateDownloadLink.href = URL.createObjectURL(errFile);
            that.$refs.templateDownloadLink.download = `${this.$t('knowledge_graph.material_manage.batch_upload_filename')}.xlsx`;
            // window.open(URL.createObjectURL(errFile), '_blank');

            that.$refs.templateDownloadLink.click();
          });
      },

      logExport() {
        const that = this;
        this.$api.getUploadFaliedInfo(this.robotID, this.failFileName)
          .then((res) => {
            console.log(res);
            const errFile = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });

            window.URL = window.URL || window.webkitURL;
            that.$refs.downloadLink.href = URL.createObjectURL(errFile);
            that.$refs.downloadLink.download = this.failFileName;
            // window.open(URL.createObjectURL(errFile), '_blank');

            that.$refs.downloadLink.click();
          });
      },
      testCaseLogExport() {
        const that = this;
        this.$api.getUploadFaliedInfo(this.robotID, this.testCaseFailFileName)
          .then((res) => {
            console.log(res);
            const errFile = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });

            window.URL = window.URL || window.webkitURL;
            that.$refs.testCaseDownloadLink.href = URL.createObjectURL(errFile);
            that.$refs.testCaseDownloadLink.download = this.testCaseFailFileName;
            // window.open(URL.createObjectURL(errFile), '_blank');

            that.$refs.testCaseDownloadLink.click();
          });
      },
      getAllExistingTestResult() {
        return this.$api.getAllTestInfo(this.robotID)
          .then((res) => {
            res.data.datasets.forEach((item) => {
              this.tableData = [...this.tableData, ...item.info];
            });
            this.tableData = this.tableData.map((item, idx) => {
              item.status = item.result !== '-1' ? 'finished' : 'processing';
              item.id = idx;
              return item;
            });

            return new Promise((resolve) => {
              resolve();
            });
          });
      },

      handleBrowse() {
        // console.log(data);
        // this.$api.getTestDetailInfo(data.taskId).then((res) => {
        //   const testResult = res.data.checkresults;
        // });
      },

      initCall(taskId) {
        return this.$api.checkTrainingStatus(this.robotID, taskId);
      },

      initTestCall() {
        return this.$api.getLastTestResultStatus(this.robotID, this.TestTaskId);
      },

      getLatestStatus(taskId) {
        this.$api.checkTrainingStatus(this.robotID, taskId)
          .then((data) => {
            this.lastImportResult = data.data.status;
          });
      },

      getLatestTestStatus() {
        this.$api.getLastTestResultStatus(this.robotID, this.TestTaskId)
          .then((res) => {
            this.lastTestImportResult = res.data;
          });
      },

      getStatus() {
        let timesRun = 0;
        this.initCall(this.taskId)
          .then((data) => {
            this.lastImportResult = data.data.status;
            if (this.lastImportResult !== 'done') {
              const interval = setInterval(() => {
                this.getLatestStatus(this.taskId);
                timesRun += 1;
                console.log(this.lastImportResult);
                if (this.lastImportResult === 'done' || timesRun === 1000) {
                  clearInterval(interval);
                  this.isLastResultSuccess = true;
                  this.listenFlag = false;
                  // this.$api.syncDataAfterTest(this.robotID);
                  this.$api.SandboxSync(this.robotID).then(() => {
                    this.$api.syncDataAfterTest(this.robotID);
                    // this.$message({
                    //   showClose: true,
                    //   message: this.$t('knowledge_graph.material_manage.sandbox_sync_msg'),
                    //   type: 'success',
                    // });
                    this.refreshSandBoxStatus();
                    // this.$emit('endLoading');
                  });
                  // this.refreshSandBoxStatus();
                }
              }, 2000);
            }
          });
      },

      getTestStatus() {
        let timesRun = 0;
        console.log(this.taskId);
        this.initTestCall()
          .then((data) => {
            this.lastTestImportResult = data.data;
            if (this.lastTestImportResult.result === '-1') {
              const testInterval = setInterval(() => {
                console.log(this.taskId);
                this.getLatestTestStatus();
                timesRun += 1;
                console.log(this.lastTestImportResult);
                if (this.lastTestImportResult.result !== '-1' || timesRun === 1000) {
                  clearInterval(testInterval);
                  this.isLastResultSuccess = true;
                  this.listenFlag = false;
                }
              }, 2000);
            }
          });
      },

      triggerKGTest() {
        let taskId = '';
        this.$api.triggerKGTesting(this.robotID, this.TestTaskId)
          .then((data) => {
            console.log(data);
            if (data.data.task_id !== '') {
              taskId = data.data.task_id;
              console.log(taskId);
              return this.$api.getLastTestResultStatus(this.robotID, taskId);
            }
            return new Promise((resolve) => {
              resolve();
            });
          })
          .then((result) => {
            console.log(result);
            if (result.data.result !== '-1') {
              this.lastTestImportResult = result.data;
            } else {
              this.TestTaskId = result.data.taskId;
              this.testListenFlag = true;
            }
          });
      },

      KGTraining() {
        let taskId = '';
        this.$api.triggerTraining(this.robotID)
          .then((data) => {
            console.log(data);
            if (data.data.status === 'success') {
              taskId = data.data.taskId;
              return this.$api.checkTrainingStatus(this.robotID, taskId);
            }
            return new Promise((resolve) => {
              resolve();
            });
          })
          .then((result) => {
            if (result.data.status === 'done') {
              this.lastImportResult = 'done';
            } else {
              this.listenFlag = true;
              this.taskId = taskId;
            }
          });
      },

      refreshSandBoxStatus() {
        this.$api.CheckSandbox(this.robotID).then((res) => {
          console.log(res);
          if (res.data.status === 'success') {
            if (res.data.hasModify !== '0') {
              this.sandboxSwitch = true;
            } else {
              this.sandboxSwitch = false;
            }
          }
        });
      },

      initKG() {
        const option = {
          data: {
            msg: this.$t('knowledge_graph.material_manage.batch_upload_tip'),
          },
          callback: {
            ok: () => {
              this.$refs.initKGfile.click();
            },
          },
        };
        this.$popCheck(option);
      },

      exportKG() {
        const that = this;
        this.$api.ExportKGFile(this.robotID)
          .then((res) => {
            console.log(res);
            return new Promise((resolve) => {
              resolve(res.data.filename);
            });
          }).then(fileName => this.$api.ExportByFileName(this.robotID, fileName).then((res) => {
            console.log(res);
            const errFile = new Blob([res.data], { type: 'application/vnd.ms-excel;charset=UTF-8' });

            window.URL = window.URL || window.webkitURL;
            that.$refs.exportKGLink.href = URL.createObjectURL(errFile);
            that.$refs.exportKGLink.download = fileName;
          // window.open(URL.createObjectURL(errFile), '_blank');

            that.$refs.exportKGLink.click();
          }));
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


      uploadTestFile() {
        this.$refs.testFileUploader.click();
      },

      validFile(param) {
        let msg = '';
        const fileSizeLimit = 15 * 1024 * 1024;
        this.fileValid = false;
        let theFile = '';
        if (param === 'init') {
          theFile = this.$refs.initKGfile.files[0];
        } else if (param === 'test') {
          theFile = this.$refs.testFileUploader.files[0];
        }

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
              switch (param) {
                case 'test':
                  this.submitTestFile();
                  break;
                case 'init':
                  this.initBuildKG();
                  break;
                default:
              }
              // this.uploadEntityFile();
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

      updateFilename(msg) {
        this.filename = msg || this.file.name;
      },

      initBuildKG() {
        const that = this;
        // console.log(this.file);
        this.isUploadFailed = false;
        that.$emit('startLoading');
        that.$api.initBuildKG(this.file, this.robotID, this.userID)
          .then((data) => {
            const res = data.data;
            if (res.status === 'success') {
              that.$message({
                showClose: true,
                message: this.$t('knowledge_graph.material_manage.batch_upload_success'),
                type: 'success',
              });
            }
          })
          .catch((err) => {
            const message = this.$t('knowledge_graph.material_manage.err_msg_batch_upload_fail',
              { name: err.response.data.message });

            that.$message({
              showClose: true,
              message,
              type: 'error',
            });
            if (err.response.data.filename) {
              this.failFileName = err.response.data.filename;
              this.isUploadFailed = true;
            }
            // }
          })
          .finally(() => {
            // this.listenFlag = true;
            that.$refs.initKGfile.value = '';
            that.$emit('endLoading');
          });
      },
      submitTestFile() {
        const that = this;
        this.isTestCaseUploadFailed = false;
        const newRecord = {};
        that.$emit('startLoading');
        that.$api.submitTestFile(this.file, this.robotID, this.userID)
          .then((data) => {
            const res = data.data;
            if (res.status === 'success') {
              // that.TestTaskId = res.dataset;
              newRecord.id = that.tableData.length;
              newRecord.dataset = res.dataset;
              newRecord.taskId = '';
              newRecord.result = '0.0';
              newRecord.status = 'initial';
              that.$notify({ text: that.$t('wordbank.result.success') });
              that.tableData.push(newRecord);
            }
          })
          .catch((err) => {
            that.$notifyFail(this.$t('knowledge_graph.material_manage.no_testcase_is_found'));
            if (err.response.data.filename) {
              this.isTestCaseUploadFailed = true;
              this.testCaseFailFileName = err.response.data.filename;
            }
          })
          .finally(() => {
            that.$refs.testFileUploader.value = '';
            that.$emit('endLoading');
          });
      },


    },

    beforeMount() {
    },

    mounted() {
      this.$api.CheckSandbox(this.robotID).then((res) => {
        console.log(res);
        if (res.data.status === 'success') {
          if (res.data.hasModify !== '0') {
            this.sandboxSwitch = true;
          } else {
            this.sandboxSwitch = false;
          }
        }
        this.getAllExistingTestResult();
      });

      // this.generateResultGraph();
    },


  };
</script>

<style lang="scss" scoped>
  @import '../../assets/styles/variable';

  .text {
    font-size: 14px;
  }

  .item {
    padding: 18px 0;
  }

  .result {
    // padding: 20px;
    height: 30vh;
    width: 25vw;
  }

  .clickable-link {
    color: $color-primary;
    text-decoration: underline;
    @include click-button();
  }

  #material-manage {
    height: 100%;
    .content {
      display: flex;
      flex-direction: column;
      .row {
        flex: 0 0 auto;
        padding-left: 20px;
        .sandbox_operation {
          padding: 0px 20px;
        }

        &.title {
          @include font-16px();
          color: $color-font-active;
          flex: 0 0 60px;
          border-bottom: 1px solid $color-borderline;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

      }

      .box-card {
        width: 100%;
        font-size: 14px;
        padding: 10px 15px;
        border-bottom: 1px solid $color-borderline;
        .head {
        }
        .results {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }
        .content {
          flex: 1;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          .toolbar {
            flex: 0 0 auto;
            margin: 10px 0px;
            display: flex;

            .text-button {
              margin: 0 5px;
            }
          }
          .status /deep/ {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 0px 10px;

            .process {
              margin: 0px 10px;
              color: #1875f0;
            }
            .success {
              margin: 0px 10px;
              color: #00a699;
            }

          }
          .result_report {
            display: flex;
            flex-direction: column;
            .detail_report {
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: center;
              padding: 10px;
            }

          }
          .overview {
            padding: 5px;
            display: flex;
            flex-direction: row;
            align-items: center;
            .content {
              .row {
                height: 20vh;
                display: flex;
                flex-direction: row;
                overflow-y: scroll;
              }
            }

          }
        }
      }
    }

  }

</style>
