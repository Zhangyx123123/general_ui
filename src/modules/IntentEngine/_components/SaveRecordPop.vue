<template>
<div id="block">
  <div class="input-row">
    <div class="input-label">
      {{ $t('general.name')}}
    </div>
    <input classtype="text" v-model="recordName"
      :placeholder="$t('intent_engine.test_records.save_record_pop.enter_record_name')"/>
  </div>
</div>
</template>

<script>
export default {
  props: {
    extData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      recordName: '',
    };
  },
  watch: {
    recordName() {
      if (this.recordName.trim() !== '') {
        this.$emit('enableOK');
      } else {
        this.$emit('disableOK');
      }
    },
  },
  methods: {
    validate() {
      const name = this.recordName.trim();
      if (name) {
        this.$emit('validateSuccess', name);
      }
    },
  },
  mounted() {
    this.$on('validate', this.validate);
    if (this.extData.recordName) {
      this.recordName = this.extData.recordName;
    }
  },
};
</script>
<style lang="scss" scoped>

#block {
  display: flex;
  flex-direction: column;
  padding: 10px 20px 105px 20px;
  width: 480px;
  .input-row{
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    @include font-14px-line-height-28px();
    input{
      width: 400px;
      margin-left: 10px;
    }
  }
 
}
</style>