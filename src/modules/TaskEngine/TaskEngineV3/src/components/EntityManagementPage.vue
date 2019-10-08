<template lang="html">
<div id="entity-management-page" class="entity-management-page page">
  <h1>{{$t('task_engine_v3.entity_management.title')}}</h1>
  <hr>
  <div class="row">
    <div class="filter_column">
      <select class="no_border" name="entity_category">
        <option value="全部类别">全部类别</option>
        <option 
          v-for="entityCategory in entityCategoryList" 
          :value="entityCategory"
        >{{entityCategory}}</option>
      </select>
    </div>
    <div class="search_column">
      <input class="no_border" type="text" name="key_word" 
        :placeholder="$t('task_engine_v3.entity_management.search_placeholder')"
      >
    </div>
    <div class="add_new_column">
      <button class="btn-basic" @click="addCustomEntityType">
        {{$t('task_engine_v3.entity_management.create_new_entity_type')}}
      </button>
    </div>
  </div>
  <div class="entity-container">
    <div class="entity_type_column">
      {{$t('task_engine_v3.entity_management.entity_type')}}
    </div>
    <div class="create_date_column">
      {{$t('task_engine_v3.entity_management.create_date')}}
    </div>
    <div class="category_column">
      {{$t('task_engine_v3.entity_management.cagegory')}}
    </div>
    <div class="description_column">
      {{$t('task_engine_v3.entity_management.description')}}
    </div>
    <div class="operation_column">
      {{$t('task_engine_v3.entity_management.operation')}}
    </div>
  </div>
  <div v-for="(entity, index) in entityList" :key="entity.entityType" class="entity-container">
    <div class="entity_type_column">
      {{entity.entityType}}
    </div>
    <div class="create_date_column">
      {{entity.createDate}}
    </div>
    <div class="category_column">
      {{entity.entityCategory}}
    </div>
    <div class="description_column">
      {{entity.entityTypeDescription}}
    </div>
    <div class="operation_column">
      <button class="btn-basic" @click="editCustomEntityType(index)">
        {{$t('general.edit')}}
      </button>
      <button class="btn-basic" @click="removeCustomEntityType(index)">
        {{$t('general.delete')}}
      </button>
    </div>
  </div>
</div>
</template>

<script>
import CustomEntityTypeEditorPop from './CustomEntityTypeEditorPop';

export default {
  name: 'entity-management',
  components: {
  },
  data() {
    return {
      entityList: [],
      entityCategoryList: [
        '通用实体类别',
        '金融实体类别',
      ],
    };
  },
  computed: {},
  watch: {},
  methods: {
    removeCustomEntityType(index) {
      this.entityList.splice(index, 1);
    },
    editCustomEntityType(index) {
      const that = this;
      that.$pop({
        title: '',
        component: CustomEntityTypeEditorPop,
        validate: true,
        data: that.entityList[index],
        callback: {
          ok: (response) => {
            that.entityList[index] = {
              entityType: response.entityType,
              createDate: response.createDate,
              entityCategory: response.entityCategory,
              entityCategoryList: response.entityCategoryList,
              entityTypeDescription: response.entityTypeDescription,
              entitySynonymsList: response.entitySynonymsList,
            };
            that.$nextTick(() => {
              that.$forceUpdate();
            });
          },
        },
      });
    },
    addCustomEntityType() {
      const that = this;
      that.$pop({
        title: '',
        component: CustomEntityTypeEditorPop,
        validate: true,
        data: {
          entityType: null,
          entityTypeDescription: null,
          entityCategory: '通用实体类别',
          entityCategoryList: that.entityCategoryList,
          entitySynonymsList: [],
        },
        callback: {
          ok: (response) => {
            that.entityList.push({
              entityType: response.entityType,
              createDate: new Date().toJSON().slice(0, 10).replace(/-/g, '-'),
              entityCategory: response.entityCategory,
              entityCategoryList: response.entityCategoryList,
              entityTypeDescription: response.entityTypeDescription,
              entitySynonymsList: response.entitySynonymsList,
            });
          },
        },
      });
    },
  },
  beforeMount() {},
  mounted() {},
};
</script>

<style lang="scss" scoped>
@import "../scss/teVariable.scss";
.entity-management-page{
  flex: 1 1 0;
  .row{
    display:flex;
    flex-direction: row;
    .filter_column{
      flex:1;
      display:flex;
      flex-direction: row;
    }
    .search_column{
      flex:4;
      display:flex;
      flex-direction: row;
    }
    .add_new_column{
      flex:1;
      display:flex;
      flex-direction: row;
    }
  }
  .entity-container{
    border: 1px solid #e4eaec;
    width: 100%;
    display:flex;
    flex-direction: row;
    .entity_type_column{
      flex:1;
      display:flex;
      flex-direction: row;
    }
    .create_date_column{
      flex:1;
      display:flex;
      flex-direction: row;
    }
    .category_column{
      flex:2;
      display:flex;
      flex-direction: row;
    }
    .description_column{
      flex:2;
      display:flex;
      flex-direction: row;
    }
    .operation_column{
      flex:1;
      display:flex;
      flex-direction: row;
    }
  }
  
  .no_border{
    border:none;
    width: 80%;
  }
}
</style>
