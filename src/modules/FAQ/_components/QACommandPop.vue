<template>
  <div id="qa-dimension-select-pop">
    <div class="header">
      <span>{{`${$t('qalist.set_command')}：`}}</span>
      <span style="float:right;" v-for="box in value.items" :key="box.id" v-if="box.id===value.selected">{{`${$t('qalist.current_command')}：${box.text}`}}</span>
    </div>
    <div class="raidobox-container">
        <div v-for="box in value.items" class="radiobox" :key="box.id" v-if="box.id==='no-order'">
          <input type="radio" v-model="value.selected" :value="box.id" :id="`${box.id}`"/>
          <label :for="`${box.id}`"> {{ box.text }} </label>
        </div>
    </div>
    <div class="raidobox-container">
        <div v-for="box in value.items" class="radiobox" :key="box.id" v-if="box.id!=='no-order'">
          <input type="radio" v-model="value.selected" :value="box.id" :id="`${box.id}`"/>
          <label :for="`${box.id}`"> {{ box.text }} </label>
        </div>
    </div>
    <div class="center-algin">
      <div>
        <span>{{`${$t('qalist.keywords')}：`}}</span><input maxlength="100" :placeholder="$t('qalist.keywords_enter')" v-model="value.answerCMDMsg" :disabled="value.selected !== 'shopping'">
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'QACommandPop',
  props: {
    value: {
      type: Object,
      requried: true,
    },
  },
  data() {
    return {
      data: {
      },
    };
  },
  mounted() {
    this.data.items = this.value.commands;
    this.data.selected = this.value.selected;
  },
  methods: {
  },
  computed: {
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
#qa-dimension-select-pop{
  .header{
    font-size: 18px;
    padding: 10px 10px 30px 10px;
  }
  .raidobox-container{
    width: 700px;
    .radiobox{
      display: inline-block;
      min-width: 120px;
      text-align: center;
      margin: 10px 10px;
      input{
        display: none;

        + label {
          display: inline-block;
          min-width: 120px;
          padding: 10px 0px;
          background-color: lightgray;
          border-radius: 5px;
          border: 1px solid lightgray;
        }

        &:checked + label {
          color: #0099FF;
          background-color: white;
          border: 1px solid #0099FF;
        }
      }
    }
  }
  .center-algin {
    height: 40px;
    width: 100%;
    margin: 20px 10px;
    div {
      display: flex;
      align-items: center;
      span {
        width: 150px;
      }
      input {
        width: 500px;
      }
    }
  }
}
</style>