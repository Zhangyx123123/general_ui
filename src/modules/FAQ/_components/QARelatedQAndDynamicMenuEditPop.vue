<template>
  <div id="RelatedQ-and-Dynamic-menu-container">
    <div id="not-show-in-box">  
      <input type="checkbox" value="Bike" v-model="value.not_show">
      <label> {{$t('qalist.select_not_in_recommendation')}} </label>
    </div>
    <select v-model="value.selected">
      <option value="dynamic_menu">{{$t('qalist.select_dynamic_menu')}}</option>
      <option value="relatedQ">{{$t('qalist.select_related_questions')}}</option>
      <option value="not_indicate">{{$t('qalist.not_indicate')}}</option>
    </select>
    <div class="margin-top warning" v-if="originType === 'relatedQ' &&  value.selected === 'not_indicate'"> 
      {{ $t('qalist.related_question_overwrite_warning') }} 
    </div>
    <div class="margin-top warning" v-if="originType === 'dynamic_menu' &&  value.selected === 'not_indicate'"> 
      {{ $t('qalist.dynamic_menu_overwrite_warning') }} 
    </div>
    <div class="dynamic-list" v-if="value.selected === 'dynamic_menu'">
      <div class="margin-top warning" v-if="originType === 'relatedQ'"> {{$t('qalist.related_question_overwrite_warning')}} </div>
      <dynamic-list-lnput v-model="dynamic_menu"></dynamic-list-lnput>
    </div>
     <div class="dynamic-list" v-if="value.selected === 'relatedQ'">
       <div class="margin-top warning" v-if="originType === 'dynamic_menu'"> {{$t('qalist.dynamic_menu_overwrite_warning')}} </div>
      <dynamic-list-lnput v-model="related_q"></dynamic-list-lnput>
    </div>
  </div>
</template>

<script>
import DynamicListInput from './DynamicListInput';

export default {
  props: {
    value: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      dynamic_menu: {
        contents: this.value.dynamic_menu,
        contentMaxNum: 1000,
      },
      related_q: {
        contents: this.value.related_q,
        contentMaxNum: 1000,
      },
      originType: this.value.selected,
    };
  },
  computed: {
  },
  mounted() {
  },
  methods: {
  },
  components: {
    'dynamic-list-lnput': DynamicListInput,
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style lang='scss' scoped>
  #RelatedQ-and-Dynamic-menu-container {
    width: 500px;

    .dynamic-list {
        height: 300px;
    }

    #not-show-in-box {
      display: flex;
    }

    select {
      width: 300px;
      height: 30px;
      margin-top: 10px;
    }

    .margin-top {
      margin-top: 10px;
    }

    .warning {
      color:red;
    }
  }
</style>