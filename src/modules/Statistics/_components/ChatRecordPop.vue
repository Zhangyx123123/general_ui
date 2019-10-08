<template>
  <div class="record-pop">
    <template v-for="(record, idx) in value.data">
      <div class="record-pop-row" :key="`u_${idx}`">
        <div>
          <span class="record-pop-user">
            {{ $t('statistics.user_say') }}
          </span>
          {{ record.question_time}}
        </div>
        <div class="record-pop-content">
          {{ record.question}}
        </div>
      </div>
      <div class="record-pop-row" :key="`r_${idx}`">
        <div>
          <span class="record-pop-robot">
            {{ $t('statistics.robot_say') }}
          </span>
          {{ record.answer_time}}
        </div>
        <div class="record-pop-content">
          {{ record.answer}}
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      tepe: Array,
      default: [],
    },
  },
};
</script>

<style lang="scss" scoped>
.record-pop {
  max-width: 800px;
  .record-pop-row {
    margin-top: 20px;
    .record-pop-user {
      color: red;
    }
    .record-pop-robot {
      color: blue;
    }
    .record-pop-content {
      line-height: 1.5em;
      word-break: break-all;
    }
  }
}
</style>
