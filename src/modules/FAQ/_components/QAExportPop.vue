<template>
  <div>
    <div>
      {{ statsText }}
    </div>
    <br>
    <div class="loader"></div>
    <br>
    <div>
      <template v-if="showTimeStr !== ''">
      {{ $t('qalist.check_exrpot_time') }}: {{ showTimeStr }}
      </template>
    </div>
  </div>  
</template>

<script>
// import i18nUtil from '@/utils/i18nUtil';
import { mapGetters } from 'vuex';
import format from '@/utils/js/format';
import QAapi from '../_api/qalist';

export default {
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  api: QAapi,
  data() {
    return {
      statsText: '',
      showTime: new Date(),
      // i18n: {},
      currentTimeout: undefined,
    };
  },
  methods: {
    setUpMsg() {
      this.statsText = this.$t('qalist.check_export_status');
    },
    pollingState(id) {
      this.$api.queryOperationProgress(id).then((data) => {
        if (data.status === 'running') {
          setTimeout(() => {
            this.pollingState.bind(this)(id);
          }, 5000);
        } else {
          this.$emit('validateSuccess', data);
        }
      }).catch(() => {
        const failedData = {
          status: 'failed',
        };
        this.$emit('validateSuccess', failedData);
      });
    },
  },
  beforeDestroy() {
    if (this.currentTimeout && clearTimeout) {
      clearTimeout(this.currentTimeout);
    }
  },
  mounted() {
    const that = this;
    that.setUpMsg();

    const options = this.qaQueryOptions;
    this.$api.exportQuestions(options).then((data) => {
      that.pollingState(data.stateId);
    }).catch((err) => {
      this.$emit('validateSuccess', {
        status: 'failed',
      });
      that.$notify({
        text: `${err}`,
        type: 'fail',
      });
    });
  },
  computed: {
    ...mapGetters([
      'qaQueryOptions',
    ]),
    showTimeStr() {
      return format.datetimeToString(this.showTime.toString());
    },
  },
};
</script>

<style scoped>
.loader {
    border: 5px solid #f3f3f3; /* Light grey */
    border-top: 5px solid #3498db; /* Blue */
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>